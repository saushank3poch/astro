import { PublicKey } from '@solana/web3.js';
import { BrowserProvider } from 'ethers';
import type { Blockchain } from '@/types';
import { apiClient } from './api';

// Phantom wallet types
interface PhantomProvider {
  isPhantom?: boolean;
  connect: () => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  signMessage: (message: Uint8Array, encoding: string) => Promise<{ signature: Uint8Array }>;
  publicKey: PublicKey | null;
}

declare global {
  interface Window {
    phantom?: {
      solana?: PhantomProvider;
    };
    ethereum?: any;
  }
}

// Wallet connection errors
export class WalletError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'WalletError';
  }
}

// Check if Phantom wallet is installed
export function isPhantomInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window.phantom?.solana?.isPhantom);
}

// Check if MetaMask is installed
export function isMetaMaskInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window.ethereum?.isMetaMask);
}

// Phantom wallet functions
export class PhantomWallet {
  private provider: PhantomProvider | null = null;

  constructor() {
    if (typeof window !== 'undefined' && window.phantom?.solana) {
      this.provider = window.phantom.solana;
    }
  }

  isInstalled(): boolean {
    return isPhantomInstalled();
  }

  async connect(): Promise<string> {
    if (!this.provider) {
      throw new WalletError(
        'Phantom wallet is not installed. Please install it from https://phantom.app',
        'WALLET_NOT_FOUND'
      );
    }

    try {
      const response = await this.provider.connect();
      return response.publicKey.toString();
    } catch (error: any) {
      if (error.code === 4001) {
        throw new WalletError('User rejected the connection request', 'USER_REJECTED');
      }
      throw new WalletError('Failed to connect to Phantom wallet', 'CONNECTION_FAILED');
    }
  }

  async disconnect(): Promise<void> {
    if (!this.provider) return;
    try {
      await this.provider.disconnect();
    } catch (error) {
      console.error('Phantom disconnect error:', error);
    }
  }

  async signMessage(message: string): Promise<string> {
    if (!this.provider) {
      throw new WalletError('Phantom wallet is not connected', 'WALLET_NOT_CONNECTED');
    }

    try {
      const encodedMessage = new TextEncoder().encode(message);
      const { signature } = await this.provider.signMessage(encodedMessage, 'utf8');

      // Convert signature to base64
      return Buffer.from(signature).toString('base64');
    } catch (error: any) {
      if (error.code === 4001) {
        throw new WalletError('User rejected the signature request', 'USER_REJECTED');
      }
      throw new WalletError('Failed to sign message', 'SIGNATURE_FAILED');
    }
  }

  getPublicKey(): string | null {
    if (!this.provider?.publicKey) return null;
    return this.provider.publicKey.toString();
  }
}

// MetaMask wallet functions
export class MetaMaskWallet {
  private provider: any = null;

  constructor() {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.provider = window.ethereum;
    }
  }

  isInstalled(): boolean {
    return isMetaMaskInstalled();
  }

  async connect(): Promise<string> {
    if (!this.provider) {
      throw new WalletError(
        'MetaMask is not installed. Please install it from https://metamask.io',
        'WALLET_NOT_FOUND'
      );
    }

    try {
      const accounts = await this.provider.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new WalletError('No accounts found', 'NO_ACCOUNTS');
      }

      return accounts[0];
    } catch (error: any) {
      if (error.code === 4001) {
        throw new WalletError('User rejected the connection request', 'USER_REJECTED');
      }
      throw new WalletError('Failed to connect to MetaMask', 'CONNECTION_FAILED');
    }
  }

  async signMessage(message: string, address: string): Promise<string> {
    if (!this.provider) {
      throw new WalletError('MetaMask is not connected', 'WALLET_NOT_CONNECTED');
    }

    try {
      const signature = await this.provider.request({
        method: 'personal_sign',
        params: [message, address],
      });

      return signature;
    } catch (error: any) {
      if (error.code === 4001) {
        throw new WalletError('User rejected the signature request', 'USER_REJECTED');
      }
      throw new WalletError('Failed to sign message', 'SIGNATURE_FAILED');
    }
  }

  async getAccounts(): Promise<string[]> {
    if (!this.provider) return [];

    try {
      const accounts = await this.provider.request({
        method: 'eth_accounts',
      });
      return accounts || [];
    } catch (error) {
      console.error('Failed to get accounts:', error);
      return [];
    }
  }

  async getCurrentAccount(): Promise<string | null> {
    const accounts = await this.getAccounts();
    return accounts.length > 0 ? accounts[0] : null;
  }

  async switchToChain(chainId: string): Promise<void> {
    if (!this.provider) return;

    try {
      await this.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
    } catch (error: any) {
      // Chain doesn't exist, try to add it
      if (error.code === 4902) {
        throw new WalletError('Chain not found in wallet', 'CHAIN_NOT_FOUND');
      }
      throw new WalletError('Failed to switch chain', 'CHAIN_SWITCH_FAILED');
    }
  }
}

// High-level authentication functions
export async function authenticateWithPhantom(): Promise<{
  user: any;
  isNewUser: boolean;
}> {
  const wallet = new PhantomWallet();

  if (!wallet.isInstalled()) {
    throw new WalletError(
      'Phantom wallet is not installed. Please install it from https://phantom.app',
      'WALLET_NOT_FOUND'
    );
  }

  // Step 1: Connect wallet
  const walletAddress = await wallet.connect();

  // Step 2: Request nonce
  const { nonce, message } = await apiClient.requestWalletNonce({
    walletAddress,
    blockchain: 'solana',
  });

  // Step 3: Sign message
  const signature = await wallet.signMessage(message);

  // Step 4: Verify signature and authenticate
  const response = await apiClient.verifyWalletSignature({
    walletAddress,
    blockchain: 'solana',
    signature,
    nonce,
  });

  return {
    user: response.user,
    isNewUser: response.isNewUser,
  };
}

export async function authenticateWithMetaMask(): Promise<{
  user: any;
  isNewUser: boolean;
}> {
  const wallet = new MetaMaskWallet();

  if (!wallet.isInstalled()) {
    throw new WalletError(
      'MetaMask is not installed. Please install it from https://metamask.io',
      'WALLET_NOT_FOUND'
    );
  }

  // Step 1: Connect wallet
  const walletAddress = await wallet.connect();

  // Step 2: Request nonce
  const { nonce, message } = await apiClient.requestWalletNonce({
    walletAddress,
    blockchain: 'ethereum',
  });

  // Step 3: Sign message
  const signature = await wallet.signMessage(message, walletAddress);

  // Step 4: Verify signature and authenticate
  const response = await apiClient.verifyWalletSignature({
    walletAddress,
    blockchain: 'ethereum',
    signature,
    nonce,
  });

  return {
    user: response.user,
    isNewUser: response.isNewUser,
  };
}

// Link wallet to existing account
export async function linkPhantomWallet(label?: string): Promise<void> {
  const wallet = new PhantomWallet();

  if (!wallet.isInstalled()) {
    throw new WalletError('Phantom wallet is not installed', 'WALLET_NOT_FOUND');
  }

  const walletAddress = await wallet.connect();

  const { nonce, message } = await apiClient.requestWalletLinkingNonce({
    walletAddress,
    blockchain: 'solana',
  });

  const signature = await wallet.signMessage(message);

  await apiClient.verifyWalletLinking({
    walletAddress,
    blockchain: 'solana',
    signature,
    nonce,
    label,
  });
}

export async function linkMetaMaskWallet(label?: string): Promise<void> {
  const wallet = new MetaMaskWallet();

  if (!wallet.isInstalled()) {
    throw new WalletError('MetaMask is not installed', 'WALLET_NOT_FOUND');
  }

  const walletAddress = await wallet.connect();

  const { nonce, message } = await apiClient.requestWalletLinkingNonce({
    walletAddress,
    blockchain: 'ethereum',
  });

  const signature = await wallet.signMessage(message, walletAddress);

  await apiClient.verifyWalletLinking({
    walletAddress,
    blockchain: 'ethereum',
    signature,
    nonce,
    label,
  });
}

// Utility functions
export function shortenAddress(address: string, chars = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function getWalletIcon(blockchain: Blockchain): string {
  switch (blockchain) {
    case 'solana':
      return '◎';
    case 'ethereum':
    case 'base':
      return 'Ξ';
    default:
      return '⬡';
  }
}

export function getWalletName(blockchain: Blockchain): string {
  switch (blockchain) {
    case 'solana':
      return 'Phantom';
    case 'ethereum':
      return 'MetaMask';
    case 'base':
      return 'Base';
    default:
      return 'Wallet';
  }
}

// Export wallet instances
export const phantomWallet = new PhantomWallet();
export const metaMaskWallet = new MetaMaskWallet();

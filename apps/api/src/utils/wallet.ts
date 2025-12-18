import nacl from 'tweetnacl';
import { PublicKey } from '@solana/web3.js';
import { ethers } from 'ethers';
import bs58 from 'bs58';
import { WalletSignatureVerification } from '../types';
import logger from './logger';

/**
 * Verify Solana wallet signature
 */
export function verifySolanaSignature(
  message: string,
  signature: string,
  publicKey: string
): WalletSignatureVerification {
  try {
    // Encode message to bytes
    const messageBytes = new TextEncoder().encode(message);

    // Decode signature from base64 or base58
    let signatureBytes: Uint8Array;
    try {
      signatureBytes = Buffer.from(signature, 'base64');
    } catch {
      signatureBytes = bs58.decode(signature);
    }

    // Get public key bytes
    const publicKeyObj = new PublicKey(publicKey);
    const publicKeyBytes = publicKeyObj.toBytes();

    // Verify signature
    const isValid = nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKeyBytes
    );

    return {
      isValid,
      walletAddress: isValid ? publicKey : undefined,
    };
  } catch (error) {
    logger.error('Solana signature verification failed', { error, publicKey });
    return { isValid: false };
  }
}

/**
 * Verify Ethereum wallet signature
 */
export function verifyEthereumSignature(
  message: string,
  signature: string,
  expectedAddress: string
): WalletSignatureVerification {
  try {
    // Recover address from signature
    const recoveredAddress = ethers.verifyMessage(message, signature);

    // Compare addresses (case-insensitive)
    const isValid =
      recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();

    return {
      isValid,
      walletAddress: isValid ? recoveredAddress : undefined,
    };
  } catch (error) {
    logger.error('Ethereum signature verification failed', {
      error,
      expectedAddress,
    });
    return { isValid: false };
  }
}

/**
 * Generate a random nonce for wallet authentication
 */
export function generateNonce(): string {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
}

/**
 * Create authentication message for wallet signing
 */
export function createAuthMessage(
  nonce: string,
  action: 'sign_in' | 'link_wallet' = 'sign_in'
): string {
  const timestamp = new Date().toISOString();
  const actionText =
    action === 'sign_in'
      ? 'authenticate with Astro'
      : 'link this wallet to your Astro account';

  return `Sign this message to ${actionText}:

Nonce: ${nonce}
Timestamp: ${timestamp}

This request will not trigger a blockchain transaction or cost any gas fees.`;
}

/**
 * Verify wallet signature based on blockchain type
 */
export function verifyWalletSignature(
  blockchain: string,
  message: string,
  signature: string,
  walletAddress: string
): WalletSignatureVerification {
  switch (blockchain.toLowerCase()) {
    case 'solana':
      return verifySolanaSignature(message, signature, walletAddress);

    case 'ethereum':
    case 'base':
    case 'polygon':
      return verifyEthereumSignature(message, signature, walletAddress);

    default:
      logger.error('Unsupported blockchain', { blockchain });
      return { isValid: false };
  }
}

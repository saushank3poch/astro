/**
 * Ethereum Payment Service
 * Handles Ethereum, Base, and ERC20 token (USDC/USDT) payments
 */

import { ethers } from 'ethers';
import axios from 'axios';
import { MERCHANT_WALLETS, RPC_URLS, TOKEN_ADDRESSES, CONFIRMATION_REQUIREMENTS } from '../../config/pricing';

export interface EthereumPaymentRequest {
  toAddress: string;
  amountWei: string;
  amountEther: string;
  tokenAddress?: string;
  expectedAmount: number;
  chain: string;
}

export interface TransactionStatus {
  status: 'pending' | 'confirmed' | 'failed';
  confirmations: number;
  txHash?: string;
}

// ERC20 ABI (minimal for transfer detection)
const ERC20_ABI = [
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'function decimals() view returns (uint8)',
];

export class EthereumPaymentService {
  private providers: Map<string, ethers.Provider>;
  private priceCache: Map<string, { price: number; timestamp: number }>;

  constructor() {
    this.providers = new Map();
    this.priceCache = new Map();

    // Initialize providers
    if (RPC_URLS.ethereum) {
      this.providers.set('ethereum', new ethers.JsonRpcProvider(RPC_URLS.ethereum));
    }

    if (RPC_URLS.base) {
      this.providers.set('base', new ethers.JsonRpcProvider(RPC_URLS.base));
    }
  }

  /**
   * Create payment request
   */
  async createPaymentRequest(
    amountUSD: number,
    token: 'ETH' | 'USDC' | 'USDT',
    chain: 'ethereum' | 'base'
  ): Promise<EthereumPaymentRequest> {
    try {
      // Get merchant address for chain
      const merchantAddress = chain === 'ethereum'
        ? MERCHANT_WALLETS.ethereum
        : MERCHANT_WALLETS.base;

      if (!merchantAddress) {
        throw new Error(`Merchant wallet not configured for ${chain}`);
      }

      // Get token price and calculate crypto amount
      const tokenPrice = await this.getTokenPrice(token);
      const amountCrypto = ['USDC', 'USDT'].includes(token)
        ? amountUSD // Stablecoins are 1:1 with USD
        : amountUSD / tokenPrice;

      // For native ETH
      if (token === 'ETH') {
        const amountWei = ethers.parseEther(amountCrypto.toString());
        return {
          toAddress: merchantAddress,
          amountWei: amountWei.toString(),
          amountEther: amountCrypto.toString(),
          expectedAmount: amountCrypto,
          chain,
        };
      }

      // For ERC20 tokens (USDC/USDT)
      const tokenAddress = chain === 'ethereum'
        ? TOKEN_ADDRESSES.ethereum[token.toLowerCase() as 'usdc' | 'usdt']
        : TOKEN_ADDRESSES.base.usdc;

      if (!tokenAddress) {
        throw new Error(`Token ${token} not supported on ${chain}`);
      }

      // ERC20 tokens typically use 6 decimals (USDC, USDT)
      const decimals = token === 'USDC' || token === 'USDT' ? 6 : 18;
      const amountWei = ethers.parseUnits(amountCrypto.toString(), decimals);

      return {
        toAddress: merchantAddress,
        amountWei: amountWei.toString(),
        amountEther: amountCrypto.toString(),
        tokenAddress,
        expectedAmount: amountCrypto,
        chain,
      };
    } catch (error) {
      console.error('Error creating Ethereum payment request:', error);
      throw new Error('Failed to create payment request');
    }
  }

  /**
   * Monitor transaction
   */
  async monitorTransaction(
    txHash: string,
    chain: 'ethereum' | 'base'
  ): Promise<TransactionStatus> {
    try {
      const provider = this.providers.get(chain);
      if (!provider) {
        throw new Error(`Provider not configured for ${chain}`);
      }

      // Get transaction receipt
      const receipt = await provider.getTransactionReceipt(txHash);

      if (!receipt) {
        return { status: 'pending', confirmations: 0 };
      }

      // Check if transaction failed
      if (receipt.status === 0) {
        return { status: 'failed', confirmations: 0, txHash };
      }

      // Get current block number
      const currentBlock = await provider.getBlockNumber();
      const confirmations = currentBlock - (receipt.blockNumber || 0);

      // Check if enough confirmations
      const requiredConfirmations = CONFIRMATION_REQUIREMENTS[chain];
      const isConfirmed = confirmations >= requiredConfirmations;

      return {
        status: isConfirmed ? 'confirmed' : 'pending',
        confirmations,
        txHash,
      };
    } catch (error) {
      console.error('Error monitoring Ethereum transaction:', error);
      return { status: 'pending', confirmations: 0 };
    }
  }

  /**
   * Verify native ETH transaction
   */
  async verifyTransaction(
    txHash: string,
    expectedAmount: number,
    chain: 'ethereum' | 'base'
  ): Promise<boolean> {
    try {
      const provider = this.providers.get(chain);
      if (!provider) {
        throw new Error(`Provider not configured for ${chain}`);
      }

      const merchantAddress = chain === 'ethereum'
        ? MERCHANT_WALLETS.ethereum
        : MERCHANT_WALLETS.base;

      // Get transaction
      const tx = await provider.getTransaction(txHash);
      if (!tx) {
        return false;
      }

      // Verify recipient
      if (tx.to?.toLowerCase() !== merchantAddress.toLowerCase()) {
        console.error('Transaction recipient mismatch');
        return false;
      }

      // Verify amount (allow 1% tolerance for gas)
      const receivedEther = parseFloat(ethers.formatEther(tx.value));
      const tolerance = expectedAmount * 0.01;

      if (Math.abs(receivedEther - expectedAmount) > tolerance) {
        console.error('Transaction amount mismatch', {
          expected: expectedAmount,
          received: receivedEther,
        });
        return false;
      }

      // Verify transaction is confirmed
      const receipt = await provider.getTransactionReceipt(txHash);
      if (!receipt || receipt.status === 0) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error verifying Ethereum transaction:', error);
      return false;
    }
  }

  /**
   * Verify ERC20 token transfer
   */
  async verifyERC20Transfer(
    txHash: string,
    tokenAddress: string,
    expectedAmount: number,
    chain: 'ethereum' | 'base'
  ): Promise<boolean> {
    try {
      const provider = this.providers.get(chain);
      if (!provider) {
        throw new Error(`Provider not configured for ${chain}`);
      }

      const merchantAddress = chain === 'ethereum'
        ? MERCHANT_WALLETS.ethereum
        : MERCHANT_WALLETS.base;

      // Get transaction receipt
      const receipt = await provider.getTransactionReceipt(txHash);
      if (!receipt || receipt.status === 0) {
        return false;
      }

      // Create contract interface
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);

      // Get decimals
      const decimals = await tokenContract.decimals();

      // Parse Transfer events
      const transferEvents = receipt.logs
        .filter((log) => log.address.toLowerCase() === tokenAddress.toLowerCase())
        .map((log) => {
          try {
            return tokenContract.interface.parseLog({
              topics: log.topics as string[],
              data: log.data,
            });
          } catch {
            return null;
          }
        })
        .filter((event) => event !== null && event.name === 'Transfer');

      // Find transfer to merchant
      const merchantTransfer = transferEvents.find(
        (event: any) => event && event.args.to.toLowerCase() === merchantAddress.toLowerCase()
      );

      if (!merchantTransfer) {
        console.error('No transfer to merchant found');
        return false;
      }

      // Verify amount
      const receivedAmount = parseFloat(
        ethers.formatUnits(merchantTransfer.args.value, decimals)
      );
      const tolerance = expectedAmount * 0.01;

      if (Math.abs(receivedAmount - expectedAmount) > tolerance) {
        console.error('Token transfer amount mismatch', {
          expected: expectedAmount,
          received: receivedAmount,
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error verifying ERC20 transfer:', error);
      return false;
    }
  }

  /**
   * Get token price in USD
   */
  async getTokenPrice(token: 'ETH' | 'USDC' | 'USDT'): Promise<number> {
    // Stablecoins are always $1
    if (token === 'USDC' || token === 'USDT') {
      return 1;
    }

    // Check cache
    const cached = this.priceCache.get(token);
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
      return cached.price;
    }

    try {
      // Use CoinGecko API for ETH price
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price',
        {
          params: {
            ids: 'ethereum',
            vs_currencies: 'usd',
          },
          headers: process.env.COINGECKO_API_KEY
            ? { 'x-cg-pro-api-key': process.env.COINGECKO_API_KEY }
            : {},
        }
      );

      const price = response.data.ethereum.usd;

      // Cache the price
      this.priceCache.set(token, { price, timestamp: Date.now() });

      return price;
    } catch (error) {
      console.error('Error fetching ETH price:', error);
      // Fallback to a default price if API fails
      return 3000; // Default fallback price
    }
  }

  /**
   * Get transaction details
   */
  async getTransactionDetails(txHash: string, chain: 'ethereum' | 'base'): Promise<any> {
    try {
      const provider = this.providers.get(chain);
      if (!provider) {
        return null;
      }

      const [tx, receipt] = await Promise.all([
        provider.getTransaction(txHash),
        provider.getTransactionReceipt(txHash),
      ]);

      return { transaction: tx, receipt };
    } catch (error) {
      console.error('Error getting transaction details:', error);
      return null;
    }
  }
}

export default EthereumPaymentService;

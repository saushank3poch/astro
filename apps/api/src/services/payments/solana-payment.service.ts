/**
 * Solana Payment Service
 * Handles Solana and SPL token (USDC) payments using Solana Pay
 */

import {
  Connection,
  PublicKey,
} from '@solana/web3.js';
import { encodeURL, createQR, findReference, validateTransfer } from '@solana/pay';
import BigNumber from 'bignumber.js';
import axios from 'axios';
import { MERCHANT_WALLETS, RPC_URLS, TOKEN_ADDRESSES } from '../../config/pricing';

export interface SolanaPaymentRequest {
  paymentUrl: string;
  qrCode: string;
  reference: string;
  amount: number;
  recipient: string;
  label: string;
}

export interface TransactionStatus {
  status: 'pending' | 'confirmed' | 'failed';
  signature?: string;
  amount?: number;
  confirmations?: number;
}

export class SolanaPaymentService {
  private connection: Connection;
  private merchantWallet: PublicKey;
  private priceCache: Map<string, { price: number; timestamp: number }>;

  constructor() {
    this.connection = new Connection(RPC_URLS.solana, 'confirmed');

    if (!MERCHANT_WALLETS.solana) {
      throw new Error('SOLANA_MERCHANT_WALLET not configured');
    }

    this.merchantWallet = new PublicKey(MERCHANT_WALLETS.solana);
    this.priceCache = new Map();
  }

  /**
   * Create a Solana Pay payment request
   */
  async createPaymentRequest(
    amountUSD: number,
    token: 'SOL' | 'USDC',
    label: string = 'Astro Credits Purchase'
  ): Promise<SolanaPaymentRequest> {
    try {
      // Get token price and calculate crypto amount
      const tokenPrice = await this.getTokenPrice(token);
      const amountCrypto = token === 'USDC'
        ? amountUSD // USDC is 1:1 with USD
        : amountUSD / tokenPrice;

      // Generate unique reference for tracking
      const reference = new PublicKey(this.generateReference());

      // Create payment URL
      const url = encodeURL({
        recipient: this.merchantWallet,
        amount: new BigNumber(amountCrypto),
        splToken: token === 'USDC'
          ? new PublicKey(TOKEN_ADDRESSES.solana.usdc)
          : undefined,
        reference,
        label,
        message: `Purchase ${label}`,
      });

      // Generate QR code
      const qr = createQR(url);
      const qrCode = await qr.getRawData('png');
      const qrCodeBase64 = qrCode ? (qrCode as Buffer).toString('base64') : '';

      return {
        paymentUrl: url.toString(),
        qrCode: `data:image/png;base64,${qrCodeBase64}`,
        reference: reference.toString(),
        amount: amountCrypto,
        recipient: this.merchantWallet.toString(),
        label,
      };
    } catch (error) {
      console.error('Error creating Solana payment request:', error);
      throw new Error('Failed to create payment request');
    }
  }

  /**
   * Monitor transaction by reference
   */
  async monitorTransaction(reference: string): Promise<TransactionStatus> {
    try {
      const referencePublicKey = new PublicKey(reference);

      // Try to find the transaction
      const signatureInfo = await findReference(this.connection, referencePublicKey, {
        finality: 'confirmed',
      });

      if (!signatureInfo.signature) {
        return { status: 'pending' };
      }

      // Get transaction details
      const transaction = await this.connection.getParsedTransaction(
        signatureInfo.signature,
        { maxSupportedTransactionVersion: 0 }
      );

      if (!transaction) {
        return { status: 'pending' };
      }

      // Check if transaction is finalized
      const status = await this.connection.getSignatureStatus(signatureInfo.signature);

      if (status.value?.err) {
        return { status: 'failed', signature: signatureInfo.signature };
      }

      const confirmations = status.value?.confirmations || 0;
      const isFinalized = status.value?.confirmationStatus === 'finalized';

      return {
        status: isFinalized ? 'confirmed' : 'pending',
        signature: signatureInfo.signature,
        confirmations,
      };
    } catch (error: any) {
      // findReference throws if not found, which is expected for pending
      if (error.message?.includes('not found')) {
        return { status: 'pending' };
      }
      console.error('Error monitoring Solana transaction:', error);
      return { status: 'failed' };
    }
  }

  /**
   * Verify transaction details
   */
  async verifyTransaction(
    signature: string,
    expectedAmount: number,
    reference: string,
    token: 'SOL' | 'USDC'
  ): Promise<boolean> {
    try {
      const referencePublicKey = new PublicKey(reference);

      if (token === 'SOL') {
        // Verify native SOL transfer
        await validateTransfer(
          this.connection,
          signature,
          {
            recipient: this.merchantWallet,
            amount: new BigNumber(expectedAmount),
            reference: referencePublicKey,
          },
          { commitment: 'finalized' }
        );
      } else {
        // Verify SPL token transfer (USDC)
        await validateTransfer(
          this.connection,
          signature,
          {
            recipient: this.merchantWallet,
            amount: new BigNumber(expectedAmount),
            splToken: new PublicKey(TOKEN_ADDRESSES.solana.usdc),
            reference: referencePublicKey,
          },
          { commitment: 'finalized' }
        );
      }

      return true;
    } catch (error) {
      console.error('Error verifying Solana transaction:', error);
      return false;
    }
  }

  /**
   * Get current token price in USD
   */
  async getTokenPrice(token: 'SOL' | 'USDC'): Promise<number> {
    // USDC is always $1
    if (token === 'USDC') {
      return 1;
    }

    // Check cache
    const cached = this.priceCache.get(token);
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
      return cached.price;
    }

    try {
      // Use CoinGecko API for SOL price
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price',
        {
          params: {
            ids: 'solana',
            vs_currencies: 'usd',
          },
          headers: process.env.COINGECKO_API_KEY
            ? { 'x-cg-pro-api-key': process.env.COINGECKO_API_KEY }
            : {},
        }
      );

      const price = response.data.solana.usd;

      // Cache the price
      this.priceCache.set(token, { price, timestamp: Date.now() });

      return price;
    } catch (error) {
      console.error('Error fetching SOL price:', error);
      // Fallback to a default price if API fails
      return 100; // Default fallback price
    }
  }

  /**
   * Generate a unique reference for payment tracking
   */
  private generateReference(): string {
    // Generate a random public key for reference
    const { Keypair } = require('@solana/web3.js');
    return Keypair.generate().publicKey.toString();
  }

  /**
   * Get transaction details by signature
   */
  async getTransactionDetails(signature: string): Promise<any> {
    try {
      const transaction = await this.connection.getParsedTransaction(
        signature,
        { maxSupportedTransactionVersion: 0 }
      );
      return transaction;
    } catch (error) {
      console.error('Error getting transaction details:', error);
      return null;
    }
  }
}

export default SolanaPaymentService;

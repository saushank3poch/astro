/**
 * Payment Service
 * Main orchestration service for payment processing
 */

import { PrismaClient } from '@astro/database';
import SolanaPaymentService from './payments/solana-payment.service';
import EthereumPaymentService from './payments/ethereum-payment.service';
import CreditsService from './credits.service';
import { PRICING_TIERS, PAYMENT_TIMEOUT_MS } from '../config/pricing';

const prisma = new PrismaClient();

export interface CreatePaymentInput {
  userId: string;
  packageType: 'credits_10' | 'credits_50' | 'credits_100' | 'unlimited_month';
  blockchain: 'solana' | 'ethereum' | 'base';
  token: 'native' | 'usdc' | 'usdt';
}

export interface PaymentIntent {
  id: string;
  amount: number; // in USD
  amountCrypto: number; // in crypto tokens
  currency: string;
  blockchain: string;
  recipientAddress: string;
  expiresAt: Date;
  qrCode?: string;
  paymentUrl?: string;
  reference?: string;
  tokenAddress?: string;
  packageType: string;
}

export interface TransactionFilters {
  status?: string;
  userId?: string;
  blockchain?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export class PaymentService {
  private solanaService: SolanaPaymentService;
  private ethereumService: EthereumPaymentService;
  private creditsService: CreditsService;

  constructor() {
    this.solanaService = new SolanaPaymentService();
    this.ethereumService = new EthereumPaymentService();
    this.creditsService = new CreditsService();
  }

  /**
   * Create payment intent
   */
  async createPaymentIntent(input: CreatePaymentInput): Promise<PaymentIntent> {
    try {
      // Validate package type
      const pricingTier = PRICING_TIERS[input.packageType];
      if (!pricingTier) {
        throw new Error('Invalid package type');
      }

      const amountUSD = pricingTier.priceUSD;
      const expiresAt = new Date(Date.now() + PAYMENT_TIMEOUT_MS);

      // Determine token based on input
      const token = this.mapToken(input.token, input.blockchain);

      let paymentDetails: any;
      let blockchain = input.blockchain;
      let tokenType = input.token;

      // Create payment request based on blockchain
      if (input.blockchain === 'solana') {
        paymentDetails = await this.solanaService.createPaymentRequest(
          amountUSD,
          token as 'SOL' | 'USDC',
          `Astro ${pricingTier.description}`
        );
      } else {
        paymentDetails = await this.ethereumService.createPaymentRequest(
          amountUSD,
          token as 'ETH' | 'USDC' | 'USDT',
          input.blockchain as 'ethereum' | 'base'
        );
      }

      // Create transaction record in database
      const transaction = await prisma.transaction.create({
        data: {
          userId: input.userId,
          amount: amountUSD,
          currency: 'USD',
          paymentMethod: `crypto_${blockchain}`,
          blockchain: blockchain,
          tokenType: tokenType,
          toWallet: paymentDetails.toAddress || paymentDetails.recipient,
          transactionHash: null,
          confirmationCount: 0,
          status: 'pending',
          creditsGranted: pricingTier.credits > 0 ? pricingTier.credits : null,
          subscriptionDaysGranted: pricingTier.duration
            ? Math.floor(pricingTier.duration / (24 * 60 * 60 * 1000))
            : null,
          subscriptionTierGranted: pricingTier.credits === -1 ? 'unlimited' : null,
          usdValue: amountUSD,
          productId: input.packageType,
        },
      });

      // Store payment reference/metadata
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          receiptData: JSON.stringify({
            reference: paymentDetails.reference,
            tokenAddress: paymentDetails.tokenAddress,
            amountCrypto: paymentDetails.amount || paymentDetails.amountEther,
            tokenType: tokenType,
            paymentUrl: paymentDetails.paymentUrl,
            expiresAt: expiresAt.toISOString(),
          }),
        },
      });

      return {
        id: transaction.id,
        amount: amountUSD,
        amountCrypto: paymentDetails.amount || parseFloat(paymentDetails.amountEther),
        currency: token,
        blockchain: blockchain,
        recipientAddress: paymentDetails.toAddress || paymentDetails.recipient,
        expiresAt,
        qrCode: paymentDetails.qrCode,
        paymentUrl: paymentDetails.paymentUrl,
        reference: paymentDetails.reference,
        tokenAddress: paymentDetails.tokenAddress,
        packageType: input.packageType,
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string): Promise<any> {
    try {
      const transaction = await prisma.transaction.findUnique({
        where: { id: paymentId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
            },
          },
        },
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      return transaction;
    } catch (error) {
      console.error('Error getting payment status:', error);
      throw new Error('Failed to get payment status');
    }
  }

  /**
   * Process completed payment
   */
  async processCompletedPayment(
    transactionHash: string,
    blockchain: string
  ): Promise<void> {
    try {
      // Find pending transaction with matching blockchain
      const transaction = await prisma.transaction.findFirst({
        where: {
          blockchain: blockchain,
          status: 'pending',
          toWallet: { not: null },
        },
      });

      if (!transaction) {
        console.log('No pending transaction found for hash:', transactionHash);
        return;
      }

      // Check if transaction hash is already processed
      const existing = await prisma.transaction.findFirst({
        where: {
          transactionHash: transactionHash,
          status: { in: ['completed', 'confirmed'] },
        },
      });

      if (existing) {
        console.log('Transaction already processed:', transactionHash);
        return;
      }

      // Parse receipt data to get payment details
      const receiptData = transaction.receiptData
        ? JSON.parse(transaction.receiptData as string)
        : {};

      // Verify transaction based on blockchain
      let isValid = false;

      if (blockchain === 'solana') {
        const tokenType = receiptData.tokenType === 'usdc' ? 'USDC' : 'SOL';
        isValid = await this.solanaService.verifyTransaction(
          transactionHash,
          receiptData.amountCrypto,
          receiptData.reference,
          tokenType
        );
      } else {
        if (receiptData.tokenAddress) {
          // ERC20 token
          isValid = await this.ethereumService.verifyERC20Transfer(
            transactionHash,
            receiptData.tokenAddress,
            receiptData.amountCrypto,
            blockchain as 'ethereum' | 'base'
          );
        } else {
          // Native ETH
          isValid = await this.ethereumService.verifyTransaction(
            transactionHash,
            receiptData.amountCrypto,
            blockchain as 'ethereum' | 'base'
          );
        }
      }

      if (!isValid) {
        console.error('Transaction verification failed:', transactionHash);
        await this.handleFailedPayment(
          transaction.id,
          'Transaction verification failed'
        );
        return;
      }

      // Update transaction with hash and mark as confirmed
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          transactionHash: transactionHash,
          status: 'confirmed',
          confirmedAt: new Date(),
          fromWallet: receiptData.fromWallet || 'unknown',
        },
      });

      // Grant credits or subscription
      if (transaction.userId) {
        if (transaction.creditsGranted && transaction.creditsGranted > 0) {
          // Grant credits
          await this.creditsService.addCredits(
            transaction.userId,
            transaction.creditsGranted,
            'purchase'
          );
        }

        if (transaction.subscriptionDaysGranted && transaction.subscriptionTierGranted) {
          // Grant subscription
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + transaction.subscriptionDaysGranted);

          await prisma.user.update({
            where: { id: transaction.userId },
            data: {
              subscriptionTier: transaction.subscriptionTierGranted,
              subscriptionStatus: 'active',
              subscriptionExpiresAt: expiresAt,
              subscriptionProvider: `crypto_${blockchain}`,
            },
          });
        }
      }

      // Mark transaction as completed
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'completed',
          completedAt: new Date(),
        },
      });

      console.log('Payment processed successfully:', transactionHash);
    } catch (error) {
      console.error('Error processing completed payment:', error);
      throw error;
    }
  }

  /**
   * Handle failed payment
   */
  async handleFailedPayment(paymentId: string, reason: string): Promise<void> {
    try {
      await prisma.transaction.update({
        where: { id: paymentId },
        data: {
          status: 'failed',
          failureReason: reason,
        },
      });

      console.log('Payment marked as failed:', paymentId, reason);
    } catch (error) {
      console.error('Error handling failed payment:', error);
    }
  }

  /**
   * Get user transaction history
   */
  async getUserTransactions(userId: string): Promise<any[]> {
    try {
      return await prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    } catch (error) {
      console.error('Error getting user transactions:', error);
      return [];
    }
  }

  /**
   * Get all transactions with filters (Admin)
   */
  async getAllTransactions(filters: TransactionFilters): Promise<any> {
    try {
      const where: any = {};

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.userId) {
        where.userId = filters.userId;
      }

      if (filters.blockchain) {
        where.blockchain = filters.blockchain;
      }

      if (filters.startDate || filters.endDate) {
        where.createdAt = {};
        if (filters.startDate) {
          where.createdAt.gte = filters.startDate;
        }
        if (filters.endDate) {
          where.createdAt.lte = filters.endDate;
        }
      }

      const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                username: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: filters.limit || 100,
          skip: filters.offset || 0,
        }),
        prisma.transaction.count({ where }),
      ]);

      return {
        transactions,
        total,
        limit: filters.limit || 100,
        offset: filters.offset || 0,
      };
    } catch (error) {
      console.error('Error getting all transactions:', error);
      return { transactions: [], total: 0 };
    }
  }

  /**
   * Mark expired payments
   */
  async markExpiredPayments(): Promise<void> {
    try {
      const expiredTime = new Date(Date.now() - PAYMENT_TIMEOUT_MS);

      await prisma.transaction.updateMany({
        where: {
          status: 'pending',
          createdAt: {
            lt: expiredTime,
          },
        },
        data: {
          status: 'expired',
          failureReason: 'Payment timeout',
        },
      });
    } catch (error) {
      console.error('Error marking expired payments:', error);
    }
  }

  /**
   * Map token string to blockchain-specific token
   */
  private mapToken(token: string, blockchain: string): string {
    if (token === 'native') {
      return blockchain === 'solana' ? 'SOL' : 'ETH';
    }
    return token.toUpperCase();
  }

  /**
   * Get payment statistics (Admin)
   */
  async getPaymentStats(): Promise<any> {
    try {
      const [totalRevenue, successfulPayments, pendingPayments, failedPayments] =
        await Promise.all([
          prisma.transaction.aggregate({
            where: { status: 'completed' },
            _sum: { usdValue: true },
          }),
          prisma.transaction.count({ where: { status: 'completed' } }),
          prisma.transaction.count({ where: { status: 'pending' } }),
          prisma.transaction.count({ where: { status: 'failed' } }),
        ]);

      const revenueByBlockchain = await prisma.transaction.groupBy({
        by: ['blockchain'],
        where: { status: 'completed' },
        _sum: { usdValue: true },
        _count: true,
      });

      return {
        totalRevenue: totalRevenue._sum.usdValue || 0,
        successfulPayments,
        pendingPayments,
        failedPayments,
        revenueByBlockchain,
      };
    } catch (error) {
      console.error('Error getting payment stats:', error);
      return null;
    }
  }
}

export default PaymentService;

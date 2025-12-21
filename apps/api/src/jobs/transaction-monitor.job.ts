/**
 * Transaction Monitor Job
 * Polls pending transactions and processes confirmations
 */

import { PrismaClient } from '@astro/database';
import cron from 'node-cron';
import SolanaPaymentService from '../services/payments/solana-payment.service';
import EthereumPaymentService from '../services/payments/ethereum-payment.service';
import PaymentService from '../services/payment.service';
import { TRANSACTION_POLL_INTERVAL_MS } from '../config/pricing';

const prisma = new PrismaClient();

export class TransactionMonitor {
  private solanaService: SolanaPaymentService;
  private ethereumService: EthereumPaymentService;
  private paymentService: PaymentService;
  private isRunning: boolean = false;

  constructor() {
    this.solanaService = new SolanaPaymentService();
    this.ethereumService = new EthereumPaymentService();
    this.paymentService = new PaymentService();
  }

  /**
   * Monitor pending transactions
   */
  async monitorPendingTransactions(): Promise<void> {
    if (this.isRunning) {
      console.log('Transaction monitor already running, skipping...');
      return;
    }

    this.isRunning = true;

    try {
      // Get all pending transactions
      const pendingTransactions = await prisma.transaction.findMany({
        where: {
          status: 'pending',
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      console.log(`Monitoring ${pendingTransactions.length} pending transactions`);

      // Process each transaction
      for (const transaction of pendingTransactions) {
        try {
          await this.processTransaction(transaction);
        } catch (error) {
          console.error(`Error processing transaction ${transaction.id}:`, error);
        }
      }

      // Mark expired payments
      await this.paymentService.markExpiredPayments();
    } catch (error) {
      console.error('Error in transaction monitor:', error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Process individual transaction
   */
  private async processTransaction(transaction: any): Promise<void> {
    // Check if transaction has timed out (10 minutes)
    const createdAt = new Date(transaction.createdAt);
    const now = new Date();
    const timeElapsed = now.getTime() - createdAt.getTime();

    if (timeElapsed > 10 * 60 * 1000) {
      await this.paymentService.handleFailedPayment(
        transaction.id,
        'Payment timeout - no transaction detected'
      );
      return;
    }

    // Parse receipt data to get reference
    const receiptData = transaction.receiptData
      ? JSON.parse(transaction.receiptData as string)
      : {};

    if (!receiptData.reference && !transaction.blockchain) {
      console.log(`Transaction ${transaction.id} missing reference or blockchain`);
      return;
    }

    // Check transaction status based on blockchain
    if (transaction.blockchain === 'solana') {
      await this.processSolanaTransaction(transaction, receiptData);
    } else if (transaction.blockchain === 'ethereum' || transaction.blockchain === 'base') {
      await this.processEthereumTransaction(transaction, receiptData);
    }
  }

  /**
   * Process Solana transaction
   */
  private async processSolanaTransaction(
    transaction: any,
    receiptData: any
  ): Promise<void> {
    try {
      const status = await this.solanaService.monitorTransaction(receiptData.reference);

      if (status.status === 'confirmed' && status.signature) {
        console.log(`Solana transaction confirmed: ${status.signature}`);

        // Process the payment
        await this.paymentService.processCompletedPayment(
          status.signature,
          'solana'
        );
      } else if (status.status === 'failed') {
        console.log(`Solana transaction failed for payment ${transaction.id}`);
        await this.paymentService.handleFailedPayment(
          transaction.id,
          'Transaction failed on blockchain'
        );
      }
      // If pending, keep waiting
    } catch (error) {
      console.error('Error processing Solana transaction:', error);
    }
  }

  /**
   * Process Ethereum/Base transaction
   */
  private async processEthereumTransaction(
    transaction: any,
    _receiptData: any
  ): Promise<void> {
    try {
      // For Ethereum, we need the transaction hash to monitor
      // Users submit the hash via the verify endpoint
      // This method can check if a hash was submitted

      if (transaction.transactionHash) {
        const status = await this.ethereumService.monitorTransaction(
          transaction.transactionHash,
          transaction.blockchain as 'ethereum' | 'base'
        );

        if (status.status === 'confirmed') {
          console.log(`Ethereum transaction confirmed: ${transaction.transactionHash}`);

          // Process the payment
          await this.paymentService.processCompletedPayment(
            transaction.transactionHash,
            transaction.blockchain
          );
        } else if (status.status === 'failed') {
          console.log(`Ethereum transaction failed for payment ${transaction.id}`);
          await this.paymentService.handleFailedPayment(
            transaction.id,
            'Transaction failed on blockchain'
          );
        }
        // Update confirmation count
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            confirmationCount: status.confirmations,
          },
        });
      }
    } catch (error) {
      console.error('Error processing Ethereum transaction:', error);
    }
  }

  /**
   * Start monitoring with cron
   */
  startMonitoring(): void {
    console.log('Starting transaction monitor...');

    // Run every 5 seconds
    cron.schedule('*/5 * * * * *', async () => {
      await this.monitorPendingTransactions();
    });

    // Also run immediately on start
    this.monitorPendingTransactions();
  }

  /**
   * Start monitoring with interval (alternative to cron)
   */
  startMonitoringWithInterval(): void {
    console.log('Starting transaction monitor with interval...');

    // Run immediately
    this.monitorPendingTransactions();

    // Then run every 5 seconds
    setInterval(async () => {
      await this.monitorPendingTransactions();
    }, TRANSACTION_POLL_INTERVAL_MS);
  }

  /**
   * Manual trigger for testing
   */
  async runOnce(): Promise<void> {
    await this.monitorPendingTransactions();
  }
}

export default TransactionMonitor;

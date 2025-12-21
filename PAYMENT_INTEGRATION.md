# Payment Integration Guide

**Version:** 1.0
**Last Updated:** 2025-12-21
**Status:** Implementation Spec

---

## Table of Contents

1. [Overview](#overview)
2. [Solana Pay Integration](#solana-pay-integration)
3. [Ethereum Payment Integration](#ethereum-payment-integration)
4. [Transaction Monitoring](#transaction-monitoring)
5. [Credit Allocation](#credit-allocation)
6. [Error Handling](#error-handling)
7. [Security](#security)
8. [Testing Strategy](#testing-strategy)

---

## Overview

This document provides detailed technical specifications for implementing crypto payment processing across Solana, Ethereum, and Base networks. The payment system supports both native tokens (SOL, ETH) and stablecoins (USDC, USDT) for purchasing prediction credits and subscriptions.

### Architecture Diagram

```
┌─────────────┐
│   User      │
│  (Frontend) │
└──────┬──────┘
       │
       │ 1. Create Payment Request
       ▼
┌──────────────────────────────────────┐
│   Backend API                        │
│   POST /api/payments/create          │
│   - Generate unique reference        │
│   - Calculate amount in crypto       │
│   - Create transaction record        │
│   - Return payment URL/details       │
└──────┬───────────────────────────────┘
       │
       │ 2. Payment URL/QR Code
       ▼
┌──────────────┐                ┌─────────────────┐
│   User       │  3. Pay        │   Blockchain    │
│   Wallet     │───────────────▶│   (Solana/ETH)  │
└──────────────┘                └────────┬────────┘
                                         │
                                         │ 4. Transaction Broadcast
                                         ▼
                            ┌────────────────────────┐
                            │   RPC Provider         │
                            │   (Helius/Alchemy)     │
                            └───────┬────────────────┘
                                    │
                                    │ 5. Webhook Notification
                                    ▼
                        ┌───────────────────────────┐
                        │   Backend Webhook Handler │
                        │   POST /api/webhooks/*    │
                        │   - Verify signature      │
                        │   - Update transaction    │
                        │   - Monitor confirmations │
                        └──────┬────────────────────┘
                               │
                               │ 6. Confirmed?
                               ▼
                    ┌──────────────────────────┐
                    │   Credit Allocation      │
                    │   - Verify transaction   │
                    │   - Grant credits        │
                    │   - Notify user          │
                    └──────────────────────────┘
```

### Payment Flow States

```
pending → confirming → completed
   ↓           ↓            ↓
failed      failed      refunded
```

---

## Solana Pay Integration

### Installation

```bash
npm install @solana/web3.js @solana/pay @solana/spl-token bs58
```

### Configuration

```typescript
// config/solana.config.ts
import { Connection, Keypair, PublicKey } from '@solana/web3.js';

export const SOLANA_CONFIG = {
  // Network
  network: process.env.SOLANA_NETWORK || 'mainnet-beta',
  rpcUrl: process.env.HELIUS_RPC_URL || 'https://api.mainnet-beta.solana.com',

  // Payment wallet
  paymentWallet: new PublicKey(process.env.SOLANA_PAYMENT_WALLET!),

  // Token addresses
  tokens: {
    SOL: 'native',
    USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // Mainnet USDC
  },

  // Confirmation requirements
  confirmations: {
    finalized: 1, // Wait for finalized commitment
  },

  // Price oracles (for SOL/USD conversion)
  priceOracle: {
    SOL_USD: 'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd',
    USDC_USD: 1.00, // Stablecoin
  }
};

// Create connection
export const connection = new Connection(
  SOLANA_CONFIG.rpcUrl,
  'confirmed'
);
```

### Payment Request Creation

```typescript
// services/payment/solana-payment.service.ts
import { encodeURL, createQR, validateTransfer } from '@solana/pay';
import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { v4 as uuidv4 } from 'uuid';

interface CreatePaymentRequestParams {
  userId: string;
  packageId: 'credits_10' | 'credits_50' | 'credits_100' | 'unlimited_month';
  token: 'SOL' | 'USDC';
}

interface PaymentRequest {
  reference: string;
  paymentUrl: string;
  qrCode: string;
  amount: number;
  token: string;
  recipient: string;
  label: string;
  message: string;
}

export class SolanaPaymentService {

  async createPaymentRequest(params: CreatePaymentRequestParams): Promise<PaymentRequest> {
    const { userId, packageId, token } = params;

    // 1. Get package details
    const packageDetails = this.getPackageDetails(packageId);

    // 2. Calculate amount in crypto
    const amountInCrypto = await this.calculateAmount(packageDetails.usdPrice, token);

    // 3. Generate unique reference
    const reference = new Keypair(); // Use keypair for reference (standard Solana Pay practice)

    // 4. Create transaction record in database
    const transaction = await db.transactions.create({
      data: {
        user_id: userId,
        amount: amountInCrypto,
        currency: token,
        payment_method: 'solana',
        blockchain: 'solana',
        status: 'pending',
        metadata: {
          reference: reference.publicKey.toBase58(),
          packageId,
          usdPrice: packageDetails.usdPrice,
        }
      }
    });

    // 5. Create Solana Pay URL
    const recipient = SOLANA_CONFIG.paymentWallet;
    const splToken = token === 'USDC'
      ? new PublicKey(SOLANA_CONFIG.tokens.USDC)
      : undefined;

    const url = encodeURL({
      recipient,
      amount: amountInCrypto,
      splToken,
      reference: reference.publicKey,
      label: 'Astro Prediction Platform',
      message: `Purchase ${packageDetails.name}`,
      memo: `astro:${transaction.id}:${packageId}`
    });

    // 6. Generate QR code
    const qrCode = await this.generateQRCode(url.toString());

    // 7. Return payment request
    return {
      reference: reference.publicKey.toBase58(),
      paymentUrl: url.toString(),
      qrCode,
      amount: amountInCrypto,
      token,
      recipient: recipient.toBase58(),
      label: 'Astro Prediction Platform',
      message: `Purchase ${packageDetails.name}`
    };
  }

  private async calculateAmount(usdPrice: number, token: 'SOL' | 'USDC'): Promise<number> {
    if (token === 'USDC') {
      // USDC is 1:1 with USD
      return usdPrice;
    }

    // Get SOL/USD price
    const solPrice = await this.getSolPrice();

    // Calculate SOL amount with 1% slippage tolerance
    const solAmount = (usdPrice / solPrice) * 1.01;

    return Number(solAmount.toFixed(9)); // SOL has 9 decimals
  }

  private async getSolPrice(): Promise<number> {
    try {
      const response = await fetch(SOLANA_CONFIG.priceOracle.SOL_USD);
      const data = await response.json();
      return data.solana.usd;
    } catch (error) {
      console.error('Failed to fetch SOL price:', error);
      throw new Error('Unable to fetch current SOL price. Please try again.');
    }
  }

  private getPackageDetails(packageId: string) {
    const packages = {
      credits_10: { name: '10 Credits', usdPrice: 4.99, credits: 10 },
      credits_50: { name: '50 Credits', usdPrice: 19.99, credits: 50 },
      credits_100: { name: '100 Credits', usdPrice: 34.99, credits: 100 },
      unlimited_month: { name: 'Unlimited (30 days)', usdPrice: 49.99, unlimitedDays: 30 }
    };

    return packages[packageId];
  }

  private async generateQRCode(url: string): Promise<string> {
    const qr = createQR(url, 512, 'transparent');
    return qr.toDataURL();
  }
}
```

### Transaction Verification

```typescript
// services/payment/solana-verification.service.ts
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { validateTransfer } from '@solana/pay';
import * as splToken from '@solana/spl-token';

export class SolanaVerificationService {

  async verifyTransaction(signature: string, expectedParams: {
    recipient: string;
    amount: number;
    token?: string;
    reference: string;
  }): Promise<boolean> {
    try {
      const connection = new Connection(SOLANA_CONFIG.rpcUrl, 'confirmed');

      // 1. Get transaction details
      const tx = await connection.getTransaction(signature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0
      });

      if (!tx) {
        throw new Error('Transaction not found');
      }

      // 2. Check transaction succeeded
      if (tx.meta?.err) {
        throw new Error('Transaction failed on blockchain');
      }

      // 3. Validate transfer using @solana/pay
      const recipient = new PublicKey(expectedParams.recipient);
      const reference = new PublicKey(expectedParams.reference);

      if (expectedParams.token && expectedParams.token !== 'SOL') {
        // SPL Token transfer (USDC)
        const splTokenAddress = new PublicKey(expectedParams.token);

        await validateTransfer(
          connection,
          signature,
          {
            recipient,
            amount: BigInt(Math.round(expectedParams.amount * 1e6)), // USDC has 6 decimals
            splToken: splTokenAddress,
            reference
          },
          { commitment: 'confirmed' }
        );
      } else {
        // Native SOL transfer
        await validateTransfer(
          connection,
          signature,
          {
            recipient,
            amount: BigInt(Math.round(expectedParams.amount * 1e9)), // SOL has 9 decimals
            reference
          },
          { commitment: 'confirmed' }
        );
      }

      return true;

    } catch (error) {
      console.error('Transaction verification failed:', error);
      return false;
    }
  }

  async getTransactionStatus(signature: string): Promise<{
    status: 'pending' | 'confirmed' | 'finalized' | 'failed';
    confirmations: number;
    blockTime?: number;
  }> {
    const connection = new Connection(SOLANA_CONFIG.rpcUrl, 'confirmed');

    try {
      const status = await connection.getSignatureStatus(signature, {
        searchTransactionHistory: true
      });

      if (!status || !status.value) {
        return { status: 'pending', confirmations: 0 };
      }

      if (status.value.err) {
        return { status: 'failed', confirmations: 0 };
      }

      const commitment = status.value.confirmationStatus;

      return {
        status: commitment === 'finalized' ? 'finalized' : 'confirmed',
        confirmations: commitment === 'finalized' ? 32 : (status.value.confirmations || 0),
        blockTime: undefined // Can fetch separately if needed
      };

    } catch (error) {
      console.error('Failed to get transaction status:', error);
      return { status: 'pending', confirmations: 0 };
    }
  }
}
```

### Helius Webhook Integration

```typescript
// routes/webhooks/helius.ts
import { Request, Response } from 'express';
import crypto from 'crypto';

export async function heliusWebhookHandler(req: Request, res: Response) {
  try {
    // 1. Verify webhook signature
    const signature = req.headers['x-helius-signature'] as string;
    const isValid = verifyHeliusSignature(req.body, signature);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // 2. Parse webhook payload
    const events = req.body as HeliusWebhookEvent[];

    // 3. Process each transaction
    for (const event of events) {
      await processHeliusEvent(event);
    }

    res.status(200).json({ success: true });

  } catch (error) {
    console.error('Helius webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

function verifyHeliusSignature(payload: any, signature: string): boolean {
  const secret = process.env.HELIUS_WEBHOOK_SECRET!;
  const hash = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');

  return hash === signature;
}

async function processHeliusEvent(event: HeliusWebhookEvent) {
  const { signature, type, description, feePayer, timestamp } = event;

  // Only process transfers to our payment wallet
  if (type !== 'TRANSFER' && type !== 'TOKEN_TRANSFER') {
    return;
  }

  // Find transaction in database by reference
  // Reference is embedded in the transaction memo or as a separate account
  const transaction = await findTransactionBySignature(signature);

  if (!transaction) {
    console.warn(`Transaction not found for signature: ${signature}`);
    return;
  }

  // Update transaction status
  await db.transactions.update({
    where: { id: transaction.id },
    data: {
      transaction_hash: signature,
      status: 'confirming',
      from_wallet: feePayer,
      confirmation_count: 1
    }
  });

  // Start monitoring for finality
  monitorTransactionFinality(signature, transaction.id);
}

async function monitorTransactionFinality(signature: string, transactionId: string) {
  const verificationService = new SolanaVerificationService();
  const maxAttempts = 60; // 60 attempts * 2 seconds = 2 minutes max
  let attempts = 0;

  const interval = setInterval(async () => {
    attempts++;

    const status = await verificationService.getTransactionStatus(signature);

    if (status.status === 'finalized') {
      clearInterval(interval);

      // Get transaction details for verification
      const transaction = await db.transactions.findUnique({
        where: { id: transactionId }
      });

      // Verify transaction details
      const isValid = await verificationService.verifyTransaction(signature, {
        recipient: SOLANA_CONFIG.paymentWallet.toBase58(),
        amount: transaction.amount,
        token: transaction.currency === 'USDC' ? SOLANA_CONFIG.tokens.USDC : undefined,
        reference: transaction.metadata.reference
      });

      if (isValid) {
        // Update to completed and allocate credits
        await db.transactions.update({
          where: { id: transactionId },
          data: {
            status: 'completed',
            confirmed_at: new Date(),
            completed_at: new Date(),
            confirmation_count: 32
          }
        });

        // Allocate credits (see Credit Allocation section)
        await creditAllocationService.allocateCredits(transactionId);
      } else {
        // Transaction verification failed
        await db.transactions.update({
          where: { id: transactionId },
          data: {
            status: 'failed',
            failure_reason: 'Transaction verification failed'
          }
        });
      }
    } else if (status.status === 'failed') {
      clearInterval(interval);

      await db.transactions.update({
        where: { id: transactionId },
        data: {
          status: 'failed',
          failure_reason: 'Transaction failed on blockchain'
        }
      });
    } else if (attempts >= maxAttempts) {
      clearInterval(interval);

      console.error(`Transaction ${signature} did not finalize within 2 minutes`);
      // Keep as 'confirming', will be picked up by polling job
    }
  }, 2000); // Check every 2 seconds
}

interface HeliusWebhookEvent {
  signature: string;
  type: string;
  description: string;
  source: string;
  fee: number;
  feePayer: string;
  timestamp: number;
  nativeTransfers?: Array<{
    fromUserAccount: string;
    toUserAccount: string;
    amount: number;
  }>;
  tokenTransfers?: Array<{
    fromUserAccount: string;
    toUserAccount: string;
    mint: string;
    tokenAmount: number;
  }>;
}
```

---

## Ethereum Payment Integration

### Installation

```bash
npm install ethers viem @rainbow-me/rainbowkit wagmi
```

### Configuration

```typescript
// config/ethereum.config.ts
import { ethers } from 'ethers';

export const ETHEREUM_CONFIG = {
  chains: {
    ethereum: {
      chainId: 1,
      name: 'Ethereum Mainnet',
      rpcUrl: process.env.ALCHEMY_ETHEREUM_RPC!,
      paymentWallet: process.env.ETHEREUM_PAYMENT_WALLET!,
      confirmations: 12,
      blockTime: 12000, // 12 seconds
      tokens: {
        USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7'
      }
    },
    base: {
      chainId: 8453,
      name: 'Base',
      rpcUrl: process.env.ALCHEMY_BASE_RPC!,
      paymentWallet: process.env.BASE_PAYMENT_WALLET!,
      confirmations: 5,
      blockTime: 2000, // 2 seconds
      tokens: {
        USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
      }
    }
  },

  // ERC20 ABI (minimal for transfers)
  erc20Abi: [
    'function transfer(address to, uint256 amount) returns (bool)',
    'function balanceOf(address owner) view returns (uint256)',
    'function decimals() view returns (uint8)'
  ],

  // Price oracles
  priceOracle: {
    ETH_USD: 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
    USDC_USD: 1.00,
    USDT_USD: 1.00
  }
};

// Create providers
export const providers = {
  ethereum: new ethers.providers.JsonRpcProvider(ETHEREUM_CONFIG.chains.ethereum.rpcUrl),
  base: new ethers.providers.JsonRpcProvider(ETHEREUM_CONFIG.chains.base.rpcUrl)
};
```

### Payment Request Creation

```typescript
// services/payment/ethereum-payment.service.ts
import { ethers } from 'ethers';
import { v4 as uuidv4 } from 'uuid';

interface CreateEthereumPaymentRequestParams {
  userId: string;
  packageId: string;
  chain: 'ethereum' | 'base';
  token: 'ETH' | 'USDC' | 'USDT';
}

interface EthereumPaymentRequest {
  reference: string;
  to: string;
  value: string; // Wei for ETH, token units for ERC20
  tokenAddress?: string;
  chainId: number;
  data?: string;
}

export class EthereumPaymentService {

  async createPaymentRequest(params: CreateEthereumPaymentRequestParams): Promise<EthereumPaymentRequest> {
    const { userId, packageId, chain, token } = params;

    // 1. Get chain config
    const chainConfig = ETHEREUM_CONFIG.chains[chain];

    // 2. Get package details
    const packageDetails = this.getPackageDetails(packageId);

    // 3. Calculate amount in crypto
    const amountInCrypto = await this.calculateAmount(packageDetails.usdPrice, token);

    // 4. Generate unique reference
    const reference = uuidv4();

    // 5. Prepare payment data
    let value: string;
    let tokenAddress: string | undefined;

    if (token === 'ETH') {
      // Native ETH payment
      value = ethers.utils.parseEther(amountInCrypto.toString()).toString();
      tokenAddress = undefined;
    } else {
      // ERC20 token payment
      tokenAddress = chainConfig.tokens[token];
      const decimals = token === 'USDC' || token === 'USDT' ? 6 : 18;
      value = ethers.utils.parseUnits(amountInCrypto.toString(), decimals).toString();
    }

    // 6. Create transaction record
    await db.transactions.create({
      data: {
        user_id: userId,
        amount: amountInCrypto,
        currency: token,
        payment_method: chain,
        blockchain: chain,
        to_wallet: chainConfig.paymentWallet,
        status: 'pending',
        metadata: {
          reference,
          packageId,
          usdPrice: packageDetails.usdPrice,
          chainId: chainConfig.chainId,
          tokenAddress
        }
      }
    });

    // 7. Return payment request
    return {
      reference,
      to: chainConfig.paymentWallet,
      value,
      tokenAddress,
      chainId: chainConfig.chainId
    };
  }

  private async calculateAmount(usdPrice: number, token: string): Promise<number> {
    if (token === 'USDC' || token === 'USDT') {
      return usdPrice;
    }

    // Get ETH/USD price
    const ethPrice = await this.getEthPrice();

    // Calculate ETH amount with 1% slippage tolerance
    const ethAmount = (usdPrice / ethPrice) * 1.01;

    return Number(ethAmount.toFixed(18));
  }

  private async getEthPrice(): Promise<number> {
    try {
      const response = await fetch(ETHEREUM_CONFIG.priceOracle.ETH_USD);
      const data = await response.json();
      return data.ethereum.usd;
    } catch (error) {
      console.error('Failed to fetch ETH price:', error);
      throw new Error('Unable to fetch current ETH price');
    }
  }

  private getPackageDetails(packageId: string) {
    const packages = {
      credits_10: { name: '10 Credits', usdPrice: 4.99, credits: 10 },
      credits_50: { name: '50 Credits', usdPrice: 19.99, credits: 50 },
      credits_100: { name: '100 Credits', usdPrice: 34.99, credits: 100 },
      unlimited_month: { name: 'Unlimited (30 days)', usdPrice: 49.99, unlimitedDays: 30 }
    };

    return packages[packageId];
  }
}
```

### Transaction Monitoring (Polling)

```typescript
// services/payment/ethereum-monitoring.service.ts
import { ethers } from 'ethers';

export class EthereumMonitoringService {

  async monitorTransaction(txHash: string, chain: 'ethereum' | 'base'): Promise<void> {
    const chainConfig = ETHEREUM_CONFIG.chains[chain];
    const provider = providers[chain];

    let confirmations = 0;
    const requiredConfirmations = chainConfig.confirmations;

    while (confirmations < requiredConfirmations) {
      try {
        // Get transaction receipt
        const receipt = await provider.getTransactionReceipt(txHash);

        if (!receipt) {
          // Transaction not yet included in a block
          console.log(`Transaction ${txHash} pending...`);
          await this.sleep(15000); // Wait 15 seconds
          continue;
        }

        // Check if transaction succeeded
        if (receipt.status === 0) {
          // Transaction failed
          await this.markTransactionFailed(txHash, 'Transaction reverted');
          return;
        }

        // Calculate confirmations
        const currentBlock = await provider.getBlockNumber();
        confirmations = currentBlock - receipt.blockNumber + 1;

        console.log(`Transaction ${txHash}: ${confirmations}/${requiredConfirmations} confirmations`);

        // Update transaction in database
        await db.transactions.updateMany({
          where: { transaction_hash: txHash },
          data: {
            status: confirmations >= requiredConfirmations ? 'completed' : 'confirming',
            confirmation_count: confirmations
          }
        });

        if (confirmations < requiredConfirmations) {
          await this.sleep(chainConfig.blockTime); // Wait for next block
        }

      } catch (error) {
        console.error(`Error monitoring transaction ${txHash}:`, error);
        await this.sleep(15000);
      }
    }

    // Transaction fully confirmed
    await this.finalizeTransaction(txHash);
  }

  private async finalizeTransaction(txHash: string): Promise<void> {
    const transaction = await db.transactions.findFirst({
      where: { transaction_hash: txHash }
    });

    if (!transaction) {
      console.error(`Transaction ${txHash} not found in database`);
      return;
    }

    // Verify transaction details
    const isValid = await this.verifyTransaction(txHash, transaction);

    if (isValid) {
      // Update to completed
      await db.transactions.update({
        where: { id: transaction.id },
        data: {
          status: 'completed',
          confirmed_at: new Date(),
          completed_at: new Date()
        }
      });

      // Allocate credits
      await creditAllocationService.allocateCredits(transaction.id);
    } else {
      await this.markTransactionFailed(txHash, 'Transaction verification failed');
    }
  }

  private async verifyTransaction(txHash: string, expectedTransaction: any): Promise<boolean> {
    const chain = expectedTransaction.blockchain;
    const provider = providers[chain];

    try {
      const tx = await provider.getTransaction(txHash);

      if (!tx) {
        return false;
      }

      // Verify recipient
      if (tx.to?.toLowerCase() !== expectedTransaction.to_wallet?.toLowerCase() &&
          !expectedTransaction.metadata.tokenAddress) {
        console.error('Recipient mismatch');
        return false;
      }

      // Verify amount (with 2% tolerance for price fluctuation)
      if (expectedTransaction.metadata.tokenAddress) {
        // ERC20 transfer - verify via logs
        const receipt = await provider.getTransactionReceipt(txHash);
        const transferLog = receipt.logs.find(log =>
          log.topics[0] === ethers.utils.id('Transfer(address,address,uint256)')
        );

        if (!transferLog) {
          console.error('Transfer log not found');
          return false;
        }

        const decimals = expectedTransaction.currency === 'USDC' || expectedTransaction.currency === 'USDT' ? 6 : 18;
        const expectedAmount = ethers.utils.parseUnits(
          expectedTransaction.amount.toString(),
          decimals
        );
        const actualAmount = ethers.BigNumber.from(transferLog.data);

        const tolerance = expectedAmount.mul(2).div(100); // 2% tolerance
        const diff = actualAmount.sub(expectedAmount).abs();

        if (diff.gt(tolerance)) {
          console.error('Amount mismatch');
          return false;
        }
      } else {
        // Native ETH transfer
        const expectedValue = ethers.utils.parseEther(expectedTransaction.amount.toString());
        const tolerance = expectedValue.mul(2).div(100);
        const diff = tx.value.sub(expectedValue).abs();

        if (diff.gt(tolerance)) {
          console.error('Value mismatch');
          return false;
        }
      }

      return true;

    } catch (error) {
      console.error('Transaction verification error:', error);
      return false;
    }
  }

  private async markTransactionFailed(txHash: string, reason: string): Promise<void> {
    await db.transactions.updateMany({
      where: { transaction_hash: txHash },
      data: {
        status: 'failed',
        failure_reason: reason
      }
    });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

---

## Transaction Monitoring

### Webhook vs Polling Strategy

We use a **hybrid approach**:
1. **Primary**: Webhooks (real-time, efficient)
2. **Backup**: Polling (reliable fallback)

### Polling Job (Backup Monitoring)

```typescript
// jobs/transaction-monitoring.job.ts
import cron from 'node-cron';

export class TransactionMonitoringJob {

  // Run every minute
  static schedule = '* * * * *';

  static async run() {
    console.log('[TransactionMonitoringJob] Starting...');

    // Find all pending/confirming transactions older than 5 minutes
    const staleTransactions = await db.transactions.findMany({
      where: {
        status: { in: ['pending', 'confirming'] },
        created_at: {
          lt: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
        }
      }
    });

    console.log(`[TransactionMonitoringJob] Found ${staleTransactions.length} stale transactions`);

    // Process each transaction
    for (const tx of staleTransactions) {
      try {
        if (!tx.transaction_hash) {
          // No hash yet, user hasn't submitted payment
          // Mark as failed if older than 30 minutes
          if (new Date(tx.created_at).getTime() < Date.now() - 30 * 60 * 1000) {
            await db.transactions.update({
              where: { id: tx.id },
              data: {
                status: 'failed',
                failure_reason: 'Payment not submitted within 30 minutes'
              }
            });
          }
          continue;
        }

        // Check status on blockchain
        if (tx.blockchain === 'solana') {
          await this.checkSolanaTransaction(tx);
        } else {
          await this.checkEthereumTransaction(tx);
        }

      } catch (error) {
        console.error(`[TransactionMonitoringJob] Error processing transaction ${tx.id}:`, error);
      }
    }

    console.log('[TransactionMonitoringJob] Completed');
  }

  private static async checkSolanaTransaction(tx: any) {
    const verificationService = new SolanaVerificationService();
    const status = await verificationService.getTransactionStatus(tx.transaction_hash);

    if (status.status === 'finalized') {
      // Verify and complete
      const isValid = await verificationService.verifyTransaction(
        tx.transaction_hash,
        {
          recipient: SOLANA_CONFIG.paymentWallet.toBase58(),
          amount: tx.amount,
          token: tx.currency === 'USDC' ? SOLANA_CONFIG.tokens.USDC : undefined,
          reference: tx.metadata.reference
        }
      );

      if (isValid) {
        await db.transactions.update({
          where: { id: tx.id },
          data: {
            status: 'completed',
            confirmed_at: new Date(),
            completed_at: new Date()
          }
        });

        await creditAllocationService.allocateCredits(tx.id);
      } else {
        await db.transactions.update({
          where: { id: tx.id },
          data: {
            status: 'failed',
            failure_reason: 'Verification failed'
          }
        });
      }
    } else if (status.status === 'failed') {
      await db.transactions.update({
        where: { id: tx.id },
        data: {
          status: 'failed',
          failure_reason: 'Transaction failed on blockchain'
        }
      });
    }
  }

  private static async checkEthereumTransaction(tx: any) {
    const provider = providers[tx.blockchain];

    try {
      const receipt = await provider.getTransactionReceipt(tx.transaction_hash);

      if (!receipt) {
        // Still pending
        return;
      }

      if (receipt.status === 0) {
        // Failed
        await db.transactions.update({
          where: { id: tx.id },
          data: {
            status: 'failed',
            failure_reason: 'Transaction reverted'
          }
        });
        return;
      }

      // Get confirmations
      const currentBlock = await provider.getBlockNumber();
      const confirmations = currentBlock - receipt.blockNumber + 1;
      const required = ETHEREUM_CONFIG.chains[tx.blockchain].confirmations;

      if (confirmations >= required) {
        // Fully confirmed
        const monitoringService = new EthereumMonitoringService();
        await monitoringService['finalizeTransaction'](tx.transaction_hash);
      } else {
        // Update confirmation count
        await db.transactions.update({
          where: { id: tx.id },
          data: {
            confirmation_count: confirmations
          }
        });
      }

    } catch (error) {
      console.error(`Error checking Ethereum transaction ${tx.transaction_hash}:`, error);
    }
  }
}

// Register cron job
cron.schedule(TransactionMonitoringJob.schedule, () => {
  TransactionMonitoringJob.run();
});
```

---

## Credit Allocation

### Atomic Credit Granting

```typescript
// services/credits/credit-allocation.service.ts
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

export class CreditAllocationService {

  async allocateCredits(transactionId: string): Promise<void> {
    // Use database transaction for atomicity
    await db.$transaction(async (tx) => {
      // 1. Get transaction details
      const transaction = await tx.transactions.findUnique({
        where: { id: transactionId },
        include: { user: true }
      });

      if (!transaction) {
        throw new Error(`Transaction ${transactionId} not found`);
      }

      if (transaction.status !== 'completed') {
        throw new Error(`Transaction ${transactionId} is not completed`);
      }

      // Check if already allocated (idempotency)
      if (transaction.credits_granted !== null) {
        console.log(`Credits already allocated for transaction ${transactionId}`);
        return;
      }

      // 2. Get package details
      const packageId = transaction.metadata.packageId;
      const packageDetails = this.getPackageDetails(packageId);

      // 3. Update user credits (if package includes credits)
      if (packageDetails.credits) {
        const userCredits = await tx.user_credits.upsert({
          where: { user_id: transaction.user_id },
          create: {
            user_id: transaction.user_id,
            credits_balance: packageDetails.credits,
            credits_purchased_lifetime: packageDetails.credits,
            last_credit_purchase_at: new Date()
          },
          update: {
            credits_balance: { increment: packageDetails.credits },
            credits_purchased_lifetime: { increment: packageDetails.credits },
            last_credit_purchase_at: new Date()
          }
        });

        console.log(`Granted ${packageDetails.credits} credits to user ${transaction.user_id}`);
      }

      // 4. Update subscription (if package includes unlimited access)
      if (packageDetails.unlimitedDays) {
        const currentExpiry = transaction.user.subscription_expires_at || new Date();
        const newExpiry = new Date(
          Math.max(currentExpiry.getTime(), new Date().getTime()) +
          packageDetails.unlimitedDays * 24 * 60 * 60 * 1000
        );

        await tx.users.update({
          where: { id: transaction.user_id },
          data: {
            subscription_tier: 'pro',
            subscription_status: 'active',
            subscription_expires_at: newExpiry
          }
        });

        console.log(`Activated pro subscription for user ${transaction.user_id} until ${newExpiry}`);
      }

      // 5. Update transaction record
      await tx.transactions.update({
        where: { id: transactionId },
        data: {
          credits_granted: packageDetails.credits || 0,
          subscription_days_granted: packageDetails.unlimitedDays || 0,
          subscription_tier_granted: packageDetails.unlimitedDays ? 'pro' : null
        }
      });

      // 6. Log usage event
      await tx.usage_logs.create({
        data: {
          user_id: transaction.user_id,
          action: 'credits_purchased',
          credits_used: 0,
          metadata: {
            transaction_id: transactionId,
            package_id: packageId,
            credits_granted: packageDetails.credits,
            subscription_days: packageDetails.unlimitedDays
          }
        }
      });
    });

    // 7. Send notification (outside transaction to avoid rollback issues)
    await this.sendSuccessNotification(transactionId);
  }

  private async sendSuccessNotification(transactionId: string): Promise<void> {
    const transaction = await db.transactions.findUnique({
      where: { id: transactionId },
      include: { user: true }
    });

    if (!transaction) return;

    const packageDetails = this.getPackageDetails(transaction.metadata.packageId);

    // Email notification
    await emailService.send({
      to: transaction.user.email,
      subject: 'Payment Successful - Credits Added!',
      template: 'payment-success',
      data: {
        userName: transaction.user.username,
        packageName: packageDetails.name,
        credits: packageDetails.credits,
        transactionHash: transaction.transaction_hash,
        amount: transaction.amount,
        currency: transaction.currency
      }
    });

    // In-app notification
    await notificationService.create({
      userId: transaction.user_id,
      type: 'payment_success',
      title: 'Payment Successful!',
      message: packageDetails.credits
        ? `${packageDetails.credits} credits have been added to your account.`
        : `Your pro subscription is now active for ${packageDetails.unlimitedDays} days.`,
      action: {
        label: 'Start Predicting',
        url: '/predictions/new'
      }
    });
  }

  private getPackageDetails(packageId: string) {
    const packages = {
      credits_10: { name: '10 Credits', usdPrice: 4.99, credits: 10, unlimitedDays: 0 },
      credits_50: { name: '50 Credits', usdPrice: 19.99, credits: 50, unlimitedDays: 0 },
      credits_100: { name: '100 Credits', usdPrice: 34.99, credits: 100, unlimitedDays: 0 },
      unlimited_month: { name: 'Unlimited (30 days)', usdPrice: 49.99, credits: 0, unlimitedDays: 30 }
    };

    return packages[packageId] || packages.credits_10;
  }
}

export const creditAllocationService = new CreditAllocationService();
```

---

## Error Handling

### Comprehensive Error Scenarios

```typescript
// utils/payment-errors.ts

export class PaymentError extends Error {
  constructor(
    public code: string,
    message: string,
    public userMessage: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'PaymentError';
  }
}

export const PAYMENT_ERRORS = {
  // User errors
  INSUFFICIENT_FUNDS: new PaymentError(
    'INSUFFICIENT_FUNDS',
    'User wallet has insufficient funds',
    'Your wallet does not have enough funds to complete this purchase. Please add funds and try again.',
    false
  ),

  INVALID_AMOUNT: new PaymentError(
    'INVALID_AMOUNT',
    'Payment amount does not match expected amount',
    'Payment amount mismatch. Please contact support.',
    false
  ),

  TRANSACTION_CANCELLED: new PaymentError(
    'TRANSACTION_CANCELLED',
    'User cancelled the transaction',
    'Transaction cancelled.',
    true
  ),

  // Blockchain errors
  TRANSACTION_FAILED: new PaymentError(
    'TRANSACTION_FAILED',
    'Transaction failed on blockchain',
    'Your transaction failed on the blockchain. Please try again.',
    true
  ),

  CONFIRMATION_TIMEOUT: new PaymentError(
    'CONFIRMATION_TIMEOUT',
    'Transaction did not confirm within expected timeframe',
    'Transaction is taking longer than expected. Please check your wallet or contact support.',
    false
  ),

  CHAIN_REORGANIZATION: new PaymentError(
    'CHAIN_REORGANIZATION',
    'Blockchain reorganization detected',
    'A blockchain reorganization occurred. Your transaction is being re-verified.',
    false
  ),

  // Service errors
  RPC_ERROR: new PaymentError(
    'RPC_ERROR',
    'RPC provider error',
    'Unable to connect to blockchain network. Please try again.',
    true
  ),

  WEBHOOK_ERROR: new PaymentError(
    'WEBHOOK_ERROR',
    'Webhook processing failed',
    'Payment processing encountered an error. Our team has been notified.',
    false
  ),

  PRICE_FETCH_ERROR: new PaymentError(
    'PRICE_FETCH_ERROR',
    'Failed to fetch current price',
    'Unable to fetch current exchange rate. Please try again.',
    true
  ),

  // Database errors
  TRANSACTION_NOT_FOUND: new PaymentError(
    'TRANSACTION_NOT_FOUND',
    'Transaction record not found in database',
    'Transaction not found. Please contact support.',
    false
  ),

  DUPLICATE_TRANSACTION: new PaymentError(
    'DUPLICATE_TRANSACTION',
    'Transaction already processed',
    'This transaction has already been processed.',
    false
  ),

  CREDIT_ALLOCATION_ERROR: new PaymentError(
    'CREDIT_ALLOCATION_ERROR',
    'Failed to allocate credits',
    'Payment received but credits could not be allocated. Our team has been notified and will resolve this shortly.',
    false
  )
};

// Error handler middleware
export function handlePaymentError(error: Error): { code: string; message: string; retryable: boolean } {
  if (error instanceof PaymentError) {
    return {
      code: error.code,
      message: error.userMessage,
      retryable: error.retryable
    };
  }

  // Unknown error
  console.error('Unexpected payment error:', error);
  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred. Please try again or contact support.',
    retryable: true
  };
}
```

### Retry Logic

```typescript
// utils/retry.ts

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffMultiplier?: number;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2
  } = options;

  let lastError: Error;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries) {
        console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay = Math.min(delay * backoffMultiplier, maxDelay);
      }
    }
  }

  throw lastError!;
}

// Usage example
const solPrice = await retryWithBackoff(
  () => getSolPrice(),
  { maxRetries: 3, initialDelay: 1000 }
);
```

---

## Security

### Security Checklist

- [ ] **Never trust frontend**: All payment amounts verified on backend
- [ ] **Signature verification**: Webhook signatures verified
- [ ] **Idempotency**: Duplicate transactions prevented (check transaction_hash)
- [ ] **Atomic operations**: Credit allocation uses database transactions
- [ ] **Amount verification**: Verify payment amount matches expected (with tolerance)
- [ ] **Recipient verification**: Verify payment sent to correct wallet
- [ ] **Private key security**: Payment wallet keys stored in secure vault (AWS Secrets Manager, HashiCorp Vault)
- [ ] **Rate limiting**: Prevent rapid-fire payment requests
- [ ] **Confirmation requirements**: Wait for sufficient confirmations before crediting
- [ ] **Logging**: All payment operations logged for audit trail
- [ ] **Monitoring**: Alert on suspicious patterns (many failed payments, unusual amounts)

### Amount Verification with Tolerance

```typescript
function verifyAmount(actualAmount: number, expectedAmount: number, tolerance: number = 0.02): boolean {
  const diff = Math.abs(actualAmount - expectedAmount);
  const maxDiff = expectedAmount * tolerance;

  return diff <= maxDiff;
}

// Example
const expected = 4.99; // USD
const actual = 5.05; // User paid slightly more due to price fluctuation
const isValid = verifyAmount(actual, expected, 0.02); // true (within 2%)
```

### Idempotency Check

```typescript
async function processTransaction(txHash: string): Promise<void> {
  // Check if already processed
  const existing = await db.transactions.findFirst({
    where: { transaction_hash: txHash }
  });

  if (existing && existing.status === 'completed') {
    console.log(`Transaction ${txHash} already processed`);
    return;
  }

  // Process...
}
```

---

## Testing Strategy

### Test Networks

- **Solana**: Devnet (`https://api.devnet.solana.com`)
- **Ethereum**: Sepolia (`chainId: 11155111`)
- **Base**: Base Sepolia (`chainId: 84532`)

### Test Wallets

Create dedicated test wallets for each network:

```bash
# Solana devnet
solana-keygen new --outfile test-wallet.json
solana airdrop 2 <PUBKEY> --url devnet

# Ethereum Sepolia
# Use MetaMask, request testnet ETH from https://sepoliafaucet.com

# Base Sepolia
# Bridge from Sepolia to Base Sepolia at https://bridge.base.org
```

### Test Cases

```typescript
// Test suite
describe('Payment Integration', () => {

  describe('Solana Pay', () => {
    it('should create payment request for SOL', async () => {
      const request = await solanaService.createPaymentRequest({
        userId: 'test-user',
        packageId: 'credits_10',
        token: 'SOL'
      });

      expect(request).toHaveProperty('reference');
      expect(request).toHaveProperty('paymentUrl');
      expect(request.amount).toBeGreaterThan(0);
    });

    it('should verify valid SOL transaction', async () => {
      const signature = 'valid-signature';
      const isValid = await solanaVerification.verifyTransaction(signature, {
        recipient: PAYMENT_WALLET,
        amount: 0.1,
        reference: 'test-reference'
      });

      expect(isValid).toBe(true);
    });

    it('should reject transaction with wrong amount', async () => {
      // ... test amount mismatch
    });

    it('should handle duplicate transactions', async () => {
      // ... test idempotency
    });
  });

  describe('Ethereum Pay', () => {
    it('should create payment request for ETH', async () => {
      // ... similar tests
    });

    it('should create payment request for USDC', async () => {
      // ... ERC20 token tests
    });

    it('should wait for required confirmations', async () => {
      // ... confirmation tracking tests
    });
  });

  describe('Credit Allocation', () => {
    it('should grant credits atomically', async () => {
      await creditService.allocateCredits(transactionId);

      const credits = await db.user_credits.findUnique({
        where: { user_id: userId }
      });

      expect(credits.credits_balance).toBe(10);
    });

    it('should activate subscription for unlimited package', async () => {
      // ... subscription activation tests
    });

    it('should not double-allocate credits', async () => {
      // First allocation
      await creditService.allocateCredits(transactionId);

      // Attempt second allocation (should be idempotent)
      await creditService.allocateCredits(transactionId);

      const credits = await db.user_credits.findUnique({
        where: { user_id: userId }
      });

      expect(credits.credits_balance).toBe(10); // Not 20
    });
  });

  describe('Error Handling', () => {
    it('should handle RPC failures gracefully', async () => {
      // ... test RPC error handling
    });

    it('should retry failed operations', async () => {
      // ... test retry logic
    });

    it('should provide user-friendly error messages', async () => {
      // ... test error messaging
    });
  });
});
```

### End-to-End Testing Flow

1. **Setup**: Create test user, fund test wallet
2. **Create payment**: Call API to create payment request
3. **Submit transaction**: Use test wallet to send payment
4. **Wait for confirmation**: Monitor transaction status
5. **Verify credits**: Check user credits updated
6. **Verify transaction record**: Check database state
7. **Cleanup**: Reset test data

```typescript
// E2E test
it('should complete full payment flow', async () => {
  // 1. Create test user
  const user = await createTestUser();

  // 2. Create payment request
  const paymentRequest = await request(app)
    .post('/api/payments/solana/create-payment-request')
    .set('Authorization', `Bearer ${user.token}`)
    .send({ packageId: 'credits_10' })
    .expect(200);

  const { reference, amount, recipient } = paymentRequest.body;

  // 3. Submit payment from test wallet
  const signature = await submitTestPayment({
    from: TEST_WALLET,
    to: recipient,
    amount,
    reference
  });

  // 4. Wait for processing (webhook simulation)
  await processWebhook({
    signature,
    type: 'TRANSFER',
    amount
  });

  // 5. Wait for confirmation
  await waitForTransactionStatus(reference, 'completed', { timeout: 60000 });

  // 6. Verify credits granted
  const credits = await request(app)
    .get('/api/users/me/credits')
    .set('Authorization', `Bearer ${user.token}`)
    .expect(200);

  expect(credits.body.balance).toBe(10);

  // 7. Verify transaction record
  const txRecord = await db.transactions.findFirst({
    where: { transaction_hash: signature }
  });

  expect(txRecord.status).toBe('completed');
  expect(txRecord.credits_granted).toBe(10);
});
```

---

## Production Deployment Checklist

- [ ] Set up production payment wallets (hardware wallet or MPC)
- [ ] Store private keys in secure vault (AWS Secrets Manager / HashiCorp Vault)
- [ ] Configure production RPC endpoints (Helius, Alchemy)
- [ ] Set up webhook endpoints with HTTPS
- [ ] Configure webhook signature secrets
- [ ] Enable monitoring (Sentry, DataDog)
- [ ] Set up alerting (PagerDuty, Slack)
- [ ] Configure backup monitoring (polling job)
- [ ] Test failover between RPC providers
- [ ] Enable rate limiting
- [ ] Set up database backups
- [ ] Document disaster recovery procedures
- [ ] Conduct security audit
- [ ] Test payment flow on testnet
- [ ] Test with real (small) transactions before full launch
- [ ] Set up customer support for payment issues
- [ ] Create runbook for common payment issues
- [ ] Monitor first 100 transactions closely

---

## Conclusion

This payment integration guide provides a comprehensive, production-ready implementation for crypto payments across Solana, Ethereum, and Base networks. Key features include:

- ✅ Multi-chain support (Solana, Ethereum, Base)
- ✅ Multi-token support (SOL, ETH, USDC, USDT)
- ✅ QR code payments (Solana Pay)
- ✅ Real-time transaction monitoring (webhooks + polling)
- ✅ Atomic credit allocation
- ✅ Comprehensive error handling
- ✅ Security best practices
- ✅ Extensive testing

Follow this guide to implement a robust payment system that provides a seamless user experience while maintaining security and reliability.

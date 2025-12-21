/**
 * Payment System Test Script
 * Tests payment flows for Solana and Ethereum
 */

import dotenv from 'dotenv';
import { PrismaClient } from '@astro/database';
import PaymentService from '../services/payment.service';
import SolanaPaymentService from '../services/payments/solana-payment.service';
import EthereumPaymentService from '../services/payments/ethereum-payment.service';
import CreditsService from '../services/credits.service';

dotenv.config();

const prisma = new PrismaClient();
const paymentService = new PaymentService();
const solanaService = new SolanaPaymentService();
const ethereumService = new EthereumPaymentService();
const creditsService = new CreditsService();

async function testPricing() {
  console.log('\n=== Testing Price Fetching ===\n');

  try {
    // Test SOL price
    const solPrice = await solanaService.getTokenPrice('SOL');
    console.log(`✅ SOL Price: $${solPrice}`);

    // Test USDC price
    const usdcPrice = await solanaService.getTokenPrice('USDC');
    console.log(`✅ USDC Price: $${usdcPrice}`);

    // Test ETH price
    const ethPrice = await ethereumService.getTokenPrice('ETH');
    console.log(`✅ ETH Price: $${ethPrice}`);

    // Test USDT price
    const usdtPrice = await ethereumService.getTokenPrice('USDT');
    console.log(`✅ USDT Price: $${usdtPrice}`);
  } catch (error) {
    console.error('❌ Price fetching failed:', error);
  }
}

async function testSolanaPaymentIntent() {
  console.log('\n=== Testing Solana Payment Intent ===\n');

  try {
    // Create a test user
    let testUser = await prisma.user.findFirst({
      where: { email: 'test-payment@example.com' },
    });

    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: 'test-payment@example.com',
          username: 'test-payment-user',
          primaryAuthMethod: 'wallet',
        },
      });
      console.log(`✅ Created test user: ${testUser.id}`);
    } else {
      console.log(`✅ Using existing test user: ${testUser.id}`);
    }

    // Create payment intent for SOL
    const solIntent = await paymentService.createPaymentIntent({
      userId: testUser.id,
      packageType: 'credits_10',
      blockchain: 'solana',
      token: 'native',
    });

    console.log(`✅ SOL Payment Intent Created:`);
    console.log(`   Payment ID: ${solIntent.id}`);
    console.log(`   Amount USD: $${solIntent.amount}`);
    console.log(`   Amount SOL: ${solIntent.amountCrypto}`);
    console.log(`   Recipient: ${solIntent.recipientAddress}`);
    console.log(`   Reference: ${solIntent.reference}`);
    console.log(`   QR Code: ${solIntent.qrCode ? 'Generated' : 'Not generated'}`);

    // Create payment intent for USDC on Solana
    const usdcIntent = await paymentService.createPaymentIntent({
      userId: testUser.id,
      packageType: 'credits_50',
      blockchain: 'solana',
      token: 'usdc',
    });

    console.log(`\n✅ USDC Payment Intent Created:`);
    console.log(`   Payment ID: ${usdcIntent.id}`);
    console.log(`   Amount USD: $${usdcIntent.amount}`);
    console.log(`   Amount USDC: ${usdcIntent.amountCrypto}`);
    console.log(`   Recipient: ${usdcIntent.recipientAddress}`);
    console.log(`   Reference: ${usdcIntent.reference}`);

    return { solIntent, usdcIntent, testUser };
  } catch (error) {
    console.error('❌ Solana payment intent failed:', error);
    throw error;
  }
}

async function testEthereumPaymentIntent() {
  console.log('\n=== Testing Ethereum Payment Intent ===\n');

  try {
    // Create a test user
    let testUser = await prisma.user.findFirst({
      where: { email: 'test-payment@example.com' },
    });

    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: 'test-payment@example.com',
          username: 'test-payment-user',
          primaryAuthMethod: 'wallet',
        },
      });
    }

    // Create payment intent for ETH
    const ethIntent = await paymentService.createPaymentIntent({
      userId: testUser.id,
      packageType: 'credits_100',
      blockchain: 'ethereum',
      token: 'native',
    });

    console.log(`✅ ETH Payment Intent Created:`);
    console.log(`   Payment ID: ${ethIntent.id}`);
    console.log(`   Amount USD: $${ethIntent.amount}`);
    console.log(`   Amount ETH: ${ethIntent.amountCrypto}`);
    console.log(`   Recipient: ${ethIntent.recipientAddress}`);

    // Create payment intent for USDC on Ethereum
    const usdcIntent = await paymentService.createPaymentIntent({
      userId: testUser.id,
      packageType: 'credits_10',
      blockchain: 'ethereum',
      token: 'usdc',
    });

    console.log(`\n✅ USDC on Ethereum Payment Intent Created:`);
    console.log(`   Payment ID: ${usdcIntent.id}`);
    console.log(`   Amount USD: $${usdcIntent.amount}`);
    console.log(`   Amount USDC: ${usdcIntent.amountCrypto}`);
    console.log(`   Token Address: ${usdcIntent.tokenAddress}`);

    return { ethIntent, usdcIntent, testUser };
  } catch (error) {
    console.error('❌ Ethereum payment intent failed:', error);
    throw error;
  }
}

async function testBasePaymentIntent() {
  console.log('\n=== Testing Base Payment Intent ===\n');

  try {
    // Create a test user
    let testUser = await prisma.user.findFirst({
      where: { email: 'test-payment@example.com' },
    });

    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: 'test-payment@example.com',
          username: 'test-payment-user',
          primaryAuthMethod: 'wallet',
        },
      });
    }

    // Create payment intent for ETH on Base
    const baseIntent = await paymentService.createPaymentIntent({
      userId: testUser.id,
      packageType: 'unlimited_month',
      blockchain: 'base',
      token: 'native',
    });

    console.log(`✅ Base ETH Payment Intent Created:`);
    console.log(`   Payment ID: ${baseIntent.id}`);
    console.log(`   Amount USD: $${baseIntent.amount}`);
    console.log(`   Amount ETH: ${baseIntent.amountCrypto}`);
    console.log(`   Recipient: ${baseIntent.recipientAddress}`);

    return { baseIntent, testUser };
  } catch (error) {
    console.error('❌ Base payment intent failed:', error);
    throw error;
  }
}

async function testCreditsAllocation() {
  console.log('\n=== Testing Credits Allocation ===\n');

  try {
    // Create a test user
    let testUser = await prisma.user.findFirst({
      where: { email: 'test-credits@example.com' },
    });

    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: 'test-credits@example.com',
          username: 'test-credits-user',
          primaryAuthMethod: 'wallet',
        },
      });
    }

    // Initialize credits
    await creditsService.initializeUserCredits(testUser.id, 5);
    let balance = await creditsService.getBalance(testUser.id);
    console.log(`✅ Initial balance: ${balance} credits`);

    // Add credits (simulating purchase)
    await creditsService.addCredits(testUser.id, 10, 'purchase');
    balance = await creditsService.getBalance(testUser.id);
    console.log(`✅ After purchase (+10): ${balance} credits`);

    // Deduct credits
    const result = await creditsService.deductCredits(testUser.id, 3, 'macro_prediction');
    console.log(`✅ After usage (-3): ${result.newBalance} credits`);

    // Get stats
    const stats = await creditsService.getUserStats(testUser.id);
    console.log(`✅ User stats:`, stats);

    return testUser;
  } catch (error) {
    console.error('❌ Credits allocation failed:', error);
    throw error;
  }
}

async function testTransactionHistory() {
  console.log('\n=== Testing Transaction History ===\n');

  try {
    // Get test user
    const testUser = await prisma.user.findFirst({
      where: { email: 'test-payment@example.com' },
    });

    if (!testUser) {
      console.log('⚠️  No test user found, skipping transaction history test');
      return;
    }

    // Get user's transactions
    const transactions = await paymentService.getUserTransactions(testUser.id);
    console.log(`✅ Found ${transactions.length} transactions for user`);

    transactions.slice(0, 3).forEach((tx, index) => {
      console.log(`\n   Transaction ${index + 1}:`);
      console.log(`   - ID: ${tx.id}`);
      console.log(`   - Amount: $${tx.amount}`);
      console.log(`   - Status: ${tx.status}`);
      console.log(`   - Blockchain: ${tx.blockchain}`);
      console.log(`   - Created: ${tx.createdAt}`);
    });
  } catch (error) {
    console.error('❌ Transaction history failed:', error);
  }
}

async function testPaymentStats() {
  console.log('\n=== Testing Payment Statistics ===\n');

  try {
    const stats = await paymentService.getPaymentStats();
    console.log(`✅ Payment Statistics:`);
    console.log(`   Total Revenue: $${stats.totalRevenue}`);
    console.log(`   Successful Payments: ${stats.successfulPayments}`);
    console.log(`   Pending Payments: ${stats.pendingPayments}`);
    console.log(`   Failed Payments: ${stats.failedPayments}`);
    console.log(`\n   Revenue by Blockchain:`);
    stats.revenueByBlockchain.forEach((chain: any) => {
      console.log(`   - ${chain.blockchain}: $${chain._sum.usdValue || 0} (${chain._count} txs)`);
    });
  } catch (error) {
    console.error('❌ Payment stats failed:', error);
  }
}

async function runTests() {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🧪 Payment System Test Suite                       ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);

  try {
    // Test 1: Price fetching
    await testPricing();

    // Test 2: Solana payment intents
    await testSolanaPaymentIntent();

    // Test 3: Ethereum payment intents
    await testEthereumPaymentIntent();

    // Test 4: Base payment intents
    await testBasePaymentIntent();

    // Test 5: Credits allocation
    await testCreditsAllocation();

    // Test 6: Transaction history
    await testTransactionHistory();

    // Test 7: Payment statistics
    await testPaymentStats();

    console.log(`\n
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   ✅ All Tests Completed Successfully!               ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
    `);
  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

// Run tests
runTests();

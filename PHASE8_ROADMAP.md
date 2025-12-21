# Phase 8: Payment Systems - Implementation Roadmap

**Duration:** 3 weeks (21 days)
**Status:** Planning
**Dependencies:** Phase 1-6 completed (Auth, Birth Charts, Predictions, Personalization)

---

## Overview

Phase 8 builds the monetization infrastructure for the Astro Prediction Platform, implementing crypto payments for web and planning for mobile IAP subscriptions. The credits system and basic deduction logic already exist from Phase 3; this phase adds the actual payment processing to purchase credits.

**Key Objectives:**
1. Enable users to purchase prediction credits via crypto (SOL, ETH, USDC, USDT)
2. Implement transaction monitoring and confirmation tracking
3. Build admin dashboard for transaction management
4. Enforce usage limits and rate limiting
5. Prepare architecture for future mobile IAP integration

---

## Week 1: Solana Payments (Days 1-7)

### Goals
- Solana Pay integration for SOL and USDC payments
- QR code payment generation
- Transaction monitoring via Helius webhooks
- Credit allocation on payment confirmation

### Day 1-2: Solana Pay Setup

**Backend Tasks:**
- [ ] Install dependencies: `@solana/web3.js`, `@solana/pay`, `@solana/spl-token`
- [ ] Create payment service (`/backend/src/services/payment/solana-payment.service.ts`)
- [ ] Set up Helius webhook endpoint for transaction monitoring
- [ ] Create payment wallet configuration (devnet for testing, mainnet for prod)
- [ ] Implement transaction signature verification

**API Endpoints:**
```typescript
POST /api/payments/solana/create-payment-request
  Body: { packageId: 'credits_10' | 'credits_50' | 'credits_100' | 'unlimited_month' }
  Response: { paymentUrl: string, reference: string, amount: number, token: string }

GET /api/payments/solana/status/:reference
  Response: { status: 'pending' | 'confirming' | 'completed' | 'failed', confirmations: number }

POST /api/webhooks/helius
  Body: Helius transaction webhook payload
  Response: { success: boolean }
```

**Database:**
- Use existing `transactions` table (already defined in schema.sql)
- Add index on `reference` field for quick lookups

**Testing:**
- Set up Solana devnet wallet
- Test payment request creation
- Verify QR code generation

### Day 3-4: Transaction Monitoring

**Backend Tasks:**
- [ ] Implement Helius webhook handler
- [ ] Create transaction confirmation polling (backup for webhooks)
- [ ] Build transaction status tracking
- [ ] Implement idempotency checks (prevent duplicate processing)
- [ ] Create transaction verification logic (verify amount, recipient, token)

**Transaction Flow:**
```
1. User selects package → Create payment request
2. Generate unique reference (UUID)
3. Create Solana Pay URL with reference
4. Save transaction record (status: 'pending')
5. User scans QR / clicks pay → Transaction submitted to blockchain
6. Helius webhook fires → Update transaction (status: 'confirming')
7. Wait for N confirmations (Solana: 1 confirmation = ~400ms)
8. Verify transaction details match payment request
9. Update transaction (status: 'completed')
10. Allocate credits to user
```

**Security Checks:**
- Verify transaction amount matches package price (±1% tolerance for price conversion)
- Verify recipient wallet is our payment wallet
- Verify transaction hasn't been processed before (check transaction_hash)
- Verify token type (SOL, USDC) matches request

**Testing:**
- Submit test transactions on devnet
- Test webhook processing
- Test confirmation tracking
- Test duplicate transaction handling

### Day 5-6: Credit Allocation

**Backend Tasks:**
- [ ] Create credit allocation service (`/backend/src/services/credits/credit-allocation.service.ts`)
- [ ] Implement atomic credit granting (transaction + credit update)
- [ ] Create subscription activation for unlimited packages
- [ ] Build notification system (email/in-app notification on successful payment)
- [ ] Create transaction history endpoint

**API Endpoints:**
```typescript
GET /api/users/me/transactions
  Response: { transactions: Transaction[], total: number }

GET /api/users/me/credits
  Response: { balance: number, usedLifetime: number, purchasedLifetime: number }
```

**Credit Allocation Logic:**
```typescript
async function allocateCredits(transactionId: string) {
  const tx = await db.transaction();
  try {
    // 1. Get transaction details
    const transaction = await tx.transactions.findUnique({ where: { id: transactionId } });

    // 2. Determine credits/subscription based on package
    const package = getPackageDetails(transaction.product_id);

    // 3. Update user_credits
    if (package.credits) {
      await tx.user_credits.update({
        where: { user_id: transaction.user_id },
        data: {
          credits_balance: { increment: package.credits },
          credits_purchased_lifetime: { increment: package.credits },
          last_credit_purchase_at: new Date()
        }
      });
    }

    // 4. Update subscription if unlimited
    if (package.unlimitedDays) {
      await tx.users.update({
        where: { id: transaction.user_id },
        data: {
          subscription_tier: 'pro',
          subscription_expires_at: addDays(new Date(), package.unlimitedDays)
        }
      });
    }

    // 5. Update transaction status
    await tx.transactions.update({
      where: { id: transactionId },
      data: { status: 'completed', credits_granted: package.credits, completed_at: new Date() }
    });

    // 6. Log usage
    await tx.usage_logs.create({
      data: {
        user_id: transaction.user_id,
        action: 'credits_purchased',
        credits_used: 0
      }
    });

    await tx.commit();

    // 7. Send notification
    await notificationService.send({
      userId: transaction.user_id,
      type: 'payment_success',
      message: `Successfully purchased ${package.credits} credits!`
    });

  } catch (error) {
    await tx.rollback();
    throw error;
  }
}
```

**Testing:**
- Test credit allocation with various packages
- Test subscription activation
- Test transaction rollback on errors
- Test notification delivery

### Day 7: Frontend Integration

**Frontend Tasks:**
- [ ] Create pricing page (`/app/pricing/page.tsx`)
- [ ] Build payment modal component
- [ ] Implement QR code display
- [ ] Create payment status polling
- [ ] Build transaction history page
- [ ] Add success/error toast notifications

**UI Components:**
```typescript
// Pricing cards
<PricingCard
  title="10 Credits"
  price="$4.99"
  features={["10 predictions", "All prediction types", "No expiration"]}
  onSelect={() => handlePurchase('credits_10')}
/>

// Payment modal
<PaymentModal
  amount={4.99}
  token="SOL"
  qrCodeUrl={paymentUrl}
  reference={reference}
  onSuccess={() => handleSuccess()}
  onCancel={() => handleCancel()}
/>

// Transaction history
<TransactionHistory
  transactions={transactions}
  onRefresh={() => refetchTransactions()}
/>
```

**UX Flow:**
1. User clicks "Buy 10 Credits"
2. Modal opens with payment options (SOL, USDC)
3. User selects token → QR code appears
4. Show "Waiting for payment..." with spinner
5. Poll status every 2 seconds
6. On confirmation: Show "Confirming... (1/1 confirmations)"
7. On completion: Show success message, confetti animation
8. Update credits balance in UI
9. Close modal

**Testing:**
- Test purchasing each package
- Test QR code scanning with Phantom mobile
- Test status polling
- Test error states (failed payment, cancelled)

**Week 1 Deliverable:**
✅ Users can purchase credits via Solana (SOL, USDC)
✅ QR code payments working
✅ Transaction monitoring operational
✅ Credits allocated automatically on confirmation

---

## Week 2: Ethereum Payments (Days 8-14)

### Goals
- Ethereum payment integration (ETH, USDC, USDT)
- Multi-chain support (Ethereum mainnet, Base)
- Transaction monitoring via Alchemy/Infura
- Unified payment interface for all chains

### Day 8-9: Ethereum Payment Service

**Backend Tasks:**
- [ ] Install dependencies: `ethers`, `@rainbow-me/rainbowkit` (for frontend)
- [ ] Create Ethereum payment service (`/backend/src/services/payment/ethereum-payment.service.ts`)
- [ ] Set up Alchemy/Infura provider
- [ ] Implement ERC20 token transfers (USDC, USDT)
- [ ] Create payment request generator

**Payment Methods:**
1. **Native ETH Transfer**: Simple value transfer to payment wallet
2. **ERC20 Transfer**: USDC/USDT transfer via token contract

**API Endpoints:**
```typescript
POST /api/payments/ethereum/create-payment-request
  Body: { packageId: string, chain: 'ethereum' | 'base', token: 'ETH' | 'USDC' | 'USDT' }
  Response: {
    to: string, // Payment wallet address
    value: string, // Amount in wei (for ETH) or token units
    tokenAddress?: string, // ERC20 token contract address
    reference: string, // Unique reference
    chainId: number
  }

GET /api/payments/ethereum/status/:reference
  Response: { status: string, confirmations: number, requiredConfirmations: 12 }
```

**Configuration:**
```typescript
const PAYMENT_CONFIG = {
  ethereum: {
    chainId: 1,
    rpcUrl: process.env.ALCHEMY_ETHEREUM_RPC,
    paymentWallet: process.env.ETHEREUM_PAYMENT_WALLET,
    confirmations: 12, // Wait for 12 confirmations (~3 minutes)
    tokens: {
      USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7'
    }
  },
  base: {
    chainId: 8453,
    rpcUrl: process.env.ALCHEMY_BASE_RPC,
    paymentWallet: process.env.BASE_PAYMENT_WALLET,
    confirmations: 5, // Base has faster block times
    tokens: {
      USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
    }
  }
};
```

**Testing:**
- Test ETH payments on Sepolia testnet
- Test USDC/USDT payments
- Test Base network payments

### Day 10-11: Transaction Monitoring

**Backend Tasks:**
- [ ] Implement Alchemy webhook handler (for real-time notifications)
- [ ] Create polling-based transaction tracker (backup)
- [ ] Build confirmation counter
- [ ] Implement chain reorganization handling
- [ ] Create gas price estimation for user guidance

**Transaction Monitoring:**
```typescript
async function monitorEthereumTransaction(txHash: string, chain: 'ethereum' | 'base') {
  const config = PAYMENT_CONFIG[chain];
  const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);

  let confirmations = 0;

  while (confirmations < config.confirmations) {
    const receipt = await provider.getTransactionReceipt(txHash);

    if (!receipt) {
      await wait(15000); // Wait 15 seconds
      continue;
    }

    const currentBlock = await provider.getBlockNumber();
    confirmations = currentBlock - receipt.blockNumber + 1;

    // Update transaction status
    await db.transactions.update({
      where: { transaction_hash: txHash },
      data: {
        status: confirmations >= config.confirmations ? 'completed' : 'confirming',
        confirmation_count: confirmations
      }
    });

    if (confirmations < config.confirmations) {
      await wait(15000); // Poll every 15 seconds
    }
  }

  // Verify transaction details
  const tx = await provider.getTransaction(txHash);
  await verifyTransactionDetails(tx);

  // Allocate credits
  await allocateCredits(txHash);
}
```

**Security Checks:**
- Verify transaction is included in blockchain (not pending)
- Verify transaction succeeded (status = 1)
- Verify recipient matches our wallet
- Verify amount matches expected (with gas fee tolerance)
- Check for chain reorganizations (monitor confirmations don't decrease)

**Testing:**
- Submit test transactions
- Test confirmation tracking
- Test reorg handling
- Test failed transaction detection

### Day 12-13: Multi-Chain Support

**Backend Tasks:**
- [ ] Create chain abstraction layer
- [ ] Implement automatic chain detection
- [ ] Build unified transaction status endpoint
- [ ] Create chain-specific error handling
- [ ] Implement automatic retry logic for failed RPC calls

**Chain Abstraction:**
```typescript
interface ChainPaymentService {
  createPaymentRequest(packageId: string, token: string): Promise<PaymentRequest>;
  monitorTransaction(txHash: string): Promise<TransactionStatus>;
  verifyTransaction(txHash: string): Promise<boolean>;
  getTransactionStatus(txHash: string): Promise<TransactionStatus>;
}

class SolanaPaymentService implements ChainPaymentService { /* ... */ }
class EthereumPaymentService implements ChainPaymentService { /* ... */ }
class BasePaymentService implements ChainPaymentService { /* ... */ }

// Factory pattern
function getPaymentService(chain: string): ChainPaymentService {
  switch (chain) {
    case 'solana': return new SolanaPaymentService();
    case 'ethereum': return new EthereumPaymentService();
    case 'base': return new BasePaymentService();
    default: throw new Error(`Unsupported chain: ${chain}`);
  }
}
```

**Unified Status Endpoint:**
```typescript
GET /api/payments/status/:reference
  Response: {
    reference: string,
    status: 'pending' | 'confirming' | 'completed' | 'failed',
    chain: string,
    token: string,
    amount: number,
    confirmations: number,
    requiredConfirmations: number,
    transactionHash?: string,
    explorerUrl?: string,
    estimatedCompletionTime?: string // "~30 seconds" or "~3 minutes"
  }
```

**Testing:**
- Test payment flow on each chain
- Test switching between chains
- Test error handling per chain
- Test RPC failover

### Day 14: Frontend Multi-Chain Integration

**Frontend Tasks:**
- [ ] Integrate RainbowKit for wallet connection
- [ ] Build chain selector UI
- [ ] Implement token selector (ETH, USDC, USDT)
- [ ] Create network switching prompts
- [ ] Add Etherscan/Basescan links
- [ ] Build confirmation progress UI

**UI Components:**
```typescript
// Chain & token selector
<ChainTokenSelector
  selectedChain={selectedChain}
  selectedToken={selectedToken}
  onChainChange={(chain) => setSelectedChain(chain)}
  onTokenChange={(token) => setSelectedToken(token)}
  options={[
    { chain: 'solana', tokens: ['SOL', 'USDC'] },
    { chain: 'ethereum', tokens: ['ETH', 'USDC', 'USDT'] },
    { chain: 'base', tokens: ['ETH', 'USDC'] }
  ]}
/>

// Confirmation progress
<ConfirmationProgress
  current={confirmations}
  required={requiredConfirmations}
  estimatedTime="~2 minutes"
/>
```

**UX Enhancements:**
1. Auto-detect user's connected wallet chain
2. Prompt to switch network if needed
3. Show gas fee estimate before transaction
4. Display real-time confirmation progress
5. Link to block explorer for transaction details
6. Show estimated completion time based on chain

**Testing:**
- Test wallet connection on each chain
- Test network switching
- Test ERC20 approvals (if needed)
- Test gas estimation display

**Week 2 Deliverable:**
✅ Multi-chain payment support (Solana, Ethereum, Base)
✅ Multi-token support (SOL, ETH, USDC, USDT)
✅ Unified transaction monitoring
✅ Seamless chain switching UX

---

## Week 3: Infrastructure & Admin (Days 15-21)

### Goals
- Transaction management dashboard
- Admin panel for monitoring payments
- Usage enforcement and rate limiting
- Analytics and reporting
- Mobile IAP architecture planning

### Day 15-16: Admin Dashboard

**Backend Tasks:**
- [ ] Create admin authentication middleware
- [ ] Build admin transaction endpoints
- [ ] Create revenue analytics aggregation
- [ ] Implement transaction filtering/search
- [ ] Build refund processing API

**Admin API Endpoints:**
```typescript
GET /api/admin/transactions
  Query: { status?, chain?, startDate?, endDate?, userId?, limit?, offset? }
  Response: { transactions: Transaction[], total: number, revenue: RevenueStats }

GET /api/admin/analytics/revenue
  Query: { period: 'day' | 'week' | 'month' | 'year', startDate, endDate }
  Response: {
    totalRevenue: number,
    totalTransactions: number,
    averageTransactionValue: number,
    revenueByChain: { solana: number, ethereum: number, base: number },
    revenueByPackage: { credits_10: number, credits_50: number, ... }
  }

POST /api/admin/transactions/:id/refund
  Body: { reason: string }
  Response: { success: boolean, refundedCredits: number }

GET /api/admin/users/:userId/transaction-history
  Response: { transactions: Transaction[], totalSpent: number }
```

**Admin Dashboard Features:**
1. **Transaction Monitoring**
   - Real-time transaction feed
   - Filter by status, chain, date range
   - Search by transaction hash, user ID, wallet address
   - Quick actions: View details, Refund, Mark as fraud

2. **Revenue Analytics**
   - Total revenue (USD equivalent)
   - Revenue by chain (pie chart)
   - Revenue by package (bar chart)
   - Revenue trend over time (line chart)
   - Conversion rate (visitors → purchases)

3. **User Management**
   - Top spenders list
   - Recent purchasers
   - Subscription status overview
   - Credit balance distribution

**Testing:**
- Test admin authentication
- Test transaction filtering
- Test analytics calculations
- Test refund processing

### Day 17: Rate Limiting & Usage Enforcement

**Backend Tasks:**
- [ ] Implement rate limiting middleware
- [ ] Create usage quota checker
- [ ] Build credit balance validator
- [ ] Implement low credit warnings
- [ ] Create subscription expiration checker

**Rate Limiting Strategy:**
```typescript
// Rate limits by tier
const RATE_LIMITS = {
  free: {
    predictions_per_day: 1,
    predictions_per_month: 3,
    concurrent_requests: 1
  },
  basic: {
    predictions_per_day: 10,
    predictions_per_month: 50,
    concurrent_requests: 3
  },
  pro: {
    predictions_per_day: -1, // Unlimited
    predictions_per_month: -1,
    concurrent_requests: 5
  }
};

// Middleware
async function enforceRateLimit(req, res, next) {
  const user = req.user;

  // Check subscription status
  if (user.subscription_tier !== 'free') {
    const isExpired = new Date(user.subscription_expires_at) < new Date();
    if (isExpired) {
      user.subscription_tier = 'free';
      await updateUserTier(user.id, 'free');
    }
  }

  // Check credits
  const credits = await getUserCredits(user.id);
  const requiredCredits = getRequiredCredits(req.body.prediction_type);

  if (credits.balance < requiredCredits && user.subscription_tier === 'free') {
    return res.status(402).json({
      error: 'insufficient_credits',
      message: 'You need more credits to make this prediction',
      required: requiredCredits,
      balance: credits.balance,
      purchaseUrl: '/pricing'
    });
  }

  // Check rate limits
  const usage = await getUsageToday(user.id);
  const limit = RATE_LIMITS[user.subscription_tier].predictions_per_day;

  if (limit !== -1 && usage >= limit) {
    return res.status(429).json({
      error: 'rate_limit_exceeded',
      message: `You've reached your daily limit of ${limit} predictions`,
      upgradeUrl: '/pricing'
    });
  }

  next();
}
```

**Low Credit Warnings:**
```typescript
// After each prediction
if (creditsRemaining <= 5 && creditsRemaining > 0) {
  sendNotification({
    userId: user.id,
    type: 'low_credits_warning',
    message: `You have ${creditsRemaining} credits remaining`,
    action: { label: 'Buy Credits', url: '/pricing' }
  });
}

if (creditsRemaining === 0) {
  sendNotification({
    userId: user.id,
    type: 'out_of_credits',
    message: 'You've run out of credits! Purchase more to continue.',
    action: { label: 'Buy Credits', url: '/pricing' }
  });
}
```

**Testing:**
- Test rate limiting enforcement
- Test subscription expiration
- Test low credit warnings
- Test upgrade prompts

### Day 18-19: Analytics & Reporting

**Backend Tasks:**
- [ ] Create analytics aggregation jobs
- [ ] Build conversion funnel tracking
- [ ] Implement cohort analysis
- [ ] Create revenue forecasting
- [ ] Build export functionality (CSV)

**Analytics Metrics:**
```typescript
interface PlatformMetrics {
  // User metrics
  totalUsers: number;
  activeUsers: number; // Made a prediction in last 30 days
  payingUsers: number;
  conversionRate: number; // Free → Paid

  // Revenue metrics
  totalRevenue: number;
  mrr: number; // Monthly recurring revenue
  arr: number; // Annual recurring revenue
  arpu: number; // Average revenue per user
  arppu: number; // Average revenue per paying user
  ltv: number; // Customer lifetime value

  // Transaction metrics
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  averageTransactionValue: number;

  // Usage metrics
  totalPredictions: number;
  predictionsByType: { macro: number, birth_date: number, divination: number };
  averagePredictionsPerUser: number;

  // Subscription metrics
  activeSubscriptions: number;
  churnRate: number;
  retentionRate: number;
}
```

**Conversion Funnel:**
```
1. Landing Page Views → 10,000
2. Sign Up → 2,000 (20% conversion)
3. First Prediction (free) → 1,500 (75% activation)
4. Pricing Page View → 800 (53% interest)
5. Payment Initiated → 400 (50% intent)
6. Payment Completed → 360 (90% success)
7. Second Purchase → 180 (50% retention)
```

**Reports:**
- Daily revenue report
- Weekly user growth report
- Monthly financial report
- Quarterly business review

**Testing:**
- Test metric calculations
- Test report generation
- Test CSV exports
- Test date range filtering

### Day 20: Mobile IAP Architecture Planning

**Planning Tasks:**
- [ ] Research RevenueCat integration requirements
- [ ] Design mobile subscription flow
- [ ] Plan backend sync architecture
- [ ] Document mobile-web parity strategy
- [ ] Create mobile payment roadmap

**Mobile IAP Architecture:**
```typescript
// Backend changes needed for mobile
interface MobileSubscription {
  platform: 'ios' | 'android';
  productId: string; // e.g., 'com.astro.basic_monthly'
  transactionId: string; // App Store/Play Store transaction ID
  originalTransactionId: string;
  purchaseDate: Date;
  expiresDate: Date;
  autoRenewing: boolean;
  isInTrialPeriod: boolean;
  cancellationDate?: Date;
}

// RevenueCat webhook handler
POST /api/webhooks/revenuecat
  Body: RevenueCat webhook event
  Actions:
    - Sync subscription status
    - Grant/revoke access
    - Handle renewals
    - Handle cancellations
    - Handle refunds
```

**Mobile Product IDs:**
```typescript
const MOBILE_PRODUCTS = {
  ios: {
    basic_monthly: 'com.astro.basic.monthly',
    basic_yearly: 'com.astro.basic.yearly',
    pro_monthly: 'com.astro.pro.monthly',
    pro_yearly: 'com.astro.pro.yearly'
  },
  android: {
    basic_monthly: 'basic_monthly',
    basic_yearly: 'basic_yearly',
    pro_monthly: 'pro_monthly',
    pro_yearly: 'pro_yearly'
  }
};

const MOBILE_PRICING = {
  basic_monthly: { price: 9.99, predictions: 50 },
  basic_yearly: { price: 99.99, predictions: 50 }, // 2 months free
  pro_monthly: { price: 29.99, predictions: -1 },
  pro_yearly: { price: 299.99, predictions: -1 }
};
```

**Cross-Platform Sync:**
- User purchases subscription on web (crypto) → Access on mobile app
- User purchases subscription on mobile (IAP) → Access on web
- Subscription tier unified across platforms
- Credits purchased on web are available on mobile

**Implementation Plan (Future):**
1. Week 1: RevenueCat SDK integration (iOS & Android)
2. Week 2: Backend webhook handler
3. Week 3: Cross-platform sync
4. Week 4: Testing & QA

### Day 21: Testing, Documentation & Deployment

**Testing Tasks:**
- [ ] End-to-end payment flow testing (all chains, all packages)
- [ ] Load testing (concurrent payments)
- [ ] Error scenario testing (failed payments, network issues)
- [ ] Security audit (payment verification, credit allocation)
- [ ] User acceptance testing

**Test Cases:**
```
Payment Flow Tests:
✓ Purchase credits_10 with SOL
✓ Purchase credits_50 with Solana USDC
✓ Purchase credits_100 with ETH
✓ Purchase unlimited_month with Ethereum USDC
✓ Purchase with Base USDC
✓ Purchase with Ethereum USDT

Error Handling:
✓ User cancels payment
✓ Insufficient funds in wallet
✓ Transaction fails on blockchain
✓ Webhook not received (fallback to polling)
✓ Duplicate transaction submission
✓ Chain reorganization

Edge Cases:
✓ Multiple concurrent purchases
✓ Purchase while previous payment confirming
✓ Subscription expiration during active session
✓ Credit balance update race condition
✓ Partial confirmation (< required confirmations)
```

**Documentation Tasks:**
- [ ] API documentation (payment endpoints)
- [ ] Integration guide for frontend
- [ ] Admin dashboard user guide
- [ ] Payment troubleshooting guide
- [ ] Security best practices document

**Deployment Tasks:**
- [ ] Set up production payment wallets
- [ ] Configure production RPC endpoints (Helius, Alchemy)
- [ ] Set up monitoring (Sentry, DataDog)
- [ ] Configure alerts (failed payments, low balance)
- [ ] Deploy to staging for final testing
- [ ] Deploy to production
- [ ] Monitor first real transactions

**Production Checklist:**
```
✓ Payment wallet addresses secured (hardware wallet or MPC)
✓ Private keys stored in secure vault (AWS Secrets Manager / HashiCorp Vault)
✓ RPC endpoints configured (Helius for Solana, Alchemy for Ethereum/Base)
✓ Webhook endpoints secured (signature verification)
✓ Rate limiting enabled
✓ Monitoring dashboards configured
✓ Alert rules set up (failed payments, webhook failures)
✓ Backup payment monitoring (polling) enabled
✓ Database backups configured
✓ Disaster recovery plan documented
✓ Payment amount verification enabled
✓ Transaction deduplication enabled
✓ Error tracking enabled (Sentry)
✓ Performance monitoring enabled (DataDog APM)
```

**Week 3 Deliverable:**
✅ Admin dashboard operational
✅ Rate limiting enforced
✅ Analytics and reporting functional
✅ Mobile IAP architecture planned
✅ Phase 8 fully tested and deployed to production

---

## Success Criteria

### Functional Requirements
- ✅ Users can purchase credits via Solana (SOL, USDC)
- ✅ Users can purchase credits via Ethereum (ETH, USDC, USDT)
- ✅ Users can purchase credits via Base (ETH, USDC)
- ✅ QR code payments work for mobile wallets
- ✅ Transactions are monitored and confirmed automatically
- ✅ Credits are allocated atomically after payment confirmation
- ✅ Subscriptions are activated for unlimited packages
- ✅ Admin dashboard displays all transactions
- ✅ Rate limiting prevents free tier abuse
- ✅ Low credit warnings notify users

### Non-Functional Requirements
- ✅ Payment confirmation within 5 minutes (Ethereum) or 30 seconds (Solana)
- ✅ 99.9% payment success rate
- ✅ Zero duplicate credit allocations
- ✅ Transaction monitoring uptime > 99.5%
- ✅ Admin dashboard response time < 1 second
- ✅ All payment amounts verified server-side
- ✅ All transaction hashes deduplicated

### Security Requirements
- ✅ Payment amounts verified on backend
- ✅ Transaction signatures verified
- ✅ Webhook signatures verified (Helius, Alchemy)
- ✅ Credit allocation is atomic (database transactions)
- ✅ No double-spending possible
- ✅ Payment wallet private keys secured
- ✅ All API endpoints authenticated
- ✅ Rate limiting prevents abuse

### User Experience Requirements
- ✅ Clear pricing page with all options
- ✅ One-click payment initiation
- ✅ Real-time payment status updates
- ✅ Smooth chain/token switching
- ✅ Helpful error messages
- ✅ Transaction history easily accessible
- ✅ Success notifications on payment completion

---

## Risk Mitigation

### Technical Risks

**Risk: Blockchain downtime or RPC failures**
- Mitigation: Multiple RPC providers (Helius + QuickNode for Solana, Alchemy + Infura for Ethereum)
- Fallback: Automatic failover between providers
- Monitoring: Alert on RPC errors

**Risk: Webhook delivery failures**
- Mitigation: Polling-based backup monitoring
- Recovery: Periodic sweep of pending transactions
- Monitoring: Alert on webhook failures

**Risk: Chain reorganizations (especially Ethereum)**
- Mitigation: Wait for sufficient confirmations (Solana: 1, Ethereum: 12)
- Recovery: Re-verify transaction after reorg detected
- Monitoring: Track confirmation count changes

**Risk: Smart contract/token issues (for ERC20)**
- Mitigation: Use well-established tokens (USDC, USDT)
- Testing: Extensive testnet testing
- Recovery: Manual intervention tools in admin dashboard

### Business Risks

**Risk: Low conversion rate (free → paid)**
- Mitigation: A/B test pricing, optimize pricing page
- Strategy: Implement promotional offers (bonus credits on first purchase)
- Analytics: Track conversion funnel, identify drop-off points

**Risk: High transaction fees (especially Ethereum)**
- Mitigation: Support Layer 2 (Base) with lower fees
- Strategy: Educate users on gas fees, recommend Base for small purchases
- Future: Implement gas fee subsidies for first purchase

**Risk: Price volatility (crypto payments)**
- Mitigation: Use stablecoins (USDC, USDT) as primary option
- Strategy: Convert crypto to fiat immediately (via Circle, Coinbase)
- Monitoring: Track USD equivalent of all revenues

### Operational Risks

**Risk: Payment wallet security breach**
- Mitigation: Use hardware wallet or MPC for production
- Strategy: Implement withdrawal limits, multi-sig for large amounts
- Monitoring: Alert on unexpected outflows

**Risk: Insufficient monitoring, late detection of issues**
- Mitigation: Comprehensive monitoring (Sentry, DataDog)
- Strategy: Real-time alerts on Slack/PagerDuty
- Response: On-call engineer during business hours

**Risk: Regulatory changes (crypto payments)**
- Mitigation: Emphasize entertainment purposes, disclaimers
- Strategy: Consult legal counsel, monitor regulations
- Backup: Add fiat payment options (Stripe) if needed

---

## Post-Launch Iteration

### Week 4+: Optimization & Enhancement

**Immediate Improvements:**
- [ ] Add fiat payment option (Stripe) for users without crypto
- [ ] Implement promotional offers (e.g., "20% bonus credits on first purchase")
- [ ] Add referral program (give referrer + referee bonus credits)
- [ ] Build credit gifting feature
- [ ] Implement dynamic pricing based on demand

**Analytics & Insights:**
- [ ] Track conversion rate by payment method
- [ ] Analyze drop-off points in payment flow
- [ ] A/B test pricing tiers
- [ ] Monitor average transaction value
- [ ] Track repeat purchase rate

**Mobile Preparation:**
- [ ] Finalize mobile IAP product definitions
- [ ] Set up RevenueCat account
- [ ] Implement webhook handler
- [ ] Test cross-platform sync

**Future Enhancements:**
- [ ] Subscription auto-renewal (for crypto subscriptions)
- [ ] Credit expiration (encourage usage)
- [ ] Bulk purchase discounts
- [ ] Enterprise/API access pricing
- [ ] Payment method saved for quick re-purchase

---

## Dependencies

### External Services
- **Helius** (Solana RPC + Webhooks) - [helius.dev](https://helius.dev)
- **Alchemy** (Ethereum/Base RPC + Webhooks) - [alchemy.com](https://alchemy.com)
- **RevenueCat** (Mobile IAP - future) - [revenuecat.com](https://revenuecat.com)

### Internal Dependencies
- Phase 1: Authentication system (wallet connect)
- Phase 3: Credits system and deduction logic
- Database: PostgreSQL with `transactions`, `user_credits` tables

### Technical Dependencies
```json
{
  "dependencies": {
    "@solana/web3.js": "^1.87.0",
    "@solana/pay": "^0.2.5",
    "@solana/spl-token": "^0.3.9",
    "ethers": "^6.9.0",
    "@rainbow-me/rainbowkit": "^2.0.0",
    "wagmi": "^2.0.0",
    "viem": "^2.0.0"
  }
}
```

---

## Conclusion

Phase 8 transforms the Astro Prediction Platform from a feature-complete app into a revenue-generating business. By implementing robust crypto payment infrastructure, we enable users to seamlessly purchase prediction credits while maintaining security and reliability.

**Key Achievements:**
- Multi-chain crypto payment support (Solana, Ethereum, Base)
- Multi-token support (SOL, ETH, USDC, USDT)
- Automated transaction monitoring and credit allocation
- Comprehensive admin dashboard
- Usage enforcement and rate limiting
- Mobile IAP architecture ready for future implementation

**Next Steps:**
- Monitor payment metrics and optimize conversion funnel
- Implement promotional offers to boost initial purchases
- Prepare for mobile app launch with IAP integration
- Expand payment options (fiat via Stripe)
- Build advanced analytics for business insights

With Phase 8 complete, the platform is ready to onboard paying users and generate revenue while providing a seamless, secure payment experience across web and (soon) mobile platforms.

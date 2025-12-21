# Transaction Management & Admin Dashboard

**Version:** 1.0
**Last Updated:** 2025-12-21
**Status:** Implementation Spec

---

## Table of Contents

1. [Overview](#overview)
2. [Transaction Lifecycle](#transaction-lifecycle)
3. [Database Schema Usage](#database-schema-usage)
4. [Admin Dashboard Requirements](#admin-dashboard-requirements)
5. [Revenue Reporting](#revenue-reporting)
6. [Refund Handling](#refund-handling)
7. [Failed Payment Retry](#failed-payment-retry)
8. [Monitoring & Alerts](#monitoring--alerts)

---

## Overview

Transaction management is the backbone of the payment system, ensuring reliable processing, accurate record-keeping, and administrative oversight. This document defines the complete transaction lifecycle, admin dashboard requirements, and operational procedures.

### Goals

1. **Reliability**: Every payment is tracked from creation to completion
2. **Transparency**: Admins can monitor all transactions in real-time
3. **Accountability**: Complete audit trail for all payment operations
4. **Recoverability**: Failed payments can be retried or refunded
5. **Insights**: Revenue analytics inform business decisions

---

## Transaction Lifecycle

### State Machine

```
┌─────────┐
│ pending │ ← Transaction created, waiting for user payment
└────┬────┘
     │ User submits payment on blockchain
     ▼
┌────────────┐
│ confirming │ ← Transaction detected, waiting for confirmations
└────┬───────┘
     │ Sufficient confirmations received
     ▼
┌───────────┐
│ completed │ ← Transaction verified, credits allocated
└───────────┘

Alternative paths:
pending → failed (timeout, user cancels)
confirming → failed (transaction reverted, verification failed)
completed → refunded (admin action, user request)
```

### State Definitions

| State | Description | Duration | Actions Available |
|-------|-------------|----------|-------------------|
| **pending** | Payment request created, awaiting user payment | 0-30 min | Cancel, Expire |
| **confirming** | Payment detected on blockchain, waiting for confirmations | 30s-5min (varies by chain) | Monitor, Cancel |
| **completed** | Payment confirmed, credits allocated | Permanent | Refund, View |
| **failed** | Payment failed or expired | Permanent | Retry, View |
| **refunded** | Payment refunded to user | Permanent | View |

### Lifecycle Events

```typescript
interface TransactionEvent {
  transactionId: string;
  event: 'created' | 'payment_submitted' | 'confirming' | 'confirmed' | 'completed' | 'failed' | 'refunded';
  timestamp: Date;
  metadata: Record<string, any>;
  triggeredBy: 'user' | 'system' | 'admin';
}

// Event flow
1. created → User clicks "Buy Credits"
2. payment_submitted → User's wallet submits transaction
3. confirming → Webhook receives transaction notification
4. confirmed → Sufficient confirmations reached
5. completed → Credits allocated to user

// Alternative flows
1. created → failed (timeout after 30 minutes)
2. confirming → failed (transaction reverted)
3. completed → refunded (admin action)
```

### Detailed State Transitions

#### 1. Creation (pending)

```typescript
async function createTransaction(params: {
  userId: string;
  packageId: string;
  chain: string;
  token: string;
  amount: number;
}): Promise<Transaction> {
  const transaction = await db.transactions.create({
    data: {
      user_id: params.userId,
      amount: params.amount,
      currency: params.token,
      payment_method: params.chain,
      blockchain: params.chain,
      status: 'pending',
      metadata: {
        packageId: params.packageId,
        reference: generateReference(),
        usdPrice: calculateUSDPrice(params.packageId),
        createdVia: 'web', // or 'mobile'
      }
    }
  });

  // Log event
  await logTransactionEvent({
    transactionId: transaction.id,
    event: 'created',
    metadata: { packageId: params.packageId, chain: params.chain },
    triggeredBy: 'user'
  });

  // Schedule timeout job
  scheduleTransactionTimeout(transaction.id, 30 * 60 * 1000); // 30 minutes

  return transaction;
}
```

#### 2. Payment Submission (pending → confirming)

```typescript
async function onPaymentSubmitted(params: {
  reference: string;
  transactionHash: string;
  fromWallet: string;
}): Promise<void> {
  const transaction = await db.transactions.findFirst({
    where: { metadata: { path: ['reference'], equals: params.reference } }
  });

  if (!transaction) {
    throw new Error('Transaction not found');
  }

  if (transaction.status !== 'pending') {
    console.log(`Transaction ${transaction.id} already in ${transaction.status} state`);
    return;
  }

  // Update to confirming
  await db.transactions.update({
    where: { id: transaction.id },
    data: {
      status: 'confirming',
      transaction_hash: params.transactionHash,
      from_wallet: params.fromWallet,
      confirmation_count: 0
    }
  });

  // Log event
  await logTransactionEvent({
    transactionId: transaction.id,
    event: 'payment_submitted',
    metadata: { transactionHash: params.transactionHash },
    triggeredBy: 'user'
  });

  // Start monitoring
  startTransactionMonitoring(transaction.id, params.transactionHash);
}
```

#### 3. Confirmation Progress (confirming)

```typescript
async function updateConfirmationCount(
  transactionId: string,
  confirmations: number
): Promise<void> {
  const transaction = await db.transactions.findUnique({
    where: { id: transactionId }
  });

  const requiredConfirmations = getRequiredConfirmations(transaction.blockchain);

  await db.transactions.update({
    where: { id: transactionId },
    data: {
      confirmation_count: confirmations,
      // Transition to completed if sufficient confirmations
      ...(confirmations >= requiredConfirmations ? {
        status: 'completed',
        confirmed_at: new Date(),
        completed_at: new Date()
      } : {})
    }
  });

  if (confirmations >= requiredConfirmations) {
    await logTransactionEvent({
      transactionId,
      event: 'confirmed',
      metadata: { confirmations },
      triggeredBy: 'system'
    });

    // Trigger credit allocation
    await allocateCredits(transactionId);
  }
}
```

#### 4. Completion (confirming → completed)

```typescript
async function completeTransaction(transactionId: string): Promise<void> {
  // Use database transaction for atomicity
  await db.$transaction(async (tx) => {
    // 1. Update transaction
    const transaction = await tx.transactions.update({
      where: { id: transactionId },
      data: {
        status: 'completed',
        completed_at: new Date()
      }
    });

    // 2. Allocate credits (see credit-allocation.service.ts)
    await allocateCreditsInTransaction(tx, transactionId);

    // 3. Log event
    await tx.transaction_events.create({
      data: {
        transaction_id: transactionId,
        event: 'completed',
        metadata: {},
        triggered_by: 'system'
      }
    });
  });

  // 4. Send notifications (outside transaction)
  await sendPaymentSuccessNotification(transactionId);

  // 5. Update analytics
  await updateRevenueAnalytics(transactionId);
}
```

#### 5. Failure Scenarios

```typescript
async function failTransaction(
  transactionId: string,
  reason: string,
  source: 'timeout' | 'verification_failed' | 'blockchain_error'
): Promise<void> {
  await db.transactions.update({
    where: { id: transactionId },
    data: {
      status: 'failed',
      failure_reason: reason,
      metadata: {
        ...transaction.metadata,
        failureSource: source,
        failedAt: new Date()
      }
    }
  });

  await logTransactionEvent({
    transactionId,
    event: 'failed',
    metadata: { reason, source },
    triggeredBy: 'system'
  });

  // Notify user
  await sendPaymentFailedNotification(transactionId, reason);

  // Alert admin if unusual pattern
  if (await detectSuspiciousPattern(transactionId)) {
    await alertAdmin({
      type: 'suspicious_transaction_pattern',
      transactionId,
      reason
    });
  }
}
```

#### 6. Refunds

```typescript
async function refundTransaction(
  transactionId: string,
  reason: string,
  refundedBy: string
): Promise<void> {
  await db.$transaction(async (tx) => {
    const transaction = await tx.transactions.findUnique({
      where: { id: transactionId }
    });

    if (transaction.status !== 'completed') {
      throw new Error('Can only refund completed transactions');
    }

    // 1. Update transaction status
    await tx.transactions.update({
      where: { id: transactionId },
      data: {
        status: 'refunded',
        refunded_at: new Date(),
        metadata: {
          ...transaction.metadata,
          refundReason: reason,
          refundedBy
        }
      }
    });

    // 2. Deduct credits from user (if not already used)
    const creditsToDeduct = Math.min(
      transaction.credits_granted,
      await getCurrentCredits(transaction.user_id)
    );

    if (creditsToDeduct > 0) {
      await tx.user_credits.update({
        where: { user_id: transaction.user_id },
        data: {
          credits_balance: { decrement: creditsToDeduct }
        }
      });
    }

    // 3. Log event
    await tx.transaction_events.create({
      data: {
        transaction_id: transactionId,
        event: 'refunded',
        metadata: { reason, refundedBy, creditsDeducted: creditsToDeduct },
        triggered_by: 'admin'
      }
    });
  });

  // 4. Notify user
  await sendRefundNotification(transactionId, reason);

  // 5. Update analytics
  await updateRevenueAnalytics(transactionId);
}
```

---

## Database Schema Usage

### Core Tables

The transaction management system uses the existing schema defined in `schema.sql`:

#### transactions

```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),

    -- Amount details
    amount DECIMAL NOT NULL,
    currency VARCHAR(20) NOT NULL, -- SOL, ETH, USDC, USDT
    payment_method VARCHAR(50) NOT NULL, -- solana, ethereum, base

    -- Blockchain details
    transaction_hash VARCHAR(255),
    from_wallet VARCHAR(255),
    to_wallet VARCHAR(255),
    blockchain VARCHAR(50),
    confirmation_count INTEGER,

    -- Fulfillment
    credits_granted INTEGER,
    subscription_days_granted INTEGER,
    subscription_tier_granted VARCHAR(50),

    -- Status
    status VARCHAR(50) DEFAULT 'pending',
    failure_reason TEXT,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    confirmed_at TIMESTAMP,
    completed_at TIMESTAMP,
    refunded_at TIMESTAMP,

    -- Revenue tracking
    usd_value DECIMAL,
    platform_fee DECIMAL,
    net_revenue DECIMAL
);
```

#### user_credits

```sql
CREATE TABLE user_credits (
    user_id UUID PRIMARY KEY,
    credits_balance INTEGER DEFAULT 0,
    credits_used_lifetime INTEGER DEFAULT 0,
    credits_purchased_lifetime INTEGER DEFAULT 0,
    last_credit_purchase_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Indexes for Performance

```sql
-- Transaction lookups
CREATE INDEX idx_transactions_user_created ON transactions(user_id, created_at DESC);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_hash ON transactions(transaction_hash);

-- Reference lookups (for payment matching)
CREATE INDEX idx_transactions_metadata_reference ON transactions
  USING gin((metadata->'reference'));

-- Admin dashboard queries
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);
CREATE INDEX idx_transactions_blockchain ON transactions(blockchain);
```

### Transaction Events (Audit Trail)

```sql
CREATE TABLE transaction_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    event VARCHAR(50) NOT NULL,
    metadata JSONB,
    triggered_by VARCHAR(50) NOT NULL, -- user, system, admin
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_transaction_events_tx ON transaction_events(transaction_id, created_at DESC);
```

### Revenue Analytics (Materialized View)

```sql
CREATE MATERIALIZED VIEW revenue_analytics AS
SELECT
    DATE(created_at) as date,
    blockchain,
    currency,
    COUNT(*) as transaction_count,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count,
    SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_count,
    SUM(CASE WHEN status = 'refunded' THEN 1 ELSE 0 END) as refunded_count,
    SUM(CASE WHEN status = 'completed' THEN usd_value ELSE 0 END) as total_revenue,
    SUM(CASE WHEN status = 'completed' THEN net_revenue ELSE 0 END) as net_revenue,
    AVG(CASE WHEN status = 'completed' THEN usd_value ELSE NULL END) as avg_transaction_value
FROM transactions
WHERE created_at >= NOW() - INTERVAL '90 days'
GROUP BY DATE(created_at), blockchain, currency
ORDER BY date DESC;

-- Refresh daily
CREATE INDEX idx_revenue_analytics_date ON revenue_analytics(date DESC);
```

---

## Admin Dashboard Requirements

### Dashboard Overview

The admin dashboard provides comprehensive transaction monitoring, user management, and revenue analytics in a single interface.

### Key Features

1. **Real-time Transaction Feed**
2. **Revenue Analytics**
3. **User Management**
4. **Refund Processing**
5. **Fraud Detection**
6. **Export & Reporting**

### UI Mockup Structure

```
┌─────────────────────────────────────────────────────────────┐
│ Astro Admin Dashboard                      [Admin: John]  ▼ │
├─────────────────────────────────────────────────────────────┤
│ [Overview] [Transactions] [Users] [Analytics] [Settings]    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│ │   Revenue   │ │ Transactions│ │  Conversion │            │
│ │   $18,432   │ │     312     │ │    8.4%     │            │
│ │  This Month │ │   Today     │ │   This Week │            │
│ └─────────────┘ └─────────────┘ └─────────────┘            │
│                                                               │
│ Revenue Trend (Last 30 Days)                                 │
│ [Line Chart: Daily Revenue]                                  │
│                                                               │
│ Recent Transactions                        [Filter ▼] [Export]│
│ ┌───────────────────────────────────────────────────────────┐│
│ │ Time    User      Amount    Chain    Status    Actions    ││
│ ├───────────────────────────────────────────────────────────┤│
│ │ 2m ago  alice123  $4.99 SOL Solana   Completed  [View]    ││
│ │ 5m ago  bob456    $19.99   Ethereum  Confirming [Monitor] ││
│ │ 8m ago  carol789  $49.99   Base      Completed  [Refund]  ││
│ │ 12m ago dave101   $34.99   Solana    Failed     [Retry]   ││
│ └───────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### 1. Overview Page

**Metrics:**
```typescript
interface DashboardMetrics {
  // Revenue
  totalRevenue: number; // All time
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  revenueGrowth: number; // % vs last month

  // Transactions
  totalTransactions: number;
  transactionsToday: number;
  successRate: number; // %
  averageTransactionValue: number;

  // Users
  totalUsers: number;
  payingUsers: number;
  conversionRate: number; // %
  newUsersToday: number;

  // Health
  pendingTransactions: number;
  failedLast24h: number;
  refundsLast7d: number;
}
```

**Charts:**
- Revenue trend (line chart, last 30 days)
- Transactions by status (pie chart)
- Revenue by chain (bar chart)
- Conversion funnel (funnel chart)

### 2. Transaction Management Page

**Filters:**
```typescript
interface TransactionFilters {
  status?: 'pending' | 'confirming' | 'completed' | 'failed' | 'refunded';
  blockchain?: 'solana' | 'ethereum' | 'base';
  currency?: 'SOL' | 'ETH' | 'USDC' | 'USDT';
  dateRange?: { start: Date; end: Date };
  userId?: string;
  transactionHash?: string;
  minAmount?: number;
  maxAmount?: number;
}
```

**Transaction List Columns:**
- Timestamp
- User (username + ID)
- Amount (with USD equivalent)
- Currency / Chain
- Status (with color coding)
- Confirmations (for confirming transactions)
- Actions (View, Refund, Retry)

**Bulk Actions:**
- Export selected transactions (CSV)
- Batch refund (with confirmation)
- Batch retry failed transactions

### 3. Transaction Detail View

**Modal/Page showing:**
```typescript
interface TransactionDetails {
  // Basic Info
  id: string;
  user: { id: string; username: string; email: string };
  createdAt: Date;
  status: string;

  // Payment Details
  amount: number;
  currency: string;
  usdValue: number;
  blockchain: string;
  paymentMethod: string;

  // Blockchain Info
  transactionHash?: string;
  fromWallet?: string;
  toWallet?: string;
  confirmations?: number;
  blockExplorerUrl?: string;

  // Fulfillment
  creditsGranted?: number;
  subscriptionDaysGranted?: number;

  // Timeline
  events: TransactionEvent[];

  // Metadata
  packageId: string;
  reference: string;
  userAgent: string;
  ipAddress: string;
}
```

**Actions:**
- View on block explorer
- Refund (if completed)
- Retry (if failed)
- Contact user
- Mark as fraud (flag for review)

### 4. Revenue Analytics Page

**Time Periods:**
- Today
- Last 7 days
- Last 30 days
- Last 90 days
- Custom range

**Metrics:**
```typescript
interface RevenueMetrics {
  totalRevenue: number;
  netRevenue: number; // After fees
  transactionCount: number;
  averageTransactionValue: number;

  // Breakdown
  revenueByChain: { solana: number; ethereum: number; base: number };
  revenueByToken: { SOL: number; ETH: number; USDC: number; USDT: number };
  revenueByPackage: { credits_10: number; credits_50: number; credits_100: number; unlimited_month: number };

  // Trends
  dailyRevenue: { date: string; revenue: number }[];
  growthRate: number; // % vs previous period

  // User metrics
  newPayingUsers: number;
  repeatCustomers: number;
  averageRevenuePerUser: number;
}
```

**Charts:**
- Revenue over time (line chart with comparison to previous period)
- Revenue by chain (pie chart)
- Revenue by package (bar chart)
- Top users by spend (table)
- Cohort analysis (retention by signup month)

### 5. User Management Page

**User List:**
```typescript
interface UserListItem {
  id: string;
  username: string;
  email: string;
  createdAt: Date;

  // Credits
  creditsBalance: number;
  creditsUsedLifetime: number;
  creditsPurchasedLifetime: number;

  // Subscription
  subscriptionTier: string;
  subscriptionStatus: string;
  subscriptionExpiresAt?: Date;

  // Spending
  totalSpent: number;
  transactionCount: number;
  lastPurchaseAt?: Date;

  // Activity
  predictionCount: number;
  lastActiveAt: Date;
}
```

**Actions:**
- View user details
- View transaction history
- Grant free credits (admin action)
- Extend subscription (admin action)
- Ban user (fraud prevention)
- Contact user

### 6. Settings Page

**Configuration:**
- Payment wallet addresses (Solana, Ethereum, Base)
- RPC endpoints
- Webhook secrets
- Pricing configuration
- Feature flags (enable/disable payment methods)
- Notification settings

---

## Revenue Reporting

### Daily Revenue Report

**Generated automatically at midnight UTC**

```typescript
interface DailyRevenueReport {
  date: Date;

  // Totals
  totalRevenue: number;
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  refunds: number;

  // Breakdown
  revenueByChain: { [chain: string]: number };
  revenueByPackage: { [packageId: string]: number };
  transactionsByStatus: { [status: string]: number };

  // User metrics
  newPayingUsers: number;
  repeatPurchases: number;

  // Trends
  comparisonToYesterday: {
    revenue: { value: number; change: number; percentChange: number };
    transactions: { value: number; change: number; percentChange: number };
  };

  comparisonToLastWeek: {
    revenue: { value: number; change: number; percentChange: number };
  };
}

// Send to admin email and Slack
async function generateDailyReport(): Promise<DailyRevenueReport> {
  const yesterday = subDays(new Date(), 1);
  const startOfDay = startOfDay(yesterday);
  const endOfDay = endOfDay(yesterday);

  const transactions = await db.transactions.findMany({
    where: {
      created_at: { gte: startOfDay, lte: endOfDay }
    }
  });

  // Calculate metrics...
  const report = calculateRevenueMetrics(transactions);

  // Send email
  await emailService.send({
    to: process.env.ADMIN_EMAIL,
    subject: `Daily Revenue Report - ${format(yesterday, 'MMM dd, yyyy')}`,
    template: 'daily-revenue-report',
    data: report
  });

  // Post to Slack
  await slackService.postMessage({
    channel: '#revenue',
    text: formatSlackReport(report)
  });

  return report;
}
```

### Monthly Financial Report

**Generated on 1st of each month**

```typescript
interface MonthlyFinancialReport {
  month: string; // "2025-01"

  // Revenue
  totalRevenue: number;
  netRevenue: number; // After platform fees
  platformFees: number;

  // Growth
  revenueGrowth: number; // % vs last month
  userGrowth: number;

  // Transactions
  totalTransactions: number;
  successRate: number;
  averageTransactionValue: number;

  // Users
  totalUsers: number;
  payingUsers: number;
  newPayingUsers: number;
  churnedUsers: number;

  // Metrics
  mrr: number; // Monthly recurring revenue (subscriptions)
  arpu: number; // Average revenue per user
  ltv: number; // Lifetime value estimate

  // Breakdown
  revenueByChain: { [chain: string]: number };
  revenueByPackage: { [packageId: string]: number };
  topUsers: Array<{ userId: string; username: string; spent: number }>;
}
```

### Export Functionality

```typescript
// Export transactions to CSV
async function exportTransactions(filters: TransactionFilters): Promise<string> {
  const transactions = await db.transactions.findMany({
    where: buildWhereClause(filters),
    include: { user: true }
  });

  const csv = [
    // Header
    ['Date', 'User ID', 'Username', 'Amount', 'Currency', 'Chain', 'Status', 'TX Hash', 'Credits'].join(','),

    // Rows
    ...transactions.map(tx => [
      tx.created_at.toISOString(),
      tx.user_id,
      tx.user.username,
      tx.amount,
      tx.currency,
      tx.blockchain,
      tx.status,
      tx.transaction_hash || '',
      tx.credits_granted || ''
    ].join(','))
  ].join('\n');

  return csv;
}

// Usage
app.get('/api/admin/transactions/export', async (req, res) => {
  const filters = req.query;
  const csv = await exportTransactions(filters);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
  res.send(csv);
});
```

---

## Refund Handling

### Refund Policy

**Eligible for Refund:**
- Payment completed but credits not allocated (system error)
- Duplicate payment
- User changed mind within 24 hours (discretionary)
- Service issue (platform downtime)

**Not Eligible:**
- Credits already used
- Purchase > 30 days ago
- Fraudulent claim

### Refund Process

```typescript
async function processRefund(params: {
  transactionId: string;
  reason: string;
  refundType: 'full' | 'partial';
  partialAmount?: number;
  adminId: string;
}): Promise<RefundResult> {
  const { transactionId, reason, refundType, partialAmount, adminId } = params;

  // 1. Validate refund eligibility
  const transaction = await db.transactions.findUnique({
    where: { id: transactionId },
    include: { user: true }
  });

  if (transaction.status !== 'completed') {
    throw new Error('Can only refund completed transactions');
  }

  // Check if credits were used
  const creditsUsed = await getCreditsUsedSinceTransaction(
    transaction.user_id,
    transaction.created_at
  );

  if (creditsUsed > transaction.credits_granted) {
    // User has used more credits than this transaction granted
    // Allow partial refund or deny
    if (refundType === 'full') {
      throw new Error('User has used credits from this purchase. Only partial refund available.');
    }
  }

  // 2. Calculate refund amount
  const refundAmount = refundType === 'full'
    ? transaction.amount
    : (partialAmount || transaction.amount * 0.5);

  // 3. Process refund (in database transaction)
  await db.$transaction(async (tx) => {
    // Update transaction status
    await tx.transactions.update({
      where: { id: transactionId },
      data: {
        status: 'refunded',
        refunded_at: new Date(),
        metadata: {
          ...transaction.metadata,
          refundReason: reason,
          refundType,
          refundAmount,
          refundedBy: adminId,
          originalAmount: transaction.amount
        }
      }
    });

    // Deduct credits from user
    const creditsToDeduct = Math.min(
      transaction.credits_granted,
      await getCurrentCredits(tx, transaction.user_id)
    );

    if (creditsToDeduct > 0) {
      await tx.user_credits.update({
        where: { user_id: transaction.user_id },
        data: {
          credits_balance: { decrement: creditsToDeduct }
        }
      });
    }

    // Create refund record
    await tx.refunds.create({
      data: {
        transaction_id: transactionId,
        user_id: transaction.user_id,
        amount: refundAmount,
        currency: transaction.currency,
        reason,
        refund_type: refundType,
        credits_deducted: creditsToDeduct,
        processed_by: adminId,
        status: 'pending' // Will be 'completed' after blockchain refund
      }
    });
  });

  // 4. Process blockchain refund (if applicable)
  // For crypto payments, this would require manual transfer
  // For future IAP, this uses platform APIs

  // 5. Notify user
  await emailService.send({
    to: transaction.user.email,
    subject: 'Refund Processed',
    template: 'refund-notification',
    data: {
      amount: refundAmount,
      currency: transaction.currency,
      reason,
      transactionId
    }
  });

  // 6. Log admin action
  await auditLog({
    adminId,
    action: 'refund_processed',
    resourceType: 'transaction',
    resourceId: transactionId,
    metadata: { reason, refundType, refundAmount }
  });

  return {
    success: true,
    refundAmount,
    creditsDeducted: creditsToDeduct,
    message: 'Refund processed successfully'
  };
}
```

### Refunds Table

```sql
CREATE TABLE refunds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES transactions(id),
    user_id UUID REFERENCES users(id),

    amount DECIMAL NOT NULL,
    currency VARCHAR(20),

    reason TEXT,
    refund_type VARCHAR(20), -- full, partial

    credits_deducted INTEGER,

    status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed

    processed_by UUID REFERENCES users(id), -- Admin who processed
    processed_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);
```

---

## Failed Payment Retry

### Automatic Retry

```typescript
// Retry failed payments automatically (with exponential backoff)
async function retryFailedPayment(transactionId: string): Promise<void> {
  const transaction = await db.transactions.findUnique({
    where: { id: transactionId }
  });

  if (transaction.status !== 'failed') {
    throw new Error('Can only retry failed transactions');
  }

  // Check retry count
  const retryCount = transaction.metadata.retryCount || 0;
  const maxRetries = 3;

  if (retryCount >= maxRetries) {
    console.log(`Transaction ${transactionId} has reached max retries`);
    return;
  }

  // Update retry metadata
  await db.transactions.update({
    where: { id: transactionId },
    data: {
      metadata: {
        ...transaction.metadata,
        retryCount: retryCount + 1,
        lastRetryAt: new Date()
      }
    }
  });

  // Attempt to re-process
  try {
    if (transaction.transaction_hash) {
      // Re-check transaction on blockchain
      await recheckTransactionStatus(transaction.transaction_hash, transaction.blockchain);
    } else {
      // Transaction never submitted, can't retry automatically
      console.log(`Transaction ${transactionId} has no hash, cannot retry`);
    }
  } catch (error) {
    console.error(`Retry failed for transaction ${transactionId}:`, error);

    // Schedule next retry with exponential backoff
    const backoffMs = Math.pow(2, retryCount) * 60 * 1000; // 1min, 2min, 4min
    setTimeout(() => retryFailedPayment(transactionId), backoffMs);
  }
}
```

### Manual Retry (Admin Action)

```typescript
// Admin manually triggers retry
app.post('/api/admin/transactions/:id/retry', async (req, res) => {
  const { id } = req.params;
  const adminId = req.user.id;

  try {
    await retryFailedPayment(id);

    await auditLog({
      adminId,
      action: 'transaction_retry',
      resourceType: 'transaction',
      resourceId: id
    });

    res.json({ success: true, message: 'Retry initiated' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

---

## Monitoring & Alerts

### Key Metrics to Monitor

```typescript
interface MonitoringMetrics {
  // Transaction health
  pendingTransactions: number;
  confirmingTransactions: number;
  failureRate: number; // % of failed transactions
  averageConfirmationTime: number; // seconds

  // System health
  webhookSuccessRate: number;
  rpcResponseTime: number; // ms
  databaseResponseTime: number; // ms

  // Business metrics
  revenueToday: number;
  transactionsToday: number;
  conversionRate: number;
}
```

### Alert Rules

```typescript
const ALERT_RULES = {
  // Critical (PagerDuty)
  high_failure_rate: {
    condition: (metrics) => metrics.failureRate > 10, // >10% failed
    severity: 'critical',
    message: 'High transaction failure rate detected'
  },

  webhook_failures: {
    condition: (metrics) => metrics.webhookSuccessRate < 90,
    severity: 'critical',
    message: 'Webhook delivery failures detected'
  },

  stuck_transactions: {
    condition: (metrics) => metrics.pendingTransactions > 50,
    severity: 'high',
    message: 'Many transactions stuck in pending state'
  },

  // Warning (Slack)
  slow_confirmations: {
    condition: (metrics) => metrics.averageConfirmationTime > 300, // >5 minutes
    severity: 'warning',
    message: 'Transactions taking longer than expected to confirm'
  },

  low_revenue: {
    condition: (metrics) => {
      const hour = new Date().getHours();
      return hour > 12 && metrics.revenueToday < 100; // Low revenue by noon
    },
    severity: 'warning',
    message: 'Revenue below expected for this time of day'
  }
};

// Check alerts every minute
setInterval(async () => {
  const metrics = await collectMetrics();

  for (const [name, rule] of Object.entries(ALERT_RULES)) {
    if (rule.condition(metrics)) {
      await sendAlert({
        name,
        severity: rule.severity,
        message: rule.message,
        metrics
      });
    }
  }
}, 60 * 1000);
```

### Dashboards (DataDog / Grafana)

**Transaction Dashboard:**
- Transactions per minute (real-time)
- Success rate over time
- Average confirmation time
- Transactions by status (pie chart)
- Transactions by chain (bar chart)

**Revenue Dashboard:**
- Revenue per hour (line chart)
- Revenue by chain (pie chart)
- Top users by spend (table)
- Conversion rate (gauge)

**System Health Dashboard:**
- RPC response time (line chart)
- Webhook delivery rate (gauge)
- Database query time (line chart)
- Error rate (line chart)

### Logging

```typescript
// Structured logging for all payment operations
logger.info('Payment created', {
  transactionId: transaction.id,
  userId: transaction.user_id,
  amount: transaction.amount,
  currency: transaction.currency,
  blockchain: transaction.blockchain
});

logger.info('Payment confirmed', {
  transactionId: transaction.id,
  transactionHash: transaction.transaction_hash,
  confirmations: transaction.confirmation_count,
  duration: Date.now() - transaction.created_at.getTime()
});

logger.error('Payment failed', {
  transactionId: transaction.id,
  reason: transaction.failure_reason,
  blockchain: transaction.blockchain,
  transactionHash: transaction.transaction_hash
});
```

---

## Conclusion

Comprehensive transaction management ensures the payment system operates reliably, transparently, and efficiently. Key takeaways:

**Transaction Lifecycle:**
- Clear state machine (pending → confirming → completed)
- Complete audit trail via transaction events
- Automated and manual recovery paths

**Admin Dashboard:**
- Real-time monitoring of all transactions
- Revenue analytics for business insights
- User management and support tools
- Refund and retry capabilities

**Revenue Reporting:**
- Automated daily and monthly reports
- Export functionality for accounting
- Trend analysis and forecasting

**Operational Excellence:**
- Comprehensive monitoring and alerting
- Failed payment retry logic
- Fraud detection and prevention
- Complete audit trail

With these systems in place, the Astro Prediction Platform has a robust foundation for payment operations, administrative oversight, and business intelligence.

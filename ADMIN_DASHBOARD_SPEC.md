# Phase 9: Admin Dashboard Specification

**Version:** 1.0
**Last Updated:** 2025-12-22
**Status:** Planning

---

## Overview

This document specifies the comprehensive admin dashboard for the Astro Prediction Platform. The dashboard provides real-time visibility into system health, business metrics, AI costs, user behavior, and prediction performance.

**Primary Users:**
- Platform administrators
- Product managers
- Operations team
- Founders/executives

**Key Objectives:**
- **Operational Excellence:** Monitor system health and catch issues early
- **Business Intelligence:** Track revenue, users, and growth metrics
- **Cost Control:** Monitor AI costs and identify optimization opportunities
- **Product Insights:** Understand user behavior and prediction performance
- **Data-Driven Decisions:** Provide actionable metrics for strategic planning

---

## Dashboard Architecture

### Technology Stack

**Frontend:**
- React (already in use)
- Recharts for data visualization
- TailwindCSS for styling
- React Query for data fetching
- WebSocket (optional) for real-time updates

**Backend:**
- Next.js API routes
- PostgreSQL for data storage
- Redis for real-time metrics
- Scheduled jobs for aggregations

### Route Structure

```
/admin
  /admin/overview             - Main dashboard (landing page)
  /admin/ai-costs             - AI cost analytics
  /admin/users                - User analytics
  /admin/predictions          - Prediction analytics
  /admin/revenue              - Revenue & payments
  /admin/system-health        - System health & errors
  /admin/feedback             - User feedback
  /admin/settings             - Dashboard configuration
```

---

## Section 1: Overview Dashboard

**Route:** `/admin/overview`
**Purpose:** High-level snapshot of platform health and key metrics
**Refresh:** Auto-refresh every 30 seconds

### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  ASTRO ADMIN DASHBOARD                          [@admin]  Logout │
│  Last Updated: 2 min ago  |  Auto-refresh: ON  |  [⟳ Refresh]    │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  KEY METRICS (Last 24 Hours)                  Compare: Yesterday  │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────┐ │
│  │ USERS        │ │ PREDICTIONS  │ │ REVENUE      │ │ AI COSTS │ │
│  │              │ │              │ │              │ │          │ │
│  │   1,234      │ │   3,567      │ │   $1,250     │ │  $180    │ │
│  │   ↑ +15%     │ │   ↑ +23%     │ │   ↑ +18%     │ │  ↑ +12%  │ │
│  │              │ │              │ │              │ │          │ │
│  │ Active users │ │ Generated    │ │ Gross        │ │ Spent    │ │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────┘ │
│                                                                   │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────┐ │
│  │ CACHE HIT    │ │ ERROR RATE   │ │ P95 LATENCY  │ │ UPTIME   │ │
│  │   54.2%      │ │   0.3%       │ │   1.2s       │ │  99.9%   │ │
│  │   ✅ >50%    │ │   ✅ <1%     │ │   ✅ <2s     │ │  ✅      │ │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────┘ │
│                                                                   │
├──────────────────────────────────────────────────────────────────┤
│  REVENUE TREND (Last 30 Days)                    [Week] [Month]  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ $2K │                                               ╱───╲   │  │
│  │     │                                          ╱───╯     ╲  │  │
│  │ $1.5K                                    ╱───╯            │  │
│  │     │                              ╱────╯                 │  │
│  │ $1K │                        ╱────╯                       │  │
│  │     │                  ╱────╯                             │  │
│  │ $500│            ╱────╯                                   │  │
│  │     ├────────────────────────────────────────────────────│  │
│  │       Dec 1   Dec 8   Dec 15   Dec 22   Dec 29           │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
├──────────────────────────────────────────────────────────────────┤
│  PREDICTIONS BY TYPE (Today)              ACTIVE ALERTS          │
│  ┌─────────────────────────────────┐  ┌─────────────────────┐   │
│  │ Macro      ████████████ 1,234   │  │ ✅ No active alerts │   │
│  │ Timing     ██████████     987   │  │                     │   │
│  │ Divination ████           520   │  │ Last alert:         │   │
│  │ Compat     ███            320   │  │ 2 hours ago         │   │
│  └─────────────────────────────────┘  │ (Resolved)          │   │
│                                        └─────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  QUICK ACTIONS                                                    │
│  [View Errors] [Check AI Costs] [User Analytics] [Export Data]   │
└──────────────────────────────────────────────────────────────────┘
```

### Data Requirements

**API Endpoint:** `GET /api/admin/overview`

```typescript
interface OverviewMetrics {
  period: '24h' | '7d' | '30d';

  users: {
    active: number;          // Active in period
    total: number;           // Total users
    new: number;             // New signups
    changePercent: number;   // vs previous period
  };

  predictions: {
    total: number;
    byType: Record<string, number>;
    changePercent: number;
  };

  revenue: {
    amount: number;          // USD cents
    transactions: number;
    changePercent: number;
  };

  aiCosts: {
    amount: number;          // USD cents
    apiCalls: number;
    costPerPrediction: number;
    changePercent: number;
  };

  systemHealth: {
    cacheHitRate: number;    // 0-1
    errorRate: number;       // 0-1
    p95Latency: number;      // milliseconds
    uptime: number;          // 0-1
  };

  revenueTimeline: Array<{
    date: string;
    amount: number;
  }>;

  activeAlerts: Alert[];
  lastUpdated: string;
}
```

### Components

```typescript
// /apps/web/components/admin/overview/

- OverviewDashboard.tsx        // Main container
- MetricCard.tsx                // Reusable metric card
- RevenueChart.tsx              // Line chart for revenue
- PredictionTypeChart.tsx       // Bar chart for predictions
- SystemHealthIndicators.tsx    // Health status cards
- AlertsPanel.tsx               // Active alerts display
- QuickActions.tsx              // Action buttons
```

---

## Section 2: AI Cost Analytics

**Route:** `/admin/ai-costs`
**Purpose:** Detailed analysis of AI API costs and optimization opportunities
**Refresh:** Every 5 minutes

### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  AI COST ANALYTICS                        Date Range: [Last 30d] │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  COST SUMMARY                                                     │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────┐ │
│  │ TOTAL SPENT  │ │ AVG/PRED     │ │ COST/REVENUE │ │ PROJECTED│ │
│  │   $5,432     │ │   $0.15      │ │    14.2%     │ │  $5,800  │ │
│  │   ↓ -8%      │ │   ↓ -12%     │ │   ✅ <20%    │ │  /month  │ │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────┘ │
│                                                                   │
├──────────────────────────────────────────────────────────────────┤
│  DAILY COST TREND                                                 │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ $200 │                                                      │  │
│  │      │      ╱╲    ╱╲                          ╱╲           │  │
│  │ $150 │     ╱  ╲  ╱  ╲        ╱╲            ╱╯  ╲          │  │
│  │      │    ╱    ╲╯    ╲    ╱╯  ╲        ╱╯      ╲         │  │
│  │ $100 │   ╱             ╲──╯      ╲────╱          ╲────    │  │
│  │      ├──────────────────────────────────────────────────── │  │
│  │        Dec 1      Dec 8      Dec 15      Dec 22            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
├──────────────────────────────────────────────────────────────────┤
│  COST BY PREDICTION TYPE                                          │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Type        │ API Calls │ Avg Tokens │ Avg Cost │ Total   │  │
│  │─────────────────────────────────────────────────────────────│  │
│  │ Macro       │  12,345   │   8,523    │  $0.18   │ $2,220  │  │
│  │ Timing      │  10,234   │   6,234    │  $0.14   │ $1,433  │  │
│  │ Divination  │   5,678   │   9,876    │  $0.21   │ $1,192  │  │
│  │ Compat      │   3,456   │   5,123    │  $0.11   │   $380  │  │
│  │─────────────────────────────────────────────────────────────│  │
│  │ TOTAL       │  31,713   │   7,439    │  $0.17   │ $5,225  │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
├──────────────────────────────────────────────────────────────────┤
│  TOP USERS BY AI COST (Last 7 Days)                               │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ User               │ Predictions │ Total Cost │ Avg Cost   │  │
│  │──────────────────────────────────────────────────────────────│  │
│  │ @crypto_whale      │     456     │   $82.50   │   $0.18    │  │
│  │ @astro_trader      │     389     │   $71.23   │   $0.18    │  │
│  │ user@email.com     │     312     │   $53.76   │   $0.17    │  │
│  │ ...                │     ...     │    ...     │    ...     │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
├──────────────────────────────────────────────────────────────────┤
│  OPTIMIZATION OPPORTUNITIES                                       │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ ⚠️  Cache hit rate for macro: 45% (target 60%)             │  │
│  │ 💡 Recommendation: Increase macro prediction TTL to 48h    │  │
│  │                                                             │  │
│  │ ⚠️  Timing predictions: avg 8.2K tokens (target <7K)       │  │
│  │ 💡 Recommendation: Test shorter prompt version (v2.1)      │  │
│  │                                                             │  │
│  │ ⚠️  Divination most expensive: $0.21/prediction            │  │
│  │ 💡 Recommendation: Implement selective caching             │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  [Export CSV] [Set Budget Alert] [View Detailed Logs]             │
└──────────────────────────────────────────────────────────────────┘
```

### Data Requirements

**API Endpoint:** `GET /api/admin/ai-costs?startDate=...&endDate=...&groupBy=day`

```typescript
interface AICostAnalytics {
  summary: {
    totalSpent: number;        // USD cents
    totalApiCalls: number;
    avgCostPerPrediction: number;
    avgTokensPerPrediction: number;
    costToRevenueRatio: number;
    projectedMonthlyCost: number;
    changeVsPreviousPeriod: number;
  };

  timeline: Array<{
    date: string;
    cost: number;
    apiCalls: number;
    avgCost: number;
  }>;

  byType: Record<string, {
    apiCalls: number;
    avgTokens: number;
    avgCost: number;
    totalCost: number;
  }>;

  topUsers: Array<{
    userId: string;
    email?: string;
    telegramUsername?: string;
    predictions: number;
    totalCost: number;
    avgCost: number;
  }>;

  optimizations: Array<{
    type: 'warning' | 'info';
    title: string;
    description: string;
    recommendation: string;
    estimatedSavings?: number;
  }>;
}
```

---

## Section 3: User Analytics

**Route:** `/admin/users`
**Purpose:** User growth, retention, and engagement metrics

### Key Metrics

```
┌──────────────────────────────────────────────────────────────────┐
│  USER ANALYTICS                           Date Range: [Last 30d] │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  USER GROWTH                                                      │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────┐ │
│  │ TOTAL USERS  │ │ NEW (30d)    │ │ DAU          │ │ MAU      │ │
│  │   12,456     │ │   1,234      │ │   3,456      │ │  8,901   │ │
│  │   ↑ +23%     │ │   ↑ +15%     │ │   ↑ +8%      │ │  ↑ +12%  │ │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────┘ │
│                                                                   │
│  SIGNUP TREND                                                     │
│  [Line chart showing daily signups over time]                     │
│                                                                   │
│  USER RETENTION COHORTS                                           │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Cohort   │ Users │ Day 1 │ Day 7 │ Day 30│ Day 90│         │  │
│  │──────────────────────────────────────────────────────────────│  │
│  │ Dec W1   │  234  │  85%  │  45%  │  28%  │  18%  │         │  │
│  │ Nov W4   │  198  │  82%  │  42%  │  25%  │  15%  │         │  │
│  │ Nov W3   │  212  │  88%  │  48%  │  30%  │  20%  │ ✅      │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  TOP USERS (By Prediction Count)                                  │
│  [Table showing most active users]                                │
│                                                                   │
│  PLATFORM BREAKDOWN                                               │
│  Web: 45% | iOS: 35% | Android: 15% | Telegram: 5%               │
│  [Pie chart]                                                      │
└──────────────────────────────────────────────────────────────────┘
```

### Data Requirements

**API Endpoint:** `GET /api/admin/users?startDate=...&endDate=...`

```typescript
interface UserAnalytics {
  summary: {
    totalUsers: number;
    newUsers: number;
    dau: number;            // Daily Active Users
    mau: number;            // Monthly Active Users
    changePercent: number;
  };

  signupTrend: Array<{
    date: string;
    signups: number;
    platform: Record<string, number>;
  }>;

  retention: {
    cohorts: Array<{
      cohortWeek: string;
      users: number;
      day1: number;      // % retained
      day7: number;
      day30: number;
      day90: number;
    }>;
    overall: {
      day1: number;
      day7: number;
      day30: number;
      day90: number;
    };
  };

  topUsers: Array<{
    userId: string;
    email?: string;
    telegramUsername?: string;
    predictions: number;
    lastActive: string;
    platform: string;
  }>;

  platformBreakdown: Record<string, number>;
}
```

---

## Section 4: Prediction Analytics

**Route:** `/admin/predictions`
**Purpose:** Prediction volume, accuracy, and user feedback

### Key Metrics

```
┌──────────────────────────────────────────────────────────────────┐
│  PREDICTION ANALYTICS                     Date Range: [Last 30d] │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  PREDICTION VOLUME                                                │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────┐ │
│  │ TOTAL        │ │ AVG/USER     │ │ AVG RATING   │ │ ACCURACY │ │
│  │   45,678     │ │   5.1        │ │   4.2/5      │ │  67.3%   │ │
│  │   ↑ +18%     │ │   ↑ +5%      │ │   ↑ +3%      │ │  ↑ +2%   │ │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────┘ │
│                                                                   │
│  PREDICTIONS BY TYPE                                              │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Type        │ Count │ Avg Rating │ Accuracy │ Cache Hit   │  │
│  │──────────────────────────────────────────────────────────────│  │
│  │ Macro       │12,345 │    4.3     │  68.5%   │    78%      │  │
│  │ Timing      │18,234 │    4.4     │  74.2%   │    62%      │  │
│  │ Divination  │ 9,876 │    3.9     │  61.8%   │    18%      │  │
│  │ Compat      │ 5,223 │    4.5     │  79.1%   │    85%      │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ACCURACY TREND (Last 90 Days)                                    │
│  [Line chart showing accuracy over time by prediction type]       │
│                                                                   │
│  MOST REQUESTED ASSETS                                            │
│  1. Bitcoin (BTC) - 8,234 predictions                             │
│  2. Ethereum (ETH) - 6,123 predictions                            │
│  3. Solana (SOL) - 3,456 predictions                              │
│  ...                                                              │
│                                                                   │
│  CACHE PERFORMANCE                                                │
│  Overall Hit Rate: 54.2% | Misses: 45.8%                          │
│  Cost Saved: $2,345 (43% of AI costs avoided)                    │
│  [Bar chart comparing cache hit rates by type]                    │
└──────────────────────────────────────────────────────────────────┘
```

---

## Section 5: Revenue Analytics

**Route:** `/admin/revenue`
**Purpose:** Revenue tracking, payment methods, and financial metrics

### Key Metrics

```
┌──────────────────────────────────────────────────────────────────┐
│  REVENUE ANALYTICS                        Date Range: [Last 30d] │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  REVENUE SUMMARY                                                  │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────┐ │
│  │ TOTAL REV    │ │ MRR          │ │ ARPU         │ │ CONV RATE│ │
│  │   $35,678    │ │   $12,345    │ │   $4.02      │ │   12.3%  │ │
│  │   ↑ +24%     │ │   ↑ +18%     │ │   ↑ +7%      │ │  ↑ +2%   │ │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────┘ │
│                                                                   │
│  REVENUE TREND                                                    │
│  [Line chart showing daily revenue]                               │
│                                                                   │
│  REVENUE BY PAYMENT METHOD                                        │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Method      │ Transactions │ Volume    │ Avg Amount  │     │  │
│  │──────────────────────────────────────────────────────────────│  │
│  │ Stripe      │     1,234    │  $24,567  │   $19.91    │     │  │
│  │ BTC         │       234    │   $5,678  │   $24.26    │     │  │
│  │ ETH         │       123    │   $3,456  │   $28.10    │     │  │
│  │ SOL         │        89    │   $1,977  │   $22.21    │     │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  TOP CUSTOMERS (By Revenue)                                       │
│  [Table showing highest paying users]                             │
│                                                                   │
│  CREDIT PACKAGES                                                  │
│  50 credits: 45% | 100 credits: 30% | 500 credits: 25%           │
└──────────────────────────────────────────────────────────────────┘
```

---

## Section 6: System Health

**Route:** `/admin/system-health`
**Purpose:** Monitor errors, performance, and system status

### Key Metrics

```
┌──────────────────────────────────────────────────────────────────┐
│  SYSTEM HEALTH                            Status: ✅ OPERATIONAL │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  PERFORMANCE METRICS                                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────┐ │
│  │ P95 LATENCY  │ │ ERROR RATE   │ │ UPTIME       │ │ REQUESTS │ │
│  │   1.2s       │ │   0.3%       │ │   99.9%      │ │  45.6K   │ │
│  │   ✅ <2s     │ │   ✅ <1%     │ │   ✅         │ │  /day    │ │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────┘ │
│                                                                   │
│  RESPONSE TIME PERCENTILES (Last 24h)                             │
│  p50: 450ms | p95: 1.2s | p99: 2.8s                              │
│  [Line chart showing response times]                              │
│                                                                   │
│  RECENT ERRORS (Last 100)                                         │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Time     │ Severity │ Category  │ Error                    │  │
│  │──────────────────────────────────────────────────────────────│  │
│  │ 10:23 AM │ error    │ ai        │ Claude API timeout       │  │
│  │ 09:45 AM │ warning  │ cache     │ Redis connection lost    │  │
│  │ 09:12 AM │ error    │ payment   │ Stripe webhook failed    │  │
│  │ ...      │ ...      │ ...       │ ...                      │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ERROR BREAKDOWN (Last 24h)                                       │
│  AI Errors: 12 | Payment: 5 | Database: 2 | Other: 8            │
│  [Pie chart]                                                      │
│                                                                   │
│  ACTIVE ALERTS                                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ ✅ No active alerts                                         │  │
│  │                                                              │  │
│  │ Last alert: High error rate (resolved 2h ago)               │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  SLOW ENDPOINTS (p95 > 2s)                                        │
│  /api/predictions/divination: 3.2s (needs optimization)           │
└──────────────────────────────────────────────────────────────────┘
```

---

## Section 7: User Feedback

**Route:** `/admin/feedback`
**Purpose:** Aggregate user feedback and NPS

### Key Metrics

```
┌──────────────────────────────────────────────────────────────────┐
│  USER FEEDBACK                            Date Range: [Last 30d] │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  FEEDBACK SUMMARY                                                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────┐ │
│  │ AVG RATING   │ │ NPS SCORE    │ │ FEEDBACK %   │ │ CAME TRUE│ │
│  │   4.2/5      │ │     +42      │ │    32%       │ │   68%    │ │
│  │   ⭐⭐⭐⭐     │ │   ✅         │ │   ↑ +5%      │ │  ↑ +3%   │ │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────┘ │
│                                                                   │
│  RATINGS BY PREDICTION TYPE                                       │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Type        │ Avg Rating │ Responses │ Came True %       │  │
│  │──────────────────────────────────────────────────────────────│  │
│  │ Macro       │    4.3     │   1,234   │     68.5%         │  │
│  │ Timing      │    4.4     │   2,345   │     74.2%         │  │
│  │ Divination  │    3.9     │   1,567   │     61.8%         │  │
│  │ Compat      │    4.5     │     890   │     79.1%         │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  RECENT FEEDBACK                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ User         │ Rating │ Type    │ Feedback                 │  │
│  │──────────────────────────────────────────────────────────────│  │
│  │ @user123     │  5⭐   │ Timing  │ "Predicted BTC move..."  │  │
│  │ @trader456   │  2⭐   │ Macro   │ "Too vague, not help..." │  │
│  │ user@mail    │  4⭐   │ Divin   │ "Interesting insight..." │  │
│  │ ...          │  ...   │ ...     │ ...                      │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  LOW-RATED PREDICTIONS (Flagged for Review)                       │
│  [List of predictions with rating <3]                             │
│                                                                   │
│  NPS BREAKDOWN                                                    │
│  Promoters (9-10): 45% | Passive (7-8): 35% | Detractors (0-6): 20%│
│  [Visualization]                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Real-Time Updates

### WebSocket Implementation (Optional)

```typescript
// /apps/web/hooks/useRealtimeMetrics.ts

import { useEffect, useState } from 'react';
import io from 'socket.io-client';

export function useRealtimeMetrics() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_WS_URL);

    socket.on('metrics:update', (data) => {
      setMetrics(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return metrics;
}
```

### Auto-Refresh

```typescript
// Polling approach (simpler)
const { data, refetch } = useQuery('admin-overview', fetchOverview, {
  refetchInterval: 30000, // 30 seconds
  refetchIntervalInBackground: false
});
```

---

## Filters & Date Ranges

### Date Range Picker

```typescript
interface DateRangeFilter {
  preset?: 'today' | '7d' | '30d' | '90d' | 'custom';
  startDate?: Date;
  endDate?: Date;
}

// Preset options
const DATE_PRESETS = [
  { label: 'Today', value: 'today' },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'Custom range', value: 'custom' }
];
```

### Additional Filters

- **Prediction Type:** All, Macro, Timing, Divination, Compatibility
- **Platform:** All, Web, iOS, Android, Telegram
- **Payment Method:** All, Stripe, Bitcoin, Ethereum, Solana
- **User Segment:** All, New (<30d), Active, Power Users

---

## Export Capabilities

### Export Formats

```typescript
// Export options
enum ExportFormat {
  CSV = 'csv',
  JSON = 'json',
  PDF = 'pdf'  // For reports
}

// Export API
POST /api/admin/export
Body: {
  type: 'overview' | 'ai-costs' | 'users' | 'predictions' | 'revenue';
  format: ExportFormat;
  dateRange: DateRangeFilter;
  filters?: Record<string, any>;
}

Response: {
  downloadUrl: string;
  expiresAt: string;
}
```

---

## Admin Authentication & Permissions

### Role-Based Access

```typescript
enum AdminRole {
  SUPER_ADMIN = 'super_admin',  // Full access
  ADMIN = 'admin',                // View all + basic actions
  ANALYST = 'analyst',            // View only
  SUPPORT = 'support'             // Limited view
}

// Permission checks
const ROUTE_PERMISSIONS = {
  '/admin/overview': [AdminRole.ANALYST, AdminRole.ADMIN, AdminRole.SUPER_ADMIN],
  '/admin/ai-costs': [AdminRole.ADMIN, AdminRole.SUPER_ADMIN],
  '/admin/users': [AdminRole.SUPPORT, AdminRole.ADMIN, AdminRole.SUPER_ADMIN],
  '/admin/revenue': [AdminRole.ADMIN, AdminRole.SUPER_ADMIN],
  '/admin/settings': [AdminRole.SUPER_ADMIN]
};
```

---

## Performance Optimization

### Query Optimization

- Use materialized views for expensive aggregations
- Cache dashboard queries for 1-5 minutes
- Pre-calculate daily/weekly/monthly rollups
- Index all date range queries

### Frontend Optimization

- Lazy load chart libraries
- Virtual scrolling for large tables
- Debounced date range changes
- Memoized chart components

---

## Mobile Responsiveness

- Dashboard accessible on tablets
- Simplified mobile view (priority metrics only)
- Touch-friendly controls
- Responsive charts

---

## Success Criteria

- ✅ Dashboard loads in <2 seconds
- ✅ All metrics update within 5 minutes of reality
- ✅ Admins use dashboard daily
- ✅ 90% of questions answered without SQL queries
- ✅ Zero calculation errors in metrics
- ✅ Export functionality works for all sections
- ✅ Mobile usable for quick checks

---

## Future Enhancements

1. **Alerting Configuration UI**
   - Configure alert thresholds from dashboard
   - Set notification preferences
   - Acknowledge/resolve alerts

2. **Custom Dashboards**
   - Users can create custom views
   - Drag-and-drop widgets
   - Save custom date ranges

3. **Prediction of Metrics**
   - ML to forecast revenue, costs
   - Anomaly detection
   - Automated insights

4. **Integration with BI Tools**
   - Tableau connector
   - Metabase integration
   - Data warehouse export

5. **Advanced Filtering**
   - Compare time periods
   - User cohort segmentation
   - Multi-dimensional analysis

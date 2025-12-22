# Phase 9: Monitoring Architecture

**Version:** 1.0
**Last Updated:** 2025-12-22
**Status:** Planning

---

## Overview

This document outlines the comprehensive monitoring architecture for the Astro Prediction Platform, designed to provide complete visibility into system health, AI costs, user experience, and business metrics. The architecture focuses on lightweight, efficient monitoring that provides actionable insights without impacting production performance.

**Key Principles:**
- **Low Overhead:** Monitoring should add < 5% to request latency
- **Actionable Metrics:** Every metric should inform a decision or action
- **Progressive Detail:** Start with high-level metrics, drill down as needed
- **Cost Awareness:** Track what matters for profitability
- **User-Centric:** Monitor what impacts user experience

---

## Monitoring Stack

### Core Technologies

1. **Winston Logger (Enhanced)**
   - **Current Usage:** Basic console logging
   - **Enhancement:** Add database transport for error logging
   - **Levels:** error, warn, info, debug
   - **Structured Logging:** JSON format for easy parsing
   - **Rotation:** Daily log files with 30-day retention

2. **PostgreSQL (Metrics Storage)**
   - **Why PostgreSQL:** Already in stack, excellent for time-series data
   - **Tables:** ai_usage_logs, performance_metrics, error_logs, prediction_cache_stats
   - **Indexes:** Optimized for time-range queries
   - **Retention:** 90 days detailed, 2 years aggregated

3. **Redis (Optional - for real-time metrics)**
   - **Use Case:** Real-time counters, rate limiting
   - **Metrics:** Current error rate, active users, requests/second
   - **TTL:** 1 hour (metrics flow to PostgreSQL for long-term storage)

4. **Email Alerts**
   - **Provider:** SendGrid (already configured)
   - **Alert Types:** Critical errors, cost thresholds, system health
   - **Recipients:** Admin team distribution list
   - **Throttling:** Max 1 alert per type per 5 minutes

### Data Flow

```
┌─────────────┐
│   API       │
│   Request   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Monitoring Middleware                   │
│  - Start timer                           │
│  - Capture request context               │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Business Logic                          │
│  - Prediction generation                 │
│  - AI calls (tracked)                    │
│  - Database queries (tracked)            │
│  - Cache operations (tracked)            │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Response Middleware                     │
│  - Calculate duration                    │
│  - Log metrics (async)                   │
│  - Update counters                       │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Async Metrics Logger                    │
│  - Batch inserts to PostgreSQL           │
│  - Update Redis counters                 │
│  - Check alert thresholds                │
└──────┬──────────────────────────────────┘
       │
       ├──────────┬──────────┬────────────┐
       ▼          ▼          ▼            ▼
   ┌────────┐ ┌────────┐ ┌────────┐  ┌────────┐
   │ Perf   │ │AI Cost │ │ Error  │  │ Cache  │
   │ Metrics│ │  Logs  │ │  Logs  │  │ Stats  │
   └────────┘ └────────┘ └────────┘  └────────┘
```

---

## AI Cost Tracking Implementation

### Architecture

**Goal:** Track every penny spent on AI API calls, attribute costs to users and prediction types, identify optimization opportunities.

### Data Model

```sql
CREATE TABLE ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Request Context
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  prediction_id UUID REFERENCES predictions(id) ON DELETE SET NULL,

  -- AI Provider Details
  provider VARCHAR(50) NOT NULL,           -- 'anthropic', 'openai'
  model VARCHAR(100) NOT NULL,              -- 'claude-3-5-sonnet-20241022'

  -- Token Usage
  prediction_type VARCHAR(50) NOT NULL,     -- 'macro', 'timing', 'divination'
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  total_tokens INTEGER NOT NULL,

  -- Cost Calculation (USD cents)
  input_cost INTEGER NOT NULL,              -- input_tokens * rate_per_million / 10000
  output_cost INTEGER NOT NULL,             -- output_tokens * rate_per_million / 10000
  total_cost INTEGER NOT NULL,              -- input_cost + output_cost

  -- Performance
  latency_ms INTEGER,                       -- AI API response time
  cache_hit BOOLEAN DEFAULT false,          -- Prompt caching hit

  -- Versioning
  prompt_version VARCHAR(20),               -- Links to prompt_templates
  prompt_template_id UUID,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  date DATE GENERATED ALWAYS AS (created_at::DATE) STORED
);

-- Indexes for fast queries
CREATE INDEX idx_ai_logs_user ON ai_usage_logs(user_id);
CREATE INDEX idx_ai_logs_date ON ai_usage_logs(date DESC);
CREATE INDEX idx_ai_logs_type ON ai_usage_logs(prediction_type, date);
CREATE INDEX idx_ai_logs_created ON ai_usage_logs(created_at DESC);
```

### Cost Calculation Logic

```typescript
// /services/monitoring/ai-cost-tracker.service.ts

interface AIUsage {
  provider: 'anthropic' | 'openai';
  model: string;
  inputTokens: number;
  outputTokens: number;
}

interface PricingTable {
  [provider: string]: {
    [model: string]: {
      inputPricePerMillion: number;  // USD
      outputPricePerMillion: number; // USD
    };
  };
}

const PRICING: PricingTable = {
  anthropic: {
    'claude-3-5-sonnet-20241022': {
      inputPricePerMillion: 3.00,
      outputPricePerMillion: 15.00
    }
  },
  openai: {
    'gpt-4-turbo': {
      inputPricePerMillion: 10.00,
      outputPricePerMillion: 30.00
    }
  }
};

function calculateCost(usage: AIUsage): {
  inputCostCents: number;
  outputCostCents: number;
  totalCostCents: number;
} {
  const pricing = PRICING[usage.provider]?.[usage.model];
  if (!pricing) {
    throw new Error(`No pricing found for ${usage.provider}:${usage.model}`);
  }

  // Calculate costs in cents
  const inputCostCents = Math.ceil(
    (usage.inputTokens / 1_000_000) * pricing.inputPricePerMillion * 100
  );

  const outputCostCents = Math.ceil(
    (usage.outputTokens / 1_000_000) * pricing.outputPricePerMillion * 100
  );

  const totalCostCents = inputCostCents + outputCostCents;

  return { inputCostCents, outputCostCents, totalCostCents };
}

async function logAIUsage(params: {
  userId?: string;
  predictionId?: string;
  provider: string;
  model: string;
  predictionType: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  promptVersion?: string;
  cacheHit?: boolean;
}) {
  const costs = calculateCost({
    provider: params.provider as any,
    model: params.model,
    inputTokens: params.inputTokens,
    outputTokens: params.outputTokens
  });

  await db.aiUsageLogs.create({
    data: {
      userId: params.userId,
      predictionId: params.predictionId,
      provider: params.provider,
      model: params.model,
      predictionType: params.predictionType,
      inputTokens: params.inputTokens,
      outputTokens: params.outputTokens,
      totalTokens: params.inputTokens + params.outputTokens,
      inputCost: costs.inputCostCents,
      outputCost: costs.outputCostCents,
      totalCost: costs.totalCostCents,
      latencyMs: params.latencyMs,
      cacheHit: params.cacheHit || false,
      promptVersion: params.promptVersion
    }
  });

  // Update daily totals in Redis for real-time dashboard
  await updateDailyTotals(costs.totalCostCents);
}
```

### Aggregation Queries

```sql
-- Daily AI costs by prediction type
SELECT
  date,
  prediction_type,
  COUNT(*) as api_calls,
  SUM(total_tokens) as total_tokens,
  SUM(total_cost) as total_cost_cents,
  AVG(total_cost) as avg_cost_cents,
  AVG(latency_ms) as avg_latency_ms
FROM ai_usage_logs
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY date, prediction_type
ORDER BY date DESC, prediction_type;

-- Top 10 users by AI cost
SELECT
  u.email,
  u.telegram_username,
  COUNT(*) as predictions,
  SUM(ai.total_cost) as total_cost_cents,
  AVG(ai.total_cost) as avg_cost_cents
FROM ai_usage_logs ai
JOIN users u ON ai.user_id = u.id
WHERE ai.date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY u.id, u.email, u.telegram_username
ORDER BY total_cost_cents DESC
LIMIT 10;

-- Cost efficiency by prompt version
SELECT
  prompt_version,
  prediction_type,
  COUNT(*) as uses,
  AVG(total_tokens) as avg_tokens,
  AVG(total_cost) as avg_cost_cents,
  AVG(latency_ms) as avg_latency_ms
FROM ai_usage_logs
WHERE prompt_version IS NOT NULL
  AND date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY prompt_version, prediction_type
ORDER BY prediction_type, prompt_version;
```

### AI Cost Alerts

```typescript
// Alert thresholds
const AI_COST_ALERTS = {
  daily_cost_threshold_usd: 100,      // Alert if daily AI costs > $100
  hourly_cost_threshold_usd: 20,      // Alert if hourly costs > $20
  cost_to_revenue_ratio: 0.25,        // Alert if AI costs > 25% of revenue
  abnormal_cost_spike: 2.0            // Alert if costs 2x daily average
};

async function checkAICostAlerts() {
  // Daily cost check
  const dailyCost = await getDailyAICost();
  if (dailyCost > AI_COST_ALERTS.daily_cost_threshold_usd * 100) {
    await sendAlert({
      severity: 'warning',
      title: 'High AI Costs Detected',
      message: `Daily AI costs: $${dailyCost / 100}. Threshold: $${AI_COST_ALERTS.daily_cost_threshold_usd}`,
      action: 'Review prediction volume and cache hit rates'
    });
  }

  // Revenue ratio check
  const dailyRevenue = await getDailyRevenue();
  const costRatio = dailyCost / dailyRevenue;
  if (costRatio > AI_COST_ALERTS.cost_to_revenue_ratio) {
    await sendAlert({
      severity: 'critical',
      title: 'AI Costs Exceeding Revenue Threshold',
      message: `AI costs are ${(costRatio * 100).toFixed(1)}% of revenue. Target: <25%`,
      action: 'Immediate optimization needed: increase caching, review prompt efficiency'
    });
  }
}
```

---

## Performance Monitoring

### Architecture

**Goal:** Track API response times, identify slow endpoints, monitor database query performance, ensure p95 < 2 seconds.

### Data Model

```sql
CREATE TABLE performance_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Request Details
  endpoint VARCHAR(255) NOT NULL,           -- '/api/predictions/macro'
  method VARCHAR(10) NOT NULL,              -- 'POST', 'GET'

  -- Performance
  response_time_ms INTEGER NOT NULL,        -- Total request duration
  status_code INTEGER NOT NULL,             -- 200, 400, 500, etc.

  -- User Context
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Breakdown
  db_query_time_ms INTEGER,                 -- Total DB query time
  db_query_count INTEGER,                   -- Number of DB queries
  ai_latency_ms INTEGER,                    -- AI API call time (if applicable)
  cache_latency_ms INTEGER,                 -- Cache lookup time

  -- Cache Status
  cache_hit BOOLEAN DEFAULT false,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  date DATE GENERATED ALWAYS AS (created_at::DATE) STORED,
  hour INTEGER GENERATED ALWAYS AS (EXTRACT(HOUR FROM created_at)) STORED
);

-- Indexes
CREATE INDEX idx_perf_endpoint ON performance_metrics(endpoint, date);
CREATE INDEX idx_perf_date ON performance_metrics(date DESC);
CREATE INDEX idx_perf_slow ON performance_metrics(response_time_ms DESC)
  WHERE response_time_ms > 2000;
```

### Monitoring Middleware

```typescript
// /middleware/performance-monitor.middleware.ts

import { Request, Response, NextFunction } from 'express';

interface PerformanceContext {
  startTime: number;
  dbQueryCount: number;
  dbQueryTime: number;
  aiLatency?: number;
  cacheLatency?: number;
  cacheHit?: boolean;
}

export function performanceMonitor(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const context: PerformanceContext = {
    startTime: Date.now(),
    dbQueryCount: 0,
    dbQueryTime: 0
  };

  // Attach context to request for tracking
  (req as any).perfContext = context;

  // Hook into response finish
  res.on('finish', async () => {
    const duration = Date.now() - context.startTime;

    // Log performance metrics asynchronously
    setImmediate(async () => {
      try {
        await logPerformanceMetric({
          endpoint: req.path,
          method: req.method,
          responseTimeMs: duration,
          statusCode: res.statusCode,
          userId: (req as any).user?.id,
          dbQueryTimeMs: context.dbQueryTime,
          dbQueryCount: context.dbQueryCount,
          aiLatencyMs: context.aiLatency,
          cacheLatencyMs: context.cacheLatency,
          cacheHit: context.cacheHit
        });
      } catch (error) {
        logger.error('Failed to log performance metric:', error);
      }
    });
  });

  next();
}
```

### Percentile Calculations

```sql
-- Calculate p50, p95, p99 for each endpoint
SELECT
  endpoint,
  COUNT(*) as request_count,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY response_time_ms) as p50_ms,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time_ms) as p95_ms,
  PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY response_time_ms) as p99_ms,
  AVG(response_time_ms) as avg_ms,
  MAX(response_time_ms) as max_ms
FROM performance_metrics
WHERE date >= CURRENT_DATE - INTERVAL '24 hours'
  AND status_code < 500  -- Exclude server errors
GROUP BY endpoint
ORDER BY p95_ms DESC;

-- Identify slow queries (N+1 problems)
SELECT
  endpoint,
  AVG(db_query_count) as avg_queries,
  MAX(db_query_count) as max_queries,
  AVG(db_query_time_ms) as avg_query_time_ms
FROM performance_metrics
WHERE date >= CURRENT_DATE - INTERVAL '24 hours'
  AND db_query_count IS NOT NULL
GROUP BY endpoint
HAVING AVG(db_query_count) > 10
ORDER BY avg_queries DESC;
```

---

## Error Tracking System

### Architecture

**Goal:** Capture all errors, categorize by type and severity, alert on critical issues, track resolution.

### Data Model

```sql
CREATE TABLE error_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Error Details
  error_type VARCHAR(100) NOT NULL,         -- 'AIProviderError', 'PaymentError'
  error_message TEXT NOT NULL,
  error_stack TEXT,                         -- Stack trace

  -- Request Context
  endpoint VARCHAR(255),
  method VARCHAR(10),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Request Data (for debugging)
  request_body JSONB,
  request_params JSONB,
  request_headers JSONB,

  -- Categorization
  severity VARCHAR(20) NOT NULL,            -- 'critical', 'error', 'warning'
  category VARCHAR(50) NOT NULL,            -- 'ai', 'payment', 'database', 'auth'

  -- Environment
  environment VARCHAR(20) DEFAULT 'production',

  -- Resolution Tracking
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP,
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  resolution_notes TEXT,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  date DATE GENERATED ALWAYS AS (created_at::DATE) STORED
);

-- Indexes
CREATE INDEX idx_error_type ON error_logs(error_type, created_at DESC);
CREATE INDEX idx_error_severity ON error_logs(severity) WHERE NOT resolved;
CREATE INDEX idx_error_category ON error_logs(category, date);
CREATE INDEX idx_error_unresolved ON error_logs(created_at DESC) WHERE NOT resolved;
```

### Error Categorization

```typescript
// /services/monitoring/error-tracker.service.ts

enum ErrorCategory {
  AI = 'ai',
  PAYMENT = 'payment',
  DATABASE = 'database',
  AUTH = 'auth',
  PREDICTION = 'prediction',
  CACHE = 'cache',
  VALIDATION = 'validation',
  EXTERNAL_API = 'external_api'
}

enum ErrorSeverity {
  CRITICAL = 'critical',   // System down, data loss, security breach
  ERROR = 'error',         // Feature broken, user impacted
  WARNING = 'warning'      // Degraded performance, minor issue
}

function categorizeError(error: Error): {
  category: ErrorCategory;
  severity: ErrorSeverity;
} {
  const errorName = error.name;
  const errorMessage = error.message.toLowerCase();

  // AI errors
  if (errorName.includes('AI') || errorName.includes('Anthropic') ||
      errorMessage.includes('claude') || errorMessage.includes('openai')) {
    return {
      category: ErrorCategory.AI,
      severity: errorMessage.includes('rate limit') ?
        ErrorSeverity.WARNING : ErrorSeverity.ERROR
    };
  }

  // Payment errors
  if (errorName.includes('Payment') || errorMessage.includes('stripe') ||
      errorMessage.includes('crypto') || errorMessage.includes('transaction')) {
    return {
      category: ErrorCategory.PAYMENT,
      severity: ErrorSeverity.CRITICAL  // Money = critical
    };
  }

  // Database errors
  if (errorName.includes('Prisma') || errorMessage.includes('database') ||
      errorMessage.includes('connection')) {
    return {
      category: ErrorCategory.DATABASE,
      severity: errorMessage.includes('connection') ?
        ErrorSeverity.CRITICAL : ErrorSeverity.ERROR
    };
  }

  // Auth errors
  if (errorName.includes('Auth') || errorMessage.includes('token') ||
      errorMessage.includes('permission')) {
    return {
      category: ErrorCategory.AUTH,
      severity: ErrorSeverity.WARNING
    };
  }

  // Default
  return {
    category: ErrorCategory.PREDICTION,
    severity: ErrorSeverity.ERROR
  };
}

async function logError(params: {
  error: Error;
  context?: {
    endpoint?: string;
    method?: string;
    userId?: string;
    requestBody?: any;
    requestParams?: any;
  };
}) {
  const { error, context } = params;
  const { category, severity } = categorizeError(error);

  await db.errorLogs.create({
    data: {
      errorType: error.name,
      errorMessage: error.message,
      errorStack: error.stack,
      endpoint: context?.endpoint,
      method: context?.method,
      userId: context?.userId,
      requestBody: context?.requestBody,
      requestParams: context?.requestParams,
      category,
      severity
    }
  });

  // Check if we should alert
  await checkErrorAlerts(category, severity);
}
```

### Error Alerting Strategy

```typescript
// Alert thresholds
const ERROR_ALERT_THRESHOLDS = {
  critical_error_immediate: 1,        // Alert on ANY critical error
  error_burst: 10,                    // 10 errors in 5 minutes
  error_rate_percent: 5,              // >5% of requests failing
  ai_consecutive_failures: 5,         // 5 AI failures in a row
  database_connection_failures: 3     // 3 DB connection failures in 1 minute
};

async function checkErrorAlerts(category: ErrorCategory, severity: ErrorSeverity) {
  // Critical errors = immediate alert
  if (severity === ErrorSeverity.CRITICAL) {
    await sendImmediateAlert({
      title: 'Critical Error Detected',
      category,
      severity,
      action: 'Investigate immediately'
    });
    return;
  }

  // Error burst detection
  const recentErrorCount = await getErrorCountLast5Minutes();
  if (recentErrorCount >= ERROR_ALERT_THRESHOLDS.error_burst) {
    await sendAlert({
      title: 'Error Burst Detected',
      message: `${recentErrorCount} errors in last 5 minutes`,
      severity: 'warning'
    });
  }

  // Error rate check
  const errorRate = await getErrorRateLast5Minutes();
  if (errorRate > ERROR_ALERT_THRESHOLDS.error_rate_percent / 100) {
    await sendAlert({
      title: 'High Error Rate',
      message: `${(errorRate * 100).toFixed(1)}% of requests failing`,
      severity: 'critical'
    });
  }
}
```

### Error Recovery Strategies

```typescript
// /utils/retry.ts

async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    backoffMs?: number;
    shouldRetry?: (error: Error) => boolean;
  } = {}
): Promise<T> {
  const maxRetries = options.maxRetries || 3;
  const backoffMs = options.backoffMs || 1000;
  const shouldRetry = options.shouldRetry || (() => true);

  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries || !shouldRetry(lastError)) {
        throw lastError;
      }

      // Exponential backoff
      const delay = backoffMs * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

// Usage for AI calls
async function generatePredictionWithRetry(params: any) {
  return withRetry(
    () => aiAgentService.generatePrediction(params),
    {
      maxRetries: 3,
      backoffMs: 1000,
      shouldRetry: (error) => {
        // Retry on rate limits and timeouts, not on invalid input
        return error.message.includes('rate limit') ||
               error.message.includes('timeout');
      }
    }
  );
}
```

---

## Key Metrics to Track

### 1. AI & Cost Metrics
- Daily/weekly/monthly AI costs (USD)
- Cost per prediction type
- Cost per user
- Average tokens per prediction
- Input vs output token ratio
- Prompt version performance
- Cache hit rate impact on costs
- Projected monthly AI spend
- Cost-to-revenue ratio
- Cost trends (↑↓ vs previous period)

### 2. Performance Metrics
- p50/p95/p99 response times per endpoint
- Database query time (p50/p95/p99)
- Database query count per request
- AI API latency
- Cache lookup latency
- Slowest endpoints (top 10)
- N+1 query detection
- Request throughput (requests/second)
- Concurrent users

### 3. Cache Metrics
- Cache hit rate (overall)
- Cache hit rate by prediction type
- Cache size (MB)
- Cache evictions
- Cache latency
- Cost savings from cache
- API calls avoided
- Most cached predictions

### 4. Error Metrics
- Total errors by category
- Error rate (errors/total requests)
- Errors by endpoint
- Critical error count
- Unresolved errors
- Mean time to resolution (MTTR)
- Error trends
- Most common errors

### 5. User Experience Metrics
- Average prediction rating
- Feedback submission rate
- NPS score
- "Came true" percentage
- Share rate
- Most shared predictions
- Low-rated predictions (flagged for review)

### 6. Business Metrics
- Daily/weekly/monthly revenue
- Revenue by payment method
- Prediction volume by type
- Active users (DAU/MAU)
- User retention (7d/30d)
- Credit consumption rate
- Conversion rate (free → paid)
- Average revenue per user (ARPU)

### 7. System Health Metrics
- Uptime percentage
- API availability
- Database connection pool utilization
- Redis connection status
- Memory usage
- CPU usage
- Disk usage

---

## Dashboard Wireframes (Text-Based)

### Overview Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│  ASTRO PREDICTION PLATFORM - ADMIN DASHBOARD                     │
│  Last Updated: 2 minutes ago  |  Refresh: [Auto] [Manual]        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  KEY METRICS (Last 24 Hours)                                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐│
│  │  Users      │  │ Predictions │  │  Revenue   │  │  AI Costs  ││
│  │  1,234      │  │   3,567     │  │  $1,250    │  │   $180     ││
│  │  ▲ +15%     │  │   ▲ +23%    │  │  ▲ +18%    │  │   ▲ +12%   ││
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘│
│                                                                  │
│  SYSTEM HEALTH                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Error Rate: 0.3% ✅  |  p95 Response: 1.2s ✅              │ │
│  │  Uptime: 99.9% ✅     |  Cache Hit Rate: 54% ✅             │ │
│  │  Active Alerts: 0 ✅                                        │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  REVENUE TREND (Last 30 Days)                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  $1.5K│                                            ╱╲        │ │
│  │       │                                        ╱──╯  ╲       │ │
│  │  $1.0K│                              ╱────╲╱╯        ╲      │ │
│  │       │                    ╱────╲╱╯                   ╲     │ │
│  │  $0.5K│          ╱────╲╱╯                              ╲──  │ │
│  │       │────────────────────────────────────────────────────│ │
│  │       └──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┘    │ │
│  │         Nov 22  Nov 29  Dec 6   Dec 13  Dec 20               │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  PREDICTIONS BY TYPE (Today)                                     │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Macro:      ████████████░░░░░░░░  1,234 (45%)             │ │
│  │  Timing:     ███████████░░░░░░░░░    987 (36%)             │ │
│  │  Divination: ████░░░░░░░░░░░░░░░░    520 (19%)             │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### AI Cost Analytics Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│  AI COST ANALYTICS                                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  COST SUMMARY (Last 30 Days)                                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐│
│  │Total Spent  │  │ Avg/Pred   │  │ Cost/Revenue│  │ Projected  ││
│  │  $5,432     │  │  $0.15     │  │    14.2%    │  │  $5,800    ││
│  │  ▼ -8%      │  │  ▼ -12%    │  │    ✅ <20%  │  │  This Month││
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘│
│                                                                  │
│  DAILY COST TREND                                                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  $200│                                                      │ │
│  │      │     ╱╲  ╱╲                            ╱╲            │ │
│  │  $150│    ╱  ╲╱  ╲        ╱╲              ╱╯  ╲           │ │
│  │      │   ╱        ╲    ╱╯  ╲          ╱╯      ╲          │ │
│  │  $100│  ╱          ╲──╯      ╲────╲╱╯          ╲────     │ │
│  │      └──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┘   │ │
│  │        Dec 1    Dec 8    Dec 15   Dec 22                    │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  COST BY PREDICTION TYPE                                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Type        │  API Calls │ Avg Tokens │  Avg Cost │ Total │ │
│  │─────────────────────────────────────────────────────────────│ │
│  │  Macro       │   12,345   │   8,523    │   $0.18   │ $2,220││
│  │  Timing      │   10,234   │   6,234    │   $0.14   │ $1,433││
│  │  Divination  │    5,678   │   9,876    │   $0.21   │ $1,192││
│  │─────────────────────────────────────────────────────────────│ │
│  │  TOTAL       │   28,257   │   8,011    │   $0.17   │ $4,845││
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  TOP USERS BY AI COST (Last 7 Days)                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  User              │ Predictions │  Total Cost  │ Avg Cost  │ │
│  │──────────────────────────────────────────────────────────────│ │
│  │  @crypto_whale     │     456     │    $82.50    │  $0.18    │ │
│  │  @astro_trader     │     389     │    $71.23    │  $0.18    │ │
│  │  user@email.com    │     312     │    $53.76    │  $0.17    │ │
│  │  ...               │     ...     │     ...      │   ...     │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  OPTIMIZATION OPPORTUNITIES                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  ⚠️  Cache hit rate for macro predictions: 45% (target 60%)││
│  │  💡 Increase macro prediction TTL to 48h                   │ │
│  │  ⚠️  Timing predictions averaging 8.2K tokens (target <7K) ││
│  │  💡 Test shorter prompt version (v2.1)                     │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Alert Configuration

### Alert Types

1. **Critical Alerts** (Immediate Email + Slack)
   - System down (uptime < 95%)
   - Database connection failures (>3 in 1 minute)
   - Payment processing failures (>5% failure rate)
   - AI costs > 30% of revenue

2. **Warning Alerts** (Email within 15 minutes)
   - Error rate > 5%
   - p95 response time > 3 seconds
   - Cache hit rate < 30%
   - AI costs > 20% of revenue
   - Low disk space (>80% full)

3. **Info Alerts** (Daily Digest Email)
   - Daily metrics summary
   - Cost optimization opportunities
   - User feedback highlights
   - Performance trends

### Alert Delivery

```typescript
// /services/monitoring/alert.service.ts

interface Alert {
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  category: string;
  action?: string;
  metadata?: Record<string, any>;
}

async function sendAlert(alert: Alert) {
  const now = Date.now();
  const cacheKey = `alert:${alert.category}:${alert.title}`;

  // Throttle: Don't send same alert more than once per 5 minutes
  const lastSent = await redis.get(cacheKey);
  if (lastSent && now - Number(lastSent) < 5 * 60 * 1000) {
    return; // Skip duplicate alert
  }

  // Send email
  await emailService.send({
    to: process.env.ADMIN_EMAIL,
    subject: `[${alert.severity.toUpperCase()}] ${alert.title}`,
    html: formatAlertEmail(alert)
  });

  // Send Slack (if configured)
  if (process.env.SLACK_WEBHOOK_URL) {
    await axios.post(process.env.SLACK_WEBHOOK_URL, {
      text: `*${alert.title}*\n${alert.message}`,
      attachments: [{
        color: alert.severity === 'critical' ? 'danger' : 'warning',
        fields: [
          { title: 'Severity', value: alert.severity, short: true },
          { title: 'Category', value: alert.category, short: true },
          { title: 'Action', value: alert.action || 'N/A', short: false }
        ]
      }]
    });
  }

  // Set throttle cache
  await redis.setex(cacheKey, 300, now.toString());

  // Log alert
  logger.warn(`Alert sent: ${alert.title}`, alert);
}
```

---

## Implementation Checklist

### Week 1: Foundation
- [ ] Create database tables (ai_usage_logs, performance_metrics, error_logs)
- [ ] Implement AI cost tracking service
- [ ] Add performance monitoring middleware
- [ ] Enhance error logging with categorization
- [ ] Create aggregation queries
- [ ] Set up email alerting
- [ ] Test monitoring overhead (<5%)

### Week 2: Optimization
- [ ] Implement prediction caching
- [ ] Create cache performance tracking
- [ ] Set up prompt versioning
- [ ] Link AI logs to prompt versions
- [ ] Create user feedback collection
- [ ] Implement accuracy tracking

### Week 3: Dashboard
- [ ] Build admin API endpoints
- [ ] Create frontend dashboard components
- [ ] Implement data visualization
- [ ] Set up scheduled analytics jobs
- [ ] Create alert rules engine
- [ ] Launch and train team

---

## Performance Impact

**Estimated Overhead:**
- Request logging: ~2-5ms per request
- Error logging: ~1-3ms per error
- AI cost logging: ~3-5ms per AI call (async)
- Performance metric logging: ~2-4ms per request

**Total Overhead: ~5-10ms per request (< 1% for typical 500ms+ responses)**

**Mitigation Strategies:**
- All logging is asynchronous
- Batch inserts for high-volume metrics
- Redis for real-time counters (fast)
- PostgreSQL for long-term storage
- Indexes optimized for common queries
- Option to disable monitoring if needed

---

## Success Metrics

- ✅ 100% of AI requests tracked
- ✅ AI cost accuracy within 1%
- ✅ Performance metrics for all endpoints
- ✅ Error categorization rate > 95%
- ✅ Alert delivery < 1 minute for critical issues
- ✅ Dashboard query response < 500ms
- ✅ Monitoring overhead < 5%
- ✅ Team uses dashboard daily for decisions

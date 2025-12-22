# Phase 9: Prediction Caching Strategy

**Version:** 1.0
**Last Updated:** 2025-12-22
**Status:** Planning

---

## Overview

This document outlines the comprehensive caching strategy for AI-generated predictions in the Astro Prediction Platform. The primary goal is to reduce AI costs by 40-60% while maintaining prediction quality and freshness.

**Key Objectives:**
- Reduce AI API costs by caching reusable predictions
- Improve response times for cached predictions (10x faster)
- Maintain prediction accuracy and freshness
- Track cache performance and ROI
- Scale caching strategy based on usage patterns

**Cache Philosophy:**
- Cache aggressively for non-personalized predictions
- Short TTLs for time-sensitive predictions
- No cache for highly personalized predictions
- Transparent to end users (they shouldn't notice)

---

## Cache Architecture

### Technology Choice: Redis

**Why Redis?**
- Fast in-memory storage (sub-millisecond reads)
- Built-in TTL support (automatic expiration)
- Supports complex data structures (hashes, sets)
- Battle-tested for caching at scale
- Easy to scale horizontally if needed

**Alternative Considered:** In-memory LRU cache
- **Pros:** No external dependency, simpler deployment
- **Cons:** Lost on server restart, can't share across instances, limited memory
- **Decision:** Start with Redis, fallback to in-memory if Redis unavailable

### Redis Configuration

```typescript
// /config/redis.ts

import Redis from 'ioredis';
import logger from './logger';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD,
  db: 0,

  // Connection settings
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },

  // Reconnection
  reconnectOnError: (err) => {
    logger.error('Redis connection error:', err);
    return true;
  },

  // Performance
  enableReadyCheck: true,
  lazyConnect: false
});

redis.on('connect', () => {
  logger.info('Redis connected');
});

redis.on('error', (err) => {
  logger.error('Redis error:', err);
});

export default redis;
```

---

## Cache Key Design

### Key Format

```
prediction:{type}:{version}:{hash}
```

**Components:**
- `prediction:` - Namespace (allows clearing all prediction caches)
- `{type}` - Prediction type (macro, timing, divination, compatibility)
- `{version}` - Prompt version (v1.0, v2.0) - invalidate on prompt change
- `{hash}` - MD5 hash of prediction parameters

### Hash Calculation

```typescript
// /services/caching/cache-key.service.ts

import crypto from 'crypto';

interface PredictionParams {
  type: 'macro' | 'timing' | 'divination' | 'compatibility';
  // Macro parameters
  year?: number;
  timeframe?: string;

  // Timing parameters
  assetSymbol?: string;
  assetId?: string;

  // Divination parameters
  question?: string;
  userId?: string;  // For personalized divination

  // Compatibility parameters
  asset1Id?: string;
  asset2Id?: string;

  // Common
  promptVersion: string;
}

function generateCacheKey(params: PredictionParams): string {
  const { type, promptVersion, ...hashParams } = params;

  // Sort keys for consistent hashing
  const sortedParams = Object.keys(hashParams)
    .sort()
    .reduce((acc, key) => {
      acc[key] = hashParams[key];
      return acc;
    }, {} as Record<string, any>);

  // Create hash
  const paramsString = JSON.stringify(sortedParams);
  const hash = crypto
    .createHash('md5')
    .update(paramsString)
    .digest('hex')
    .substring(0, 12);  // First 12 chars sufficient

  return `prediction:${type}:${promptVersion}:${hash}`;
}

// Examples:
// generateCacheKey({ type: 'macro', year: 2025, timeframe: 'Q1', promptVersion: 'v1.0' })
// => "prediction:macro:v1.0:a3f2c8d9e1b4"
//
// generateCacheKey({ type: 'timing', assetSymbol: 'BTC', promptVersion: 'v2.1' })
// => "prediction:timing:v2.1:7b8c9d2e3f5a"
```

---

## TTL Strategy by Prediction Type

### 1. Macro Predictions (Economic Outlook)

**Cache:** ✅ Yes (highly cacheable)
**TTL:** 24 hours
**Rationale:** Macro predictions are the same for all users within a timeframe. Economic outlook doesn't change hourly.

**Cache Key Example:**
```
prediction:macro:v1.0:2025-Q1 => 24h TTL
```

**Parameters affecting cache:**
- Year
- Timeframe (Q1, Q2, annual, monthly)
- Focus area (crypto, stocks, commodities)

**Expected Hit Rate:** 80-90% (many users request same macro predictions)

### 2. Timing Predictions (Asset-Specific)

**Cache:** ✅ Yes (moderately cacheable)
**TTL:** 6 hours
**Rationale:** Multiple users interested in same assets. Market conditions change throughout the day but not every minute.

**Cache Key Example:**
```
prediction:timing:v1.0:BTC-next-30-days => 6h TTL
```

**Parameters affecting cache:**
- Asset symbol/ID
- Timeframe (next 24h, 7d, 30d)
- Analysis depth

**Expected Hit Rate:** 60-70% (popular assets like BTC, ETH get many requests)

**Cache Warming:** Pre-generate predictions for top 20 assets

### 3. Divination Predictions (Question-Based)

**Cache:** ⚠️ Conditional (question-dependent)
**TTL:** 1 hour
**Rationale:** Generic questions can be cached, but personalized questions should not be.

**Caching Logic:**
```typescript
function shouldCacheDivination(question: string, userId: string): boolean {
  // Don't cache if question contains personal identifiers
  const personalIndicators = [
    'my', 'me', 'I', 'should I',
    userId, // User's name/handle
    'personal', 'specifically for me'
  ];

  const questionLower = question.toLowerCase();
  const hasPersonalContext = personalIndicators.some(
    indicator => questionLower.includes(indicator.toLowerCase())
  );

  return !hasPersonalContext;
}

// Cacheable: "What will happen to Bitcoin in 2025?"
// Not cacheable: "Should I invest in Bitcoin?"
```

**Expected Hit Rate:** 20-30% (mostly generic questions)

### 4. Asset Compatibility Predictions

**Cache:** ✅ Yes (highly cacheable)
**TTL:** 24 hours
**Rationale:** Astrological compatibility between assets is stable. Only changes with major planetary transits.

**Cache Key Example:**
```
prediction:compatibility:v1.0:BTC-ETH => 24h TTL
```

**Parameters affecting cache:**
- Asset 1 ID
- Asset 2 ID
- Relationship type (correlation, harmony, conflict)

**Expected Hit Rate:** 75-85% (limited number of asset pairs)

---

## Cache Implementation

### Cache Service

```typescript
// /services/caching/prediction-cache.service.ts

import redis from '../../config/redis';
import logger from '../../config/logger';
import { generateCacheKey } from './cache-key.service';

interface CacheOptions {
  ttlSeconds: number;
  version: string;
}

class PredictionCacheService {
  /**
   * Get prediction from cache
   */
  async get<T>(params: PredictionParams): Promise<T | null> {
    try {
      const key = generateCacheKey(params);
      const cached = await redis.get(key);

      if (!cached) {
        await this.trackCacheMiss(params.type);
        return null;
      }

      await this.trackCacheHit(params.type);
      return JSON.parse(cached) as T;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null; // Fail gracefully
    }
  }

  /**
   * Set prediction in cache
   */
  async set<T>(
    params: PredictionParams,
    value: T,
    options: CacheOptions
  ): Promise<void> {
    try {
      const key = generateCacheKey(params);
      const serialized = JSON.stringify(value);

      await redis.setex(key, options.ttlSeconds, serialized);

      logger.debug(`Cached prediction: ${key} (TTL: ${options.ttlSeconds}s)`);
    } catch (error) {
      logger.error('Cache set error:', error);
      // Don't throw - caching failure shouldn't break predictions
    }
  }

  /**
   * Invalidate cache for a prediction type
   */
  async invalidateByType(type: string, version?: string): Promise<number> {
    try {
      const pattern = version
        ? `prediction:${type}:${version}:*`
        : `prediction:${type}:*`;

      const keys = await redis.keys(pattern);

      if (keys.length === 0) {
        return 0;
      }

      const deleted = await redis.del(...keys);
      logger.info(`Invalidated ${deleted} cached ${type} predictions`);

      return deleted;
    } catch (error) {
      logger.error('Cache invalidation error:', error);
      return 0;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    totalKeys: number;
    memoryUsedMB: number;
    hitRate: number;
  }> {
    try {
      const info = await redis.info('stats');
      const dbSize = await redis.dbsize();
      const memory = await redis.info('memory');

      // Parse hit rate from Redis stats
      const hitsMatch = info.match(/keyspace_hits:(\d+)/);
      const missesMatch = info.match(/keyspace_misses:(\d+)/);

      const hits = hitsMatch ? parseInt(hitsMatch[1]) : 0;
      const misses = missesMatch ? parseInt(missesMatch[1]) : 0;
      const hitRate = hits + misses > 0 ? hits / (hits + misses) : 0;

      // Parse memory usage
      const memMatch = memory.match(/used_memory:(\d+)/);
      const memoryBytes = memMatch ? parseInt(memMatch[1]) : 0;
      const memoryUsedMB = Math.round(memoryBytes / 1024 / 1024);

      return {
        totalKeys: dbSize,
        memoryUsedMB,
        hitRate
      };
    } catch (error) {
      logger.error('Cache stats error:', error);
      return {
        totalKeys: 0,
        memoryUsedMB: 0,
        hitRate: 0
      };
    }
  }

  /**
   * Track cache hit for analytics
   */
  private async trackCacheHit(predictionType: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const counterKey = `cache_stats:${today}:${predictionType}:hits`;
    await redis.incr(counterKey);
    await redis.expire(counterKey, 86400 * 7); // Keep for 7 days
  }

  /**
   * Track cache miss for analytics
   */
  private async trackCacheMiss(predictionType: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const counterKey = `cache_stats:${today}:${predictionType}:misses`;
    await redis.incr(counterKey);
    await redis.expire(counterKey, 86400 * 7);
  }
}

export default new PredictionCacheService();
```

### Integration with Prediction Service

```typescript
// /services/predictions/prediction.service.ts

import cacheService from '../caching/prediction-cache.service';
import aiAgent from '../ai/agent.service';
import logger from '../../config/logger';

async function generateMacroPrediction(params: {
  year: number;
  timeframe: string;
  promptVersion: string;
}): Promise<MacroPrediction> {
  // 1. Try cache first
  const cached = await cacheService.get<MacroPrediction>({
    type: 'macro',
    year: params.year,
    timeframe: params.timeframe,
    promptVersion: params.promptVersion
  });

  if (cached) {
    logger.info('Cache hit: macro prediction', params);
    return {
      ...cached,
      fromCache: true,
      cachedAt: new Date()
    };
  }

  // 2. Cache miss - generate with AI
  logger.info('Cache miss: generating macro prediction', params);

  const prediction = await aiAgent.generateMacroPrediction({
    year: params.year,
    timeframe: params.timeframe
  });

  // 3. Store in cache
  await cacheService.set(
    {
      type: 'macro',
      year: params.year,
      timeframe: params.timeframe,
      promptVersion: params.promptVersion
    },
    prediction,
    {
      ttlSeconds: 24 * 60 * 60, // 24 hours
      version: params.promptVersion
    }
  );

  return {
    ...prediction,
    fromCache: false,
    generatedAt: new Date()
  };
}
```

---

## Cache Invalidation Strategy

### When to Invalidate

1. **Prompt Version Change**
   - **Trigger:** New prompt version activated
   - **Action:** Invalidate all predictions for that type
   - **Reason:** Predictions generated with old prompts may be inconsistent

2. **Manual Invalidation**
   - **Trigger:** Admin request
   - **Action:** Clear specific prediction type or all caches
   - **Reason:** Force fresh predictions (e.g., major market event)

3. **TTL Expiration**
   - **Trigger:** Automatic (Redis handles)
   - **Action:** Cache entry removed
   - **Reason:** Predictions become stale after TTL

4. **Data Source Updates**
   - **Trigger:** Asset birth chart updated
   - **Action:** Invalidate predictions for that asset
   - **Reason:** Fundamental data changed

### Invalidation API

```typescript
// POST /api/admin/cache/invalidate

export async function invalidateCache(req: Request, res: Response) {
  const { type, version, assetId } = req.body;

  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: 'Admin only' });
  }

  let deletedCount = 0;

  if (assetId) {
    // Invalidate all predictions for specific asset
    deletedCount += await cacheService.invalidateByType('timing', version);
    deletedCount += await cacheService.invalidateByType('compatibility', version);
  } else if (type) {
    // Invalidate specific prediction type
    deletedCount = await cacheService.invalidateByType(type, version);
  } else {
    // Invalidate all
    await redis.flushdb();
    deletedCount = -1; // Unknown
  }

  logger.info(`Cache invalidated by ${req.user.email}`, {
    type,
    version,
    assetId,
    deletedCount
  });

  return res.json({
    success: true,
    deletedCount,
    message: `Invalidated ${deletedCount} cached predictions`
  });
}
```

---

## Cache Warming Strategies

### Pre-generate Popular Predictions

**Strategy:** Generate and cache predictions for popular assets during off-peak hours.

```typescript
// /jobs/cache-warming.job.ts

import cron from 'node-cron';
import predictionService from '../services/predictions/prediction.service';
import logger from '../config/logger';

// Run daily at 3 AM UTC
cron.schedule('0 3 * * *', async () => {
  logger.info('Starting cache warming job...');

  const popularAssets = [
    { symbol: 'BTC', id: 'bitcoin-123' },
    { symbol: 'ETH', id: 'ethereum-456' },
    { symbol: 'SOL', id: 'solana-789' },
    // Top 20 assets
  ];

  const timeframes = ['24h', '7d', '30d'];

  for (const asset of popularAssets) {
    for (const timeframe of timeframes) {
      try {
        await predictionService.generateTimingPrediction({
          assetId: asset.id,
          assetSymbol: asset.symbol,
          timeframe,
          promptVersion: 'v1.0'
        });

        // Rate limit to avoid overwhelming AI API
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        logger.error(`Cache warming failed for ${asset.symbol}:`, error);
      }
    }
  }

  logger.info('Cache warming job completed');
});
```

### Predictive Caching

**Strategy:** Cache predictions for assets that are likely to be requested soon.

```typescript
// When user views asset page, pre-cache timing predictions
async function handleAssetPageView(assetId: string) {
  // Fire and forget - don't await
  predictionService.generateTimingPrediction({
    assetId,
    timeframe: '7d',
    promptVersion: 'v1.0'
  }).catch(err => logger.error('Predictive cache error:', err));
}
```

---

## Fallback Strategy

### When Cache is Unavailable

```typescript
// Graceful degradation

async function generatePredictionWithCacheFallback<T>(
  generateFn: () => Promise<T>,
  cacheParams: PredictionParams,
  cacheOptions: CacheOptions
): Promise<T> {
  try {
    // Try cache first
    const cached = await cacheService.get<T>(cacheParams);
    if (cached) {
      return cached;
    }
  } catch (error) {
    logger.warn('Cache unavailable, falling back to direct generation:', error);
  }

  // Generate prediction
  const result = await generateFn();

  // Try to cache (best effort)
  try {
    await cacheService.set(cacheParams, result, cacheOptions);
  } catch (error) {
    logger.warn('Failed to cache result:', error);
    // Don't fail the request
  }

  return result;
}
```

---

## Performance Impact Analysis

### Without Cache

```
User Request → API → AI Agent → Claude API (8-12s) → Response
                                   ↑
                            $0.15 per prediction
```

**Metrics:**
- Response time: 8-12 seconds
- Cost per prediction: $0.15
- AI API load: 100% of requests

### With Cache (50% hit rate)

```
User Request → API → Cache Hit (10-50ms) → Response (50% of requests)
                  ↓
                  └→ AI Agent → Claude API (8-12s) → Cache → Response (50% of requests)
```

**Metrics:**
- Response time (cached): 10-50ms (200x faster)
- Response time (uncached): 8-12 seconds
- Average response time: ~4 seconds (50% mix)
- Cost per prediction: $0.075 average (50% savings)
- AI API load: 50% of requests

### With Cache (80% hit rate - after warming)

**Metrics:**
- Average response time: ~1.5 seconds
- Cost per prediction: $0.03 average (80% savings)
- AI API load: 20% of requests

---

## Cache Performance Tracking

### Metrics to Track

```sql
CREATE TABLE prediction_cache_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  hour INTEGER,  -- 0-23, for hourly stats

  -- Performance
  prediction_type VARCHAR(50),
  cache_hits INTEGER DEFAULT 0,
  cache_misses INTEGER DEFAULT 0,
  hit_rate DECIMAL(5,2),  -- Calculated: hits / (hits + misses)

  -- Savings
  ai_costs_saved_cents INTEGER,  -- How much $ saved by cache
  api_calls_saved INTEGER,       -- How many AI calls avoided
  avg_cache_latency_ms INTEGER,
  avg_ai_latency_ms INTEGER,

  -- Storage
  cache_size_mb DECIMAL(10,2),
  total_keys INTEGER,

  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(date, hour, prediction_type)
);

-- Daily aggregation view
CREATE VIEW daily_cache_performance AS
SELECT
  date,
  prediction_type,
  SUM(cache_hits) as total_hits,
  SUM(cache_misses) as total_misses,
  ROUND(
    SUM(cache_hits)::DECIMAL / NULLIF(SUM(cache_hits + cache_misses), 0) * 100,
    2
  ) as hit_rate_percent,
  SUM(ai_costs_saved_cents) as total_saved_cents,
  SUM(api_calls_saved) as total_calls_saved
FROM prediction_cache_stats
GROUP BY date, prediction_type
ORDER BY date DESC;
```

### Dashboard Metrics

```typescript
// GET /api/admin/cache/stats

export async function getCacheStats(req: Request, res: Response) {
  const { startDate, endDate, predictionType } = req.query;

  const stats = await db.$queryRaw`
    SELECT
      date,
      prediction_type,
      SUM(cache_hits) as hits,
      SUM(cache_misses) as misses,
      ROUND(
        SUM(cache_hits)::DECIMAL /
        NULLIF(SUM(cache_hits + cache_misses), 0) * 100,
        2
      ) as hit_rate,
      SUM(ai_costs_saved_cents) as saved_cents,
      SUM(api_calls_saved) as calls_saved
    FROM prediction_cache_stats
    WHERE date >= ${startDate}
      AND date <= ${endDate}
      ${predictionType ? Prisma.sql`AND prediction_type = ${predictionType}` : Prisma.empty}
    GROUP BY date, prediction_type
    ORDER BY date DESC
  `;

  return res.json({
    stats,
    summary: {
      totalHitRate: calculateOverallHitRate(stats),
      totalSavings: stats.reduce((sum, s) => sum + s.saved_cents, 0),
      projectedMonthlySavings: calculateProjectedSavings(stats)
    }
  });
}
```

---

## Cache Size Estimation

### Memory Requirements

**Average prediction size:** 2-5 KB (JSON)

**Estimated cache sizes:**

| Scenario | Cached Items | Memory Usage | Monthly Cost (Redis Cloud) |
|----------|-------------|--------------|---------------------------|
| Small    | 1,000       | 5 MB         | Free tier                 |
| Medium   | 10,000      | 50 MB        | ~$5/month                 |
| Large    | 100,000     | 500 MB       | ~$30/month                |

**ROI Calculation:**
- Medium scenario: $5/month cache cost
- Saves ~5,000 AI calls/month × $0.15 = $750/month
- **ROI: 150x** (spend $5, save $750)

---

## Testing Strategy

### Unit Tests

```typescript
// __tests__/services/caching/prediction-cache.test.ts

describe('PredictionCacheService', () => {
  beforeEach(async () => {
    await redis.flushdb();
  });

  it('should cache and retrieve macro prediction', async () => {
    const params = {
      type: 'macro' as const,
      year: 2025,
      timeframe: 'Q1',
      promptVersion: 'v1.0'
    };

    const prediction = { outlook: 'bullish', confidence: 0.75 };

    await cacheService.set(params, prediction, {
      ttlSeconds: 3600,
      version: 'v1.0'
    });

    const cached = await cacheService.get(params);

    expect(cached).toEqual(prediction);
  });

  it('should return null on cache miss', async () => {
    const params = {
      type: 'macro' as const,
      year: 2099,
      timeframe: 'Q1',
      promptVersion: 'v1.0'
    };

    const cached = await cacheService.get(params);

    expect(cached).toBeNull();
  });

  it('should respect TTL', async () => {
    const params = {
      type: 'timing' as const,
      assetSymbol: 'BTC',
      promptVersion: 'v1.0'
    };

    await cacheService.set(params, { data: 'test' }, {
      ttlSeconds: 1,  // 1 second TTL
      version: 'v1.0'
    });

    // Immediate retrieval should work
    let cached = await cacheService.get(params);
    expect(cached).toBeTruthy();

    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Should be expired now
    cached = await cacheService.get(params);
    expect(cached).toBeNull();
  });

  it('should track cache hits and misses', async () => {
    // Implementation test
  });
});
```

### Load Testing

```typescript
// Load test cache performance

import { performance } from 'perf_hooks';

async function loadTestCache() {
  const iterations = 1000;
  const start = performance.now();

  for (let i = 0; i < iterations; i++) {
    await cacheService.get({
      type: 'macro',
      year: 2025,
      timeframe: 'Q1',
      promptVersion: 'v1.0'
    });
  }

  const duration = performance.now() - start;
  const avgLatency = duration / iterations;

  console.log(`Cache load test results:`);
  console.log(`  Iterations: ${iterations}`);
  console.log(`  Total time: ${duration.toFixed(2)}ms`);
  console.log(`  Average latency: ${avgLatency.toFixed(2)}ms`);
  console.log(`  Throughput: ${(iterations / (duration / 1000)).toFixed(0)} ops/sec`);

  // Assert performance requirements
  expect(avgLatency).toBeLessThan(10); // < 10ms per cache read
}
```

---

## Rollout Plan

### Phase 1: Macro Predictions (Week 2, Day 1-2)
- Implement cache for macro predictions
- 24h TTL
- Monitor hit rate
- **Target:** 70% hit rate

### Phase 2: Timing Predictions (Week 2, Day 2-3)
- Add cache for timing predictions
- 6h TTL
- Implement cache warming for top 20 assets
- **Target:** 50% hit rate

### Phase 3: Compatibility (Week 2, Day 3-4)
- Add cache for asset compatibility
- 24h TTL
- **Target:** 75% hit rate

### Phase 4: Selective Divination (Week 2, Day 4)
- Add cache for generic divination questions
- 1h TTL
- Implement personalization detection
- **Target:** 25% hit rate

### Phase 5: Optimization (Week 2, Day 5-7)
- Tune TTLs based on actual hit rates
- Expand cache warming
- Implement predictive caching
- **Target:** 60% overall hit rate

---

## Success Criteria

- ✅ Cache hit rate > 50% overall
- ✅ Cache latency < 50ms (p95)
- ✅ AI cost reduction > 40%
- ✅ No cache-related user complaints
- ✅ Cache availability > 99%
- ✅ Zero data leaks (user A seeing user B's personalized predictions)
- ✅ Admin dashboard shows cache ROI

---

## Future Enhancements

1. **Edge Caching (CDN)**
   - Cache predictions closer to users
   - Reduce latency further (< 10ms)
   - Global distribution

2. **Intelligent Cache Warming**
   - ML to predict which assets will be requested
   - Time-of-day patterns
   - User behavior analysis

3. **Tiered Caching**
   - L1: In-memory (instant)
   - L2: Redis (fast)
   - L3: Database (persistent)

4. **Cache Compression**
   - Compress large predictions
   - Save memory
   - Trade CPU for storage

5. **Partial Caching**
   - Cache intermediate AI steps
   - Faster regeneration with slight variations

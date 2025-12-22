/**
 * Prediction Cache Service
 * In-memory LRU cache for prediction results to reduce AI API costs
 */

import * as crypto from 'crypto';

export interface CacheEntry {
  key: string;
  prediction: any;
  createdAt: Date;
  expiresAt: Date;
  hitCount: number;
}

export interface CacheStats {
  hitRate: number;
  missRate: number;
  totalHits: number;
  totalMisses: number;
  entriesCount: number;
  memoryUsage: number;
}

/**
 * TTL Configuration (in seconds)
 */
const TTL_CONFIG = {
  macro: 24 * 60 * 60,      // 24 hours (same year = same prediction)
  timing: 60 * 60,           // 1 hour (prices change frequently)
  divination: 0,             // No cache (always unique to user + question)
};

export class PredictionCacheService {
  private cache: Map<string, CacheEntry>;
  private maxSize: number;
  private hits: number;
  private misses: number;

  constructor(maxSize: number = 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Generate cache key from prediction type and parameters
   */
  generateKey(type: string, params: any): string {
    // Normalize params for consistent hashing
    const normalized = this.normalizeParams(type, params);
    const hash = crypto
      .createHash('sha256')
      .update(JSON.stringify(normalized))
      .digest('hex');

    return `${type}:${hash}`;
  }

  /**
   * Normalize parameters for consistent cache keys
   */
  private normalizeParams(type: string, params: any): any {
    if (type === 'macro') {
      // For macro: year + asset classes (sorted)
      return {
        year: params.year,
        assetClasses: [...params.assetClasses].sort(),
        method: params.method,
      };
    } else if (type === 'timing') {
      // For timing: asset ID + date range
      const targetDate = params.targetDate ? new Date(params.targetDate) : new Date();
      const dateKey = targetDate.toISOString().split('T')[0];
      return {
        assetId: params.assetId,
        dateKey,
        timeframe: params.timeframe,
      };
    } else if (type === 'divination') {
      // Divination: always return unique key (no caching)
      return {
        question: params.question,
        userId: params.userId,
        timestamp: Date.now(),
        random: Math.random(),
      };
    }

    return params;
  }

  /**
   * Get from cache
   */
  async get(key: string): Promise<any | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    // Check if expired
    if (new Date() > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    // Update hit count
    entry.hitCount++;
    this.hits++;

    // Move to end (LRU)
    this.cache.delete(key);
    this.cache.set(key, entry);

    console.log(`Cache HIT: ${key.substring(0, 50)}... (hits: ${entry.hitCount})`);
    return entry.prediction;
  }

  /**
   * Set cache entry
   */
  async set(key: string, prediction: any, ttlSeconds: number): Promise<void> {
    // Don't cache if TTL is 0
    if (ttlSeconds === 0) {
      return;
    }

    // Evict oldest entry if at max size
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
        console.log(`Cache EVICTED: ${firstKey.substring(0, 50)}...`);
      }
    }

    const now = new Date();
    const entry: CacheEntry = {
      key,
      prediction,
      createdAt: now,
      expiresAt: new Date(now.getTime() + ttlSeconds * 1000),
      hitCount: 0,
    };

    this.cache.set(key, entry);
    console.log(`Cache SET: ${key.substring(0, 50)}... (TTL: ${ttlSeconds}s)`);
  }

  /**
   * Invalidate cache entry
   */
  async invalidate(key: string): Promise<void> {
    this.cache.delete(key);
    console.log(`Cache INVALIDATED: ${key.substring(0, 50)}...`);
  }

  /**
   * Invalidate by pattern (e.g., all macro predictions)
   */
  async invalidatePattern(pattern: string): Promise<number> {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (key.startsWith(pattern)) {
        this.cache.delete(key);
        count++;
      }
    }
    console.log(`Cache INVALIDATED PATTERN: ${pattern} (${count} entries)`);
    return count;
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<CacheStats> {
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? (this.hits / total) * 100 : 0;
    const missRate = total > 0 ? (this.misses / total) * 100 : 0;

    // Estimate memory usage
    let memoryUsage = 0;
    for (const entry of this.cache.values()) {
      memoryUsage += JSON.stringify(entry.prediction).length;
    }

    return {
      hitRate,
      missRate,
      totalHits: this.hits,
      totalMisses: this.misses,
      entriesCount: this.cache.size,
      memoryUsage,
    };
  }

  /**
   * Clear expired entries
   */
  async clearExpired(): Promise<number> {
    const now = new Date();
    let count = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        count++;
      }
    }

    if (count > 0) {
      console.log(`Cache CLEARED ${count} expired entries`);
    }

    return count;
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    const count = this.cache.size;
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
    console.log(`Cache CLEARED ALL (${count} entries)`);
  }

  /**
   * Get TTL for prediction type
   */
  getTTL(predictionType: 'macro' | 'timing' | 'divination'): number {
    return TTL_CONFIG[predictionType];
  }

  /**
   * Get popular cache entries
   */
  async getPopularEntries(limit: number = 10): Promise<Array<{
    key: string;
    hitCount: number;
    createdAt: Date;
    expiresAt: Date;
  }>> {
    const entries = Array.from(this.cache.values())
      .sort((a, b) => b.hitCount - a.hitCount)
      .slice(0, limit);

    return entries.map(entry => ({
      key: entry.key,
      hitCount: entry.hitCount,
      createdAt: entry.createdAt,
      expiresAt: entry.expiresAt,
    }));
  }

  /**
   * Get cache size by prediction type
   */
  async getSizeByType(): Promise<Record<string, number>> {
    const sizes: Record<string, number> = {
      macro: 0,
      timing: 0,
      divination: 0,
      other: 0,
    };

    for (const key of this.cache.keys()) {
      const type = key.split(':')[0];
      if (type in sizes) {
        sizes[type]++;
      } else {
        sizes.other++;
      }
    }

    return sizes;
  }
}

export default PredictionCacheService;

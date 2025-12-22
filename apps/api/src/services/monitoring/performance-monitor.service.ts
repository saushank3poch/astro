/**
 * Performance Monitor Service
 * Tracks API endpoint performance and response times
 */

export interface PerformanceMetric {
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  timestamp: Date;
}

export interface EndpointStats {
  p50: number;
  p95: number;
  p99: number;
  avgResponseTime: number;
  requestCount: number;
  minResponseTime: number;
  maxResponseTime: number;
}

export interface OverallStats {
  totalRequests: number;
  avgResponseTime: number;
  errorRate: number;
  requestsPerMinute: number;
}

export class PerformanceMonitorService {
  private metrics: PerformanceMetric[];
  private maxMetrics: number;

  constructor(maxMetrics: number = 10000) {
    this.metrics = [];
    this.maxMetrics = maxMetrics;
  }

  /**
   * Track request performance
   */
  async trackRequest(metric: PerformanceMetric): Promise<void> {
    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log slow requests
    if (metric.responseTime > 2000) {
      console.warn(`SLOW REQUEST: ${metric.method} ${metric.endpoint} - ${metric.responseTime}ms`);
    }
  }

  /**
   * Calculate percentile
   */
  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;

    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }

  /**
   * Get stats for specific endpoint
   */
  async getEndpointStats(endpoint: string): Promise<EndpointStats> {
    const endpointMetrics = this.metrics.filter(m => m.endpoint === endpoint);

    if (endpointMetrics.length === 0) {
      return {
        p50: 0,
        p95: 0,
        p99: 0,
        avgResponseTime: 0,
        requestCount: 0,
        minResponseTime: 0,
        maxResponseTime: 0,
      };
    }

    const responseTimes = endpointMetrics.map(m => m.responseTime);
    const totalTime = responseTimes.reduce((sum, time) => sum + time, 0);

    return {
      p50: this.calculatePercentile(responseTimes, 50),
      p95: this.calculatePercentile(responseTimes, 95),
      p99: this.calculatePercentile(responseTimes, 99),
      avgResponseTime: totalTime / responseTimes.length,
      requestCount: endpointMetrics.length,
      minResponseTime: Math.min(...responseTimes),
      maxResponseTime: Math.max(...responseTimes),
    };
  }

  /**
   * Get slow requests (> threshold)
   */
  async getSlowRequests(limit: number = 20, threshold: number = 2000): Promise<PerformanceMetric[]> {
    return this.metrics
      .filter(m => m.responseTime > threshold)
      .sort((a, b) => b.responseTime - a.responseTime)
      .slice(0, limit);
  }

  /**
   * Get overall statistics
   */
  async getOverallStats(): Promise<OverallStats> {
    if (this.metrics.length === 0) {
      return {
        totalRequests: 0,
        avgResponseTime: 0,
        errorRate: 0,
        requestsPerMinute: 0,
      };
    }

    const totalRequests = this.metrics.length;
    const totalTime = this.metrics.reduce((sum, m) => sum + m.responseTime, 0);
    const errorCount = this.metrics.filter(m => m.statusCode >= 400).length;

    // Calculate requests per minute
    const oldestTimestamp = this.metrics[0].timestamp.getTime();
    const newestTimestamp = this.metrics[this.metrics.length - 1].timestamp.getTime();
    const minutesSpan = (newestTimestamp - oldestTimestamp) / 1000 / 60;
    const requestsPerMinute = minutesSpan > 0 ? totalRequests / minutesSpan : 0;

    return {
      totalRequests,
      avgResponseTime: totalTime / totalRequests,
      errorRate: (errorCount / totalRequests) * 100,
      requestsPerMinute,
    };
  }

  /**
   * Get stats by HTTP method
   */
  async getStatsByMethod(): Promise<Record<string, EndpointStats>> {
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    const stats: Record<string, EndpointStats> = {};

    for (const method of methods) {
      const methodMetrics = this.metrics.filter(m => m.method === method);

      if (methodMetrics.length === 0) {
        continue;
      }

      const responseTimes = methodMetrics.map(m => m.responseTime);
      const totalTime = responseTimes.reduce((sum, time) => sum + time, 0);

      stats[method] = {
        p50: this.calculatePercentile(responseTimes, 50),
        p95: this.calculatePercentile(responseTimes, 95),
        p99: this.calculatePercentile(responseTimes, 99),
        avgResponseTime: totalTime / responseTimes.length,
        requestCount: methodMetrics.length,
        minResponseTime: Math.min(...responseTimes),
        maxResponseTime: Math.max(...responseTimes),
      };
    }

    return stats;
  }

  /**
   * Get slowest endpoints
   */
  async getSlowestEndpoints(limit: number = 10): Promise<Array<{
    endpoint: string;
    avgResponseTime: number;
    requestCount: number;
  }>> {
    // Group by endpoint
    const endpointMap = new Map<string, number[]>();

    for (const metric of this.metrics) {
      const times = endpointMap.get(metric.endpoint) || [];
      times.push(metric.responseTime);
      endpointMap.set(metric.endpoint, times);
    }

    // Calculate averages
    const endpointStats = Array.from(endpointMap.entries()).map(([endpoint, times]) => ({
      endpoint,
      avgResponseTime: times.reduce((sum, time) => sum + time, 0) / times.length,
      requestCount: times.length,
    }));

    // Sort by avg response time
    return endpointStats
      .sort((a, b) => b.avgResponseTime - a.avgResponseTime)
      .slice(0, limit);
  }

  /**
   * Get most requested endpoints
   */
  async getMostRequestedEndpoints(limit: number = 10): Promise<Array<{
    endpoint: string;
    requestCount: number;
    avgResponseTime: number;
  }>> {
    // Group by endpoint
    const endpointMap = new Map<string, number[]>();

    for (const metric of this.metrics) {
      const times = endpointMap.get(metric.endpoint) || [];
      times.push(metric.responseTime);
      endpointMap.set(metric.endpoint, times);
    }

    // Calculate stats
    const endpointStats = Array.from(endpointMap.entries()).map(([endpoint, times]) => ({
      endpoint,
      requestCount: times.length,
      avgResponseTime: times.reduce((sum, time) => sum + time, 0) / times.length,
    }));

    // Sort by request count
    return endpointStats
      .sort((a, b) => b.requestCount - a.requestCount)
      .slice(0, limit);
  }

  /**
   * Get error rate by endpoint
   */
  async getErrorRateByEndpoint(): Promise<Array<{
    endpoint: string;
    totalRequests: number;
    errorCount: number;
    errorRate: number;
  }>> {
    // Group by endpoint
    const endpointMap = new Map<string, { total: number; errors: number }>();

    for (const metric of this.metrics) {
      const stats = endpointMap.get(metric.endpoint) || { total: 0, errors: 0 };
      stats.total++;
      if (metric.statusCode >= 400) {
        stats.errors++;
      }
      endpointMap.set(metric.endpoint, stats);
    }

    // Calculate error rates
    return Array.from(endpointMap.entries())
      .map(([endpoint, stats]) => ({
        endpoint,
        totalRequests: stats.total,
        errorCount: stats.errors,
        errorRate: (stats.errors / stats.total) * 100,
      }))
      .filter(stat => stat.errorCount > 0)
      .sort((a, b) => b.errorRate - a.errorRate);
  }

  /**
   * Get performance trend (hourly buckets)
   */
  async getPerformanceTrend(hours: number = 24): Promise<Array<{
    hour: string;
    avgResponseTime: number;
    requestCount: number;
  }>> {
    const now = new Date();
    const cutoff = new Date(now.getTime() - hours * 60 * 60 * 1000);

    // Filter recent metrics
    const recentMetrics = this.metrics.filter(m => m.timestamp >= cutoff);

    // Group by hour
    const hourlyMap = new Map<string, number[]>();

    for (const metric of recentMetrics) {
      const hour = new Date(metric.timestamp).toISOString().substring(0, 13);
      const times = hourlyMap.get(hour) || [];
      times.push(metric.responseTime);
      hourlyMap.set(hour, times);
    }

    // Calculate stats
    return Array.from(hourlyMap.entries())
      .map(([hour, times]) => ({
        hour,
        avgResponseTime: times.reduce((sum, time) => sum + time, 0) / times.length,
        requestCount: times.length,
      }))
      .sort((a, b) => a.hour.localeCompare(b.hour));
  }

  /**
   * Clear old metrics (keep last N)
   */
  clearOldMetrics(keepLast: number = 5000): number {
    const removed = Math.max(0, this.metrics.length - keepLast);
    this.metrics = this.metrics.slice(-keepLast);
    return removed;
  }
}

export default PerformanceMonitorService;

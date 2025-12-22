/**
 * Error Tracker Service
 * Tracks and monitors application errors for alerting and debugging
 */

import { PrismaClient } from '@astro/database';

const prisma = new PrismaClient();

export interface ErrorLog {
  id: string;
  errorType: string;
  message: string;
  stack?: string;
  userId?: string;
  endpoint?: string;
  metadata?: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  createdAt: Date;
}

export interface ErrorStats {
  totalErrors: number;
  errorRate: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
  unresolvedCount: number;
}

export class ErrorTrackerService {
  private alertThreshold: number;
  private recentRequestCount: number;

  constructor(alertThreshold: number = 5) {
    this.alertThreshold = alertThreshold; // Alert if error rate > 5%
    this.recentRequestCount = 0;
  }

  /**
   * Update request count for error rate calculation
   */
  incrementRequestCount(): void {
    this.recentRequestCount++;
  }

  /**
   * Log error to database
   */
  async logError(error: {
    errorType: string;
    message: string;
    stack?: string;
    userId?: string;
    endpoint?: string;
    metadata?: any;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<void> {
    await prisma.errorLog.create({
      data: {
        errorType: error.errorType,
        message: error.message,
        stack: error.stack,
        userId: error.userId,
        endpoint: error.endpoint,
        metadata: error.metadata,
        severity: error.severity,
        resolved: false,
      },
    });

    // Log to console based on severity
    const logMethod = error.severity === 'critical' || error.severity === 'high'
      ? console.error
      : console.warn;

    logMethod(
      `[${error.severity.toUpperCase()}] ${error.errorType}: ${error.message}`,
      error.endpoint ? `at ${error.endpoint}` : ''
    );

    // Check if we should alert
    if (error.severity === 'critical') {
      await this.triggerAlert(error);
    }
  }

  /**
   * Get recent errors
   */
  async getRecentErrors(
    limit: number = 50,
    filters?: {
      severity?: string;
      resolved?: boolean;
      errorType?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<ErrorLog[]> {
    const where: any = {};

    if (filters?.severity) where.severity = filters.severity;
    if (filters?.resolved !== undefined) where.resolved = filters.resolved;
    if (filters?.errorType) where.errorType = filters.errorType;

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    const errors = await prisma.errorLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return errors as ErrorLog[];
  }

  /**
   * Get error statistics
   */
  async getErrorStats(
    startDate?: Date,
    endDate?: Date
  ): Promise<ErrorStats> {
    const where: any = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const errors = await prisma.errorLog.findMany({ where });
    const totalErrors = errors.length;

    // Calculate error rate
    const errorRate = this.recentRequestCount > 0
      ? (totalErrors / this.recentRequestCount) * 100
      : 0;

    // Group by type
    const byType: Record<string, number> = {};
    errors.forEach(error => {
      byType[error.errorType] = (byType[error.errorType] || 0) + 1;
    });

    // Group by severity
    const bySeverity: Record<string, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };
    errors.forEach(error => {
      bySeverity[error.severity]++;
    });

    // Count unresolved
    const unresolvedCount = errors.filter(e => !e.resolved).length;

    return {
      totalErrors,
      errorRate,
      byType,
      bySeverity,
      unresolvedCount,
    };
  }

  /**
   * Mark error as resolved
   */
  async markResolved(errorId: string): Promise<void> {
    await prisma.errorLog.update({
      where: { id: errorId },
      data: { resolved: true },
    });

    console.log(`Error ${errorId} marked as resolved`);
  }

  /**
   * Mark multiple errors as resolved by type
   */
  async markResolvedByType(errorType: string): Promise<number> {
    const result = await prisma.errorLog.updateMany({
      where: {
        errorType,
        resolved: false,
      },
      data: { resolved: true },
    });

    console.log(`Marked ${result.count} errors of type ${errorType} as resolved`);
    return result.count;
  }

  /**
   * Check if should alert based on error rate
   */
  async shouldAlert(): Promise<boolean> {
    const stats = await this.getErrorStats();
    return stats.errorRate > this.alertThreshold;
  }

  /**
   * Trigger alert for critical errors
   */
  private async triggerAlert(error: {
    errorType: string;
    message: string;
    severity: string;
    endpoint?: string;
  }): Promise<void> {
    // In production, send to alerting service (PagerDuty, email, Slack, etc.)
    console.error('🚨 CRITICAL ALERT:', {
      type: error.errorType,
      message: error.message,
      endpoint: error.endpoint,
      timestamp: new Date().toISOString(),
    });

    // TODO: Integrate with actual alerting service
    // Example: await sendSlackAlert(...) or await sendEmailAlert(...)
  }

  /**
   * Get error trends (daily buckets)
   */
  async getErrorTrends(days: number = 7): Promise<Array<{
    date: string;
    count: number;
    bySeverity: Record<string, number>;
  }>> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const errors = await prisma.errorLog.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by date
    const dailyMap = new Map<string, {
      count: number;
      bySeverity: Record<string, number>;
    }>();

    errors.forEach(error => {
      const date = error.createdAt.toISOString().split('T')[0];
      const stats = dailyMap.get(date) || {
        count: 0,
        bySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
      };

      stats.count++;
      stats.bySeverity[error.severity]++;
      dailyMap.set(date, stats);
    });

    return Array.from(dailyMap.entries())
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get most common errors
   */
  async getMostCommonErrors(limit: number = 10): Promise<Array<{
    errorType: string;
    count: number;
    lastOccurrence: Date;
    severity: string;
  }>> {
    const errors = await prisma.errorLog.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Group by error type
    const errorMap = new Map<string, {
      count: number;
      lastOccurrence: Date;
      severity: string;
    }>();

    errors.forEach(error => {
      const existing = errorMap.get(error.errorType);
      if (!existing) {
        errorMap.set(error.errorType, {
          count: 1,
          lastOccurrence: error.createdAt,
          severity: error.severity,
        });
      } else {
        existing.count++;
        if (error.createdAt > existing.lastOccurrence) {
          existing.lastOccurrence = error.createdAt;
        }
      }
    });

    return Array.from(errorMap.entries())
      .map(([errorType, stats]) => ({ errorType, ...stats }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Clean up old resolved errors
   */
  async cleanupOldErrors(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await prisma.errorLog.deleteMany({
      where: {
        resolved: true,
        createdAt: { lt: cutoffDate },
      },
    });

    console.log(`Cleaned up ${result.count} old resolved errors`);
    return result.count;
  }

  /**
   * Reset request counter (call periodically)
   */
  resetRequestCount(): void {
    this.recentRequestCount = 0;
  }
}

export default ErrorTrackerService;

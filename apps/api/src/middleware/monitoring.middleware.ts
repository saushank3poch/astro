/**
 * Monitoring Middleware
 * Automatically tracks performance and errors for all API requests
 */

import { Request, Response, NextFunction } from 'express';
import { PerformanceMonitorService } from '../services/monitoring/performance-monitor.service';
import { ErrorTrackerService } from '../services/monitoring/error-tracker.service';

// Singleton instances
let performanceMonitor: PerformanceMonitorService;
let errorTracker: ErrorTrackerService;

/**
 * Initialize monitoring services
 */
export function initializeMonitoring() {
  performanceMonitor = new PerformanceMonitorService(10000);
  errorTracker = new ErrorTrackerService(5); // 5% error rate threshold
  return { performanceMonitor, errorTracker };
}

/**
 * Get monitoring service instances
 */
export function getMonitoringServices() {
  if (!performanceMonitor || !errorTracker) {
    return initializeMonitoring();
  }
  return { performanceMonitor, errorTracker };
}

/**
 * Performance monitoring middleware
 * Tracks response time and status codes for all requests
 */
export function performanceMonitoringMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const startTime = Date.now();

  // Track request count for error rate calculation
  const { errorTracker } = getMonitoringServices();
  errorTracker.incrementRequestCount();

  // Capture response when it finishes
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    const { performanceMonitor } = getMonitoringServices();

    performanceMonitor.trackRequest({
      endpoint: req.path,
      method: req.method,
      responseTime,
      statusCode: res.statusCode,
      timestamp: new Date(),
    });

    // Log slow requests
    if (responseTime > 2000) {
      console.warn(
        `⚠️  SLOW REQUEST: ${req.method} ${req.path} - ${responseTime}ms`
      );
    }
  });

  next();
}

/**
 * Error tracking middleware
 * Logs all errors to the error tracking service
 */
export function errorTrackingMiddleware(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { errorTracker } = getMonitoringServices();

  // Determine severity based on status code
  let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
  const statusCode = err.statusCode || err.status || 500;

  if (statusCode >= 500) {
    severity = 'high';
  } else if (statusCode >= 400 && statusCode < 500) {
    severity = 'low';
  }

  // Critical errors
  if (
    err.message?.includes('database') ||
    err.message?.includes('connection') ||
    err.message?.includes('timeout')
  ) {
    severity = 'critical';
  }

  // Determine error type
  let errorType = err.name || 'UNKNOWN_ERROR';
  if (err.message?.includes('payment')) {
    errorType = 'PAYMENT_ERROR';
  } else if (err.message?.includes('AI') || err.message?.includes('prediction')) {
    errorType = 'AI_ERROR';
  } else if (err.message?.includes('database')) {
    errorType = 'DATABASE_ERROR';
  } else if (err.message?.includes('auth')) {
    errorType = 'AUTH_ERROR';
  }

  // Log error
  errorTracker.logError({
    errorType,
    message: err.message || 'Unknown error occurred',
    stack: err.stack,
    userId: (req as any).userId, // From auth middleware
    endpoint: req.path,
    metadata: {
      method: req.method,
      statusCode,
      query: req.query,
      body: sanitizeBody(req.body),
    },
    severity,
  });

  // Pass to next error handler
  next(err);
}

/**
 * Sanitize request body to remove sensitive data
 */
function sanitizeBody(body: any): any {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const sanitized = { ...body };
  const sensitiveFields = [
    'password',
    'passwordHash',
    'token',
    'apiKey',
    'secret',
    'privateKey',
  ];

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
}

/**
 * Request logging middleware
 * Logs basic info about each request
 */
export function requestLoggingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const path = req.path;
  const ip = req.ip || req.socket.remoteAddress;

  console.log(`[${timestamp}] ${method} ${path} - IP: ${ip}`);

  next();
}

/**
 * Health check endpoint middleware
 * Returns current system health status
 */
export async function healthCheckMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.path !== '/health' && req.path !== '/v1/health') {
    return next();
  }

  const { performanceMonitor, errorTracker } = getMonitoringServices();

  try {
    const [overallStats, errorStats] = await Promise.all([
      performanceMonitor.getOverallStats(),
      errorTracker.getErrorStats(),
    ]);

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      performance: {
        avgResponseTime: overallStats.avgResponseTime,
        requestsPerMinute: overallStats.requestsPerMinute,
      },
      errors: {
        errorRate: errorStats.errorRate,
        unresolvedCount: errorStats.unresolvedCount,
      },
    };

    // Determine overall health status
    if (errorStats.errorRate > 5 || overallStats.avgResponseTime > 3000) {
      health.status = 'degraded';
    }

    if (errorStats.errorRate > 10 || overallStats.avgResponseTime > 5000) {
      health.status = 'unhealthy';
    }

    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Failed to check health',
    });
  }
}

/**
 * Cleanup middleware - periodically clean old data
 */
export function startCleanupJob(intervalMinutes: number = 60) {
  setInterval(async () => {
    const { performanceMonitor } = getMonitoringServices();

    // Keep only last 5000 performance metrics
    const removed = performanceMonitor.clearOldMetrics(5000);
    if (removed > 0) {
      console.log(`🧹 Cleaned up ${removed} old performance metrics`);
    }

    // Reset error rate counter
    const { errorTracker } = getMonitoringServices();
    errorTracker.resetRequestCount();
  }, intervalMinutes * 60 * 1000);

  console.log(`✅ Cleanup job scheduled every ${intervalMinutes} minutes`);
}

export default {
  performanceMonitoringMiddleware,
  errorTrackingMiddleware,
  requestLoggingMiddleware,
  healthCheckMiddleware,
  initializeMonitoring,
  getMonitoringServices,
  startCleanupJob,
};

/**
 * Admin Routes
 * Analytics and monitoring endpoints for platform administrators
 */

import { Router, Request, Response } from 'express';
import { AICostTrackerService } from '../services/monitoring/ai-cost-tracker.service';
import { PerformanceMonitorService } from '../services/monitoring/performance-monitor.service';
import { ErrorTrackerService } from '../services/monitoring/error-tracker.service';
import { PredictionCacheService } from '../services/caching/prediction-cache.service';
import { FeedbackService } from '../services/feedback.service';
import { AnalyticsService } from '../services/analytics.service';
import { PromptVersionManager } from '../services/prompt-version-manager.service';
import { getMonitoringServices } from '../middleware/monitoring.middleware';

const router = Router();

// Initialize services
const aiCostTracker = new AICostTrackerService(1000); // $1000 monthly budget
const predictionCache = new PredictionCacheService(1000); // 1000 entries max
const feedbackService = new FeedbackService();
const analyticsService = new AnalyticsService(
  aiCostTracker,
  predictionCache,
  feedbackService
);
const promptVersionManager = new PromptVersionManager();

/**
 * GET /v1/admin/overview
 * Dashboard overview with key metrics
 */
router.get('/overview', async (req: Request, res: Response) => {
  try {
    const overview = await analyticsService.getOverview();
    res.json(overview);
  } catch (error) {
    console.error('Error fetching overview:', error);
    res.status(500).json({
      error: 'Failed to fetch overview',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /v1/admin/analytics/users
 * User analytics and engagement metrics
 */
router.get('/analytics/users', async (req: Request, res: Response) => {
  try {
    const userAnalytics = await analyticsService.getUserAnalytics();
    res.json(userAnalytics);
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({
      error: 'Failed to fetch user analytics',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /v1/admin/analytics/predictions
 * Prediction analytics and performance
 */
router.get('/analytics/predictions', async (req: Request, res: Response) => {
  try {
    const predictionAnalytics = await analyticsService.getPredictionAnalytics();
    res.json(predictionAnalytics);
  } catch (error) {
    console.error('Error fetching prediction analytics:', error);
    res.status(500).json({
      error: 'Failed to fetch prediction analytics',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /v1/admin/analytics/revenue
 * Revenue analytics and transactions
 */
router.get('/analytics/revenue', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;

    const revenueAnalytics = await analyticsService.getRevenueAnalytics(start, end);
    res.json(revenueAnalytics);
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    res.status(500).json({
      error: 'Failed to fetch revenue analytics',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /v1/admin/analytics/funnel
 * User funnel conversion analytics
 */
router.get('/analytics/funnel', async (req: Request, res: Response) => {
  try {
    const funnelAnalytics = await analyticsService.getFunnelAnalytics();
    res.json(funnelAnalytics);
  } catch (error) {
    console.error('Error fetching funnel analytics:', error);
    res.status(500).json({
      error: 'Failed to fetch funnel analytics',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /v1/admin/analytics/cohorts
 * Cohort retention analysis
 */
router.get('/analytics/cohorts', async (req: Request, res: Response) => {
  try {
    const weeks = parseInt(req.query.weeks as string) || 8;
    const cohortAnalysis = await analyticsService.getCohortAnalysis(weeks);
    res.json(cohortAnalysis);
  } catch (error) {
    console.error('Error fetching cohort analysis:', error);
    res.status(500).json({
      error: 'Failed to fetch cohort analysis',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /v1/admin/ai-costs
 * AI API usage and costs
 */
router.get('/ai-costs', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate
      ? new Date(startDate as string)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default 30 days

    const end = endDate ? new Date(endDate as string) : new Date();

    const [costs, budget, stats, topExpensive] = await Promise.all([
      aiCostTracker.getCosts(start, end),
      aiCostTracker.checkBudget(),
      aiCostTracker.getUsageStats(start, end),
      aiCostTracker.getTopExpensivePredictions(10),
    ]);

    res.json({
      costs,
      budget,
      stats,
      topExpensive,
    });
  } catch (error) {
    console.error('Error fetching AI costs:', error);
    res.status(500).json({
      error: 'Failed to fetch AI costs',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /v1/admin/performance
 * API performance metrics
 */
router.get('/performance', async (req: Request, res: Response) => {
  try {
    const { performanceMonitor } = getMonitoringServices();
    const endpoint = req.query.endpoint as string;

    if (endpoint) {
      const stats = await performanceMonitor.getEndpointStats(endpoint);
      res.json(stats);
    } else {
      const [
        overallStats,
        slowRequests,
        slowestEndpoints,
        mostRequested,
        errorRates,
        trend,
      ] = await Promise.all([
        performanceMonitor.getOverallStats(),
        performanceMonitor.getSlowRequests(20),
        performanceMonitor.getSlowestEndpoints(10),
        performanceMonitor.getMostRequestedEndpoints(10),
        performanceMonitor.getErrorRateByEndpoint(),
        performanceMonitor.getPerformanceTrend(24),
      ]);

      res.json({
        overall: overallStats,
        slowRequests,
        slowestEndpoints,
        mostRequested,
        errorRates,
        trend,
      });
    }
  } catch (error) {
    console.error('Error fetching performance:', error);
    res.status(500).json({
      error: 'Failed to fetch performance metrics',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /v1/admin/errors
 * Error logs and statistics
 */
router.get('/errors', async (req: Request, res: Response) => {
  try {
    const { errorTracker } = getMonitoringServices();
    const { severity, resolved, type, limit } = req.query;

    const filters: any = {};
    if (severity) filters.severity = severity;
    if (resolved !== undefined) filters.resolved = resolved === 'true';
    if (type) filters.errorType = type;

    const [errors, stats, trends, common] = await Promise.all([
      errorTracker.getRecentErrors(parseInt(limit as string) || 50, filters),
      errorTracker.getErrorStats(),
      errorTracker.getErrorTrends(7),
      errorTracker.getMostCommonErrors(10),
    ]);

    res.json({
      errors,
      stats,
      trends,
      common,
    });
  } catch (error) {
    console.error('Error fetching errors:', error);
    res.status(500).json({
      error: 'Failed to fetch error logs',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /v1/admin/errors/:errorId/resolve
 * Mark an error as resolved
 */
router.post('/errors/:errorId/resolve', async (req: Request, res: Response) => {
  try {
    const { errorTracker } = getMonitoringServices();
    await errorTracker.markResolved(req.params.errorId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking error as resolved:', error);
    res.status(500).json({
      error: 'Failed to mark error as resolved',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /v1/admin/feedback/stats
 * Feedback statistics
 */
router.get('/feedback/stats', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, predictionType } = req.query;

    const filters: any = {};
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);
    if (predictionType) filters.predictionType = predictionType;

    const [stats, bestRated, worstRated, trends, needingAttention] = await Promise.all([
      feedbackService.getStats(filters),
      feedbackService.getBestRatedPredictions(10),
      feedbackService.getWorstRatedPredictions(10),
      feedbackService.getFeedbackTrends(30),
      feedbackService.getPredictionsNeedingAttention(2.5),
    ]);

    res.json({
      stats,
      bestRated,
      worstRated,
      trends,
      needingAttention,
    });
  } catch (error) {
    console.error('Error fetching feedback stats:', error);
    res.status(500).json({
      error: 'Failed to fetch feedback statistics',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /v1/admin/cache/stats
 * Cache performance statistics
 */
router.get('/cache/stats', async (req: Request, res: Response) => {
  try {
    const [stats, popular, sizeByType] = await Promise.all([
      predictionCache.getStats(),
      predictionCache.getPopularEntries(10),
      predictionCache.getSizeByType(),
    ]);

    res.json({
      stats,
      popular,
      sizeByType,
    });
  } catch (error) {
    console.error('Error fetching cache stats:', error);
    res.status(500).json({
      error: 'Failed to fetch cache statistics',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /v1/admin/cache/clear
 * Clear cache (all or by pattern)
 */
router.post('/cache/clear', async (req: Request, res: Response) => {
  try {
    const { pattern } = req.body;

    if (pattern) {
      const count = await predictionCache.invalidatePattern(pattern);
      res.json({ success: true, cleared: count });
    } else {
      await predictionCache.clear();
      res.json({ success: true, cleared: 'all' });
    }
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({
      error: 'Failed to clear cache',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /v1/admin/prompts
 * Get all prompt versions
 */
router.get('/prompts', async (req: Request, res: Response) => {
  try {
    const { predictionType } = req.query;

    if (predictionType) {
      const versions = await promptVersionManager.getAllVersions(predictionType as string);
      res.json(versions);
    } else {
      const best = await promptVersionManager.getBestVersions();
      res.json(best);
    }
  } catch (error) {
    console.error('Error fetching prompts:', error);
    res.status(500).json({
      error: 'Failed to fetch prompts',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /v1/admin/prompts
 * Create new prompt version
 */
router.post('/prompts', async (req: Request, res: Response) => {
  try {
    const { predictionType, version, systemPrompt } = req.body;

    if (!predictionType || !version || !systemPrompt) {
      return res.status(400).json({
        error: 'Missing required fields: predictionType, version, systemPrompt',
      });
    }

    const versionId = await promptVersionManager.createVersion({
      predictionType,
      version,
      systemPrompt,
    });

    res.json({ success: true, versionId });
  } catch (error) {
    console.error('Error creating prompt:', error);
    res.status(500).json({
      error: 'Failed to create prompt version',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /v1/admin/prompts/:versionId/activate
 * Set a prompt version as active
 */
router.post('/prompts/:versionId/activate', async (req: Request, res: Response) => {
  try {
    await promptVersionManager.setActive(req.params.versionId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error activating prompt:', error);
    res.status(500).json({
      error: 'Failed to activate prompt version',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /v1/admin/prompts/:versionId/update-score
 * Update performance score for a prompt version
 */
router.post('/prompts/:versionId/update-score', async (req: Request, res: Response) => {
  try {
    await promptVersionManager.updatePerformanceScore(req.params.versionId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating prompt score:', error);
    res.status(500).json({
      error: 'Failed to update prompt score',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /v1/admin/prompts/compare
 * Compare two prompt versions
 */
router.get('/prompts/compare', async (req: Request, res: Response) => {
  try {
    const { version1, version2 } = req.query;

    if (!version1 || !version2) {
      return res.status(400).json({
        error: 'Missing required query params: version1, version2',
      });
    }

    const comparison = await promptVersionManager.compareVersions(
      version1 as string,
      version2 as string
    );

    res.json(comparison);
  } catch (error) {
    console.error('Error comparing prompts:', error);
    res.status(500).json({
      error: 'Failed to compare prompts',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

/**
 * Compatibility API Routes
 * Endpoints for user-asset compatibility matching and personalization
 */

import express, { Request, Response } from 'express';
import PersonalizationService from '../services/personalization.service';
import logger from '../utils/logger';

const router = express.Router();
const personalizationService = new PersonalizationService();

/**
 * Required authentication middleware
 */
const requireAuth = (req: Request, res: Response, next: any) => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  (req as any).userId = userId;
  next();
};

// ============================================================================
// COMPATIBILITY ENDPOINTS
// ============================================================================

/**
 * GET /api/compatibility/top
 * Get top N most compatible assets for current user
 * Query params: limit (default: 10)
 */
router.get('/top', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const limit = parseInt(req.query.limit as string) || 10;

    logger.info('Fetching top compatible assets', { userId, limit });

    const topAssets = await personalizationService.getTopCompatibleAssets(userId, limit);

    res.json({
      success: true,
      data: {
        userId,
        limit,
        count: topAssets.length,
        assets: topAssets,
      },
    });
  } catch (error: any) {
    logger.error('Error fetching top compatible assets', { error });
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch compatible assets',
    });
  }
});

/**
 * GET /api/compatibility/asset/:assetId
 * Get compatibility score and reasoning for specific asset
 */
router.get('/asset/:assetId', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { assetId } = req.params;

    logger.info('Fetching asset compatibility', { userId, assetId });

    const compatibility = await personalizationService.getAssetCompatibility(userId, assetId);

    res.json({
      success: true,
      data: {
        userId,
        assetId,
        compatibility,
      },
    });
  } catch (error: any) {
    logger.error('Error fetching asset compatibility', { error });
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch asset compatibility',
    });
  }
});

/**
 * POST /api/compatibility/refresh
 * Trigger recalculation of all compatibilities for current user
 */
router.post('/refresh', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    logger.info('Refreshing user compatibilities', { userId });

    await personalizationService.refreshCompatibilities(userId);

    res.json({
      success: true,
      message: 'Compatibility refresh initiated',
      data: {
        userId,
      },
    });
  } catch (error: any) {
    logger.error('Error refreshing compatibilities', { error });
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to refresh compatibilities',
    });
  }
});

/**
 * GET /api/compatibility/all
 * Get all compatibilities with filtering and sorting
 * Query params:
 *   - filter: 'crypto' | 'stocks' | 'commodities' (optional)
 *   - sort: 'score' | 'name' (default: 'score')
 *   - minScore: number (default: 0)
 */
router.get('/all', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { filter, sort, minScore } = req.query;

    const options: any = {};
    if (filter) options.filter = filter as string;
    if (sort) options.sort = sort as string;
    if (minScore) options.minScore = parseInt(minScore as string);

    logger.info('Fetching all compatibilities', { userId, options });

    const compatibilities = await personalizationService.getAllCompatibilities(userId, options);

    res.json({
      success: true,
      data: {
        userId,
        count: compatibilities.length,
        filter: options.filter,
        sort: options.sort || 'score',
        minScore: options.minScore || 0,
        compatibilities,
      },
    });
  } catch (error: any) {
    logger.error('Error fetching all compatibilities', { error });
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch compatibilities',
    });
  }
});

/**
 * POST /api/compatibility/calculate
 * Calculate compatibilities for all assets (batch process)
 * This is useful when user first completes their astrological profile
 */
router.post('/calculate', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    logger.info('Starting compatibility calculation for user', { userId });

    const compatibilities = await personalizationService.calculateUserCompatibilities(userId);

    res.json({
      success: true,
      message: 'Compatibility calculation completed',
      data: {
        userId,
        totalCalculated: compatibilities.length,
        summary: {
          excellent: compatibilities.filter((c) => c.overallCompatibilityScore >= 8).length,
          good: compatibilities.filter((c) => c.overallCompatibilityScore >= 7 && c.overallCompatibilityScore < 8).length,
          moderate: compatibilities.filter((c) => c.overallCompatibilityScore >= 5 && c.overallCompatibilityScore < 7).length,
          challenging: compatibilities.filter((c) => c.overallCompatibilityScore < 5).length,
        },
      },
    });
  } catch (error: any) {
    logger.error('Error calculating compatibilities', { error });
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to calculate compatibilities',
    });
  }
});

/**
 * GET /api/compatibility/stats
 * Get compatibility statistics for user
 */
router.get('/stats', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    logger.info('Fetching compatibility stats', { userId });

    const allCompatibilities = await personalizationService.getAllCompatibilities(userId);

    const stats = {
      total: allCompatibilities.length,
      excellent: allCompatibilities.filter((c) => c.compatibilityScore >= 8).length,
      good: allCompatibilities.filter((c) => c.compatibilityScore >= 7 && c.compatibilityScore < 8).length,
      moderate: allCompatibilities.filter((c) => c.compatibilityScore >= 5 && c.compatibilityScore < 7).length,
      challenging: allCompatibilities.filter((c) => c.compatibilityScore < 5).length,
      averageScore: allCompatibilities.length > 0
        ? (allCompatibilities.reduce((sum, c) => sum + c.compatibilityScore, 0) / allCompatibilities.length).toFixed(2)
        : 0,
    };

    res.json({
      success: true,
      data: {
        userId,
        stats,
      },
    });
  } catch (error: any) {
    logger.error('Error fetching compatibility stats', { error });
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch compatibility stats',
    });
  }
});

export default router;

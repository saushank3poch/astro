/**
 * Predictions API Routes
 * Endpoints for macro, timing, and divination predictions
 */

import express, { Request, Response } from 'express';
import PredictionsService from '../services/predictions.service';
import CreditsService from '../services/credits.service';

const router = express.Router();
const predictionsService = new PredictionsService();
const creditsService = new CreditsService();

/**
 * Optional authentication middleware
 * Attaches userId if authenticated, allows anonymous if not
 */
const optionalAuth = (req: Request, res: Response, next: any) => {
  // In production, verify JWT token from Authorization header
  // For now, we'll check for user ID in header or allow anonymous
  const userId = req.headers['x-user-id'] as string;
  (req as any).userId = userId;
  next();
};

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
// MACRO PREDICTIONS
// ============================================================================

/**
 * POST /v1/predictions/macro
 * Generate macro market prediction
 */
router.post('/macro', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { year, assetClasses, method, enhanceWithAI } = req.body;
    const userId = (req as any).userId;

    // Validation
    if (!year || !assetClasses || !Array.isArray(assetClasses) || assetClasses.length === 0) {
      return res.status(400).json({
        error: 'Missing required fields: year, assetClasses (array)',
      });
    }

    if (!['chinese', 'western', 'combined'].includes(method)) {
      return res.status(400).json({
        error: 'Invalid method. Must be: chinese, western, or combined',
      });
    }

    // Generate prediction
    const result = await predictionsService.generateMacro({
      userId,
      year,
      assetClasses,
      method,
      enhanceWithAI: enhanceWithAI !== false, // Default true
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Macro prediction error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate prediction',
    });
  }
});

// ============================================================================
// TIMING PREDICTIONS
// ============================================================================

/**
 * POST /v1/predictions/timing/:assetId
 * Generate timing prediction for specific asset
 */
router.post('/timing/:assetId', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { assetId } = req.params;
    const { targetDate, timeframe, enhanceWithAI } = req.body;
    const userId = (req as any).userId;

    // Validation
    if (!['short_term', 'medium_term', 'long_term'].includes(timeframe)) {
      return res.status(400).json({
        error: 'Invalid timeframe. Must be: short_term, medium_term, or long_term',
      });
    }

    // Generate prediction
    const result = await predictionsService.generateTiming({
      userId,
      assetId,
      targetDate: targetDate ? new Date(targetDate) : undefined,
      timeframe,
      enhanceWithAI: enhanceWithAI !== false, // Default true
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Timing prediction error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate prediction',
    });
  }
});

// ============================================================================
// DIVINATION PREDICTIONS
// ============================================================================

/**
 * POST /v1/predictions/divination
 * Generate divination prediction (Tarot or I Ching)
 */
router.post('/divination', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { question, method, spread, context, enhanceWithAI } = req.body;
    const userId = (req as any).userId;

    // Validation
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({
        error: 'Missing required field: question (non-empty string)',
      });
    }

    if (!['tarot', 'iching'].includes(method)) {
      return res.status(400).json({
        error: 'Invalid method. Must be: tarot or iching',
      });
    }

    if (method === 'tarot' && spread && !['three_card', 'celtic_cross'].includes(spread)) {
      return res.status(400).json({
        error: 'Invalid spread. Must be: three_card or celtic_cross',
      });
    }

    // Generate prediction
    const result = await predictionsService.generateDivination({
      userId,
      question: question.trim(),
      method,
      spread,
      context,
      enhanceWithAI: enhanceWithAI !== false, // Default true
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Divination prediction error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate prediction',
    });
  }
});

// ============================================================================
// PREDICTION RETRIEVAL & MANAGEMENT
// ============================================================================

/**
 * GET /v1/predictions/:id
 * Get specific prediction by ID
 */
router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    const prediction = await predictionsService.getPrediction(id, userId);

    res.json({
      success: true,
      data: prediction,
    });
  } catch (error) {
    console.error('Get prediction error:', error);
    res.status(error instanceof Error && error.message === 'Unauthorized' ? 403 : 404).json({
      success: false,
      error: error instanceof Error ? error.message : 'Prediction not found',
    });
  }
});

/**
 * GET /v1/predictions
 * List user's predictions
 */
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { predictionType, status, limit, offset } = req.query;

    const result = await predictionsService.listUserPredictions(userId, {
      predictionType: predictionType as string,
      status: status as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('List predictions error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list predictions',
    });
  }
});

/**
 * POST /v1/predictions/:id/feedback
 * Submit feedback on a prediction
 */
router.post('/:id/feedback', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, feedback } = req.body;
    const userId = (req as any).userId;

    // Validation
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({
        error: 'Invalid rating. Must be a number between 1 and 5',
      });
    }

    await predictionsService.submitFeedback(id, userId, rating, feedback);

    res.json({
      success: true,
      message: 'Feedback submitted successfully',
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit feedback',
    });
  }
});

// ============================================================================
// CREDITS MANAGEMENT
// ============================================================================

/**
 * GET /v1/predictions/credits/balance
 * Get user's credit balance
 */
router.get('/credits/balance', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const stats = await creditsService.getUserStats(userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get credits error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get credits',
    });
  }
});

/**
 * GET /v1/predictions/credits/pricing
 * Get credit pricing for each prediction type
 */
router.get('/credits/pricing', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      macro: creditsService.getCreditCost('macro'),
      timing: creditsService.getCreditCost('timing'),
      divination: creditsService.getCreditCost('divination'),
    },
  });
});

/**
 * GET /v1/predictions/credits/usage
 * Get user's recent credit usage
 */
router.get('/credits/usage', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    const usage = await creditsService.getRecentUsage(userId, limit);

    res.json({
      success: true,
      data: usage,
    });
  } catch (error) {
    console.error('Get usage error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get usage',
    });
  }
});

export default router;

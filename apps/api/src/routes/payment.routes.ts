/**
 * Payment Routes
 * API endpoints for payment processing
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import PaymentService from '../services/payment.service';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const paymentService = new PaymentService();

// Validation schemas
const createPaymentSchema = z.object({
  packageType: z.enum(['credits_10', 'credits_50', 'credits_100', 'unlimited_month']),
  blockchain: z.enum(['solana', 'ethereum', 'base']),
  token: z.enum(['native', 'usdc', 'usdt']),
});

const verifyPaymentSchema = z.object({
  transactionHash: z.string().min(1),
});

/**
 * POST /v1/payments/create
 * Create a new payment intent
 */
router.post('/create', authenticate, async (req: Request, res: Response) => {
  try {
    const validated = createPaymentSchema.parse(req.body);

    const paymentIntent = await paymentService.createPaymentIntent({
      userId: (req as any).user.userId,
      packageType: validated.packageType,
      blockchain: validated.blockchain,
      token: validated.token,
    });

    res.json({
      success: true,
      data: paymentIntent,
    });
  } catch (error: any) {
    console.error('Error creating payment:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to create payment intent',
    });
  }
});

/**
 * GET /v1/payments/:paymentId/status
 * Get payment status
 */
router.get('/:paymentId/status', authenticate, async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    const transaction = await paymentService.getPaymentStatus(paymentId);

    // Verify user owns this transaction
    if (transaction.userId !== (req as any).user.userId && (req as any).user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    res.json({
      success: true,
      data: transaction,
    });
  } catch (error: any) {
    console.error('Error getting payment status:', error);
    res.status(404).json({
      success: false,
      error: error.message || 'Payment not found',
    });
  }
});

/**
 * POST /v1/payments/:paymentId/verify
 * Manually verify a payment with transaction hash
 */
router.post('/:paymentId/verify', authenticate, async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    const validated = verifyPaymentSchema.parse(req.body);

    // Get transaction
    const transaction = await paymentService.getPaymentStatus(paymentId);

    // Verify user owns this transaction
    if (transaction.userId !== (req as any).user.userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    // Process the payment
    await paymentService.processCompletedPayment(
      validated.transactionHash,
      transaction.blockchain
    );

    res.json({
      success: true,
      message: 'Payment verification initiated',
    });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to verify payment',
    });
  }
});

/**
 * GET /v1/payments/history
 * Get user's transaction history
 */
router.get('/history', authenticate, async (req: Request, res: Response) => {
  try {
    const transactions = await paymentService.getUserTransactions((req as any).user.userId);

    res.json({
      success: true,
      data: transactions,
    });
  } catch (error: any) {
    console.error('Error getting transaction history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get transaction history',
    });
  }
});

/**
 * GET /v1/payments/packages
 * Get available packages and pricing
 */
router.get('/packages', async (req: Request, res: Response) => {
  try {
    const { PRICING_TIERS } = require('../config/pricing');

    const packages = Object.entries(PRICING_TIERS).map(([key, tier]: [string, any]) => ({
      id: key,
      ...tier,
    }));

    res.json({
      success: true,
      data: packages,
    });
  } catch (error: any) {
    console.error('Error getting packages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get packages',
    });
  }
});

// ============================================================================
// ADMIN ENDPOINTS
// ============================================================================

/**
 * GET /v1/admin/payments/all
 * Get all transactions with filters (Admin only)
 */
router.get('/admin/all', authenticate, async (req: Request, res: Response) => {
  try {
    // Check admin role
    if ((req as any).user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required',
      });
    }

    const filters = {
      status: req.query.status as string,
      userId: req.query.userId as string,
      blockchain: req.query.blockchain as string,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 100,
      offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
    };

    const result = await paymentService.getAllTransactions(filters);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error getting all transactions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get transactions',
    });
  }
});

/**
 * GET /v1/admin/payments/stats
 * Get payment statistics (Admin only)
 */
router.get('/admin/stats', authenticate, async (req: Request, res: Response) => {
  try {
    // Check admin role
    if ((req as any).user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required',
      });
    }

    const stats = await paymentService.getPaymentStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('Error getting payment stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get payment stats',
    });
  }
});

export default router;

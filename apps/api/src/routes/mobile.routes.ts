/**
 * Mobile API Routes
 * Handles mobile-specific endpoints for push notifications, subscriptions, and IAP
 */

import { Router, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { AuthRequest } from '../types';
import PushNotificationService from '../services/mobile/push-notification.service';
import IAPValidationService from '../services/mobile/iap-validation.service';
import SubscriptionManagerService from '../services/mobile/subscription-manager.service';
import RevenueCatWebhookService from '../services/mobile/revenuecat-webhook.service';
import { PrismaClient } from '@astro/database';
import logger from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

const pushNotificationService = new PushNotificationService();
const iapValidationService = new IAPValidationService();
const subscriptionManagerService = new SubscriptionManagerService();
const revenueCatWebhookService = new RevenueCatWebhookService();

/**
 * POST /v1/mobile/push-token
 * Register device for push notifications
 */
router.post('/push-token', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { token, platform } = req.body;

    if (!token || !platform) {
      return res.status(400).json({
        error: {
          code: 'MISSING_FIELDS',
          message: 'Token and platform are required',
        },
      });
    }

    if (!['ios', 'android'].includes(platform)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_PLATFORM',
          message: 'Platform must be ios or android',
        },
      });
    }

    await pushNotificationService.registerToken(req.user!.id, token, platform);

    res.status(200).json({
      success: true,
      message: 'Push token registered successfully',
    });
  } catch (error: any) {
    logger.error('Error registering push token', { error: error.message });
    next(error);
  }
});

/**
 * DELETE /v1/mobile/push-token
 * Unregister device from push notifications
 */
router.delete('/push-token', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: {
          code: 'MISSING_TOKEN',
          message: 'Token is required',
        },
      });
    }

    await pushNotificationService.unregisterToken(token);

    res.status(200).json({
      success: true,
      message: 'Push token unregistered successfully',
    });
  } catch (error: any) {
    logger.error('Error unregistering push token', { error: error.message });
    next(error);
  }
});

/**
 * GET /v1/mobile/subscription-status
 * Get current subscription status
 */
router.get('/subscription-status', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;

    const [status, creditLimit, canPredict, tier] = await Promise.all([
      iapValidationService.getSubscriptionStatus(userId),
      subscriptionManagerService.getCreditLimit(userId),
      subscriptionManagerService.canMakePrediction(userId),
      subscriptionManagerService.getSubscriptionTier(userId),
    ]);

    // Get current credits
    const userCredits = await prisma.userCredits.findUnique({
      where: { userId },
    });

    res.status(200).json({
      subscription: status,
      tier,
      credits: {
        balance: userCredits?.creditsBalance || 0,
        limit: creditLimit,
        unlimited: creditLimit === -1,
      },
      canMakePrediction: canPredict,
    });
  } catch (error: any) {
    logger.error('Error getting subscription status', { error: error.message });
    next(error);
  }
});

/**
 * POST /v1/mobile/validate-receipt
 * Validate and process IAP receipt
 */
router.post('/validate-receipt', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { receiptData, productId, transactionId, platform } = req.body;

    if (!receiptData || !productId || !transactionId || !platform) {
      return res.status(400).json({
        error: {
          code: 'MISSING_FIELDS',
          message: 'Receipt data, productId, transactionId, and platform are required',
        },
      });
    }

    if (!['ios', 'android'].includes(platform)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_PLATFORM',
          message: 'Platform must be ios or android',
        },
      });
    }

    const result = await iapValidationService.validateAndProcessReceipt(
      {
        platform,
        receiptData,
        productId,
        transactionId,
      },
      req.user!.id
    );

    if (!result.success) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_FAILED',
          message: result.error || 'Receipt validation failed',
        },
      });
    }

    res.status(200).json({
      success: true,
      subscription: result.subscription,
    });
  } catch (error: any) {
    logger.error('Error validating receipt', { error: error.message });
    next(error);
  }
});

/**
 * POST /v1/mobile/restore-purchases
 * Restore previous purchases
 */
router.post('/restore-purchases', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { receiptData, platform } = req.body;

    if (!receiptData || !platform) {
      return res.status(400).json({
        error: {
          code: 'MISSING_FIELDS',
          message: 'Receipt data and platform are required',
        },
      });
    }

    if (!['ios', 'android'].includes(platform)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_PLATFORM',
          message: 'Platform must be ios or android',
        },
      });
    }

    const result = await iapValidationService.restorePurchases(
      req.user!.id,
      receiptData,
      platform
    );

    if (!result.success) {
      return res.status(404).json({
        error: {
          code: 'NO_PURCHASES',
          message: result.error || 'No valid purchases found',
        },
      });
    }

    res.status(200).json({
      success: true,
      subscription: result.subscription,
    });
  } catch (error: any) {
    logger.error('Error restoring purchases', { error: error.message });
    next(error);
  }
});

/**
 * POST /v1/mobile/webhooks/revenuecat
 * Handle RevenueCat webhook events
 */
router.post('/webhooks/revenuecat', async (req, res: Response, next) => {
  try {
    const signature = req.headers['x-revenuecat-signature'] as string;
    const payload = JSON.stringify(req.body);

    // Verify webhook signature
    const isValid = revenueCatWebhookService.verifySignature(payload, signature);

    if (!isValid) {
      logger.warn('Invalid RevenueCat webhook signature');
      return res.status(401).json({
        error: {
          code: 'INVALID_SIGNATURE',
          message: 'Invalid webhook signature',
        },
      });
    }

    // Process webhook
    await revenueCatWebhookService.processWebhook(req.body);

    res.status(200).json({ received: true });
  } catch (error: any) {
    logger.error('Error processing RevenueCat webhook', { error: error.message });
    // Still return 200 to prevent RevenueCat from retrying
    res.status(200).json({ received: true, error: error.message });
  }
});

/**
 * GET /v1/mobile/notifications/preferences
 * Get notification preferences
 */
router.get('/notifications/preferences', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;

    let preferences = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    // Create default preferences if not exists
    if (!preferences) {
      preferences = await prisma.notificationPreference.create({
        data: {
          userId,
          dailyInsight: true,
          favorablePeriods: true,
          lowCredit: true,
          subscriptionExpiry: true,
        },
      });
    }

    res.status(200).json({
      preferences: {
        dailyInsight: preferences.dailyInsight,
        favorablePeriods: preferences.favorablePeriods,
        lowCredit: preferences.lowCredit,
        subscriptionExpiry: preferences.subscriptionExpiry,
      },
    });
  } catch (error: any) {
    logger.error('Error getting notification preferences', { error: error.message });
    next(error);
  }
});

/**
 * PUT /v1/mobile/notifications/preferences
 * Update notification preferences
 */
router.put('/notifications/preferences', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const { dailyInsight, favorablePeriods, lowCredit, subscriptionExpiry } = req.body;

    const updateData: any = {};
    if (typeof dailyInsight === 'boolean') updateData.dailyInsight = dailyInsight;
    if (typeof favorablePeriods === 'boolean') updateData.favorablePeriods = favorablePeriods;
    if (typeof lowCredit === 'boolean') updateData.lowCredit = lowCredit;
    if (typeof subscriptionExpiry === 'boolean') updateData.subscriptionExpiry = subscriptionExpiry;

    const preferences = await prisma.notificationPreference.upsert({
      where: { userId },
      create: {
        userId,
        dailyInsight: dailyInsight ?? true,
        favorablePeriods: favorablePeriods ?? true,
        lowCredit: lowCredit ?? true,
        subscriptionExpiry: subscriptionExpiry ?? true,
      },
      update: updateData,
    });

    res.status(200).json({
      success: true,
      preferences: {
        dailyInsight: preferences.dailyInsight,
        favorablePeriods: preferences.favorablePeriods,
        lowCredit: preferences.lowCredit,
        subscriptionExpiry: preferences.subscriptionExpiry,
      },
    });
  } catch (error: any) {
    logger.error('Error updating notification preferences', { error: error.message });
    next(error);
  }
});

/**
 * POST /v1/mobile/test-notification
 * Send test notification (for debugging)
 */
router.post('/test-notification', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;

    await pushNotificationService.testNotification(userId);

    res.status(200).json({
      success: true,
      message: 'Test notification sent',
    });
  } catch (error: any) {
    logger.error('Error sending test notification', { error: error.message });
    next(error);
  }
});

/**
 * POST /v1/mobile/initialize
 * Initialize free subscription for new mobile user
 */
router.post('/initialize', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { platform } = req.body;

    if (!platform || !['ios', 'android'].includes(platform)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_PLATFORM',
          message: 'Platform must be ios or android',
        },
      });
    }

    await subscriptionManagerService.initializeFreeSubscription(req.user!.id, platform);

    res.status(200).json({
      success: true,
      message: 'Free subscription initialized',
    });
  } catch (error: any) {
    logger.error('Error initializing subscription', { error: error.message });
    next(error);
  }
});

export default router;

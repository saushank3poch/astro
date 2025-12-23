/**
 * RevenueCat Webhook Service
 * Handles webhook events from RevenueCat for subscription management
 */

import { PrismaClient } from '@astro/database';
import crypto from 'crypto';
import { getTierFromProductId } from '../../config/mobile-subscriptions';
import { CreditsService } from '../credits.service';
import PushNotificationService from './push-notification.service';

const prisma = new PrismaClient();
const creditsService = new CreditsService();
const pushNotificationService = new PushNotificationService();

export interface RevenueCatWebhookEvent {
  event: {
    type: string;
    app_user_id: string;
    product_id: string;
    period_type?: string;
    purchased_at_ms?: number;
    expiration_at_ms?: number;
    store?: string;
    environment?: string;
    is_trial_conversion?: boolean;
    transaction_id?: string;
    original_transaction_id?: string;
    price?: number;
    currency?: string;
  };
}

export class RevenueCatWebhookService {
  private readonly WEBHOOK_SECRET = process.env.REVENUECAT_WEBHOOK_SECRET;

  /**
   * Verify webhook signature
   */
  verifySignature(payload: string, signature: string): boolean {
    if (!this.WEBHOOK_SECRET) {
      console.warn('RevenueCat webhook secret not configured');
      return true; // Allow in development
    }

    try {
      const hmac = crypto.createHmac('sha256', this.WEBHOOK_SECRET);
      const digest = hmac.update(payload).digest('hex');
      return signature === digest;
    } catch (error) {
      console.error('Error verifying webhook signature:', error);
      return false;
    }
  }

  /**
   * Process RevenueCat webhook event
   */
  async processWebhook(event: RevenueCatWebhookEvent): Promise<void> {
    try {
      const {
        type,
        app_user_id: userId,
        product_id: productId,
        expiration_at_ms: expirationMs,
        transaction_id: transactionId,
        original_transaction_id: originalTransactionId,
        store,
        environment,
      } = event.event;

      console.log(`Processing RevenueCat webhook: ${type} for user ${userId}`);

      switch (type) {
        case 'INITIAL_PURCHASE':
          await this.handleInitialPurchase(
            userId,
            productId,
            expirationMs,
            transactionId,
            originalTransactionId,
            store
          );
          break;

        case 'RENEWAL':
          await this.handleRenewal(userId, productId, expirationMs);
          break;

        case 'CANCELLATION':
          await this.handleCancellation(userId);
          break;

        case 'EXPIRATION':
          await this.handleExpiration(userId);
          break;

        case 'BILLING_ISSUE':
          await this.handleBillingIssue(userId);
          break;

        case 'PRODUCT_CHANGE':
          await this.handleProductChange(userId, productId, expirationMs);
          break;

        case 'UNCANCELLATION':
          await this.handleUncancellation(userId, productId, expirationMs);
          break;

        default:
          console.log(`Unhandled webhook type: ${type}`);
      }
    } catch (error) {
      console.error('Error processing RevenueCat webhook:', error);
      throw error;
    }
  }

  /**
   * Handle initial purchase event
   */
  private async handleInitialPurchase(
    userId: string,
    productId: string,
    expirationMs?: number,
    transactionId?: string,
    originalTransactionId?: string,
    store?: string
  ): Promise<void> {
    try {
      const tier = getTierFromProductId(productId);
      const expiresAt = expirationMs ? new Date(expirationMs) : null;
      const platform = store === 'app_store' ? 'ios' : 'android';

      // Update user subscription
      await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionTier: tier,
          subscriptionStatus: 'active',
          subscriptionExpiresAt: expiresAt,
          subscriptionProvider: 'revenuecat',
        },
      });

      // Create or update mobile subscription
      await prisma.mobileSubscription.upsert({
        where: { userId },
        create: {
          userId,
          platform,
          tier,
          productId,
          transactionId: transactionId || null,
          originalTransactionId: originalTransactionId || null,
          expiresAt,
          autoRenewing: true,
          inGracePeriod: false,
        },
        update: {
          tier,
          productId,
          transactionId: transactionId || null,
          originalTransactionId: originalTransactionId || null,
          expiresAt,
          autoRenewing: true,
          inGracePeriod: false,
        },
      });

      // Grant subscription credits
      await this.grantSubscriptionCredits(userId, tier);

      // Send welcome notification
      await pushNotificationService.sendToUser(userId, {
        title: '🎉 Subscription Activated!',
        body: `Welcome to ${tier.toUpperCase()} tier! Your cosmic journey has been upgraded.`,
        data: {
          type: 'subscription_activated',
          tier,
          timestamp: new Date().toISOString(),
        },
      });

      console.log(`Initial purchase processed for user ${userId}: ${tier}`);
    } catch (error) {
      console.error('Error handling initial purchase:', error);
      throw error;
    }
  }

  /**
   * Handle renewal event
   */
  private async handleRenewal(
    userId: string,
    productId: string,
    expirationMs?: number
  ): Promise<void> {
    try {
      const tier = getTierFromProductId(productId);
      const expiresAt = expirationMs ? new Date(expirationMs) : null;

      // Update subscription
      await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionTier: tier,
          subscriptionStatus: 'active',
          subscriptionExpiresAt: expiresAt,
        },
      });

      await prisma.mobileSubscription.update({
        where: { userId },
        data: {
          tier,
          productId,
          expiresAt,
          autoRenewing: true,
          inGracePeriod: false,
        },
      });

      // Grant credits for new billing period
      await this.grantSubscriptionCredits(userId, tier);

      // Send renewal notification
      await pushNotificationService.sendToUser(userId, {
        title: '✨ Subscription Renewed',
        body: `Your ${tier.toUpperCase()} subscription has been renewed. Your credits have been refreshed!`,
        data: {
          type: 'subscription_renewed',
          tier,
          timestamp: new Date().toISOString(),
        },
      });

      console.log(`Renewal processed for user ${userId}: ${tier}`);
    } catch (error) {
      console.error('Error handling renewal:', error);
      throw error;
    }
  }

  /**
   * Handle cancellation event
   */
  private async handleCancellation(userId: string): Promise<void> {
    try {
      // Don't immediately downgrade - let them keep access until expiry
      await prisma.mobileSubscription.update({
        where: { userId },
        data: {
          autoRenewing: false,
        },
      });

      await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionStatus: 'cancelled',
        },
      });

      // Get expiry date for notification
      const subscription = await prisma.mobileSubscription.findUnique({
        where: { userId },
      });

      if (subscription?.expiresAt) {
        const daysRemaining = Math.ceil(
          (subscription.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );

        await pushNotificationService.sendToUser(userId, {
          title: '⚠️ Subscription Cancelled',
          body: `Your subscription has been cancelled. You'll keep access for ${daysRemaining} more days. Resubscribe anytime!`,
          data: {
            type: 'subscription_cancelled',
            daysRemaining,
            timestamp: new Date().toISOString(),
          },
        });
      }

      console.log(`Cancellation processed for user ${userId}`);
    } catch (error) {
      console.error('Error handling cancellation:', error);
      throw error;
    }
  }

  /**
   * Handle expiration event
   */
  private async handleExpiration(userId: string): Promise<void> {
    try {
      // Downgrade to free tier
      await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionTier: 'free',
          subscriptionStatus: 'expired',
        },
      });

      await prisma.mobileSubscription.update({
        where: { userId },
        data: {
          tier: 'free',
          autoRenewing: false,
          inGracePeriod: false,
        },
      });

      // Reset to free tier credits
      await prisma.userCredits.upsert({
        where: { userId },
        create: {
          userId,
          creditsBalance: 3,
          creditsUsedLifetime: 0,
          creditsPurchasedLifetime: 3,
        },
        update: {
          creditsBalance: 3,
        },
      });

      await pushNotificationService.sendToUser(userId, {
        title: '⏰ Subscription Expired',
        body: 'Your subscription has expired. You now have 3 free credits per month. Upgrade to continue unlimited access!',
        data: {
          type: 'subscription_expired',
          timestamp: new Date().toISOString(),
        },
      });

      console.log(`Expiration processed for user ${userId}`);
    } catch (error) {
      console.error('Error handling expiration:', error);
      throw error;
    }
  }

  /**
   * Handle billing issue event
   */
  private async handleBillingIssue(userId: string): Promise<void> {
    try {
      // Set grace period
      await prisma.mobileSubscription.update({
        where: { userId },
        data: {
          inGracePeriod: true,
        },
      });

      await pushNotificationService.sendToUser(userId, {
        title: '⚠️ Payment Issue',
        body: 'There was an issue processing your payment. Please update your payment method to avoid losing access.',
        data: {
          type: 'billing_issue',
          timestamp: new Date().toISOString(),
        },
      });

      console.log(`Billing issue flagged for user ${userId}`);
    } catch (error) {
      console.error('Error handling billing issue:', error);
      throw error;
    }
  }

  /**
   * Handle product change event (upgrade/downgrade)
   */
  private async handleProductChange(
    userId: string,
    productId: string,
    expirationMs?: number
  ): Promise<void> {
    try {
      const newTier = getTierFromProductId(productId);
      const expiresAt = expirationMs ? new Date(expirationMs) : null;

      // Get old tier
      const oldSubscription = await prisma.mobileSubscription.findUnique({
        where: { userId },
      });

      await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionTier: newTier,
          subscriptionStatus: 'active',
          subscriptionExpiresAt: expiresAt,
        },
      });

      await prisma.mobileSubscription.update({
        where: { userId },
        data: {
          tier: newTier,
          productId,
          expiresAt,
          autoRenewing: true,
          inGracePeriod: false,
        },
      });

      // Grant credits for new tier
      await this.grantSubscriptionCredits(userId, newTier);

      const isUpgrade = oldSubscription && this.isUpgrade(oldSubscription.tier, newTier);

      await pushNotificationService.sendToUser(userId, {
        title: isUpgrade ? '⬆️ Subscription Upgraded!' : '⬇️ Subscription Changed',
        body: `Your subscription has been ${isUpgrade ? 'upgraded' : 'changed'} to ${newTier.toUpperCase()} tier.`,
        data: {
          type: 'subscription_changed',
          newTier,
          timestamp: new Date().toISOString(),
        },
      });

      console.log(`Product change processed for user ${userId}: ${newTier}`);
    } catch (error) {
      console.error('Error handling product change:', error);
      throw error;
    }
  }

  /**
   * Handle uncancellation event
   */
  private async handleUncancellation(
    userId: string,
    productId: string,
    expirationMs?: number
  ): Promise<void> {
    try {
      const tier = getTierFromProductId(productId);
      const expiresAt = expirationMs ? new Date(expirationMs) : null;

      await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionTier: tier,
          subscriptionStatus: 'active',
          subscriptionExpiresAt: expiresAt,
        },
      });

      await prisma.mobileSubscription.update({
        where: { userId },
        data: {
          autoRenewing: true,
          inGracePeriod: false,
        },
      });

      await pushNotificationService.sendToUser(userId, {
        title: '🎉 Welcome Back!',
        body: 'Your subscription has been reactivated. Your cosmic journey continues!',
        data: {
          type: 'subscription_reactivated',
          tier,
          timestamp: new Date().toISOString(),
        },
      });

      console.log(`Uncancellation processed for user ${userId}`);
    } catch (error) {
      console.error('Error handling uncancellation:', error);
      throw error;
    }
  }

  /**
   * Grant subscription credits based on tier
   */
  private async grantSubscriptionCredits(userId: string, tier: string): Promise<void> {
    try {
      const tierConfig = {
        free: 3,
        basic: 50,
        pro: -1, // unlimited
      }[tier] || 3;

      if (tierConfig === -1) {
        // Pro tier - set very high number for unlimited
        await creditsService.addCredits(userId, 999999, 'purchase');
      } else {
        await creditsService.addCredits(userId, tierConfig, 'purchase');
      }

      console.log(`Granted ${tierConfig} credits to user ${userId} (${tier} tier)`);
    } catch (error) {
      console.error('Error granting subscription credits:', error);
      throw error;
    }
  }

  /**
   * Check if tier change is an upgrade
   */
  private isUpgrade(oldTier: string, newTier: string): boolean {
    const tierValues = {
      free: 0,
      basic: 1,
      pro: 2,
    };

    const oldValue = tierValues[oldTier as keyof typeof tierValues] || 0;
    const newValue = tierValues[newTier as keyof typeof tierValues] || 0;

    return newValue > oldValue;
  }
}

export default RevenueCatWebhookService;

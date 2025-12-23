/**
 * Subscription Manager Service
 * Manages mobile subscriptions, credit limits, and tier-based access
 */

import { PrismaClient } from '@astro/database';
import { SUBSCRIPTION_TIERS, getCreditLimitForTier } from '../../config/mobile-subscriptions';
import { CreditsService } from '../credits.service';
import PushNotificationService from './push-notification.service';

const prisma = new PrismaClient();
const creditsService = new CreditsService();
const pushNotificationService = new PushNotificationService();

export class SubscriptionManagerService {
  /**
   * Check if user has active subscription
   */
  async hasActiveSubscription(userId: string): Promise<boolean> {
    try {
      const subscription = await prisma.mobileSubscription.findUnique({
        where: { userId },
      });

      if (!subscription) {
        return false;
      }

      // Free tier is always "active"
      if (subscription.tier === 'free') {
        return true;
      }

      // Check expiration
      if (!subscription.expiresAt) {
        return false;
      }

      const now = new Date();
      return subscription.expiresAt > now;
    } catch (error) {
      console.error('Error checking active subscription:', error);
      return false;
    }
  }

  /**
   * Get credit limit for user based on subscription tier
   * Returns -1 for unlimited
   */
  async getCreditLimit(userId: string): Promise<number> {
    try {
      const subscription = await prisma.mobileSubscription.findUnique({
        where: { userId },
      });

      const tier = subscription?.tier || 'free';
      const isActive = await this.hasActiveSubscription(userId);

      // If subscription is expired, default to free tier
      if (!isActive && tier !== 'free') {
        return getCreditLimitForTier('free');
      }

      return getCreditLimitForTier(tier);
    } catch (error) {
      console.error('Error getting credit limit:', error);
      return 3; // Default to free tier
    }
  }

  /**
   * Check if user can make a prediction
   */
  async canMakePrediction(userId: string): Promise<boolean> {
    try {
      const creditLimit = await this.getCreditLimit(userId);

      // Unlimited credits (pro tier)
      if (creditLimit === -1) {
        return true;
      }

      // Check current credit balance
      const userCredits = await prisma.userCredits.findUnique({
        where: { userId },
      });

      if (!userCredits) {
        // New user, initialize with free tier credits
        await creditsService.addCredits(userId, 3, 'signup');
        return true;
      }

      return userCredits.creditsBalance > 0;
    } catch (error) {
      console.error('Error checking if user can make prediction:', error);
      return false;
    }
  }

  /**
   * Reset monthly credits for all users
   * Should be run on the 1st of each month via cron job
   */
  async resetMonthlyCredits(): Promise<void> {
    try {
      console.log('Starting monthly credit reset...');

      // Get all active subscriptions
      const subscriptions = await prisma.mobileSubscription.findMany({
        include: {
          user: {
            select: {
              id: true,
              subscriptionTier: true,
            },
          },
        },
      });

      let resetCount = 0;

      for (const subscription of subscriptions) {
        // Check if subscription is still active
        const isActive = await this.hasActiveSubscription(subscription.userId);

        if (!isActive && subscription.tier !== 'free') {
          // Downgrade to free tier if expired
          await this.handleSubscriptionExpiry(subscription.userId);
          continue;
        }

        const creditLimit = getCreditLimitForTier(subscription.tier);

        // Skip unlimited (pro) users
        if (creditLimit === -1) {
          continue;
        }

        // Reset credits to monthly limit
        await prisma.userCredits.upsert({
          where: { userId: subscription.userId },
          create: {
            userId: subscription.userId,
            creditsBalance: creditLimit,
            creditsUsedLifetime: 0,
            creditsPurchasedLifetime: creditLimit,
          },
          update: {
            creditsBalance: creditLimit,
          },
        });

        resetCount++;
      }

      console.log(`Monthly credit reset complete. Reset ${resetCount} users.`);
    } catch (error) {
      console.error('Error resetting monthly credits:', error);
      throw error;
    }
  }

  /**
   * Handle subscription expiry
   * Downgrade user to free tier and send notification
   */
  async handleSubscriptionExpiry(userId: string): Promise<void> {
    try {
      console.log(`Handling subscription expiry for user ${userId}`);

      // Update user to free tier
      await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionTier: 'free',
          subscriptionStatus: 'expired',
        },
      });

      // Update mobile subscription
      await prisma.mobileSubscription.update({
        where: { userId },
        data: {
          tier: 'free',
          autoRenewing: false,
          inGracePeriod: false,
        },
      });

      // Reset to free tier credits (3)
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

      // Send expiry notification
      await pushNotificationService.sendToUser(userId, {
        title: '⏰ Subscription Expired',
        body: 'Your subscription has expired. You now have 3 free credits per month. Upgrade to continue unlimited access!',
        data: {
          type: 'subscription_expired',
          timestamp: new Date().toISOString(),
        },
      });

      console.log(`Subscription expiry handled for user ${userId}`);
    } catch (error) {
      console.error('Error handling subscription expiry:', error);
      throw error;
    }
  }

  /**
   * Get current subscription tier for user
   */
  async getSubscriptionTier(userId: string): Promise<'free' | 'basic' | 'pro'> {
    try {
      const subscription = await prisma.mobileSubscription.findUnique({
        where: { userId },
      });

      if (!subscription) {
        return 'free';
      }

      const isActive = await this.hasActiveSubscription(userId);

      if (!isActive && subscription.tier !== 'free') {
        return 'free';
      }

      return subscription.tier as 'free' | 'basic' | 'pro';
    } catch (error) {
      console.error('Error getting subscription tier:', error);
      return 'free';
    }
  }

  /**
   * Initialize free tier subscription for new user
   */
  async initializeFreeSubscription(userId: string, platform: 'ios' | 'android'): Promise<void> {
    try {
      // Create mobile subscription record
      await prisma.mobileSubscription.upsert({
        where: { userId },
        create: {
          userId,
          platform,
          tier: 'free',
          autoRenewing: false,
          inGracePeriod: false,
        },
        update: {}, // Don't overwrite if already exists
      });

      // Initialize notification preferences
      await prisma.notificationPreference.upsert({
        where: { userId },
        create: {
          userId,
          dailyInsight: true,
          favorablePeriods: true,
          lowCredit: true,
          subscriptionExpiry: true,
        },
        update: {}, // Don't overwrite if already exists
      });

      // Initialize credits (3 for free tier)
      await creditsService.addCredits(userId, 3, 'signup');

      console.log(`Initialized free subscription for user ${userId}`);
    } catch (error) {
      console.error('Error initializing free subscription:', error);
      throw error;
    }
  }

  /**
   * Check subscriptions expiring in the next N days
   */
  async getExpiringSubscriptions(daysAhead: number): Promise<Array<{
    userId: string;
    tier: string;
    expiresAt: Date;
  }>> {
    try {
      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysAhead);

      const subscriptions = await prisma.mobileSubscription.findMany({
        where: {
          tier: {
            not: 'free',
          },
          autoRenewing: false,
          expiresAt: {
            gte: now,
            lte: futureDate,
          },
        },
        select: {
          userId: true,
          tier: true,
          expiresAt: true,
        },
      });

      return subscriptions.filter(s => s.expiresAt !== null).map(s => ({
        userId: s.userId,
        tier: s.tier,
        expiresAt: s.expiresAt!,
      }));
    } catch (error) {
      console.error('Error getting expiring subscriptions:', error);
      return [];
    }
  }

  /**
   * Get users with low credits (< 3)
   */
  async getUsersWithLowCredits(): Promise<Array<{
    userId: string;
    creditsRemaining: number;
  }>> {
    try {
      const userCredits = await prisma.userCredits.findMany({
        where: {
          creditsBalance: {
            lt: 3,
            gt: 0,
          },
        },
        select: {
          userId: true,
          creditsBalance: true,
        },
      });

      return userCredits.map(uc => ({
        userId: uc.userId,
        creditsRemaining: uc.creditsBalance,
      }));
    } catch (error) {
      console.error('Error getting users with low credits:', error);
      return [];
    }
  }

  /**
   * Get subscription summary for admin dashboard
   */
  async getSubscriptionSummary(): Promise<{
    totalUsers: number;
    freeUsers: number;
    basicUsers: number;
    proUsers: number;
    activeSubscriptions: number;
    expiringThisWeek: number;
  }> {
    try {
      const [total, free, basic, pro, expiringThisWeek] = await Promise.all([
        prisma.mobileSubscription.count(),
        prisma.mobileSubscription.count({ where: { tier: 'free' } }),
        prisma.mobileSubscription.count({ where: { tier: 'basic' } }),
        prisma.mobileSubscription.count({ where: { tier: 'pro' } }),
        this.getExpiringSubscriptions(7),
      ]);

      return {
        totalUsers: total,
        freeUsers: free,
        basicUsers: basic,
        proUsers: pro,
        activeSubscriptions: basic + pro,
        expiringThisWeek: expiringThisWeek.length,
      };
    } catch (error) {
      console.error('Error getting subscription summary:', error);
      return {
        totalUsers: 0,
        freeUsers: 0,
        basicUsers: 0,
        proUsers: 0,
        activeSubscriptions: 0,
        expiringThisWeek: 0,
      };
    }
  }
}

export default SubscriptionManagerService;

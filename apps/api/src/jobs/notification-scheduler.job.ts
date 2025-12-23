/**
 * Notification Scheduler Job
 * Runs hourly to send scheduled push notifications
 * - Daily insights at 7am local time
 * - Favorable period alerts
 * - Subscription expiry warnings (3 days before)
 * - Low credit warnings (< 3 credits)
 */

import { PrismaClient } from '@astro/database';
import cron from 'node-cron';
import PushNotificationService from '../services/mobile/push-notification.service';
import SubscriptionManagerService from '../services/mobile/subscription-manager.service';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export class NotificationScheduler {
  private pushNotificationService: PushNotificationService;
  private subscriptionManagerService: SubscriptionManagerService;
  private isRunning: boolean = false;

  constructor() {
    this.pushNotificationService = new PushNotificationService();
    this.subscriptionManagerService = new SubscriptionManagerService();
  }

  /**
   * Run all notification checks
   */
  async run(): Promise<void> {
    if (this.isRunning) {
      logger.info('Notification scheduler already running, skipping...');
      return;
    }

    this.isRunning = true;

    try {
      logger.info('Starting notification scheduler...');

      await Promise.all([
        this.sendDailyInsights(),
        this.sendFavorablePeriodAlerts(),
        this.sendSubscriptionExpiryWarnings(),
        this.sendLowCreditWarnings(),
      ]);

      logger.info('Notification scheduler completed successfully');
    } catch (error: any) {
      logger.error('Error in notification scheduler', { error: error.message });
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Send daily insights at 7am local time
   * This is simplified - in production you'd want timezone-aware scheduling
   */
  private async sendDailyInsights(): Promise<void> {
    try {
      const currentHour = new Date().getUTCHours();

      // Send to users in timezones where it's currently 7am
      // Simplified: just send at specific UTC hours (corresponds to different timezones)
      const targetHours = [7, 14, 21]; // 7am in UTC, PST, EST roughly

      if (!targetHours.includes(currentHour)) {
        return;
      }

      // Get all users with devices and daily insight enabled
      const users = await prisma.user.findMany({
        where: {
          deviceTokens: {
            some: {
              enabled: true,
            },
          },
          notificationPreference: {
            dailyInsight: true,
          },
        },
        select: {
          id: true,
        },
        take: 1000, // Process in batches
      });

      logger.info(`Sending daily insights to ${users.length} users`);

      for (const user of users) {
        try {
          await this.pushNotificationService.sendDailyInsight(user.id);
        } catch (error: any) {
          logger.error(`Error sending daily insight to user ${user.id}`, {
            error: error.message,
          });
        }
      }

      logger.info(`Daily insights sent to ${users.length} users`);
    } catch (error: any) {
      logger.error('Error sending daily insights', { error: error.message });
    }
  }

  /**
   * Send favorable period alerts
   * Check predictions created today that have favorable periods starting today/tomorrow
   */
  private async sendFavorablePeriodAlerts(): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get predictions with favorable periods starting today or tomorrow
      const predictions = await prisma.prediction.findMany({
        where: {
          status: 'completed',
          favorablePeriodStart: {
            gte: today,
            lt: tomorrow,
          },
          favorabilityScore: {
            gte: 70, // Only high favorability
          },
        },
        include: {
          user: {
            select: {
              id: true,
              notificationPreference: {
                select: {
                  favorablePeriods: true,
                },
              },
            },
          },
          asset: {
            select: {
              symbol: true,
            },
          },
        },
      });

      logger.info(`Found ${predictions.length} favorable periods to notify`);

      for (const prediction of predictions) {
        try {
          // Check if user has notifications enabled
          if (!prediction.user?.notificationPreference?.favorablePeriods) {
            continue;
          }

          if (prediction.asset?.symbol && prediction.userId) {
            await this.pushNotificationService.sendFavorablePeriodAlert(
              prediction.userId,
              prediction.asset.symbol
            );
          }
        } catch (error: any) {
          logger.error(`Error sending favorable period alert for prediction ${prediction.id}`, {
            error: error.message,
          });
        }
      }

      logger.info(`Favorable period alerts sent`);
    } catch (error: any) {
      logger.error('Error sending favorable period alerts', { error: error.message });
    }
  }

  /**
   * Send subscription expiry warnings (3 days before)
   */
  private async sendSubscriptionExpiryWarnings(): Promise<void> {
    try {
      const expiringSubscriptions = await this.subscriptionManagerService.getExpiringSubscriptions(3);

      logger.info(`Found ${expiringSubscriptions.length} subscriptions expiring in 3 days`);

      for (const subscription of expiringSubscriptions) {
        try {
          await this.pushNotificationService.sendSubscriptionExpiryWarning(
            subscription.userId,
            subscription.expiresAt
          );
        } catch (error: any) {
          logger.error(`Error sending expiry warning to user ${subscription.userId}`, {
            error: error.message,
          });
        }
      }

      logger.info(`Subscription expiry warnings sent`);
    } catch (error: any) {
      logger.error('Error sending subscription expiry warnings', { error: error.message });
    }
  }

  /**
   * Send low credit warnings (< 3 credits remaining)
   */
  private async sendLowCreditWarnings(): Promise<void> {
    try {
      const usersWithLowCredits = await this.subscriptionManagerService.getUsersWithLowCredits();

      logger.info(`Found ${usersWithLowCredits.length} users with low credits`);

      for (const user of usersWithLowCredits) {
        try {
          await this.pushNotificationService.sendLowCreditWarning(
            user.userId,
            user.creditsRemaining
          );
        } catch (error: any) {
          logger.error(`Error sending low credit warning to user ${user.userId}`, {
            error: error.message,
          });
        }
      }

      logger.info(`Low credit warnings sent`);
    } catch (error: any) {
      logger.error('Error sending low credit warnings', { error: error.message });
    }
  }

  /**
   * Start the scheduler with cron job (runs every hour)
   */
  startScheduler(): void {
    // Run every hour at minute 0
    cron.schedule('0 * * * *', async () => {
      logger.info('Running hourly notification scheduler');
      await this.run();
    });

    logger.info('Notification scheduler started (runs every hour)');
  }

  /**
   * Start the scheduler with interval (for development/testing)
   * @param intervalMinutes - How often to run in minutes
   */
  startSchedulerWithInterval(intervalMinutes: number = 60): void {
    const intervalMs = intervalMinutes * 60 * 1000;

    // Run immediately on start
    this.run();

    // Then run on interval
    setInterval(async () => {
      logger.info('Running scheduled notification check');
      await this.run();
    }, intervalMs);

    logger.info(`Notification scheduler started (runs every ${intervalMinutes} minutes)`);
  }
}

export default NotificationScheduler;

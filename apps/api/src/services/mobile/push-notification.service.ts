/**
 * Push Notification Service
 * Manages push notifications for mobile devices using Expo Push Notification service
 */

import { PrismaClient } from '@astro/database';
import axios from 'axios';

const prisma = new PrismaClient();

export interface DeviceToken {
  userId: string;
  token: string;
  platform: 'ios' | 'android';
  enabled: boolean;
}

export interface PushNotification {
  title: string;
  body: string;
  data?: any;
  badge?: number;
  sound?: string;
  priority?: 'default' | 'normal' | 'high';
}

interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  data?: any;
  badge?: number;
  sound?: string;
  priority?: 'default' | 'normal' | 'high';
}

interface ExpoPushTicket {
  status: 'ok' | 'error';
  id?: string;
  message?: string;
  details?: any;
}

export class PushNotificationService {
  private readonly EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
  private readonly BATCH_SIZE = 100;

  /**
   * Register device token for push notifications
   */
  async registerToken(userId: string, token: string, platform: 'ios' | 'android'): Promise<void> {
    try {
      // Validate token format (Expo push tokens start with ExponentPushToken[...)
      if (!token.startsWith('ExponentPushToken[') && !token.startsWith('ExpoPushToken[')) {
        throw new Error('Invalid Expo push token format');
      }

      await prisma.deviceToken.upsert({
        where: {
          token,
        },
        create: {
          userId,
          token,
          platform,
          enabled: true,
        },
        update: {
          userId,
          platform,
          enabled: true,
        },
      });

      console.log(`Registered push token for user ${userId} on ${platform}`);
    } catch (error) {
      console.error('Error registering device token:', error);
      throw error;
    }
  }

  /**
   * Unregister device token
   */
  async unregisterToken(token: string): Promise<void> {
    try {
      await prisma.deviceToken.update({
        where: { token },
        data: { enabled: false },
      });

      console.log(`Unregistered push token: ${token}`);
    } catch (error) {
      console.error('Error unregistering device token:', error);
      throw error;
    }
  }

  /**
   * Send notification to a specific user
   */
  async sendToUser(userId: string, notification: PushNotification): Promise<void> {
    try {
      // Get all enabled device tokens for user
      const deviceTokens = await prisma.deviceToken.findMany({
        where: {
          userId,
          enabled: true,
        },
      });

      if (deviceTokens.length === 0) {
        console.log(`No device tokens found for user ${userId}`);
        return;
      }

      const messages: ExpoPushMessage[] = deviceTokens.map(device => ({
        to: device.token,
        title: notification.title,
        body: notification.body,
        data: notification.data,
        badge: notification.badge,
        sound: notification.sound || 'default',
        priority: notification.priority || 'high',
      }));

      await this.sendBatch(messages);
    } catch (error) {
      console.error('Error sending notification to user:', error);
      throw error;
    }
  }

  /**
   * Send daily insight notification
   */
  async sendDailyInsight(userId: string): Promise<void> {
    try {
      // Check user preferences
      const preferences = await prisma.notificationPreference.findUnique({
        where: { userId },
      });

      if (!preferences || !preferences.dailyInsight) {
        return;
      }

      // Get user's astrological profile for personalized insight
      const profile = await prisma.userAstrologicalProfile.findUnique({
        where: { userId },
      });

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { username: true },
      });

      const insight = this.generateDailyInsight(profile, user?.username || 'there');

      await this.sendToUser(userId, {
        title: '🌟 Your Daily Cosmic Insight',
        body: insight,
        data: {
          type: 'daily_insight',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Error sending daily insight:', error);
    }
  }

  /**
   * Send favorable period alert
   */
  async sendFavorablePeriodAlert(userId: string, assetSymbol: string): Promise<void> {
    try {
      // Check user preferences
      const preferences = await prisma.notificationPreference.findUnique({
        where: { userId },
      });

      if (!preferences || !preferences.favorablePeriods) {
        return;
      }

      await this.sendToUser(userId, {
        title: '⭐ Favorable Period Alert',
        body: `A highly favorable period is starting for ${assetSymbol}. Your cosmic alignment looks promising!`,
        data: {
          type: 'favorable_period',
          assetSymbol,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Error sending favorable period alert:', error);
    }
  }

  /**
   * Send low credit warning
   */
  async sendLowCreditWarning(userId: string, remainingCredits: number): Promise<void> {
    try {
      // Check user preferences
      const preferences = await prisma.notificationPreference.findUnique({
        where: { userId },
      });

      if (!preferences || !preferences.lowCredit) {
        return;
      }

      await this.sendToUser(userId, {
        title: '⚠️ Low Credit Balance',
        body: `You have ${remainingCredits} credit${remainingCredits !== 1 ? 's' : ''} remaining. Consider upgrading to continue your cosmic journey!`,
        data: {
          type: 'low_credit',
          remainingCredits,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Error sending low credit warning:', error);
    }
  }

  /**
   * Send subscription expiry warning (3 days before)
   */
  async sendSubscriptionExpiryWarning(userId: string, expiresAt: Date): Promise<void> {
    try {
      // Check user preferences
      const preferences = await prisma.notificationPreference.findUnique({
        where: { userId },
      });

      if (!preferences || !preferences.subscriptionExpiry) {
        return;
      }

      const daysRemaining = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

      await this.sendToUser(userId, {
        title: '⏰ Subscription Expiring Soon',
        body: `Your subscription expires in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}. Renew now to keep your cosmic insights flowing!`,
        data: {
          type: 'subscription_expiry',
          expiresAt: expiresAt.toISOString(),
          daysRemaining,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Error sending subscription expiry warning:', error);
    }
  }

  /**
   * Send batch notifications (up to 100 per request)
   */
  async sendBatchNotifications(
    notifications: Array<{ userId: string; notification: PushNotification }>
  ): Promise<void> {
    try {
      const messages: ExpoPushMessage[] = [];

      for (const item of notifications) {
        const deviceTokens = await prisma.deviceToken.findMany({
          where: {
            userId: item.userId,
            enabled: true,
          },
        });

        for (const device of deviceTokens) {
          messages.push({
            to: device.token,
            title: item.notification.title,
            body: item.notification.body,
            data: item.notification.data,
            badge: item.notification.badge,
            sound: item.notification.sound || 'default',
            priority: item.notification.priority || 'default',
          });
        }
      }

      if (messages.length === 0) {
        console.log('No messages to send in batch');
        return;
      }

      // Send in batches of 100
      for (let i = 0; i < messages.length; i += this.BATCH_SIZE) {
        const batch = messages.slice(i, i + this.BATCH_SIZE);
        await this.sendBatch(batch);
      }
    } catch (error) {
      console.error('Error sending batch notifications:', error);
      throw error;
    }
  }

  /**
   * Send a batch of messages to Expo Push Service
   */
  private async sendBatch(messages: ExpoPushMessage[]): Promise<void> {
    try {
      const response = await axios.post<{ data: ExpoPushTicket[] }>(
        this.EXPO_PUSH_URL,
        messages,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Accept-Encoding': 'gzip, deflate',
          },
        }
      );

      // Handle invalid tokens
      const tickets = response.data.data;
      for (let i = 0; i < tickets.length; i++) {
        const ticket = tickets[i];
        if (ticket.status === 'error') {
          const message = messages[i];
          console.error(`Push notification error for ${message.to}:`, ticket.message);

          // Disable invalid tokens
          if (ticket.details?.error === 'DeviceNotRegistered') {
            await this.unregisterToken(message.to);
          }
        }
      }

      console.log(`Sent batch of ${messages.length} push notifications`);
    } catch (error) {
      console.error('Error sending push notification batch:', error);
      throw error;
    }
  }

  /**
   * Generate personalized daily insight based on user's astrological profile
   */
  private generateDailyInsight(profile: any, username: string): string {
    const insights = [
      `Good morning ${username}! Today's cosmic energies favor new beginnings and bold moves.`,
      `The stars align favorably for you today, ${username}. Trust your intuition in financial matters.`,
      `${username}, planetary movements suggest this is a great day for strategic planning.`,
      `Today brings opportunities for growth, ${username}. Stay alert for cosmic signs!`,
      `The universe has positive energy in store for you today, ${username}. Make the most of it!`,
    ];

    // If we have a profile, we could make this more personalized
    if (profile?.sunSign) {
      return `${username}, as a ${profile.sunSign}, today's cosmic alignment supports your natural strengths. Great day for important decisions!`;
    }

    return insights[Math.floor(Math.random() * insights.length)];
  }

  /**
   * Get all device tokens for a user
   */
  async getUserTokens(userId: string): Promise<DeviceToken[]> {
    const tokens = await prisma.deviceToken.findMany({
      where: { userId },
    });

    return tokens.map(t => ({
      userId: t.userId,
      token: t.token,
      platform: t.platform as 'ios' | 'android',
      enabled: t.enabled,
    }));
  }

  /**
   * Test send notification (for debugging)
   */
  async testNotification(userId: string): Promise<void> {
    await this.sendToUser(userId, {
      title: '🧪 Test Notification',
      body: 'This is a test notification from Astro Prediction Platform',
      data: {
        type: 'test',
        timestamp: new Date().toISOString(),
      },
    });
  }
}

export default PushNotificationService;

/**
 * Credits Service
 * Manages user credit balance and transactions
 */

import { PrismaClient } from '@astro/database';

const prisma = new PrismaClient();

export interface CreditCost {
  macro: number;
  timing: number;
  divination: number;
}

export const CREDIT_COSTS: CreditCost = {
  macro: 1,      // Macro prediction: 1 credit
  timing: 2,     // Timing prediction: 2 credits
  divination: 1, // Divination: 1 credit
};

export class CreditsService {
  /**
   * Get user's current credit balance
   */
  async getBalance(userId: string): Promise<number> {
    const credits = await prisma.userCredits.findUnique({
      where: { userId },
    });

    return credits?.creditsBalance || 0;
  }

  /**
   * Check if user has sufficient credits
   */
  async hasSufficientCredits(userId: string, amount: number): Promise<boolean> {
    const balance = await this.getBalance(userId);
    return balance >= amount;
  }

  /**
   * Deduct credits from user account
   */
  async deductCredits(
    userId: string,
    amount: number,
    action: string,
    predictionId?: string
  ): Promise<{ success: boolean; newBalance: number; error?: string }> {
    try {
      // Check current balance
      const hasSufficient = await this.hasSufficientCredits(userId, amount);

      if (!hasSufficient) {
        const currentBalance = await this.getBalance(userId);
        return {
          success: false,
          newBalance: currentBalance,
          error: `Insufficient credits. Required: ${amount}, Available: ${currentBalance}`,
        };
      }

      // Deduct credits and update usage
      const updated = await prisma.userCredits.update({
        where: { userId },
        data: {
          creditsBalance: {
            decrement: amount,
          },
          creditsUsedLifetime: {
            increment: amount,
          },
        },
      });

      // Log the usage
      await prisma.usageLog.create({
        data: {
          userId,
          predictionId,
          action,
          creditsUsed: amount,
          creditsRemaining: updated.creditsBalance,
          platform: 'web',
        },
      });

      return {
        success: true,
        newBalance: updated.creditsBalance,
      };
    } catch (error) {
      console.error('Error deducting credits:', error);
      return {
        success: false,
        newBalance: 0,
        error: 'Failed to deduct credits',
      };
    }
  }

  /**
   * Add credits to user account (for purchases or rewards)
   */
  async addCredits(
    userId: string,
    amount: number,
    source: 'purchase' | 'reward' | 'refund' | 'admin'
  ): Promise<{ success: boolean; newBalance: number }> {
    try {
      const updated = await prisma.userCredits.upsert({
        where: { userId },
        create: {
          userId,
          creditsBalance: amount,
          creditsPurchasedLifetime: source === 'purchase' ? amount : 0,
          lastCreditPurchaseAt: source === 'purchase' ? new Date() : null,
        },
        update: {
          creditsBalance: {
            increment: amount,
          },
          creditsPurchasedLifetime: source === 'purchase' ? {
            increment: amount,
          } : undefined,
          lastCreditPurchaseAt: source === 'purchase' ? new Date() : undefined,
        },
      });

      // Log the credit addition
      await prisma.usageLog.create({
        data: {
          userId,
          action: `credits_added_${source}`,
          creditsUsed: -amount, // Negative to indicate addition
          creditsRemaining: updated.creditsBalance,
          platform: 'web',
        },
      });

      return {
        success: true,
        newBalance: updated.creditsBalance,
      };
    } catch (error) {
      console.error('Error adding credits:', error);
      return {
        success: false,
        newBalance: 0,
      };
    }
  }

  /**
   * Initialize credits for new user (welcome bonus)
   */
  async initializeUserCredits(userId: string, welcomeBonus: number = 5): Promise<void> {
    try {
      await prisma.userCredits.upsert({
        where: { userId },
        create: {
          userId,
          creditsBalance: welcomeBonus,
          creditsUsedLifetime: 0,
          creditsPurchasedLifetime: 0,
        },
        update: {}, // Don't update if already exists
      });
    } catch (error) {
      console.error('Error initializing user credits:', error);
    }
  }

  /**
   * Get credit cost for prediction type
   */
  getCreditCost(predictionType: 'macro' | 'timing' | 'divination'): number {
    return CREDIT_COSTS[predictionType];
  }

  /**
   * Get user's credit usage statistics
   */
  async getUserStats(userId: string): Promise<{
    currentBalance: number;
    lifetimeUsed: number;
    lifetimePurchased: number;
    lastPurchase: Date | null;
  }> {
    const credits = await prisma.userCredits.findUnique({
      where: { userId },
    });

    return {
      currentBalance: credits?.creditsBalance || 0,
      lifetimeUsed: credits?.creditsUsedLifetime || 0,
      lifetimePurchased: credits?.creditsPurchasedLifetime || 0,
      lastPurchase: credits?.lastCreditPurchaseAt || null,
    };
  }

  /**
   * Get recent usage logs for user
   */
  async getRecentUsage(userId: string, limit: number = 10): Promise<any[]> {
    return await prisma.usageLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        prediction: {
          select: {
            predictionType: true,
            targetAssetId: true,
          },
        },
      },
    });
  }

  /**
   * Process refund for a prediction
   */
  async refundPrediction(predictionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const prediction = await prisma.prediction.findUnique({
        where: { id: predictionId },
      });

      if (!prediction || !prediction.userId) {
        return { success: false, error: 'Prediction not found' };
      }

      if (prediction.status !== 'completed' && prediction.status !== 'failed') {
        return { success: false, error: 'Cannot refund prediction in current status' };
      }

      // Add credits back
      const result = await this.addCredits(
        prediction.userId,
        prediction.creditsUsed,
        'refund'
      );

      if (result.success) {
        // Update prediction status
        await prisma.prediction.update({
          where: { id: predictionId },
          data: {
            status: 'refunded',
          },
        });
      }

      return result;
    } catch (error) {
      console.error('Error processing refund:', error);
      return { success: false, error: 'Failed to process refund' };
    }
  }
}

export default CreditsService;

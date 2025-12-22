/**
 * Analytics Service
 * Comprehensive platform analytics and insights
 */

import { PrismaClient } from '@astro/database';
import { AICostTrackerService } from './monitoring/ai-cost-tracker.service';
import { PredictionCacheService } from './caching/prediction-cache.service';
import { FeedbackService } from './feedback.service';

const prisma = new PrismaClient();

export interface OverviewStats {
  totalUsers: number;
  activeUsers: number; // last 7 days
  totalPredictions: number;
  totalRevenue: number;
  aiCosts: number;
  profit: number;
  cacheHitRate: number;
}

export interface UserAnalytics {
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  retentionRate: number; // D7 retention
  avgPredictionsPerUser: number;
  topUsers: Array<{
    userId: string;
    email: string | null;
    username: string | null;
    predictionCount: number;
    totalSpent: number;
  }>;
}

export interface PredictionAnalytics {
  byType: Record<string, number>;
  successRate: number;
  avgGenerationTime: number;
  cacheHitRate: number;
  totalPredictions: number;
  byStatus: Record<string, number>;
}

export interface RevenueAnalytics {
  totalRevenue: number;
  byPackage: Record<string, { count: number; revenue: number }>;
  byBlockchain: Record<string, { count: number; revenue: number }>;
  avgRevenuePerUser: number;
  avgRevenuePerTransaction: number;
  revenueGrowth: number; // percentage vs previous period
}

export class AnalyticsService {
  private aiCostTracker: AICostTrackerService;
  private predictionCache: PredictionCacheService;
  private feedbackService: FeedbackService;

  constructor(
    aiCostTracker: AICostTrackerService,
    predictionCache: PredictionCacheService,
    feedbackService: FeedbackService
  ) {
    this.aiCostTracker = aiCostTracker;
    this.predictionCache = predictionCache;
    this.feedbackService = feedbackService;
  }

  /**
   * Get overview dashboard stats
   */
  async getOverview(): Promise<OverviewStats> {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Total users
    const totalUsers = await prisma.user.count();

    // Active users (last 7 days)
    const activeUsers = await prisma.user.count({
      where: {
        lastLoginAt: { gte: sevenDaysAgo },
      },
    });

    // Total predictions
    const totalPredictions = await prisma.prediction.count();

    // Total revenue (this month)
    const transactions = await prisma.transaction.findMany({
      where: {
        status: 'completed',
        createdAt: { gte: startOfMonth },
      },
    });

    const totalRevenue = transactions.reduce(
      (sum, t) => sum + Number(t.usdValue || 0),
      0
    );

    // AI costs (this month)
    const aiCostAnalysis = await this.aiCostTracker.getCosts(startOfMonth, now);
    const aiCosts = aiCostAnalysis.totalCost;

    // Profit
    const profit = totalRevenue - aiCosts;

    // Cache hit rate
    const cacheStats = await this.predictionCache.getStats();
    const cacheHitRate = cacheStats.hitRate;

    return {
      totalUsers,
      activeUsers,
      totalPredictions,
      totalRevenue,
      aiCosts,
      profit,
      cacheHitRate,
    };
  }

  /**
   * Get user analytics
   */
  async getUserAnalytics(): Promise<UserAnalytics> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // New users today
    const newUsersToday = await prisma.user.count({
      where: { createdAt: { gte: today } },
    });

    // New users this week
    const newUsersThisWeek = await prisma.user.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    });

    // New users this month
    const newUsersThisMonth = await prisma.user.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    });

    // D7 retention rate
    const usersCreated7DaysAgo = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(sevenDaysAgo.getTime() - 24 * 60 * 60 * 1000),
          lt: sevenDaysAgo,
        },
      },
    });

    const usersRetained = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(sevenDaysAgo.getTime() - 24 * 60 * 60 * 1000),
          lt: sevenDaysAgo,
        },
        lastLoginAt: { gte: sevenDaysAgo },
      },
    });

    const retentionRate = usersCreated7DaysAgo > 0
      ? (usersRetained / usersCreated7DaysAgo) * 100
      : 0;

    // Average predictions per user
    const totalUsers = await prisma.user.count();
    const totalPredictions = await prisma.prediction.count();
    const avgPredictionsPerUser = totalUsers > 0
      ? totalPredictions / totalUsers
      : 0;

    // Top users by prediction count
    const topUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        predictions: {
          select: {
            id: true,
          },
        },
        transactions: {
          where: {
            status: 'completed',
          },
          select: {
            usdValue: true,
          },
        },
      },
      orderBy: {
        predictions: {
          _count: 'desc',
        },
      },
      take: 10,
    });

    const topUsersFormatted = topUsers.map(user => ({
      userId: user.id,
      email: user.email,
      username: user.username,
      predictionCount: user.predictions.length,
      totalSpent: user.transactions.reduce(
        (sum, t) => sum + Number(t.usdValue || 0),
        0
      ),
    }));

    return {
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      retentionRate,
      avgPredictionsPerUser,
      topUsers: topUsersFormatted,
    };
  }

  /**
   * Get prediction analytics
   */
  async getPredictionAnalytics(): Promise<PredictionAnalytics> {
    const predictions = await prisma.prediction.findMany({
      select: {
        predictionType: true,
        status: true,
        processingStartedAt: true,
        completedAt: true,
      },
    });

    const totalPredictions = predictions.length;

    // Group by type
    const byType: Record<string, number> = {};
    predictions.forEach(p => {
      byType[p.predictionType] = (byType[p.predictionType] || 0) + 1;
    });

    // Group by status
    const byStatus: Record<string, number> = {};
    predictions.forEach(p => {
      byStatus[p.status] = (byStatus[p.status] || 0) + 1;
    });

    // Success rate (completed / total)
    const completed = byStatus.completed || 0;
    const successRate = totalPredictions > 0
      ? (completed / totalPredictions) * 100
      : 0;

    // Average generation time
    const completedPredictions = predictions.filter(
      p => p.processingStartedAt && p.completedAt
    );

    let avgGenerationTime = 0;
    if (completedPredictions.length > 0) {
      const totalTime = completedPredictions.reduce((sum, p) => {
        const start = p.processingStartedAt!.getTime();
        const end = p.completedAt!.getTime();
        return sum + (end - start);
      }, 0);

      avgGenerationTime = totalTime / completedPredictions.length;
    }

    // Cache hit rate
    const cacheStats = await this.predictionCache.getStats();
    const cacheHitRate = cacheStats.hitRate;

    return {
      byType,
      successRate,
      avgGenerationTime,
      cacheHitRate,
      totalPredictions,
      byStatus,
    };
  }

  /**
   * Get revenue analytics
   */
  async getRevenueAnalytics(
    startDate?: Date,
    endDate?: Date
  ): Promise<RevenueAnalytics> {
    const where: any = { status: 'completed' };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const transactions = await prisma.transaction.findMany({ where });

    const totalRevenue = transactions.reduce(
      (sum, t) => sum + Number(t.usdValue || 0),
      0
    );

    // Group by package (based on credits granted)
    const byPackage: Record<string, { count: number; revenue: number }> = {};
    transactions.forEach(t => {
      const credits = t.creditsGranted || 0;
      let packageName = 'other';

      if (credits === 10) packageName = 'starter';
      else if (credits === 50) packageName = 'pro';
      else if (credits === 200) packageName = 'expert';

      if (!byPackage[packageName]) {
        byPackage[packageName] = { count: 0, revenue: 0 };
      }

      byPackage[packageName].count++;
      byPackage[packageName].revenue += Number(t.usdValue || 0);
    });

    // Group by blockchain
    const byBlockchain: Record<string, { count: number; revenue: number }> = {};
    transactions.forEach(t => {
      const blockchain = t.blockchain || 'unknown';

      if (!byBlockchain[blockchain]) {
        byBlockchain[blockchain] = { count: 0, revenue: 0 };
      }

      byBlockchain[blockchain].count++;
      byBlockchain[blockchain].revenue += Number(t.usdValue || 0);
    });

    // Average revenue per user
    const uniqueUsers = new Set(
      transactions.map(t => t.userId).filter(id => id !== null)
    );
    const avgRevenuePerUser = uniqueUsers.size > 0
      ? totalRevenue / uniqueUsers.size
      : 0;

    // Average revenue per transaction
    const avgRevenuePerTransaction = transactions.length > 0
      ? totalRevenue / transactions.length
      : 0;

    // Revenue growth (compare to previous period)
    let revenueGrowth = 0;
    if (startDate && endDate) {
      const periodLength = endDate.getTime() - startDate.getTime();
      const prevStart = new Date(startDate.getTime() - periodLength);
      const prevEnd = startDate;

      const prevTransactions = await prisma.transaction.findMany({
        where: {
          status: 'completed',
          createdAt: {
            gte: prevStart,
            lt: prevEnd,
          },
        },
      });

      const prevRevenue = prevTransactions.reduce(
        (sum, t) => sum + Number(t.usdValue || 0),
        0
      );

      if (prevRevenue > 0) {
        revenueGrowth = ((totalRevenue - prevRevenue) / prevRevenue) * 100;
      }
    }

    return {
      totalRevenue,
      byPackage,
      byBlockchain,
      avgRevenuePerUser,
      avgRevenuePerTransaction,
      revenueGrowth,
    };
  }

  /**
   * Get cohort analysis
   */
  async getCohortAnalysis(cohortWeeks: number = 8): Promise<Array<{
    cohortWeek: string;
    userCount: number;
    retentionByWeek: number[];
  }>> {
    const now = new Date();
    const cohorts: Array<{
      cohortWeek: string;
      userCount: number;
      retentionByWeek: number[];
    }> = [];

    for (let i = cohortWeeks - 1; i >= 0; i--) {
      const cohortStart = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const cohortEnd = new Date(cohortStart.getTime() + 7 * 24 * 60 * 60 * 1000);

      // Get users in this cohort
      const cohortUsers = await prisma.user.findMany({
        where: {
          createdAt: {
            gte: cohortStart,
            lt: cohortEnd,
          },
        },
        select: {
          id: true,
          createdAt: true,
          lastLoginAt: true,
        },
      });

      const userCount = cohortUsers.length;
      const retentionByWeek: number[] = [];

      // Calculate retention for each subsequent week
      for (let week = 0; week < Math.min(8, cohortWeeks - i); week++) {
        const weekStart = new Date(cohortEnd.getTime() + week * 7 * 24 * 60 * 60 * 1000);
        const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

        const retainedUsers = cohortUsers.filter(user =>
          user.lastLoginAt &&
          user.lastLoginAt >= weekStart &&
          user.lastLoginAt < weekEnd
        );

        const retentionRate = userCount > 0
          ? (retainedUsers.length / userCount) * 100
          : 0;

        retentionByWeek.push(retentionRate);
      }

      cohorts.push({
        cohortWeek: cohortStart.toISOString().split('T')[0],
        userCount,
        retentionByWeek,
      });
    }

    return cohorts;
  }

  /**
   * Get funnel analytics
   */
  async getFunnelAnalytics(): Promise<{
    registered: number;
    completedProfile: number;
    generatedPrediction: number;
    providedFeedback: number;
    madePayment: number;
    conversionRate: number;
  }> {
    const registered = await prisma.user.count();

    const completedProfile = await prisma.user.count({
      where: {
        birthDate: { not: null },
        birthTime: { not: null },
      },
    });

    const generatedPrediction = await prisma.user.count({
      where: {
        predictions: {
          some: {},
        },
      },
    });

    const providedFeedback = await prisma.user.count({
      where: {
        feedbacks: {
          some: {},
        },
      },
    });

    const madePayment = await prisma.user.count({
      where: {
        transactions: {
          some: {
            status: 'completed',
          },
        },
      },
    });

    const conversionRate = registered > 0
      ? (madePayment / registered) * 100
      : 0;

    return {
      registered,
      completedProfile,
      generatedPrediction,
      providedFeedback,
      madePayment,
      conversionRate,
    };
  }
}

export default AnalyticsService;

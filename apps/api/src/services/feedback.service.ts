/**
 * Feedback Service
 * Collects and analyzes user feedback on predictions
 */

import { PrismaClient } from '@astro/database';

const prisma = new PrismaClient();

export interface PredictionFeedback {
  id: string;
  userId: string;
  predictionId: string;
  rating: number; // 1-5 stars
  helpful: boolean;
  cameTrue?: boolean;
  comment?: string;
  createdAt: Date;
}

export interface FeedbackStats {
  avgRating: number;
  totalFeedback: number;
  helpfulPercentage: number;
  accuracyPercentage: number;
  byPredictionType: Record<string, { avgRating: number; count: number }>;
  ratingDistribution: Record<number, number>;
}

export class FeedbackService {
  /**
   * Submit feedback for a prediction
   */
  async submitFeedback(feedback: {
    userId: string;
    predictionId: string;
    rating: number;
    helpful: boolean;
    cameTrue?: boolean;
    comment?: string;
  }): Promise<void> {
    // Validate rating
    if (feedback.rating < 1 || feedback.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Check if prediction exists
    const prediction = await prisma.prediction.findUnique({
      where: { id: feedback.predictionId },
    });

    if (!prediction) {
      throw new Error('Prediction not found');
    }

    // Check if user owns the prediction
    if (prediction.userId !== feedback.userId) {
      throw new Error('Cannot provide feedback on another user\'s prediction');
    }

    // Upsert feedback (create or update if exists)
    await prisma.predictionFeedback.upsert({
      where: {
        userId_predictionId: {
          userId: feedback.userId,
          predictionId: feedback.predictionId,
        },
      },
      create: {
        userId: feedback.userId,
        predictionId: feedback.predictionId,
        rating: feedback.rating,
        helpful: feedback.helpful,
        cameTrue: feedback.cameTrue,
        comment: feedback.comment,
      },
      update: {
        rating: feedback.rating,
        helpful: feedback.helpful,
        cameTrue: feedback.cameTrue,
        comment: feedback.comment,
      },
    });

    console.log(`Feedback submitted: Prediction ${feedback.predictionId} - Rating: ${feedback.rating}/5`);
  }

  /**
   * Get feedback for a specific prediction
   */
  async getPredictionFeedback(predictionId: string): Promise<PredictionFeedback[]> {
    const feedbacks = await prisma.predictionFeedback.findMany({
      where: { predictionId },
      orderBy: { createdAt: 'desc' },
    });

    return feedbacks as PredictionFeedback[];
  }

  /**
   * Get user's feedback history
   */
  async getUserFeedback(userId: string, limit: number = 50): Promise<PredictionFeedback[]> {
    const feedbacks = await prisma.predictionFeedback.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return feedbacks as PredictionFeedback[];
  }

  /**
   * Get comprehensive feedback statistics
   */
  async getStats(filters?: {
    startDate?: Date;
    endDate?: Date;
    predictionType?: string;
  }): Promise<FeedbackStats> {
    const where: any = {};

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    const feedbacks = await prisma.predictionFeedback.findMany({
      where,
      include: {
        prediction: {
          select: {
            predictionType: true,
          },
        },
      },
    });

    const totalFeedback = feedbacks.length;

    if (totalFeedback === 0) {
      return {
        avgRating: 0,
        totalFeedback: 0,
        helpfulPercentage: 0,
        accuracyPercentage: 0,
        byPredictionType: {},
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    // Calculate average rating
    const totalRating = feedbacks.reduce((sum, f) => sum + f.rating, 0);
    const avgRating = totalRating / totalFeedback;

    // Calculate helpful percentage
    const helpfulCount = feedbacks.filter(f => f.helpful).length;
    const helpfulPercentage = (helpfulCount / totalFeedback) * 100;

    // Calculate accuracy percentage (only for feedbacks with cameTrue data)
    const withAccuracyData = feedbacks.filter(f => f.cameTrue !== null);
    const cameTrue = withAccuracyData.filter(f => f.cameTrue === true).length;
    const accuracyPercentage = withAccuracyData.length > 0
      ? (cameTrue / withAccuracyData.length) * 100
      : 0;

    // Group by prediction type
    const byPredictionType: Record<string, { avgRating: number; count: number }> = {};
    const predictionTypeMap = new Map<string, number[]>();

    feedbacks.forEach(f => {
      const type = f.prediction.predictionType;
      const ratings = predictionTypeMap.get(type) || [];
      ratings.push(f.rating);
      predictionTypeMap.set(type, ratings);
    });

    predictionTypeMap.forEach((ratings, type) => {
      const sum = ratings.reduce((a, b) => a + b, 0);
      byPredictionType[type] = {
        avgRating: sum / ratings.length,
        count: ratings.length,
      };
    });

    // Rating distribution
    const ratingDistribution: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    feedbacks.forEach(f => {
      ratingDistribution[f.rating]++;
    });

    return {
      avgRating,
      totalFeedback,
      helpfulPercentage,
      accuracyPercentage,
      byPredictionType,
      ratingDistribution,
    };
  }

  /**
   * Get best rated predictions
   */
  async getBestRatedPredictions(limit: number = 10): Promise<Array<{
    predictionId: string;
    predictionType: string;
    avgRating: number;
    feedbackCount: number;
  }>> {
    const feedbacks = await prisma.predictionFeedback.findMany({
      include: {
        prediction: {
          select: {
            id: true,
            predictionType: true,
          },
        },
      },
    });

    // Group by prediction
    const predictionMap = new Map<string, {
      predictionType: string;
      ratings: number[];
    }>();

    feedbacks.forEach(f => {
      const existing = predictionMap.get(f.predictionId);
      if (!existing) {
        predictionMap.set(f.predictionId, {
          predictionType: f.prediction.predictionType,
          ratings: [f.rating],
        });
      } else {
        existing.ratings.push(f.rating);
      }
    });

    // Calculate averages
    const predictions = Array.from(predictionMap.entries())
      .map(([predictionId, data]) => ({
        predictionId,
        predictionType: data.predictionType,
        avgRating: data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length,
        feedbackCount: data.ratings.length,
      }))
      .filter(p => p.feedbackCount >= 3) // Only predictions with at least 3 ratings
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, limit);

    return predictions;
  }

  /**
   * Get worst rated predictions
   */
  async getWorstRatedPredictions(limit: number = 10): Promise<Array<{
    predictionId: string;
    predictionType: string;
    avgRating: number;
    feedbackCount: number;
  }>> {
    const best = await this.getBestRatedPredictions(1000);
    return best.reverse().slice(0, limit);
  }

  /**
   * Get feedback trends (daily buckets)
   */
  async getFeedbackTrends(days: number = 30): Promise<Array<{
    date: string;
    avgRating: number;
    count: number;
    helpfulCount: number;
  }>> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const feedbacks = await prisma.predictionFeedback.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by date
    const dailyMap = new Map<string, {
      ratings: number[];
      helpfulCount: number;
    }>();

    feedbacks.forEach(f => {
      const date = f.createdAt.toISOString().split('T')[0];
      const stats = dailyMap.get(date) || {
        ratings: [],
        helpfulCount: 0,
      };

      stats.ratings.push(f.rating);
      if (f.helpful) stats.helpfulCount++;
      dailyMap.set(date, stats);
    });

    return Array.from(dailyMap.entries())
      .map(([date, stats]) => ({
        date,
        avgRating: stats.ratings.reduce((a, b) => a + b, 0) / stats.ratings.length,
        count: stats.ratings.length,
        helpfulCount: stats.helpfulCount,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get predictions needing attention (low ratings)
   */
  async getPredictionsNeedingAttention(threshold: number = 2.5): Promise<Array<{
    predictionId: string;
    predictionType: string;
    avgRating: number;
    feedbackCount: number;
    issues: string[];
  }>> {
    const feedbacks = await prisma.predictionFeedback.findMany({
      include: {
        prediction: {
          select: {
            id: true,
            predictionType: true,
          },
        },
      },
    });

    // Group by prediction
    const predictionMap = new Map<string, {
      predictionType: string;
      ratings: number[];
      helpful: boolean[];
      cameTrue: (boolean | null)[];
      comments: string[];
    }>();

    feedbacks.forEach(f => {
      const existing = predictionMap.get(f.predictionId);
      if (!existing) {
        predictionMap.set(f.predictionId, {
          predictionType: f.prediction.predictionType,
          ratings: [f.rating],
          helpful: [f.helpful],
          cameTrue: [f.cameTrue],
          comments: f.comment ? [f.comment] : [],
        });
      } else {
        existing.ratings.push(f.rating);
        existing.helpful.push(f.helpful);
        existing.cameTrue.push(f.cameTrue);
        if (f.comment) existing.comments.push(f.comment);
      }
    });

    // Find low-rated predictions
    const problematic = Array.from(predictionMap.entries())
      .map(([predictionId, data]) => {
        const avgRating = data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length;
        const issues: string[] = [];

        if (avgRating < threshold) {
          issues.push(`Low average rating: ${avgRating.toFixed(1)}/5`);
        }

        const helpfulRate = data.helpful.filter(h => h).length / data.helpful.length;
        if (helpfulRate < 0.5) {
          issues.push(`Low helpful rate: ${(helpfulRate * 100).toFixed(0)}%`);
        }

        const accuracyData = data.cameTrue.filter(c => c !== null);
        if (accuracyData.length > 0) {
          const accuracyRate = accuracyData.filter(c => c === true).length / accuracyData.length;
          if (accuracyRate < 0.5) {
            issues.push(`Low accuracy: ${(accuracyRate * 100).toFixed(0)}%`);
          }
        }

        return {
          predictionId,
          predictionType: data.predictionType,
          avgRating,
          feedbackCount: data.ratings.length,
          issues,
        };
      })
      .filter(p => p.issues.length > 0)
      .sort((a, b) => a.avgRating - b.avgRating);

    return problematic;
  }
}

export default FeedbackService;

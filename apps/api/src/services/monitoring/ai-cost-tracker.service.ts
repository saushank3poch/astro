/**
 * AI Cost Tracker Service
 * Tracks AI API usage and costs for budget management
 */

import { PrismaClient } from '@astro/database';

const prisma = new PrismaClient();

export interface AIUsageLog {
  id: string;
  userId?: string;
  predictionId: string;
  predictionType: 'macro' | 'timing' | 'divination';
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number;
  latency: number;
  createdAt: Date;
}

export interface CostAnalysis {
  totalCost: number;
  byPredictionType: Record<string, number>;
  byModel: Record<string, number>;
  totalTokens: number;
}

export interface BudgetStatus {
  exceeded: boolean;
  currentSpend: number;
  budget: number;
  percentUsed: number;
}

/**
 * AI API Pricing (as of 2024)
 */
const PRICING = {
  'claude-3.5-sonnet': {
    input: 3 / 1_000_000,  // $3 per million tokens
    output: 15 / 1_000_000, // $15 per million tokens
  },
  'claude-3-5-sonnet-20241022': {
    input: 3 / 1_000_000,
    output: 15 / 1_000_000,
  },
  'gpt-4': {
    input: 30 / 1_000_000,  // $30 per million tokens
    output: 60 / 1_000_000, // $60 per million tokens
  },
  'gpt-4-turbo': {
    input: 10 / 1_000_000,
    output: 30 / 1_000_000,
  },
};

export class AICostTrackerService {
  private monthlyBudget: number;

  constructor(monthlyBudget: number = 1000) {
    this.monthlyBudget = monthlyBudget;
  }

  /**
   * Calculate cost for token usage
   */
  calculateCost(model: string, inputTokens: number, outputTokens: number): number {
    const pricing = PRICING[model as keyof typeof PRICING];
    if (!pricing) {
      console.warn(`Unknown model for pricing: ${model}, using default rates`);
      return (inputTokens * 0.00001) + (outputTokens * 0.00003);
    }

    return (inputTokens * pricing.input) + (outputTokens * pricing.output);
  }

  /**
   * Log AI usage
   */
  async logUsage(data: {
    userId?: string;
    predictionId: string;
    predictionType: 'macro' | 'timing' | 'divination';
    model: string;
    inputTokens: number;
    outputTokens: number;
    latency: number;
  }): Promise<void> {
    const totalTokens = data.inputTokens + data.outputTokens;
    const estimatedCost = this.calculateCost(data.model, data.inputTokens, data.outputTokens);

    await prisma.aIUsageLog.create({
      data: {
        userId: data.userId,
        predictionId: data.predictionId,
        predictionType: data.predictionType,
        model: data.model,
        inputTokens: data.inputTokens,
        outputTokens: data.outputTokens,
        totalTokens,
        estimatedCost,
        latency: data.latency,
      },
    });

    console.log(`AI Usage: ${data.model} - ${totalTokens} tokens - $${estimatedCost.toFixed(6)}`);
  }

  /**
   * Get costs for date range
   */
  async getCosts(startDate: Date, endDate: Date): Promise<CostAnalysis> {
    const logs = await prisma.aIUsageLog.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalCost = logs.reduce((sum, log) => sum + Number(log.estimatedCost), 0);
    const totalTokens = logs.reduce((sum, log) => sum + log.totalTokens, 0);

    // Group by prediction type
    const byPredictionType: Record<string, number> = {};
    logs.forEach(log => {
      byPredictionType[log.predictionType] = (byPredictionType[log.predictionType] || 0) + Number(log.estimatedCost);
    });

    // Group by model
    const byModel: Record<string, number> = {};
    logs.forEach(log => {
      byModel[log.model] = (byModel[log.model] || 0) + Number(log.estimatedCost);
    });

    return {
      totalCost,
      byPredictionType,
      byModel,
      totalTokens,
    };
  }

  /**
   * Get cost per user
   */
  async getUserCosts(userId: string, startDate?: Date, endDate?: Date): Promise<number> {
    const where: any = { userId };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const logs = await prisma.aIUsageLog.findMany({ where });
    return logs.reduce((sum, log) => sum + Number(log.estimatedCost), 0);
  }

  /**
   * Check if costs exceed budget
   */
  async checkBudget(): Promise<BudgetStatus> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const analysis = await this.getCosts(startOfMonth, endOfMonth);
    const currentSpend = analysis.totalCost;
    const percentUsed = (currentSpend / this.monthlyBudget) * 100;

    return {
      exceeded: currentSpend > this.monthlyBudget,
      currentSpend,
      budget: this.monthlyBudget,
      percentUsed,
    };
  }

  /**
   * Get usage statistics
   */
  async getUsageStats(startDate: Date, endDate: Date): Promise<{
    totalCalls: number;
    avgTokensPerCall: number;
    avgCostPerCall: number;
    avgLatency: number;
    mostUsedModel: string;
    costTrend: Array<{ date: string; cost: number }>;
  }> {
    const logs = await prisma.aIUsageLog.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const totalCalls = logs.length;
    if (totalCalls === 0) {
      return {
        totalCalls: 0,
        avgTokensPerCall: 0,
        avgCostPerCall: 0,
        avgLatency: 0,
        mostUsedModel: 'none',
        costTrend: [],
      };
    }

    const totalTokens = logs.reduce((sum, log) => sum + log.totalTokens, 0);
    const totalCost = logs.reduce((sum, log) => sum + Number(log.estimatedCost), 0);
    const totalLatency = logs.reduce((sum, log) => sum + log.latency, 0);

    // Find most used model
    const modelCounts: Record<string, number> = {};
    logs.forEach(log => {
      modelCounts[log.model] = (modelCounts[log.model] || 0) + 1;
    });
    const mostUsedModel = Object.entries(modelCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown';

    // Calculate daily cost trend
    const dailyCosts: Record<string, number> = {};
    logs.forEach(log => {
      const date = log.createdAt.toISOString().split('T')[0];
      dailyCosts[date] = (dailyCosts[date] || 0) + Number(log.estimatedCost);
    });

    const costTrend = Object.entries(dailyCosts).map(([date, cost]) => ({
      date,
      cost,
    }));

    return {
      totalCalls,
      avgTokensPerCall: totalTokens / totalCalls,
      avgCostPerCall: totalCost / totalCalls,
      avgLatency: totalLatency / totalCalls,
      mostUsedModel,
      costTrend,
    };
  }

  /**
   * Get top expensive predictions
   */
  async getTopExpensivePredictions(limit: number = 10): Promise<Array<{
    predictionId: string;
    predictionType: string;
    model: string;
    totalCost: number;
    totalTokens: number;
    createdAt: Date;
  }>> {
    const logs = await prisma.aIUsageLog.findMany({
      orderBy: { estimatedCost: 'desc' },
      take: limit,
    });

    return logs.map(log => ({
      predictionId: log.predictionId,
      predictionType: log.predictionType,
      model: log.model,
      totalCost: Number(log.estimatedCost),
      totalTokens: log.totalTokens,
      createdAt: log.createdAt,
    }));
  }
}

export default AICostTrackerService;

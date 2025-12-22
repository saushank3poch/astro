/**
 * Predictions Service
 * Orchestrates prediction generation, AI enhancement, and database storage
 */

import { PrismaClient } from '@astro/database';
import {
  generateMacroPrediction,
  MacroPredictionInput,
  MacroPredictionOutput,
  generateTimingPrediction,
  TimingPredictionInput,
  TimingPredictionOutput,
  generateTarotPrediction,
  generateIChingPrediction,
  TarotPredictionInput,
  TarotPredictionOutput,
  IChingPredictionInput,
  IChingPredictionOutput,
  CompleteBirthChart,
} from '@astro/astro-core';
import { AIAgentService, PredictionType } from './ai-agent.service';
import CreditsService from './credits.service';
import { PredictionCacheService } from './caching/prediction-cache.service';

const prisma = new PrismaClient();

export interface GenerateMacroRequest {
  userId?: string;
  year: number;
  assetClasses: string[];
  method: 'chinese' | 'western' | 'combined';
  enhanceWithAI?: boolean;
}

export interface GenerateTimingRequest {
  userId?: string;
  assetId: string;
  targetDate?: Date;
  timeframe: 'short_term' | 'medium_term' | 'long_term';
  enhanceWithAI?: boolean;
}

export interface GenerateDivinationRequest {
  userId?: string;
  question: string;
  method: 'tarot' | 'iching';
  spread?: 'three_card' | 'celtic_cross'; // For tarot
  context?: any;
  enhanceWithAI?: boolean;
}

export class PredictionsService {
  private aiService: AIAgentService;
  private creditsService: CreditsService;
  private cacheService: PredictionCacheService;

  constructor() {
    this.aiService = new AIAgentService();
    this.creditsService = new CreditsService();
    this.cacheService = new PredictionCacheService(1000); // Max 1000 cached entries
  }

  /**
   * Generate macro market prediction
   */
  async generateMacro(request: GenerateMacroRequest): Promise<any> {
    const { userId, year, assetClasses, method, enhanceWithAI } = request;

    // Check cache first (for non-authenticated users or if specified)
    const cacheKey = this.cacheService.generateKey('macro', { year, assetClasses, method });
    const cached = await this.cacheService.get(cacheKey);

    if (cached) {
      console.log('📦 Returning cached macro prediction');
      return {
        predictionId: cached.predictionId,
        result: cached.result,
        aiEnhancement: cached.aiEnhancement,
        creditsUsed: 0, // No credits used for cached results
        fromCache: true,
      };
    }

    // Check credits if user is authenticated
    if (userId) {
      const creditCost = this.creditsService.getCreditCost('macro');
      const hasSufficient = await this.creditsService.hasSufficientCredits(userId, creditCost);

      if (!hasSufficient) {
        throw new Error(`Insufficient credits. Required: ${creditCost}`);
      }
    }

    // Create prediction record
    const prediction = await prisma.prediction.create({
      data: {
        userId,
        predictionType: 'macro',
        method,
        targetAssetClass: assetClasses.join(','),
        specificDate: new Date(year, 0, 1),
        status: 'processing',
        processingStartedAt: new Date(),
        creditsUsed: userId ? this.creditsService.getCreditCost('macro') : 0,
      },
    });

    try {
      // Generate core prediction
      const input: MacroPredictionInput = { year, assetClasses, method };
      const result: MacroPredictionOutput = generateMacroPrediction(input);

      // Enhance with AI if requested
      let aiEnhancement = null;
      if (enhanceWithAI) {
        aiEnhancement = await this.aiService.enhancePrediction({
          predictionType: 'macro',
          rawPrediction: result,
          predictionId: prediction.id,
          userContext: { userId },
        });
      }

      // Update prediction with results
      const updated = await prisma.prediction.update({
        where: { id: prediction.id },
        data: {
          predictionResult: result as any,
          confidenceScore: aiEnhancement?.confidence || 7,
          reasoning: aiEnhancement?.summary || result.overallReasoning,
          recommendations: aiEnhancement ? {
            summary: aiEnhancement.summary,
            keyInsights: aiEnhancement.keyInsights,
            actionableAdvice: aiEnhancement.actionableAdvice,
            riskWarnings: aiEnhancement.riskWarnings,
            educationalContext: aiEnhancement.educationalContext,
          } : null,
          status: 'completed',
          completedAt: new Date(),
        },
      });

      // Deduct credits if user is authenticated
      if (userId) {
        await this.creditsService.deductCredits(
          userId,
          this.creditsService.getCreditCost('macro'),
          'macro_prediction',
          prediction.id
        );
      }

      // Cache the result
      const ttl = this.cacheService.getTTL('macro');
      await this.cacheService.set(cacheKey, {
        predictionId: updated.id,
        result,
        aiEnhancement,
        creditsUsed: updated.creditsUsed,
      }, ttl);

      return {
        predictionId: updated.id,
        result,
        aiEnhancement,
        creditsUsed: updated.creditsUsed,
        fromCache: false,
      };
    } catch (error) {
      // Update prediction with error
      await prisma.prediction.update({
        where: { id: prediction.id },
        data: {
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw error;
    }
  }

  /**
   * Generate asset timing prediction
   */
  async generateTiming(request: GenerateTimingRequest): Promise<any> {
    const { userId, assetId, targetDate, timeframe, enhanceWithAI } = request;

    // Check cache first
    const cacheKey = this.cacheService.generateKey('timing', { assetId, targetDate, timeframe });
    const cached = await this.cacheService.get(cacheKey);

    if (cached) {
      console.log('📦 Returning cached timing prediction');
      return {
        ...cached,
        fromCache: true,
      };
    }

    // Check credits
    if (userId) {
      const creditCost = this.creditsService.getCreditCost('timing');
      const hasSufficient = await this.creditsService.hasSufficientCredits(userId, creditCost);

      if (!hasSufficient) {
        throw new Error(`Insufficient credits. Required: ${creditCost}`);
      }
    }

    // Get asset with birth chart
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      throw new Error('Asset not found');
    }

    if (!asset.birthChart) {
      throw new Error('Asset birth chart not available. Please research this asset first.');
    }

    // Create prediction record
    const prediction = await prisma.prediction.create({
      data: {
        userId,
        predictionType: 'timing',
        targetAssetId: assetId,
        timeframe,
        specificDate: targetDate,
        status: 'processing',
        processingStartedAt: new Date(),
        creditsUsed: userId ? this.creditsService.getCreditCost('timing') : 0,
      },
    });

    try {
      // Parse birth chart from JSON
      const assetBirthChart: CompleteBirthChart = asset.birthChart as any;

      // Generate timing prediction
      const input: TimingPredictionInput = {
        assetId,
        assetSymbol: asset.symbol,
        assetBirthChart,
        targetDate,
        timeframe,
      };
      const result: TimingPredictionOutput = generateTimingPrediction(input);

      // Enhance with AI
      let aiEnhancement = null;
      if (enhanceWithAI) {
        aiEnhancement = await this.aiService.enhancePrediction({
          predictionType: 'timing',
          rawPrediction: result,
          predictionId: prediction.id,
          userContext: { userId },
        });
      }

      // Extract favorable period
      const firstFavorable = result.favorablePeriods[0];

      // Update prediction
      const updated = await prisma.prediction.update({
        where: { id: prediction.id },
        data: {
          predictionResult: result as any,
          confidenceScore: aiEnhancement?.confidence || result.currentScore / 10,
          favorabilityScore: result.currentScore,
          favorablePeriodStart: firstFavorable?.start,
          favorablePeriodEnd: firstFavorable?.end,
          reasoning: aiEnhancement?.summary || result.recommendation,
          recommendations: aiEnhancement ? {
            summary: aiEnhancement.summary,
            keyInsights: aiEnhancement.keyInsights,
            actionableAdvice: aiEnhancement.actionableAdvice,
            riskWarnings: aiEnhancement.riskWarnings,
            educationalContext: aiEnhancement.educationalContext,
          } : null,
          status: 'completed',
          completedAt: new Date(),
        },
      });

      // Deduct credits
      if (userId) {
        await this.creditsService.deductCredits(
          userId,
          this.creditsService.getCreditCost('timing'),
          'timing_prediction',
          prediction.id
        );
      }

      // Cache the result
      const ttl = this.cacheService.getTTL('timing');
      await this.cacheService.set(cacheKey, {
        predictionId: updated.id,
        result,
        aiEnhancement,
        creditsUsed: updated.creditsUsed,
      }, ttl);

      return {
        predictionId: updated.id,
        result,
        aiEnhancement,
        creditsUsed: updated.creditsUsed,
        fromCache: false,
      };
    } catch (error) {
      await prisma.prediction.update({
        where: { id: prediction.id },
        data: {
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw error;
    }
  }

  /**
   * Generate divination prediction (Tarot or I Ching)
   */
  async generateDivination(request: GenerateDivinationRequest): Promise<any> {
    const { userId, question, method, spread, context, enhanceWithAI } = request;

    // Check credits
    if (userId) {
      const creditCost = this.creditsService.getCreditCost('divination');
      const hasSufficient = await this.creditsService.hasSufficientCredits(userId, creditCost);

      if (!hasSufficient) {
        throw new Error(`Insufficient credits. Required: ${creditCost}`);
      }
    }

    // Create prediction record
    const prediction = await prisma.prediction.create({
      data: {
        userId,
        predictionType: 'divination',
        divinationMethod: method,
        question,
        status: 'processing',
        processingStartedAt: new Date(),
        creditsUsed: userId ? this.creditsService.getCreditCost('divination') : 0,
      },
    });

    try {
      let result: TarotPredictionOutput | IChingPredictionOutput;
      let divinationResult: any;

      if (method === 'tarot') {
        const input: TarotPredictionInput = {
          question,
          userId,
          spread: spread || 'three_card',
          context,
        };
        result = generateTarotPrediction(input);
        divinationResult = result;
      } else {
        const input: IChingPredictionInput = {
          question,
          userId,
          context,
        };
        result = generateIChingPrediction(input);
        divinationResult = result;
      }

      // Enhance with AI
      let aiEnhancement = null;
      if (enhanceWithAI) {
        aiEnhancement = await this.aiService.enhancePrediction({
          predictionType: 'divination',
          rawPrediction: result,
          predictionId: prediction.id,
          userContext: { userId },
        });
      }

      // Update prediction
      const updated = await prisma.prediction.update({
        where: { id: prediction.id },
        data: {
          divinationResult: divinationResult as any,
          predictionResult: result as any,
          confidenceScore: result.confidenceScore / 10,
          reasoning: aiEnhancement?.summary || result.guidance,
          recommendations: aiEnhancement ? {
            summary: aiEnhancement.summary,
            keyInsights: aiEnhancement.keyInsights,
            actionableAdvice: aiEnhancement.actionableAdvice,
            riskWarnings: aiEnhancement.riskWarnings,
            educationalContext: aiEnhancement.educationalContext,
          } : null,
          status: 'completed',
          completedAt: new Date(),
        },
      });

      // Deduct credits
      if (userId) {
        await this.creditsService.deductCredits(
          userId,
          this.creditsService.getCreditCost('divination'),
          'divination_prediction',
          prediction.id
        );
      }

      // Note: Divination is NOT cached (always unique)
      return {
        predictionId: updated.id,
        result,
        aiEnhancement,
        creditsUsed: updated.creditsUsed,
        fromCache: false,
      };
    } catch (error) {
      await prisma.prediction.update({
        where: { id: prediction.id },
        data: {
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw error;
    }
  }

  /**
   * Get prediction by ID
   */
  async getPrediction(predictionId: string, userId?: string): Promise<any> {
    const prediction = await prisma.prediction.findUnique({
      where: { id: predictionId },
      include: {
        asset: {
          select: {
            symbol: true,
            name: true,
            assetType: true,
          },
        },
      },
    });

    if (!prediction) {
      throw new Error('Prediction not found');
    }

    // Check ownership if userId provided
    if (userId && prediction.userId !== userId) {
      throw new Error('Unauthorized');
    }

    return prediction;
  }

  /**
   * List user predictions
   */
  async listUserPredictions(
    userId: string,
    filters?: {
      predictionType?: string;
      status?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<any> {
    const { predictionType, status, limit = 20, offset = 0 } = filters || {};

    const where: any = { userId };
    if (predictionType) where.predictionType = predictionType;
    if (status) where.status = status;

    const [predictions, total] = await Promise.all([
      prisma.prediction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          asset: {
            select: {
              symbol: true,
              name: true,
            },
          },
        },
      }),
      prisma.prediction.count({ where }),
    ]);

    return {
      predictions,
      total,
      limit,
      offset,
    };
  }

  /**
   * Submit feedback on prediction
   */
  async submitFeedback(
    predictionId: string,
    userId: string,
    rating: number,
    feedback?: string
  ): Promise<void> {
    const prediction = await prisma.prediction.findUnique({
      where: { id: predictionId },
    });

    if (!prediction) {
      throw new Error('Prediction not found');
    }

    if (prediction.userId !== userId) {
      throw new Error('Unauthorized');
    }

    await prisma.prediction.update({
      where: { id: predictionId },
      data: {
        userFeedbackRating: rating,
        userFeedbackText: feedback,
      },
    });
  }
}

export default PredictionsService;

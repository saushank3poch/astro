/**
 * Personalization Service
 * Manages user-asset compatibility matching and recommendations
 */

import { PrismaClient } from '@prisma/client';
import {
  calculateCompatibility,
  calculateMultipleCompatibilities,
  CompatibilityOutput,
  UserAstrologicalProfile,
  Asset,
} from '@astro/astro-core';
import { AIAgentService } from './ai-agent.service';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export interface UserAssetCompatibility {
  id: string;
  userId: string;
  assetId: string;
  overallCompatibilityScore: number;
  elementCompatibilityScore: number;
  planetaryCompatibilityScore: number;
  reasoning: string;
  recommendations: string;
  calculatedAt: Date;
}

export interface CompatibleAsset {
  assetId: string;
  symbol: string;
  name: string;
  compatibilityScore: number;
  compatibility: 'excellent' | 'good' | 'moderate' | 'challenging' | 'poor';
  reasoning: string;
  recommendations: string;
}

export class PersonalizationService {
  private aiAgent: AIAgentService;

  constructor() {
    this.aiAgent = new AIAgentService();
  }

  /**
   * Calculate compatibility for all assets for a user
   */
  async calculateUserCompatibilities(userId: string): Promise<UserAssetCompatibility[]> {
    try {
      logger.info('Calculating compatibilities for user', { userId });

      // Fetch user's astrological profile
      const userProfile = await prisma.userAstrologicalProfile.findUnique({
        where: { userId },
      });

      if (!userProfile) {
        throw new Error('User astrological profile not found. Please complete your birth chart first.');
      }

      // Fetch all active assets
      const assets = await prisma.asset.findMany({
        where: {
          isActive: true,
        },
        select: {
          id: true,
          symbol: true,
          name: true,
          primaryElement: true,
          secondaryElement: true,
          dominantPlanet: true,
          birthDate: true,
        },
      });

      if (assets.length === 0) {
        logger.warn('No active assets found for compatibility calculation');
        return [];
      }

      // Prepare user profile for compatibility calculation
      const userAstroProfile: UserAstrologicalProfile = {
        favorableElements: (userProfile.favorableElements as any) || [],
        unfavorableElements: (userProfile.unfavorableElements as any) || [],
        birthChart: userProfile.birthChart as any,
        dominantPlanets: userProfile.birthChart
          ? [(userProfile.birthChart as any).dominantPlanet].filter(Boolean)
          : [],
      };

      // Prepare assets for compatibility calculation
      const assetList: Asset[] = assets.map((asset) => ({
        symbol: asset.symbol,
        name: asset.name,
        primaryElement: asset.primaryElement as any,
        secondaryElement: asset.secondaryElement as any,
        dominantPlanet: asset.dominantPlanet,
        birthDate: asset.birthDate || undefined,
      }));

      // Calculate compatibilities
      const compatibilities = calculateMultipleCompatibilities(userAstroProfile, assetList);

      // Store results in database
      const savedCompatibilities: UserAssetCompatibility[] = [];

      for (let i = 0; i < compatibilities.length; i++) {
        const compat = compatibilities[i];
        const asset = assets[i];

        const saved = await prisma.userAssetCompatibility.upsert({
          where: {
            userId_assetId: {
              userId,
              assetId: asset.id,
            },
          },
          create: {
            userId,
            assetId: asset.id,
            overallCompatibilityScore: Math.round(compat.score),
            elementCompatibilityScore: Math.round(compat.elementHarmony.elementScore),
            planetaryCompatibilityScore: Math.round(compat.planetCompatibility.planetScore),
            reasoning: compat.overallReasoning,
            recommendationLevel: compat.compatibility,
            whyGoodForUser: compat.recommendations,
            elementHarmony: {
              favorableMatch: compat.elementHarmony.favorableMatch,
              score: compat.elementHarmony.elementScore,
              reasoning: compat.elementHarmony.reasoning,
            } as any,
            planetaryHarmony: {
              score: compat.planetCompatibility.planetScore,
              reasoning: compat.planetCompatibility.reasoning,
            } as any,
          },
          update: {
            overallCompatibilityScore: Math.round(compat.score),
            elementCompatibilityScore: Math.round(compat.elementHarmony.elementScore),
            planetaryCompatibilityScore: Math.round(compat.planetCompatibility.planetScore),
            reasoning: compat.overallReasoning,
            recommendationLevel: compat.compatibility,
            whyGoodForUser: compat.recommendations,
            elementHarmony: {
              favorableMatch: compat.elementHarmony.favorableMatch,
              score: compat.elementHarmony.elementScore,
              reasoning: compat.elementHarmony.reasoning,
            } as any,
            planetaryHarmony: {
              score: compat.planetCompatibility.planetScore,
              reasoning: compat.planetCompatibility.reasoning,
            } as any,
            calculatedAt: new Date(),
          },
        });

        savedCompatibilities.push({
          id: saved.id,
          userId: saved.userId,
          assetId: saved.assetId,
          overallCompatibilityScore: saved.overallCompatibilityScore || 0,
          elementCompatibilityScore: saved.elementCompatibilityScore || 0,
          planetaryCompatibilityScore: saved.planetaryCompatibilityScore || 0,
          reasoning: saved.reasoning || '',
          recommendations: saved.whyGoodForUser || '',
          calculatedAt: saved.calculatedAt,
        });
      }

      logger.info('Compatibility calculation complete', {
        userId,
        totalAssets: assets.length,
      });

      return savedCompatibilities;
    } catch (error) {
      logger.error('Error calculating user compatibilities', { userId, error });
      throw error;
    }
  }

  /**
   * Get top N most compatible assets for a user
   */
  async getTopCompatibleAssets(userId: string, limit: number = 10): Promise<CompatibleAsset[]> {
    try {
      const compatibilities = await prisma.userAssetCompatibility.findMany({
        where: { userId },
        orderBy: {
          overallCompatibilityScore: 'desc',
        },
        take: limit,
        include: {
          asset: {
            select: {
              id: true,
              symbol: true,
              name: true,
            },
          },
        },
      });

      return compatibilities.map((compat) => ({
        assetId: compat.assetId,
        symbol: compat.asset.symbol,
        name: compat.asset.name,
        compatibilityScore: compat.overallCompatibilityScore || 0,
        compatibility: (compat.recommendationLevel as any) || 'moderate',
        reasoning: compat.reasoning || 'Compatibility analysis not available',
        recommendations: compat.whyGoodForUser || 'No specific recommendations available',
      }));
    } catch (error) {
      logger.error('Error fetching top compatible assets', { userId, error });
      throw error;
    }
  }

  /**
   * Get compatibility for a specific asset
   */
  async getAssetCompatibility(userId: string, assetId: string): Promise<CompatibilityOutput> {
    try {
      // Check if we have cached compatibility
      const cached = await prisma.userAssetCompatibility.findUnique({
        where: {
          userId_assetId: {
            userId,
            assetId,
          },
        },
      });

      if (cached) {
        // Return cached result
        return {
          score: cached.overallCompatibilityScore || 0,
          elementHarmony: {
            favorableMatch: (cached.elementHarmony as any)?.favorableMatch || false,
            elementScore: cached.elementCompatibilityScore || 0,
            reasoning: (cached.elementHarmony as any)?.reasoning || '',
          },
          planetCompatibility: {
            planetScore: cached.planetaryCompatibilityScore || 0,
            reasoning: (cached.planetaryHarmony as any)?.reasoning || '',
          },
          overallReasoning: cached.reasoning || '',
          recommendations: cached.whyGoodForUser || '',
          compatibility: (cached.recommendationLevel as any) || 'moderate',
        };
      }

      // If not cached, calculate it
      const userProfile = await prisma.userAstrologicalProfile.findUnique({
        where: { userId },
      });

      if (!userProfile) {
        throw new Error('User astrological profile not found');
      }

      const asset = await prisma.asset.findUnique({
        where: { id: assetId },
      });

      if (!asset) {
        throw new Error('Asset not found');
      }

      // Prepare data
      const userAstroProfile: UserAstrologicalProfile = {
        favorableElements: (userProfile.favorableElements as any) || [],
        unfavorableElements: (userProfile.unfavorableElements as any) || [],
        birthChart: userProfile.birthChart as any,
        dominantPlanets: userProfile.birthChart
          ? [(userProfile.birthChart as any).dominantPlanet].filter(Boolean)
          : [],
      };

      const assetData: Asset = {
        symbol: asset.symbol,
        name: asset.name,
        primaryElement: asset.primaryElement as any,
        secondaryElement: asset.secondaryElement as any,
        dominantPlanet: asset.dominantPlanet,
        birthDate: asset.birthDate || undefined,
      };

      // Calculate compatibility
      const compatibility = calculateCompatibility({
        userProfile: userAstroProfile,
        asset: assetData,
      });

      // Cache the result
      await prisma.userAssetCompatibility.upsert({
        where: {
          userId_assetId: {
            userId,
            assetId,
          },
        },
        create: {
          userId,
          assetId,
          overallCompatibilityScore: Math.round(compatibility.score),
          elementCompatibilityScore: Math.round(compatibility.elementHarmony.elementScore),
          planetaryCompatibilityScore: Math.round(compatibility.planetCompatibility.planetScore),
          reasoning: compatibility.overallReasoning,
          recommendationLevel: compatibility.compatibility,
          whyGoodForUser: compatibility.recommendations,
        },
        update: {
          overallCompatibilityScore: Math.round(compatibility.score),
          elementCompatibilityScore: Math.round(compatibility.elementHarmony.elementScore),
          planetaryCompatibilityScore: Math.round(compatibility.planetCompatibility.planetScore),
          reasoning: compatibility.overallReasoning,
          recommendationLevel: compatibility.compatibility,
          whyGoodForUser: compatibility.recommendations,
          calculatedAt: new Date(),
        },
      });

      return compatibility;
    } catch (error) {
      logger.error('Error getting asset compatibility', { userId, assetId, error });
      throw error;
    }
  }

  /**
   * Refresh/recalculate all compatibilities for a user
   */
  async refreshCompatibilities(userId: string): Promise<void> {
    try {
      logger.info('Refreshing all compatibilities', { userId });

      // Delete existing compatibilities
      await prisma.userAssetCompatibility.deleteMany({
        where: { userId },
      });

      // Recalculate
      await this.calculateUserCompatibilities(userId);

      logger.info('Compatibility refresh complete', { userId });
    } catch (error) {
      logger.error('Error refreshing compatibilities', { userId, error });
      throw error;
    }
  }

  /**
   * Use AI to enhance compatibility reasoning
   */
  async enhanceWithAI(compatibility: CompatibilityOutput): Promise<string> {
    try {
      const enhancedReasoning = await this.aiAgent.enhancePrediction({
        predictionType: 'macro',
        rawPrediction: {
          compatibility: compatibility.compatibility,
          score: compatibility.score,
          elementHarmony: compatibility.elementHarmony,
          planetCompatibility: compatibility.planetCompatibility,
          recommendations: compatibility.recommendations,
        },
      });

      return enhancedReasoning.summary;
    } catch (error) {
      logger.warn('AI enhancement failed, using original reasoning', { error });
      return compatibility.overallReasoning;
    }
  }

  /**
   * Get all compatibilities with filtering and sorting
   */
  async getAllCompatibilities(
    userId: string,
    options: {
      filter?: 'crypto' | 'stocks' | 'commodities';
      sort?: 'score' | 'name';
      minScore?: number;
    } = {}
  ): Promise<CompatibleAsset[]> {
    try {
      const { filter, sort = 'score', minScore = 0 } = options;

      const whereClause: any = {
        userId,
        overallCompatibilityScore: {
          gte: minScore,
        },
      };

      if (filter) {
        whereClause.asset = {
          assetType: filter,
        };
      }

      const orderByClause: any =
        sort === 'score'
          ? { overallCompatibilityScore: 'desc' }
          : { asset: { name: 'asc' } };

      const compatibilities = await prisma.userAssetCompatibility.findMany({
        where: whereClause,
        orderBy: orderByClause,
        include: {
          asset: {
            select: {
              id: true,
              symbol: true,
              name: true,
            },
          },
        },
      });

      return compatibilities.map((compat) => ({
        assetId: compat.assetId,
        symbol: compat.asset.symbol,
        name: compat.asset.name,
        compatibilityScore: compat.overallCompatibilityScore || 0,
        compatibility: (compat.recommendationLevel as any) || 'moderate',
        reasoning: compat.reasoning || '',
        recommendations: compat.whyGoodForUser || '',
      }));
    } catch (error) {
      logger.error('Error getting all compatibilities', { userId, error });
      throw error;
    }
  }
}

export default PersonalizationService;

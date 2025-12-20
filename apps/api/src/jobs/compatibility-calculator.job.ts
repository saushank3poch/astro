/**
 * Compatibility Calculator Background Job
 * Calculates user-asset compatibility in the background
 * Can be triggered when user creates/updates astrological profile
 */

import { PrismaClient } from '@prisma/client';
import PersonalizationService from '../services/personalization.service';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export interface CompatibilityJobOptions {
  userId: string;
  forceRefresh?: boolean; // Force recalculation even if exists
}

/**
 * Main job function to calculate compatibilities
 */
export async function calculateCompatibilitiesJob(
  options: CompatibilityJobOptions
): Promise<{ success: boolean; totalCalculated: number; error?: string }> {
  const { userId, forceRefresh = false } = options;

  try {
    logger.info('Starting compatibility calculation job', { userId, forceRefresh });

    const personalizationService = new PersonalizationService();

    // If force refresh, delete existing compatibilities
    if (forceRefresh) {
      await prisma.userAssetCompatibility.deleteMany({
        where: { userId },
      });
      logger.info('Deleted existing compatibilities for refresh', { userId });
    }

    // Calculate compatibilities for all assets
    const compatibilities = await personalizationService.calculateUserCompatibilities(userId);

    logger.info('Compatibility calculation job completed', {
      userId,
      totalCalculated: compatibilities.length,
    });

    return {
      success: true,
      totalCalculated: compatibilities.length,
    };
  } catch (error: any) {
    logger.error('Compatibility calculation job failed', {
      userId,
      error: error.message,
      stack: error.stack,
    });

    return {
      success: false,
      totalCalculated: 0,
      error: error.message,
    };
  }
}

/**
 * Trigger compatibility calculation when user profile is updated
 */
export async function onProfileUpdate(userId: string): Promise<void> {
  try {
    logger.info('Profile updated, triggering compatibility recalculation', { userId });

    // In production, this would queue a background job using BullMQ or similar
    // For now, we'll run it asynchronously without blocking
    calculateCompatibilitiesJob({ userId, forceRefresh: true })
      .then((result) => {
        logger.info('Async compatibility calculation completed', { userId, result });
      })
      .catch((error) => {
        logger.error('Async compatibility calculation failed', { userId, error });
      });
  } catch (error) {
    logger.error('Error triggering compatibility job', { userId, error });
  }
}

/**
 * Batch process all users' compatibilities
 * Useful for recalculating after adding new assets
 */
export async function batchCalculateAllUsers(): Promise<{
  success: boolean;
  totalUsers: number;
  successful: number;
  failed: number;
}> {
  try {
    logger.info('Starting batch compatibility calculation for all users');

    // Get all users with astrological profiles
    const usersWithProfiles = await prisma.userAstrologicalProfile.findMany({
      select: { userId: true },
    });

    let successful = 0;
    let failed = 0;

    // Process each user (in production, use a queue)
    for (const profile of usersWithProfiles) {
      const result = await calculateCompatibilitiesJob({
        userId: profile.userId,
        forceRefresh: true,
      });

      if (result.success) {
        successful++;
      } else {
        failed++;
      }

      // Add small delay to avoid overwhelming the database
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    logger.info('Batch compatibility calculation completed', {
      totalUsers: usersWithProfiles.length,
      successful,
      failed,
    });

    return {
      success: true,
      totalUsers: usersWithProfiles.length,
      successful,
      failed,
    };
  } catch (error: any) {
    logger.error('Batch compatibility calculation failed', { error });
    return {
      success: false,
      totalUsers: 0,
      successful: 0,
      failed: 0,
    };
  }
}

/**
 * Calculate compatibilities for new asset
 * Runs when a new asset is added to the database
 */
export async function onNewAsset(assetId: string): Promise<void> {
  try {
    logger.info('New asset added, calculating compatibilities for all users', { assetId });

    const personalizationService = new PersonalizationService();

    // Get all users with profiles
    const usersWithProfiles = await prisma.userAstrologicalProfile.findMany({
      select: { userId: true },
    });

    let count = 0;

    // Calculate compatibility for this asset with all users
    for (const profile of usersWithProfiles) {
      try {
        await personalizationService.getAssetCompatibility(profile.userId, assetId);
        count++;
      } catch (error) {
        logger.error('Failed to calculate compatibility for user', {
          userId: profile.userId,
          assetId,
          error,
        });
      }
    }

    logger.info('New asset compatibility calculation completed', {
      assetId,
      totalUsers: count,
    });
  } catch (error) {
    logger.error('Error calculating compatibilities for new asset', { assetId, error });
  }
}

export default {
  calculateCompatibilitiesJob,
  onProfileUpdate,
  batchCalculateAllUsers,
  onNewAsset,
};

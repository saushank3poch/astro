/**
 * Birth Chart Service
 * Handles generation and storage of astrological birth charts
 */

import { PrismaClient } from '@prisma/client';
import { generateBirthChart, CompleteBirthChart, calculateCompatibility } from '@astro/astro-core';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export interface BirthChartInput {
  birthDate: Date;
  birthTime?: Date; // Time portion only
  birthLocation: {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
    timezone?: string;
  };
  birthTimezone?: string;
}

/**
 * Generate and store a user's birth chart
 */
export async function generateUserBirthChart(userId: string): Promise<CompleteBirthChart> {
  try {
    // Fetch user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        birthDate: true,
        birthTime: true,
        birthLocation: true,
        birthTimezone: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.birthDate) {
      throw new Error('User birth date is required');
    }

    // Extract birth time (default to noon if not provided)
    let birthHour = 12;
    let birthMinute = 0;

    if (user.birthTime) {
      const timeDate = new Date(user.birthTime);
      birthHour = timeDate.getUTCHours();
      birthMinute = timeDate.getUTCMinutes();
    }

    // Validate location data
    if (!user.birthLocation) {
      throw new Error('User birth location is required for full birth chart calculation');
    }

    logger.info('Generating birth chart for user', { userId, birthDate: user.birthDate });

    // Generate the birth chart
    const birthChart = generateBirthChart(
      new Date(user.birthDate),
      birthHour,
      birthMinute,
      user.birthLocation
    );

    // Store in database
    await prisma.userAstrologicalProfile.upsert({
      where: { userId },
      create: {
        userId,
        // Chinese Astrology
        chineseZodiac: birthChart.chinese.zodiacAnimal,
        chineseElement: birthChart.chinese.baziChart.dayMaster,
        baziChart: birthChart.chinese.baziChart as any,
        favorableElements: birthChart.chinese.baziChart.favorableElements as any,
        unfavorableElements: birthChart.chinese.baziChart.unfavorableElements as any,
        luckyNumbers: birthChart.chinese.luckyNumbers,
        luckyColors: birthChart.chinese.luckyColors,
        // Western Astrology
        sunSign: birthChart.western.sunSign,
        moonSign: birthChart.western.moonSign,
        risingSign: birthChart.western.risingSign,
        birthChart: {
          planets: birthChart.western.planets,
          houses: birthChart.western.houses,
          aspects: birthChart.western.aspects,
          dominantPlanet: birthChart.western.dominantPlanet,
        } as any,
        dominantElements: birthChart.western.elementDistribution as any,
        dominantModality: birthChart.western.dominantModality,
        chartPatterns: [], // Would be extracted from aspects analysis
      },
      update: {
        // Chinese Astrology
        chineseZodiac: birthChart.chinese.zodiacAnimal,
        chineseElement: birthChart.chinese.baziChart.dayMaster,
        baziChart: birthChart.chinese.baziChart as any,
        favorableElements: birthChart.chinese.baziChart.favorableElements as any,
        unfavorableElements: birthChart.chinese.baziChart.unfavorableElements as any,
        luckyNumbers: birthChart.chinese.luckyNumbers,
        luckyColors: birthChart.chinese.luckyColors,
        // Western Astrology
        sunSign: birthChart.western.sunSign,
        moonSign: birthChart.western.moonSign,
        risingSign: birthChart.western.risingSign,
        birthChart: {
          planets: birthChart.western.planets,
          houses: birthChart.western.houses,
          aspects: birthChart.western.aspects,
          dominantPlanet: birthChart.western.dominantPlanet,
        } as any,
        dominantElements: birthChart.western.elementDistribution as any,
        dominantModality: birthChart.western.dominantModality,
        updatedAt: new Date(),
      },
    });

    logger.info('Birth chart generated and stored', { userId });

    return birthChart;
  } catch (error) {
    logger.error('Error generating user birth chart', { userId, error });
    throw error;
  }
}

/**
 * Get a user's birth chart (from database or generate if needed)
 */
export async function getUserBirthChart(userId: string): Promise<any> {
  try {
    // Try to fetch existing profile
    const profile = await prisma.userAstrologicalProfile.findUnique({
      where: { userId },
    });

    if (profile) {
      return profile;
    }

    // Generate if not exists
    return await generateUserBirthChart(userId);
  } catch (error) {
    logger.error('Error getting user birth chart', { userId, error });
    throw error;
  }
}

/**
 * Generate and store an asset's birth chart
 */
export async function generateAssetBirthChart(assetId: string): Promise<CompleteBirthChart> {
  try {
    // Fetch asset data
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      select: {
        birthDate: true,
        birthTime: true,
        birthLocation: true,
      },
    });

    if (!asset) {
      throw new Error('Asset not found');
    }

    if (!asset.birthDate) {
      throw new Error('Asset birth date is required');
    }

    // Extract birth time (default to market open: 9:30 AM ET)
    let birthHour = 9;
    let birthMinute = 30;

    if (asset.birthTime) {
      const timeDate = new Date(asset.birthTime);
      birthHour = timeDate.getUTCHours();
      birthMinute = timeDate.getUTCMinutes();
    }

    // Default location (NYSE for most assets)
    const location = asset.birthLocation || {
      latitude: 40.7128,
      longitude: -74.006,
      city: 'New York',
      country: 'USA',
      timezone: 'America/New_York',
    };

    logger.info('Generating birth chart for asset', { assetId, birthDate: asset.birthDate });

    // Generate the birth chart
    const birthChart = generateBirthChart(
      new Date(asset.birthDate),
      birthHour,
      birthMinute,
      location
    );

    // Store in database
    await prisma.asset.update({
      where: { id: assetId },
      data: {
        // Chinese Astrology
        chineseZodiac: birthChart.chinese.zodiacAnimal,
        primaryElement: birthChart.chinese.baziChart.dayMaster,
        secondaryElement: birthChart.chinese.baziChart.dominantElement,
        baziChart: birthChart.chinese.baziChart as any,
        // Western Astrology
        sunSign: birthChart.western.sunSign,
        birthChart: {
          planets: birthChart.western.planets,
          houses: birthChart.western.houses,
          aspects: birthChart.western.aspects,
        } as any,
      },
    });

    logger.info('Asset birth chart generated and stored', { assetId });

    return birthChart;
  } catch (error) {
    logger.error('Error generating asset birth chart', { assetId, error });
    throw error;
  }
}

/**
 * Get an asset's birth chart
 */
export async function getAssetBirthChart(assetId: string): Promise<any> {
  try {
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      select: {
        chineseZodiac: true,
        primaryElement: true,
        secondaryElement: true,
        baziChart: true,
        sunSign: true,
        birthChart: true,
      },
    });

    if (!asset) {
      throw new Error('Asset not found');
    }

    // If chart data exists, return it
    if (asset.baziChart || asset.birthChart) {
      return asset;
    }

    // Otherwise generate it
    return await generateAssetBirthChart(assetId);
  } catch (error) {
    logger.error('Error getting asset birth chart', { assetId, error });
    throw error;
  }
}

/**
 * Calculate compatibility between user and asset
 */
export async function calculateUserAssetCompatibility(
  userId: string,
  assetId: string
): Promise<any> {
  try {
    // Get both birth charts
    const userProfile = await getUserBirthChart(userId);
    const assetProfile = await getAssetBirthChart(assetId);

    // Get full user data for birth chart
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        birthDate: true,
        birthTime: true,
        birthLocation: true,
      },
    });

    // Get full asset data for birth chart
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      select: {
        birthDate: true,
        birthTime: true,
        birthLocation: true,
      },
    });

    if (!user || !asset || !user.birthDate || !asset.birthDate) {
      throw new Error('Missing birth data for compatibility calculation');
    }

    // Generate full birth charts for compatibility calculation
    const userBirthChart = generateBirthChart(
      new Date(user.birthDate),
      user.birthTime ? new Date(user.birthTime).getUTCHours() : 12,
      user.birthTime ? new Date(user.birthTime).getUTCMinutes() : 0,
      user.birthLocation || { latitude: 0, longitude: 0 }
    );

    const assetBirthChart = generateBirthChart(
      new Date(asset.birthDate),
      asset.birthTime ? new Date(asset.birthTime).getUTCHours() : 9,
      asset.birthTime ? new Date(asset.birthTime).getUTCMinutes() : 30,
      asset.birthLocation || { latitude: 40.7128, longitude: -74.006 }
    );

    // Calculate compatibility
    const compatibility = calculateCompatibility(userBirthChart, assetBirthChart);

    logger.info('Calculated compatibility', { userId, assetId, overall: compatibility.overall });

    // Store compatibility in database
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
        overallCompatibilityScore: compatibility.overall,
        elementCompatibilityScore: compatibility.chinese.elementCompatibility,
        planetaryCompatibilityScore: Math.round(
          (compatibility.western.sunSignCompatibility +
            compatibility.western.moonSignCompatibility +
            compatibility.western.risingSignCompatibility) /
            3
        ),
        elementHarmony: {
          chinese: compatibility.chinese,
          western: compatibility.western,
        } as any,
        reasoning: generateCompatibilityReasoning(compatibility),
      },
      update: {
        overallCompatibilityScore: compatibility.overall,
        elementCompatibilityScore: compatibility.chinese.elementCompatibility,
        planetaryCompatibilityScore: Math.round(
          (compatibility.western.sunSignCompatibility +
            compatibility.western.moonSignCompatibility +
            compatibility.western.risingSignCompatibility) /
            3
        ),
        elementHarmony: {
          chinese: compatibility.chinese,
          western: compatibility.western,
        } as any,
        reasoning: generateCompatibilityReasoning(compatibility),
        calculatedAt: new Date(),
      },
    });

    return compatibility;
  } catch (error) {
    logger.error('Error calculating compatibility', { userId, assetId, error });
    throw error;
  }
}

/**
 * Generate human-readable compatibility reasoning
 */
function generateCompatibilityReasoning(compatibility: any): string {
  const reasons: string[] = [];

  // Chinese compatibility
  if (compatibility.chinese.zodiacCompatibility > 70) {
    reasons.push('Strong Chinese zodiac compatibility indicates natural harmony.');
  } else if (compatibility.chinese.zodiacCompatibility < 40) {
    reasons.push('Challenging Chinese zodiac aspect requires careful navigation.');
  }

  if (compatibility.chinese.elementCompatibility > 70) {
    reasons.push('Elemental harmony supports beneficial interaction.');
  }

  // Western compatibility
  if (compatibility.western.sunSignCompatibility > 70) {
    reasons.push('Sun signs are highly compatible, indicating aligned core values.');
  }

  if (compatibility.western.moonSignCompatibility > 70) {
    reasons.push('Moon sign harmony suggests emotional resonance.');
  }

  // Overall assessment
  if (compatibility.overall > 75) {
    reasons.push('Overall: Highly favorable astrological alignment.');
  } else if (compatibility.overall > 60) {
    reasons.push('Overall: Positive astrological indicators with some challenges.');
  } else if (compatibility.overall > 45) {
    reasons.push('Overall: Mixed indicators require mindful approach.');
  } else {
    reasons.push('Overall: Challenging aspects require extra awareness.');
  }

  return reasons.join(' ');
}

export default {
  generateUserBirthChart,
  getUserBirthChart,
  generateAssetBirthChart,
  getAssetBirthChart,
  calculateUserAssetCompatibility,
};

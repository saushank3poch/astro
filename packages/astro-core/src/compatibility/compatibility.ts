/**
 * Main Compatibility Calculator
 * Combines element harmony and planet compatibility for user-asset matching
 */

import { Element } from '../chinese/bazi';
import { calculateElementHarmony, ElementHarmonyResult } from './element-harmony';
import { calculatePlanetCompatibility, PlanetCompatibilityResult } from './planet-compatibility';

export interface UserAstrologicalProfile {
  favorableElements: Element[];
  unfavorableElements: Element[];
  birthChart?: {
    dominantPlanet?: string;
    planets?: any[];
  };
  dominantPlanets?: string[];
}

export interface Asset {
  symbol: string;
  name: string;
  primaryElement: Element | null;
  secondaryElement: Element | null;
  dominantPlanet: string | null;
  birthDate?: Date;
}

export interface CompatibilityInput {
  userProfile: UserAstrologicalProfile;
  asset: Asset;
}

export interface CompatibilityOutput {
  score: number; // 1-10 scale
  elementHarmony: {
    favorableMatch: boolean;
    elementScore: number;
    reasoning: string;
  };
  planetCompatibility: {
    planetScore: number;
    reasoning: string;
  };
  overallReasoning: string;
  recommendations: string;
  compatibility: 'excellent' | 'good' | 'moderate' | 'challenging' | 'poor';
}

/**
 * Calculate overall compatibility between user and asset
 */
export function calculateCompatibility(input: CompatibilityInput): CompatibilityOutput {
  const { userProfile, asset } = input;

  // Calculate element harmony (50% weight)
  const elementHarmony = calculateElementHarmony(
    userProfile.favorableElements,
    userProfile.unfavorableElements,
    asset.primaryElement,
    asset.secondaryElement
  );

  // Extract user's dominant planets
  let userDominantPlanets: string[] = [];
  if (userProfile.dominantPlanets) {
    userDominantPlanets = userProfile.dominantPlanets;
  } else if (userProfile.birthChart?.dominantPlanet) {
    userDominantPlanets = [userProfile.birthChart.dominantPlanet];
  }

  // Calculate planet compatibility (50% weight)
  const planetCompat = calculatePlanetCompatibility(userDominantPlanets, asset.dominantPlanet);

  // Calculate weighted overall score
  const overallScore = Math.round((elementHarmony.elementScore * 0.5 + planetCompat.planetScore * 0.5) * 10) / 10;

  // Determine compatibility level
  let compatibility: 'excellent' | 'good' | 'moderate' | 'challenging' | 'poor';
  if (overallScore >= 8) compatibility = 'excellent';
  else if (overallScore >= 7) compatibility = 'good';
  else if (overallScore >= 5) compatibility = 'moderate';
  else if (overallScore >= 3) compatibility = 'challenging';
  else compatibility = 'poor';

  // Generate overall reasoning
  const overallReasoning = generateOverallReasoning(
    asset,
    elementHarmony,
    planetCompat,
    overallScore,
    compatibility
  );

  // Generate recommendations
  const recommendations = generateRecommendations(asset, elementHarmony, planetCompat, compatibility);

  return {
    score: overallScore,
    elementHarmony: {
      favorableMatch: elementHarmony.favorableMatch,
      elementScore: elementHarmony.elementScore,
      reasoning: elementHarmony.reasoning,
    },
    planetCompatibility: {
      planetScore: planetCompat.planetScore,
      reasoning: planetCompat.reasoning,
    },
    overallReasoning,
    recommendations,
    compatibility,
  };
}

/**
 * Generate overall reasoning combining all factors
 */
function generateOverallReasoning(
  asset: Asset,
  elementHarmony: ElementHarmonyResult,
  planetCompat: PlanetCompatibilityResult,
  score: number,
  compatibility: string
): string {
  let reasoning = `Compatibility analysis for ${asset.name} (${asset.symbol}):\n\n`;

  reasoning += `Overall Score: ${score}/10 (${compatibility.toUpperCase()})\n\n`;

  reasoning += `Element Analysis (${elementHarmony.elementScore}/10): ${elementHarmony.reasoning}\n\n`;

  reasoning += `Planetary Analysis (${planetCompat.planetScore}/10): ${planetCompat.reasoning}\n\n`;

  if (score >= 7) {
    reasoning += `This asset shows strong compatibility with your astrological profile. `;
    reasoning += `The energetic alignment suggests favorable conditions for engagement.`;
  } else if (score >= 5) {
    reasoning += `This asset shows moderate compatibility with your profile. `;
    reasoning += `While not exceptional, there are workable energies present.`;
  } else {
    reasoning += `This asset shows challenging aspects with your profile. `;
    reasoning += `Extra caution and timing awareness is advised.`;
  }

  return reasoning;
}

/**
 * Generate personalized recommendations
 */
function generateRecommendations(
  asset: Asset,
  elementHarmony: ElementHarmonyResult,
  planetCompat: PlanetCompatibilityResult,
  compatibility: string
): string {
  const recommendations: string[] = [];

  if (compatibility === 'excellent' || compatibility === 'good') {
    recommendations.push(`${asset.symbol} aligns well with your astrological energies.`);

    if (elementHarmony.favorableMatch) {
      recommendations.push(`The elemental harmony is particularly strong - consider this a favorable opportunity.`);
    }

    if (planetCompat.aspects.favorable.length > 0) {
      recommendations.push(`Favorable planetary aspects support positive outcomes.`);
    }

    recommendations.push(`Best approach: Engage during your personal favorable periods for maximum benefit.`);
  } else if (compatibility === 'moderate') {
    recommendations.push(`${asset.symbol} has mixed compatibility with your chart.`);
    recommendations.push(`Timing is crucial - wait for favorable transits before major commitments.`);

    if (elementHarmony.elementScore < 5) {
      recommendations.push(`Element harmony is weak - be extra mindful of risk management.`);
    }

    if (planetCompat.aspects.challenging.length > 0) {
      recommendations.push(`Watch for challenging planetary periods that may increase volatility.`);
    }
  } else {
    recommendations.push(`${asset.symbol} shows significant challenges with your astrological profile.`);
    recommendations.push(`Unless you have strong conviction from other analysis, consider alternatives.`);

    if (elementHarmony.elementScore < 4) {
      recommendations.push(`Element disharmony suggests this asset may work against your natural energies.`);
    }

    if (planetCompat.aspects.challenging.length > 0) {
      recommendations.push(`Challenging planetary aspects amplify potential difficulties.`);
    }

    recommendations.push(`If you proceed, use strict risk controls and reduce position sizes.`);
  }

  return recommendations.join(' ');
}

/**
 * Batch calculate compatibility for multiple assets
 */
export function calculateMultipleCompatibilities(
  userProfile: UserAstrologicalProfile,
  assets: Asset[]
): Array<CompatibilityOutput & { assetId: string; assetSymbol: string }> {
  return assets.map((asset) => {
    const compatibility = calculateCompatibility({ userProfile, asset });
    return {
      ...compatibility,
      assetId: asset.symbol, // Would use actual ID in production
      assetSymbol: asset.symbol,
    };
  });
}

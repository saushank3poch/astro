/**
 * Element Harmony Calculator
 * Calculates compatibility based on Chinese Five Elements theory
 */

import { Element } from '../chinese/bazi';
import { getProductionCycle, getDestructionCycle } from '../chinese/elements';

export interface ElementHarmonyResult {
  favorableMatch: boolean;
  elementScore: number; // 1-10 scale
  reasoning: string;
  details: {
    primaryElementMatch: boolean;
    secondaryElementMatch: boolean;
    productiveCycle: boolean;
    destructiveCycle: boolean;
  };
}

/**
 * Calculate element harmony between user and asset
 */
export function calculateElementHarmony(
  userFavorableElements: Element[],
  userUnfavorableElements: Element[],
  assetPrimaryElement: Element | null,
  assetSecondaryElement: Element | null
): ElementHarmonyResult {
  let score = 5; // Start at neutral
  let reasoning = '';
  const details = {
    primaryElementMatch: false,
    secondaryElementMatch: false,
    productiveCycle: false,
    destructiveCycle: false,
  };

  // If no asset elements, return neutral
  if (!assetPrimaryElement) {
    return {
      favorableMatch: false,
      elementScore: 5,
      reasoning: 'Asset element data not available. Neutral compatibility assumed.',
      details,
    };
  }

  const production = getProductionCycle();
  const destruction = getDestructionCycle();

  // Check primary element against favorable elements (+5 points)
  if (userFavorableElements.includes(assetPrimaryElement)) {
    score += 5;
    details.primaryElementMatch = true;
    reasoning += `Asset primary element (${assetPrimaryElement}) is highly favorable for you. `;
  }

  // Check secondary element against favorable elements (+3 points)
  if (assetSecondaryElement && userFavorableElements.includes(assetSecondaryElement)) {
    score += 3;
    details.secondaryElementMatch = true;
    reasoning += `Asset secondary element (${assetSecondaryElement}) is also favorable. `;
  }

  // Check primary element against unfavorable elements (-4 points)
  if (userUnfavorableElements.includes(assetPrimaryElement)) {
    score -= 4;
    reasoning += `Warning: Asset primary element (${assetPrimaryElement}) conflicts with your chart. `;
  }

  // Check secondary element against unfavorable elements (-2 points)
  if (assetSecondaryElement && userUnfavorableElements.includes(assetSecondaryElement)) {
    score -= 2;
    reasoning += `Asset secondary element (${assetSecondaryElement}) may cause challenges. `;
  }

  // Check productive cycle relationships
  userFavorableElements.forEach((favorableElement) => {
    // Check if favorable element produces asset element (supportive)
    if (production[favorableElement] === assetPrimaryElement) {
      score += 2;
      details.productiveCycle = true;
      reasoning += `Your favorable ${favorableElement} element nourishes the asset's ${assetPrimaryElement} element. `;
    }

    // Check if asset element produces favorable element (mutual benefit)
    if (production[assetPrimaryElement] === favorableElement) {
      score += 1;
      details.productiveCycle = true;
      reasoning += `The asset's energy supports your favorable ${favorableElement} element. `;
    }
  });

  // Check destructive cycle relationships
  userUnfavorableElements.forEach((unfavorableElement) => {
    // Check if asset element destroys unfavorable element (helpful)
    if (destruction[assetPrimaryElement] === unfavorableElement) {
      score += 1;
      reasoning += `The asset helps control your unfavorable ${unfavorableElement} element. `;
    }

    // Check if unfavorable element destroys asset element (problematic)
    if (destruction[unfavorableElement] === assetPrimaryElement) {
      score -= 2;
      details.destructiveCycle = true;
      reasoning += `Your unfavorable ${unfavorableElement} element may weaken the asset's energy. `;
    }
  });

  // Normalize to 1-10 scale
  score = Math.max(1, Math.min(10, score));

  const favorableMatch = score >= 7;

  if (!reasoning) {
    reasoning = `Asset element (${assetPrimaryElement}) has a neutral relationship with your elemental profile.`;
  }

  return {
    favorableMatch,
    elementScore: score,
    reasoning: reasoning.trim(),
    details,
  };
}

/**
 * Get element harmony description
 */
export function getElementHarmonyDescription(score: number): string {
  if (score >= 9) return 'Exceptional harmony - highly compatible';
  if (score >= 7) return 'Strong harmony - very favorable';
  if (score >= 5) return 'Moderate harmony - balanced';
  if (score >= 3) return 'Weak harmony - some challenges';
  return 'Poor harmony - significant conflicts';
}

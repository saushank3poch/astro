/**
 * Planet Compatibility Calculator
 * Analyzes Western astrology planetary harmony
 */

import { Planet } from '../western/planets';

export interface PlanetCompatibilityResult {
  planetScore: number; // 1-10 scale
  reasoning: string;
  aspects: {
    favorable: string[];
    neutral: string[];
    challenging: string[];
  };
}

/**
 * Planet affinity map - which planets work well together
 */
const PLANET_AFFINITIES: { [key: string]: { favorable: string[]; challenging: string[] } } = {
  Sun: {
    favorable: ['Jupiter', 'Mars', 'Venus'],
    challenging: ['Saturn', 'Neptune'],
  },
  Moon: {
    favorable: ['Venus', 'Neptune', 'Jupiter'],
    challenging: ['Mars', 'Uranus'],
  },
  Mercury: {
    favorable: ['Uranus', 'Venus', 'Jupiter'],
    challenging: ['Neptune', 'Saturn'],
  },
  Venus: {
    favorable: ['Jupiter', 'Moon', 'Neptune'],
    challenging: ['Mars', 'Pluto'],
  },
  Mars: {
    favorable: ['Sun', 'Pluto', 'Jupiter'],
    challenging: ['Saturn', 'Moon'],
  },
  Jupiter: {
    favorable: ['Sun', 'Venus', 'Mercury'],
    challenging: ['Saturn'],
  },
  Saturn: {
    favorable: ['Mercury', 'Venus', 'Pluto'],
    challenging: ['Sun', 'Mars', 'Jupiter'],
  },
  Uranus: {
    favorable: ['Mercury', 'Jupiter', 'Neptune'],
    challenging: ['Moon', 'Venus'],
  },
  Neptune: {
    favorable: ['Moon', 'Venus', 'Jupiter'],
    challenging: ['Mercury', 'Sun'],
  },
  Pluto: {
    favorable: ['Mars', 'Saturn', 'Sun'],
    challenging: ['Venus', 'Moon'],
  },
};

/**
 * Calculate planet compatibility between user and asset
 */
export function calculatePlanetCompatibility(
  userDominantPlanets: string[],
  assetDominantPlanet: string | null
): PlanetCompatibilityResult {
  let score = 5; // Start at neutral
  const aspects = {
    favorable: [] as string[],
    neutral: [] as string[],
    challenging: [] as string[],
  };

  if (!assetDominantPlanet || userDominantPlanets.length === 0) {
    return {
      planetScore: 5,
      reasoning: 'Planetary compatibility data incomplete. Neutral score assigned.',
      aspects,
    };
  }

  let reasoningParts: string[] = [];

  // Check each user dominant planet against asset dominant planet
  userDominantPlanets.forEach((userPlanet) => {
    const affinities = PLANET_AFFINITIES[userPlanet];

    if (!affinities) {
      aspects.neutral.push(`${userPlanet} - ${assetDominantPlanet}`);
      return;
    }

    if (userPlanet === assetDominantPlanet) {
      score += 2;
      aspects.favorable.push(`${userPlanet} conjunct ${assetDominantPlanet}`);
      reasoningParts.push(`Your ${userPlanet} energy resonates with the asset's ${assetDominantPlanet} influence.`);
    } else if (affinities.favorable.includes(assetDominantPlanet)) {
      score += 4;
      aspects.favorable.push(`${userPlanet} harmonizes with ${assetDominantPlanet}`);
      reasoningParts.push(`Your ${userPlanet} creates favorable aspects with the asset's ${assetDominantPlanet}.`);
    } else if (affinities.challenging.includes(assetDominantPlanet)) {
      score -= 2;
      aspects.challenging.push(`${userPlanet} tenses with ${assetDominantPlanet}`);
      reasoningParts.push(`Your ${userPlanet} may create tension with the asset's ${assetDominantPlanet} energy.`);
    } else {
      aspects.neutral.push(`${userPlanet} - ${assetDominantPlanet}`);
    }
  });

  // Normalize to 1-10 scale
  score = Math.max(1, Math.min(10, score));

  let reasoning = reasoningParts.join(' ');
  if (!reasoning) {
    reasoning = `Your planetary configuration has a neutral relationship with the asset's ${assetDominantPlanet} dominance.`;
  }

  return {
    planetScore: score,
    reasoning,
    aspects,
  };
}

/**
 * Get planet compatibility description
 */
export function getPlanetCompatibilityDescription(score: number): string {
  if (score >= 9) return 'Exceptional planetary alignment';
  if (score >= 7) return 'Strong planetary harmony';
  if (score >= 5) return 'Moderate planetary balance';
  if (score >= 3) return 'Some planetary challenges';
  return 'Significant planetary tensions';
}

/**
 * Extract dominant planets from birth chart
 */
export function extractDominantPlanets(birthChart: any): string[] {
  const dominantPlanets: string[] = [];

  // Add the primary dominant planet if available
  if (birthChart?.dominantPlanet) {
    dominantPlanets.push(birthChart.dominantPlanet);
  }

  // Add chart ruler (ruling planet of rising sign)
  // This would require more detailed implementation based on chart structure

  // For now, return at least the dominant planet
  return dominantPlanets.filter((p) => p); // Remove any undefined/null
}

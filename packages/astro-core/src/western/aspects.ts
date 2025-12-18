/**
 * Planetary Aspects Calculator
 * Calculates angular relationships between planets
 */

import { Planet, PlanetaryPosition } from './planets';

export type AspectType =
  | 'Conjunction'
  | 'Sextile'
  | 'Square'
  | 'Trine'
  | 'Opposition'
  | 'Quincunx'
  | 'Semisextile';

export interface Aspect {
  planet1: Planet;
  planet2: Planet;
  type: AspectType;
  angle: number; // Actual angle between planets
  orb: number; // Difference from exact aspect
  applying: boolean; // Whether aspect is applying or separating
  strength: number; // 0-100, based on orb
}

export interface AspectInfo {
  type: AspectType;
  angle: number;
  defaultOrb: number;
  nature: 'harmonious' | 'challenging' | 'neutral';
  keywords: string[];
  description: string;
}

/**
 * Major and minor aspects with their properties
 */
const ASPECT_DEFINITIONS: AspectInfo[] = [
  {
    type: 'Conjunction',
    angle: 0,
    defaultOrb: 8,
    nature: 'neutral',
    keywords: ['Unity', 'Focus', 'Intensity', 'Blending'],
    description: 'Planets are merged, intensifying their combined energy',
  },
  {
    type: 'Sextile',
    angle: 60,
    defaultOrb: 6,
    nature: 'harmonious',
    keywords: ['Opportunity', 'Cooperation', 'Talent', 'Easy flow'],
    description: 'Supportive aspect indicating opportunities and talents',
  },
  {
    type: 'Square',
    angle: 90,
    defaultOrb: 8,
    nature: 'challenging',
    keywords: ['Tension', 'Challenge', 'Action', 'Growth'],
    description: 'Friction that creates motivation for change and growth',
  },
  {
    type: 'Trine',
    angle: 120,
    defaultOrb: 8,
    nature: 'harmonious',
    keywords: ['Harmony', 'Flow', 'Luck', 'Natural ability'],
    description: 'Flowing aspect of ease and natural talents',
  },
  {
    type: 'Opposition',
    angle: 180,
    defaultOrb: 8,
    nature: 'challenging',
    keywords: ['Awareness', 'Balance', 'Projection', 'Polarity'],
    description: 'Tension between opposing forces requiring integration',
  },
  {
    type: 'Quincunx',
    angle: 150,
    defaultOrb: 3,
    nature: 'challenging',
    keywords: ['Adjustment', 'Awkwardness', 'Refinement', 'Awareness'],
    description: 'Requires constant adjustment and adaptation',
  },
  {
    type: 'Semisextile',
    angle: 30,
    defaultOrb: 2,
    nature: 'neutral',
    keywords: ['Subtle', 'Minor opportunity', 'Growth', 'Connection'],
    description: 'Minor aspect of slight opportunity',
  },
];

/**
 * Calculate the aspect between two planets
 */
export function calculateAspect(
  pos1: PlanetaryPosition,
  pos2: PlanetaryPosition
): Aspect | null {
  // Calculate angular distance between planets
  let angle = Math.abs(pos1.absoluteDegree - pos2.absoluteDegree);

  // Normalize to 0-180 (aspects are the same from either direction)
  if (angle > 180) {
    angle = 360 - angle;
  }

  // Check each aspect type
  for (const aspectDef of ASPECT_DEFINITIONS) {
    const orb = Math.abs(angle - aspectDef.angle);

    if (orb <= aspectDef.defaultOrb) {
      // Determine if aspect is applying or separating
      // This is simplified; full calculation requires planetary velocities
      const applying = isAspectApplying(pos1, pos2, aspectDef.angle);

      // Calculate strength (inversely proportional to orb)
      const strength = Math.max(0, 100 * (1 - orb / aspectDef.defaultOrb));

      return {
        planet1: pos1.planet,
        planet2: pos2.planet,
        type: aspectDef.type,
        angle,
        orb,
        applying,
        strength,
      };
    }
  }

  return null; // No aspect found
}

/**
 * Determine if aspect is applying or separating
 * Simplified version
 */
function isAspectApplying(
  pos1: PlanetaryPosition,
  pos2: PlanetaryPosition,
  aspectAngle: number
): boolean {
  // This is a simplified calculation
  // In reality, we'd need to check planetary velocities

  // Faster planets are Moon, Mercury, Venus, Sun, Mars
  const fastPlanets: Planet[] = ['Moon', 'Mercury', 'Venus', 'Sun', 'Mars'];

  // If planet1 is faster and behind, aspect is applying
  if (fastPlanets.includes(pos1.planet) && !fastPlanets.includes(pos2.planet)) {
    return pos1.absoluteDegree < pos2.absoluteDegree;
  }

  // Default to applying
  return true;
}

/**
 * Calculate all aspects in a chart
 */
export function calculateAllAspects(positions: PlanetaryPosition[]): Aspect[] {
  const aspects: Aspect[] = [];

  // Compare each planet with every other planet
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const aspect = calculateAspect(positions[i], positions[j]);
      if (aspect) {
        aspects.push(aspect);
      }
    }
  }

  return aspects;
}

/**
 * Get detailed information about an aspect type
 */
export function getAspectInfo(type: AspectType): AspectInfo {
  const info = ASPECT_DEFINITIONS.find((def) => def.type === type);
  if (!info) {
    throw new Error(`Unknown aspect type: ${type}`);
  }
  return info;
}

/**
 * Count aspects by type
 */
export function analyzeAspectPattern(aspects: Aspect[]): {
  byType: { [key in AspectType]?: number };
  harmonious: number;
  challenging: number;
  neutral: number;
  totalStrength: number;
} {
  const byType: { [key in AspectType]?: number } = {};
  let harmonious = 0;
  let challenging = 0;
  let neutral = 0;
  let totalStrength = 0;

  aspects.forEach((aspect) => {
    // Count by type
    if (!byType[aspect.type]) {
      byType[aspect.type] = 0;
    }
    byType[aspect.type]!++;

    // Count by nature
    const info = getAspectInfo(aspect.type);
    if (info.nature === 'harmonious') {
      harmonious++;
    } else if (info.nature === 'challenging') {
      challenging++;
    } else {
      neutral++;
    }

    // Sum strength
    totalStrength += aspect.strength;
  });

  return {
    byType,
    harmonious,
    challenging,
    neutral,
    totalStrength,
  };
}

/**
 * Find dominant aspect patterns
 */
export function findAspectPatterns(aspects: Aspect[]): {
  hasGrandTrine: boolean;
  hasGrandCross: boolean;
  hasTSquare: boolean;
  hasYod: boolean;
  patterns: string[];
} {
  const patterns: string[] = [];
  let hasGrandTrine = false;
  let hasGrandCross = false;
  let hasTSquare = false;
  let hasYod = false;

  // Find trines
  const trines = aspects.filter((a) => a.type === 'Trine');

  // Check for Grand Trine (3 planets in trine to each other)
  if (trines.length >= 3) {
    // Simplified check - in reality would verify all planets form complete triangle
    hasGrandTrine = true;
    patterns.push('Grand Trine: Major talent and flow of energy');
  }

  // Find squares
  const squares = aspects.filter((a) => a.type === 'Square');

  // Check for Grand Cross (4 planets in square and opposition)
  if (squares.length >= 4) {
    const oppositions = aspects.filter((a) => a.type === 'Opposition');
    if (oppositions.length >= 2) {
      hasGrandCross = true;
      patterns.push('Grand Cross: Major challenges requiring balance');
    }
  }

  // Check for T-Square (3 planets: 2 in opposition, both square to third)
  if (squares.length >= 2) {
    const oppositions = aspects.filter((a) => a.type === 'Opposition');
    if (oppositions.length >= 1) {
      hasTSquare = true;
      patterns.push('T-Square: Focused tension driving achievement');
    }
  }

  // Check for Yod (Finger of God)
  const quincunxes = aspects.filter((a) => a.type === 'Quincunx');
  const sextiles = aspects.filter((a) => a.type === 'Sextile');

  if (quincunxes.length >= 2 && sextiles.length >= 1) {
    hasYod = true;
    patterns.push('Yod: Fated pattern requiring adjustment');
  }

  return {
    hasGrandTrine,
    hasGrandCross,
    hasTSquare,
    hasYod,
    patterns,
  };
}

/**
 * Get aspects for a specific planet
 */
export function getAspectsForPlanet(planet: Planet, aspects: Aspect[]): Aspect[] {
  return aspects.filter((a) => a.planet1 === planet || a.planet2 === planet);
}

/**
 * Calculate aspect strength weighting
 */
export function calculateAspectWeight(aspect: Aspect): number {
  let weight = aspect.strength;

  // Weight major aspects more heavily
  const majorAspects: AspectType[] = ['Conjunction', 'Sextile', 'Square', 'Trine', 'Opposition'];

  if (majorAspects.includes(aspect.type)) {
    weight *= 1.5;
  }

  // Weight challenging aspects higher for transformation potential
  const info = getAspectInfo(aspect.type);
  if (info.nature === 'challenging') {
    weight *= 1.2;
  }

  return weight;
}

/**
 * Interpret aspect between two specific planets
 */
export function interpretAspect(aspect: Aspect): string {
  const info = getAspectInfo(aspect.type);
  const strengthDesc =
    aspect.strength > 80 ? 'very strong' : aspect.strength > 50 ? 'moderate' : 'weak';
  const applyingDesc = aspect.applying ? 'applying (growing stronger)' : 'separating (weakening)';

  return `${aspect.planet1} ${aspect.type} ${aspect.planet2}: ${strengthDesc}, ${applyingDesc}. ${info.description}`;
}

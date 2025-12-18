/**
 * Five Elements (Wu Xing) Logic
 * Manages the relationships between the five elements
 */

import { Element } from './bazi';

export interface ElementRelationships {
  produces: Element; // What this element produces
  producedBy: Element; // What produces this element
  controls: Element; // What this element controls/destroys
  controlledBy: Element; // What controls/destroys this element
}

/**
 * Get the Five Elements production cycle (生)
 * Wood → Fire → Earth → Metal → Water → Wood
 */
export function getProductionCycle(): { [key in Element]: Element } {
  return {
    Wood: 'Fire',
    Fire: 'Earth',
    Earth: 'Metal',
    Metal: 'Water',
    Water: 'Wood',
  };
}

/**
 * Get the Five Elements destruction/control cycle (克)
 * Wood → Earth → Water → Fire → Metal → Wood
 */
export function getDestructionCycle(): { [key in Element]: Element } {
  return {
    Wood: 'Earth',
    Earth: 'Water',
    Water: 'Fire',
    Fire: 'Metal',
    Metal: 'Wood',
  };
}

/**
 * Get all relationships for a specific element
 */
export function getElementRelationships(element: Element): ElementRelationships {
  const production = getProductionCycle();
  const destruction = getDestructionCycle();

  // Find what produces this element
  const producedBy = (Object.keys(production) as Element[]).find(
    (key) => production[key] === element
  ) as Element;

  // Find what controls this element
  const controlledBy = (Object.keys(destruction) as Element[]).find(
    (key) => destruction[key] === element
  ) as Element;

  return {
    produces: production[element],
    producedBy,
    controls: destruction[element],
    controlledBy,
  };
}

/**
 * Calculate compatibility between two elements (0-100)
 */
export function calculateElementCompatibility(element1: Element, element2: Element): number {
  if (element1 === element2) {
    return 80; // Same element - generally harmonious
  }

  const production = getProductionCycle();
  const destruction = getDestructionCycle();

  // Check if element1 produces element2 (very favorable)
  if (production[element1] === element2) {
    return 90;
  }

  // Check if element2 produces element1 (favorable)
  if (production[element2] === element1) {
    return 85;
  }

  // Check if element1 destroys element2 (conflicting)
  if (destruction[element1] === element2) {
    return 40;
  }

  // Check if element2 destroys element1 (conflicting)
  if (destruction[element2] === element1) {
    return 35;
  }

  // Neutral relationship
  return 60;
}

/**
 * Get lucky colors based on favorable elements
 */
export function getElementColors(element: Element): string[] {
  const colorMap: { [key in Element]: string[] } = {
    Wood: ['Green', 'Teal', 'Emerald'],
    Fire: ['Red', 'Orange', 'Pink', 'Purple'],
    Earth: ['Yellow', 'Brown', 'Beige', 'Tan'],
    Metal: ['White', 'Gold', 'Silver', 'Grey'],
    Water: ['Black', 'Blue', 'Navy', 'Indigo'],
  };

  return colorMap[element];
}

/**
 * Get element directions (for Feng Shui)
 */
export function getElementDirection(element: Element): string {
  const directionMap: { [key in Element]: string } = {
    Wood: 'East',
    Fire: 'South',
    Earth: 'Center',
    Metal: 'West',
    Water: 'North',
  };

  return directionMap[element];
}

/**
 * Get element season
 */
export function getElementSeason(element: Element): string {
  const seasonMap: { [key in Element]: string } = {
    Wood: 'Spring',
    Fire: 'Summer',
    Earth: 'Late Summer',
    Metal: 'Autumn',
    Water: 'Winter',
  };

  return seasonMap[element];
}

/**
 * Determine element balance in a chart
 */
export function analyzeElementBalance(elementCount: {
  [key in Element]: number;
}): {
  balanced: boolean;
  excessive: Element[];
  deficient: Element[];
  recommendations: string[];
} {
  const total = Object.values(elementCount).reduce((a, b) => a + b, 0);
  const average = total / 5;
  const threshold = average * 0.3; // 30% deviation threshold

  const excessive: Element[] = [];
  const deficient: Element[] = [];
  const recommendations: string[] = [];

  (Object.keys(elementCount) as Element[]).forEach((element) => {
    const count = elementCount[element];

    if (count > average + threshold) {
      excessive.push(element);
    } else if (count < average - threshold) {
      deficient.push(element);
    }
  });

  const balanced = excessive.length === 0 && deficient.length === 0;

  // Generate recommendations
  if (excessive.length > 0) {
    excessive.forEach((element) => {
      const destruction = getDestructionCycle();
      recommendations.push(
        `Excessive ${element}: Incorporate ${destruction[element]} element to balance`
      );
    });
  }

  if (deficient.length > 0) {
    deficient.forEach((element) => {
      const production = getProductionCycle();
      const relationships = getElementRelationships(element);
      recommendations.push(
        `Deficient ${element}: Strengthen with ${relationships.producedBy} element`
      );
    });
  }

  return {
    balanced,
    excessive,
    deficient,
    recommendations,
  };
}

/**
 * Get element personality traits
 */
export function getElementTraits(element: Element): string[] {
  const traitMap: { [key in Element]: string[] } = {
    Wood: [
      'Growth-oriented',
      'Flexible',
      'Creative',
      'Compassionate',
      'Idealistic',
      'Expansive',
    ],
    Fire: [
      'Passionate',
      'Dynamic',
      'Charismatic',
      'Enthusiastic',
      'Optimistic',
      'Expressive',
    ],
    Earth: [
      'Stable',
      'Practical',
      'Nurturing',
      'Reliable',
      'Patient',
      'Grounded',
    ],
    Metal: [
      'Structured',
      'Disciplined',
      'Precise',
      'Righteous',
      'Determined',
      'Independent',
    ],
    Water: [
      'Intuitive',
      'Adaptable',
      'Reflective',
      'Wise',
      'Philosophical',
      'Flowing',
    ],
  };

  return traitMap[element];
}

/**
 * Calculate element affinity for activities
 */
export function getElementActivities(element: Element): string[] {
  const activityMap: { [key in Element]: string[] } = {
    Wood: ['Gardening', 'Creative pursuits', 'Learning', 'Travel', 'Networking'],
    Fire: ['Public speaking', 'Performing', 'Socializing', 'Leadership', 'Sports'],
    Earth: ['Building', 'Organizing', 'Nurturing', 'Real estate', 'Agriculture'],
    Metal: ['Analysis', 'Structure', 'Finance', 'Engineering', 'Collecting'],
    Water: ['Research', 'Meditation', 'Writing', 'Music', 'Healing'],
  };

  return activityMap[element];
}

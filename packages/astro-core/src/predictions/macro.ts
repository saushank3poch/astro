/**
 * Macro Prediction Engine
 * Predicts which asset classes will perform best based on:
 * - Chinese year element (e.g., 2026 = Fire year)
 * - Western planetary transits (Jupiter, Saturn movements)
 * - Element harmony with asset classes
 */

import { Element } from '../chinese/bazi';
import { calculateChineseZodiac } from '../chinese/zodiac';
import { getChineseZodiacYear } from '../utils/date-utils';
import { getProductionCycle, getDestructionCycle, calculateElementCompatibility } from '../chinese/elements';

export interface MacroPredictionInput {
  year: number;
  assetClasses: string[]; // ['crypto', 'US_stocks', 'HK_stocks', 'DeFi', 'RWA']
  method: 'chinese' | 'western' | 'combined';
}

export interface FavorablePeriod {
  start: Date;
  end: Date;
  reason: string;
}

export interface AssetClassPrediction {
  assetClass: string;
  score: number; // 1-10
  reasoning: string;
  favorablePeriods: FavorablePeriod[];
  chineseElementScore?: number;
  westernTransitScore?: number;
}

export interface MacroPredictionOutput {
  year: number;
  chineseYearElement: string;
  chineseYearAnimal: string;
  predictions: AssetClassPrediction[];
  bestPerformers: string[];
  worstPerformers: string[];
  overallMarketEnergy: 'bullish' | 'bearish' | 'neutral' | 'volatile';
  overallReasoning: string;
}

/**
 * Map asset classes to their primary and secondary elements
 */
const ASSET_CLASS_ELEMENTS: {
  [key: string]: { primary: Element; secondary?: Element; description: string };
} = {
  crypto: {
    primary: 'Water',
    secondary: 'Metal',
    description: 'Digital currencies flow like water, backed by metal (technology/structure)',
  },
  US_stocks: {
    primary: 'Metal',
    secondary: 'Fire',
    description: 'Traditional finance (metal structure) with growth energy (fire)',
  },
  HK_stocks: {
    primary: 'Fire',
    secondary: 'Water',
    description: 'Asian markets (fire energy) with liquidity (water)',
  },
  China_stocks: {
    primary: 'Fire',
    secondary: 'Earth',
    description: 'Dragon energy (fire) with stability (earth)',
  },
  DeFi: {
    primary: 'Water',
    description: 'Pure liquidity and flow, decentralized like water',
  },
  RWA: {
    primary: 'Earth',
    secondary: 'Metal',
    description: 'Real-world assets (earth stability) with metal structure',
  },
  gold: {
    primary: 'Metal',
    description: 'Pure metal element, traditional store of value',
  },
  commodities: {
    primary: 'Earth',
    description: 'Physical resources from the earth',
  },
  tech_stocks: {
    primary: 'Metal',
    secondary: 'Water',
    description: 'Innovation (metal precision) with adaptability (water)',
  },
};

/**
 * Get Chinese year element based on Heavenly Stems cycle
 */
function getChineseYearElement(year: number): { element: Element; polarity: 'Yang' | 'Yin' } {
  // Heavenly Stems cycle: 10-year cycle for elements
  // Each element appears twice (Yang then Yin)
  const stemCycle: { element: Element; polarity: 'Yang' | 'Yin' }[] = [
    { element: 'Wood', polarity: 'Yang' },  // 甲 - 0, 10, 20...
    { element: 'Wood', polarity: 'Yin' },   // 乙 - 1, 11, 21...
    { element: 'Fire', polarity: 'Yang' },  // 丙 - 2, 12, 22...
    { element: 'Fire', polarity: 'Yin' },   // 丁 - 3, 13, 23...
    { element: 'Earth', polarity: 'Yang' }, // 戊 - 4, 14, 24...
    { element: 'Earth', polarity: 'Yin' },  // 己 - 5, 15, 25...
    { element: 'Metal', polarity: 'Yang' }, // 庚 - 6, 16, 26...
    { element: 'Metal', polarity: 'Yin' },  // 辛 - 7, 17, 27...
    { element: 'Water', polarity: 'Yang' }, // 壬 - 8, 18, 28...
    { element: 'Water', polarity: 'Yin' },  // 癸 - 9, 19, 29...
  ];

  // Base year 1924 is Jia (Wood Yang) - index 0
  const baseYear = 1924;
  const yearsSinceBase = year - baseYear;
  const stemIndex = ((yearsSinceBase % 10) + 10) % 10;

  return stemCycle[stemIndex];
}

/**
 * Calculate element harmony score (0-100)
 */
function calculateElementHarmony(yearElement: Element, assetElement: Element): number {
  return calculateElementCompatibility(yearElement, assetElement);
}

/**
 * Get Jupiter transit influence for the year
 * Jupiter changes signs roughly every year and represents expansion/growth
 */
function getJupiterInfluence(year: number): {
  sign: string;
  element: Element;
  influence: 'strong_growth' | 'moderate_growth' | 'consolidation';
} {
  // Jupiter's approximate 12-year cycle through zodiac
  const jupiterCycle = [
    { sign: 'Aries', element: 'Fire' as Element, influence: 'strong_growth' as const },
    { sign: 'Taurus', element: 'Earth' as Element, influence: 'consolidation' as const },
    { sign: 'Gemini', element: 'Air' as Element, influence: 'moderate_growth' as const },
    { sign: 'Cancer', element: 'Water' as Element, influence: 'moderate_growth' as const },
    { sign: 'Leo', element: 'Fire' as Element, influence: 'strong_growth' as const },
    { sign: 'Virgo', element: 'Earth' as Element, influence: 'consolidation' as const },
    { sign: 'Libra', element: 'Air' as Element, influence: 'moderate_growth' as const },
    { sign: 'Scorpio', element: 'Water' as Element, influence: 'moderate_growth' as const },
    { sign: 'Sagittarius', element: 'Fire' as Element, influence: 'strong_growth' as const },
    { sign: 'Capricorn', element: 'Earth' as Element, influence: 'consolidation' as const },
    { sign: 'Aquarius', element: 'Air' as Element, influence: 'strong_growth' as const },
    { sign: 'Pisces', element: 'Water' as Element, influence: 'moderate_growth' as const },
  ];

  // Approximate Jupiter position based on year
  // Jupiter was in Taurus in 2024
  const baseYear = 2024;
  const baseIndex = 1; // Taurus
  const yearDiff = year - baseYear;
  const index = (baseIndex + yearDiff) % 12;

  // Map Air to Metal for Chinese elements
  let jupiterElement = jupiterCycle[index].element;
  if (jupiterElement === 'Air' as any) {
    jupiterElement = 'Metal';
  }

  return {
    sign: jupiterCycle[index].sign,
    element: jupiterElement,
    influence: jupiterCycle[index].influence,
  };
}

/**
 * Get Saturn transit influence for the year
 * Saturn changes signs roughly every 2.5 years and represents contraction/discipline
 */
function getSaturnInfluence(year: number): {
  sign: string;
  element: Element;
  influence: 'restriction' | 'structure' | 'testing';
} {
  // Saturn's approximate 29-year cycle through zodiac
  const saturnCycle = [
    { sign: 'Aries', element: 'Fire' as Element, influence: 'testing' as const },
    { sign: 'Taurus', element: 'Earth' as Element, influence: 'structure' as const },
    { sign: 'Gemini', element: 'Air' as Element, influence: 'restriction' as const },
    { sign: 'Cancer', element: 'Water' as Element, influence: 'restriction' as const },
    { sign: 'Leo', element: 'Fire' as Element, influence: 'testing' as const },
    { sign: 'Virgo', element: 'Earth' as Element, influence: 'structure' as const },
    { sign: 'Libra', element: 'Air' as Element, influence: 'restriction' as const },
    { sign: 'Scorpio', element: 'Water' as Element, influence: 'restriction' as const },
    { sign: 'Sagittarius', element: 'Fire' as Element, influence: 'testing' as const },
    { sign: 'Capricorn', element: 'Earth' as Element, influence: 'structure' as const },
    { sign: 'Aquarius', element: 'Air' as Element, influence: 'testing' as const },
    { sign: 'Pisces', element: 'Water' as Element, influence: 'restriction' as const },
  ];

  // Saturn was in Pisces in 2024, moves to Aries in 2025
  const saturnPositions: { [key: number]: number } = {
    2024: 11, // Pisces
    2025: 0,  // Aries (enters in late May)
    2026: 0,  // Aries
    2027: 0,  // Aries
    2028: 1,  // Taurus
    2029: 1,  // Taurus
    2030: 1,  // Taurus
  };

  const index = saturnPositions[year] ?? ((year - 2024) * 0.4) % 12;

  // Map Air to Metal for Chinese elements
  let saturnElement = saturnCycle[Math.floor(index)].element;
  if (saturnElement === 'Air' as any) {
    saturnElement = 'Metal';
  }

  return {
    sign: saturnCycle[Math.floor(index)].sign,
    element: saturnElement,
    influence: saturnCycle[Math.floor(index)].influence,
  };
}

/**
 * Calculate Chinese astrology prediction score
 */
function calculateChineseScore(
  yearElement: Element,
  yearAnimal: string,
  assetElement: Element
): { score: number; reasoning: string } {
  const harmony = calculateElementHarmony(yearElement, assetElement);

  // Convert 0-100 to 1-10 scale
  const score = Math.max(1, Math.min(10, Math.round((harmony / 100) * 9) + 1));

  const production = getProductionCycle();
  const destruction = getDestructionCycle();

  let reasoning = '';

  if (production[yearElement] === assetElement) {
    reasoning = `${yearElement} year produces ${assetElement} energy - highly favorable`;
  } else if (production[assetElement] === yearElement) {
    reasoning = `${assetElement} produces ${yearElement} year energy - moderately favorable`;
  } else if (destruction[yearElement] === assetElement) {
    reasoning = `${yearElement} year controls ${assetElement} - challenging`;
  } else if (destruction[assetElement] === yearElement) {
    reasoning = `${assetElement} challenges ${yearElement} year - volatile`;
  } else if (yearElement === assetElement) {
    reasoning = `${yearElement} year strengthens ${assetElement} assets - harmonious`;
  } else {
    reasoning = `Neutral relationship between ${yearElement} year and ${assetElement} assets`;
  }

  return { score, reasoning };
}

/**
 * Calculate Western astrology prediction score
 */
function calculateWesternScore(
  jupiterData: ReturnType<typeof getJupiterInfluence>,
  saturnData: ReturnType<typeof getSaturnInfluence>,
  assetPrimary: Element,
  assetSecondary?: Element
): { score: number; reasoning: string } {
  // Jupiter influence (growth)
  const jupiterHarmony = calculateElementHarmony(jupiterData.element, assetPrimary);
  const jupiterBonus = jupiterData.influence === 'strong_growth' ? 20 :
                       jupiterData.influence === 'moderate_growth' ? 10 : 0;

  // Saturn influence (restriction)
  const saturnHarmony = calculateElementHarmony(saturnData.element, assetPrimary);
  const saturnPenalty = saturnData.influence === 'restriction' ? -15 :
                        saturnData.influence === 'testing' ? -10 : 0;

  // Secondary element bonus
  let secondaryBonus = 0;
  if (assetSecondary) {
    const secondaryJupiter = calculateElementHarmony(jupiterData.element, assetSecondary);
    secondaryBonus = (secondaryJupiter / 100) * 10;
  }

  // Calculate total score
  const totalScore = jupiterHarmony + jupiterBonus + saturnPenalty + secondaryBonus;
  const score = Math.max(1, Math.min(10, Math.round((totalScore / 100) * 9) + 1));

  const reasoning = `Jupiter in ${jupiterData.sign} (${jupiterData.influence}) ${jupiterHarmony > 70 ? 'favors' : 'challenges'} this sector. ` +
                   `Saturn in ${saturnData.sign} brings ${saturnData.influence}.`;

  return { score, reasoning };
}

/**
 * Generate favorable periods for the year
 */
function generateFavorablePeriods(
  year: number,
  assetElement: Element,
  yearElement: Element
): FavorablePeriod[] {
  const periods: FavorablePeriod[] = [];

  // Spring (Wood season) - Feb-Apr
  if (assetElement === 'Wood' || yearElement === 'Wood') {
    periods.push({
      start: new Date(year, 1, 4),
      end: new Date(year, 4, 5),
      reason: 'Spring season enhances Wood element energy',
    });
  }

  // Summer (Fire season) - May-Jul
  if (assetElement === 'Fire' || yearElement === 'Fire') {
    periods.push({
      start: new Date(year, 4, 6),
      end: new Date(year, 7, 7),
      reason: 'Summer season enhances Fire element energy',
    });
  }

  // Late Summer (Earth season) - Aug
  if (assetElement === 'Earth' || yearElement === 'Earth') {
    periods.push({
      start: new Date(year, 7, 8),
      end: new Date(year, 8, 7),
      reason: 'Late summer enhances Earth element stability',
    });
  }

  // Autumn (Metal season) - Sep-Nov
  if (assetElement === 'Metal' || yearElement === 'Metal') {
    periods.push({
      start: new Date(year, 8, 8),
      end: new Date(year, 10, 7),
      reason: 'Autumn season enhances Metal element structure',
    });
  }

  // Winter (Water season) - Dec-Jan
  if (assetElement === 'Water' || yearElement === 'Water') {
    periods.push({
      start: new Date(year, 10, 8),
      end: new Date(year + 1, 1, 3),
      reason: 'Winter season enhances Water element flow',
    });
  }

  return periods;
}

/**
 * Main macro prediction function
 */
export function generateMacroPrediction(input: MacroPredictionInput): MacroPredictionOutput {
  const { year, assetClasses, method } = input;

  // Get Chinese year data
  const yearDate = new Date(year, 0, 1);
  const chineseYearAnimal = calculateChineseZodiac(yearDate);
  const yearElementData = getChineseYearElement(year);
  const chineseYearElement = `${yearElementData.element} (${yearElementData.polarity})`;

  // Get Western transit data
  const jupiterData = getJupiterInfluence(year);
  const saturnData = getSaturnInfluence(year);

  // Generate predictions for each asset class
  const predictions: AssetClassPrediction[] = assetClasses.map((assetClass) => {
    const assetData = ASSET_CLASS_ELEMENTS[assetClass] || {
      primary: 'Metal' as Element,
      description: 'Unknown asset class',
    };

    let finalScore = 5;
    let combinedReasoning = '';
    let chineseElementScore: number | undefined;
    let westernTransitScore: number | undefined;

    if (method === 'chinese' || method === 'combined') {
      const chineseResult = calculateChineseScore(
        yearElementData.element,
        chineseYearAnimal,
        assetData.primary
      );
      chineseElementScore = chineseResult.score;
      combinedReasoning += `Chinese: ${chineseResult.reasoning}. `;

      if (method === 'chinese') {
        finalScore = chineseResult.score;
      }
    }

    if (method === 'western' || method === 'combined') {
      const westernResult = calculateWesternScore(
        jupiterData,
        saturnData,
        assetData.primary,
        assetData.secondary
      );
      westernTransitScore = westernResult.score;
      combinedReasoning += `Western: ${westernResult.reasoning}. `;

      if (method === 'western') {
        finalScore = westernResult.score;
      }
    }

    if (method === 'combined' && chineseElementScore && westernTransitScore) {
      finalScore = Math.round((chineseElementScore + westernTransitScore) / 2);
    }

    // Generate favorable periods
    const favorablePeriods = generateFavorablePeriods(
      year,
      assetData.primary,
      yearElementData.element
    );

    return {
      assetClass,
      score: finalScore,
      reasoning: combinedReasoning + assetData.description,
      favorablePeriods,
      chineseElementScore,
      westernTransitScore,
    };
  });

  // Sort by score to find best/worst performers
  const sorted = [...predictions].sort((a, b) => b.score - a.score);
  const bestPerformers = sorted.slice(0, 3).map((p) => p.assetClass);
  const worstPerformers = sorted.slice(-3).map((p) => p.assetClass);

  // Determine overall market energy
  const avgScore = predictions.reduce((sum, p) => sum + p.score, 0) / predictions.length;
  let overallMarketEnergy: 'bullish' | 'bearish' | 'neutral' | 'volatile';

  if (avgScore >= 7) {
    overallMarketEnergy = 'bullish';
  } else if (avgScore <= 4) {
    overallMarketEnergy = 'bearish';
  } else if (sorted[0].score - sorted[sorted.length - 1].score >= 5) {
    overallMarketEnergy = 'volatile';
  } else {
    overallMarketEnergy = 'neutral';
  }

  const overallReasoning = `Year of the ${chineseYearAnimal} (${chineseYearElement}). ` +
    `Jupiter in ${jupiterData.sign} brings ${jupiterData.influence}, ` +
    `while Saturn in ${saturnData.sign} creates ${saturnData.influence}. ` +
    `Overall market sentiment: ${overallMarketEnergy}.`;

  return {
    year,
    chineseYearElement,
    chineseYearAnimal,
    predictions,
    bestPerformers,
    worstPerformers,
    overallMarketEnergy,
    overallReasoning,
  };
}

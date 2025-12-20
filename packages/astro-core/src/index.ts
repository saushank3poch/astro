/**
 * Astro Core - Astrological Calculation Library
 * Main exports for Chinese and Western astrology calculations
 */

// ============================================================================
// UTILITIES
// ============================================================================
export * from './utils/date-utils';
export * from './utils/coordinates';

// ============================================================================
// CHINESE ASTROLOGY
// ============================================================================
export {
  ChineseZodiacAnimal,
  ChineseZodiacInfo,
  calculateChineseZodiac,
  getZodiacInfo as getChineseZodiacInfo,
  calculateZodiacCompatibility as calculateChineseZodiacCompatibility,
  getYearsForAnimal,
} from './chinese/zodiac';
export * from './chinese/bazi';
export * from './chinese/elements';
export * from './chinese/lucky-numbers';

// ============================================================================
// WESTERN ASTROLOGY
// ============================================================================
export {
  ZodiacSign,
  ZodiacElement,
  ZodiacModality,
  ZodiacSignInfo,
  calculateSunSign,
  getZodiacSignInfo as getWesternZodiacSignInfo,
  calculateZodiacCompatibility as calculateWesternZodiacCompatibility,
  getSignFromDegree,
  analyzeElementDistribution,
  analyzeModalityDistribution,
} from './western/zodiac';
export * from './western/planets';
export * from './western/houses';
export * from './western/aspects';

// ============================================================================
// PREDICTION ENGINES
// ============================================================================
export * from './predictions/macro';
export * from './predictions/timing';
export * from './predictions/divination';

// ============================================================================
// COMPATIBILITY & PERSONALIZATION
// ============================================================================
export * from './compatibility';

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

import { calculateChineseZodiac, getZodiacInfo as getChineseZodiacInfo } from './chinese/zodiac';
import { calculateBaziChart, BaziChart } from './chinese/bazi';
import { calculateLuckyNumbers, calculateUnluckyNumbers } from './chinese/lucky-numbers';
import { getElementColors } from './chinese/elements';
import {
  calculateSunSign,
  getZodiacSignInfo,
  analyzeElementDistribution,
  analyzeModalityDistribution,
  ZodiacSign,
} from './western/zodiac';
import {
  calculateAllPlanets,
  calculateRisingSign,
  calculateMoonSign,
  determineDominantPlanet,
  PlanetaryPosition,
} from './western/planets';
import { calculateHouses, getPlanetHouse, HouseSystem } from './western/houses';
import { calculateAllAspects, Aspect } from './western/aspects';
import { parseLocation, GeoLocation } from './utils/coordinates';

/**
 * Complete birth chart data structure
 */
export interface CompleteBirthChart {
  // Input data
  birthDate: Date;
  birthTime: {
    hour: number;
    minute: number;
  };
  location: GeoLocation;

  // Chinese Astrology
  chinese: {
    zodiacAnimal: string;
    baziChart: BaziChart;
    luckyNumbers: number[];
    unluckyNumbers: number[];
    luckyColors: string[];
  };

  // Western Astrology
  western: {
    sunSign: ZodiacSign;
    moonSign: ZodiacSign;
    risingSign: ZodiacSign;
    planets: PlanetaryPosition[];
    houses: HouseSystem;
    aspects: Aspect[];
    dominantPlanet?: string;
    elementDistribution: {
      Fire: number;
      Earth: number;
      Air: number;
      Water: number;
    };
    dominantElement: string;
    dominantModality: string;
  };
}

/**
 * Generate a complete birth chart for a person or asset
 */
export function generateBirthChart(
  birthDate: Date,
  birthHour: number,
  birthMinute: number,
  locationData: any
): CompleteBirthChart {
  // Parse location
  const location = parseLocation(locationData);

  // ====== CHINESE ASTROLOGY ======
  const chineseZodiacAnimal = calculateChineseZodiac(birthDate);
  const chineseZodiacInfo = getChineseZodiacInfo(chineseZodiacAnimal);
  const baziChart = calculateBaziChart(birthDate, birthHour);
  const luckyNumbers = calculateLuckyNumbers(baziChart, chineseZodiacAnimal);
  const unluckyNumbers = calculateUnluckyNumbers(baziChart);

  // Get lucky colors from favorable elements
  const luckyColors: string[] = [];
  baziChart.favorableElements.forEach((element) => {
    luckyColors.push(...getElementColors(element));
  });

  // ====== WESTERN ASTROLOGY ======
  const sunSign = calculateSunSign(birthDate);
  const moonSign = calculateMoonSign(birthDate);
  const risingSign = calculateRisingSign(birthDate, location.latitude, location.longitude);

  // Calculate house system
  const houses = calculateHouses(birthDate, location.latitude, location.longitude);

  // Calculate planetary positions
  const planetaryPositions = calculateAllPlanets(birthDate);

  // Assign planets to houses
  const planetsWithHouses = planetaryPositions.map((planet) => ({
    ...planet,
    house: getPlanetHouse(planet.absoluteDegree, houses.houses),
  }));

  // Calculate aspects
  const aspects = calculateAllAspects(planetsWithHouses);

  // Determine dominant planet
  const dominantPlanetEnum = determineDominantPlanet(planetsWithHouses);

  // Analyze element and modality distribution
  const planetSigns = planetsWithHouses.map((p) => p.sign);
  const elementDist = analyzeElementDistribution(planetSigns);
  const modalityDist = analyzeModalityDistribution(planetSigns);

  return {
    birthDate,
    birthTime: {
      hour: birthHour,
      minute: birthMinute,
    },
    location,

    chinese: {
      zodiacAnimal: chineseZodiacAnimal,
      baziChart,
      luckyNumbers,
      unluckyNumbers,
      luckyColors: Array.from(new Set(luckyColors)),
    },

    western: {
      sunSign,
      moonSign,
      risingSign,
      planets: planetsWithHouses,
      houses,
      aspects,
      dominantPlanet: dominantPlanetEnum,
      elementDistribution: elementDist.distribution,
      dominantElement: elementDist.dominant,
      dominantModality: modalityDist.dominant,
    },
  };
}

/**
 * Calculate compatibility between two birth charts
 */
export function calculateCompatibility(
  chart1: CompleteBirthChart,
  chart2: CompleteBirthChart
): {
  overall: number;
  chinese: {
    zodiacCompatibility: number;
    elementCompatibility: number;
  };
  western: {
    sunSignCompatibility: number;
    moonSignCompatibility: number;
    risingSignCompatibility: number;
  };
} {
  const { calculateZodiacCompatibility: calcChineseCompat } = require('./chinese/zodiac');
  const { calculateElementCompatibility } = require('./chinese/elements');
  const { calculateZodiacCompatibility: calcWesternCompat } = require('./western/zodiac');

  // Chinese compatibility
  const zodiacCompatibility = calcChineseCompat(
    chart1.chinese.zodiacAnimal,
    chart2.chinese.zodiacAnimal
  );

  const elementCompatibility = calculateElementCompatibility(
    chart1.chinese.baziChart.dayMaster,
    chart2.chinese.baziChart.dayMaster
  );

  // Western compatibility
  const sunSignCompatibility = calcWesternCompat(chart1.western.sunSign, chart2.western.sunSign);
  const moonSignCompatibility = calcWesternCompat(
    chart1.western.moonSign,
    chart2.western.moonSign
  );
  const risingSignCompatibility = calcWesternCompat(
    chart1.western.risingSign,
    chart2.western.risingSign
  );

  // Calculate overall compatibility
  const overall = Math.round(
    (zodiacCompatibility +
      elementCompatibility +
      sunSignCompatibility +
      moonSignCompatibility +
      risingSignCompatibility) /
      5
  );

  return {
    overall,
    chinese: {
      zodiacCompatibility,
      elementCompatibility,
    },
    western: {
      sunSignCompatibility,
      moonSignCompatibility,
      risingSignCompatibility,
    },
  };
}

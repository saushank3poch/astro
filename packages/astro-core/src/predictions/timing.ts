/**
 * Asset Timing Prediction Engine
 * Predicts optimal timing for buying/selling specific assets based on:
 * - Asset birth chart transits
 * - Current planetary positions
 * - Favorable and challenging aspects
 */

import { CompleteBirthChart } from '../index';
import { calculateAllPlanets, PlanetaryPosition, Planet, calculatePlanetaryStrength } from '../western/planets';
import { calculateAspect, Aspect, AspectType, getAspectInfo } from '../western/aspects';
import { ZodiacSign } from '../western/zodiac';

export interface TimingPredictionInput {
  assetId: string;
  assetSymbol: string;
  assetBirthChart: CompleteBirthChart;
  targetDate?: Date; // Optional: predict for specific date
  timeframe: 'short_term' | 'medium_term' | 'long_term'; // days, weeks, months
}

export interface TimingPeriod {
  start: Date;
  end: Date;
  score: number; // 1-10
  aspects: string[]; // e.g., "Jupiter trine natal Sun"
  reasoning: string;
}

export interface TimingPredictionOutput {
  assetSymbol: string;
  assetId: string;
  currentDate: Date;
  currentScore: number; // 1-10 (current timing favorability)
  currentAspects: Aspect[];
  currentInterpretation: string;
  favorablePeriods: TimingPeriod[];
  challengingPeriods: TimingPeriod[];
  bestEntryDate: Date;
  bestExitDate?: Date;
  recommendation: string;
  detailedAnalysis: {
    jupiterTransit: string;
    saturnTransit: string;
    marsTransit: string;
    keyAspects: string[];
    retrogradeWarnings: string[];
  };
}

/**
 * Calculate transits between current planets and natal chart
 */
function calculateTransits(
  currentPlanets: PlanetaryPosition[],
  natalPlanets: PlanetaryPosition[]
): Aspect[] {
  const transits: Aspect[] = [];

  // Check each current planet against each natal planet
  for (const transitPlanet of currentPlanets) {
    for (const natalPlanet of natalPlanets) {
      const aspect = calculateAspect(transitPlanet, natalPlanet);
      if (aspect) {
        transits.push(aspect);
      }
    }
  }

  return transits;
}

/**
 * Score transit aspects for timing favorability
 */
function scoreTransitAspects(aspects: Aspect[]): number {
  if (aspects.length === 0) return 5; // Neutral

  let totalScore = 0;
  let significantAspects = 0;

  for (const aspect of aspects) {
    const info = getAspectInfo(aspect.type);
    const planetWeight = getPlanetWeight(aspect.planet1); // Transit planet

    let aspectScore = 5; // Neutral base

    if (info.nature === 'harmonious') {
      aspectScore = 8;
    } else if (info.nature === 'challenging') {
      aspectScore = 3;
    }

    // Stronger aspects matter more
    const strengthFactor = aspect.strength / 100;
    const weightedScore = aspectScore * strengthFactor * planetWeight;

    totalScore += weightedScore;
    significantAspects += strengthFactor * planetWeight;
  }

  if (significantAspects === 0) return 5;

  // Average score, scaled 1-10
  const avgScore = totalScore / significantAspects;
  return Math.max(1, Math.min(10, Math.round(avgScore)));
}

/**
 * Get planet weight for timing analysis
 * Major planets have more influence
 */
function getPlanetWeight(planet: Planet): number {
  const weights: { [key in Planet]: number } = {
    Sun: 1.5,
    Moon: 1.0,  // Fast moving, less weight for long-term
    Mercury: 0.8,
    Venus: 1.0,
    Mars: 1.2,
    Jupiter: 1.8, // Expansion/growth - very important
    Saturn: 1.6, // Restriction/structure - very important
    Uranus: 1.3, // Change/volatility
    Neptune: 1.0, // Confusion/illusion
    Pluto: 1.4,  // Transformation/power
  };

  return weights[planet];
}

/**
 * Find favorable and challenging periods in the future
 */
function analyzeFuturePeriods(
  startDate: Date,
  natalPlanets: PlanetaryPosition[],
  timeframe: 'short_term' | 'medium_term' | 'long_term'
): { favorable: TimingPeriod[]; challenging: TimingPeriod[] } {
  const favorable: TimingPeriod[] = [];
  const challenging: TimingPeriod[] = [];

  // Determine how many days to look ahead
  const daysToAnalyze = timeframe === 'short_term' ? 30 :
                        timeframe === 'medium_term' ? 90 : 365;

  // Sample key dates (weekly for short-term, bi-weekly for medium, monthly for long-term)
  const sampleInterval = timeframe === 'short_term' ? 7 :
                         timeframe === 'medium_term' ? 14 : 30;

  for (let day = 0; day < daysToAnalyze; day += sampleInterval) {
    const checkDate = new Date(startDate.getTime() + day * 24 * 60 * 60 * 1000);
    const endDate = new Date(checkDate.getTime() + sampleInterval * 24 * 60 * 60 * 1000);

    const currentPlanets = calculateAllPlanets(checkDate);
    const transits = calculateTransits(currentPlanets, natalPlanets);
    const score = scoreTransitAspects(transits);

    // Get key aspects for this period
    const keyAspects = transits
      .filter(a => a.strength > 60)
      .map(a => `${a.planet1} ${a.type} natal ${a.planet2}`)
      .slice(0, 3);

    const reasoning = generatePeriodReasoning(transits, currentPlanets);

    const period: TimingPeriod = {
      start: checkDate,
      end: endDate,
      score,
      aspects: keyAspects,
      reasoning,
    };

    if (score >= 7) {
      favorable.push(period);
    } else if (score <= 4) {
      challenging.push(period);
    }
  }

  return { favorable, challenging };
}

/**
 * Generate reasoning for a time period
 */
function generatePeriodReasoning(transits: Aspect[], currentPlanets: PlanetaryPosition[]): string {
  const reasons: string[] = [];

  // Check Jupiter transits (expansion)
  const jupiterTransits = transits.filter(a => a.planet1 === 'Jupiter');
  if (jupiterTransits.length > 0) {
    const harmonious = jupiterTransits.filter(a => {
      const info = getAspectInfo(a.type);
      return info.nature === 'harmonious';
    });
    if (harmonious.length > 0) {
      reasons.push('Jupiter brings growth opportunities');
    }
  }

  // Check Saturn transits (caution)
  const saturnTransits = transits.filter(a => a.planet1 === 'Saturn');
  if (saturnTransits.length > 0) {
    const challenging = saturnTransits.filter(a => {
      const info = getAspectInfo(a.type);
      return info.nature === 'challenging';
    });
    if (challenging.length > 0) {
      reasons.push('Saturn advises caution and patience');
    }
  }

  // Check Mars transits (action/volatility)
  const marsTransits = transits.filter(a => a.planet1 === 'Mars');
  if (marsTransits.length > 0) {
    reasons.push('Mars brings energy and potential volatility');
  }

  // Check for retrogrades
  const retrogrades = currentPlanets.filter(p => p.retrograde && ['Mercury', 'Venus', 'Mars'].includes(p.planet));
  if (retrogrades.length > 0) {
    reasons.push(`${retrogrades.map(r => r.planet).join(', ')} retrograde - review and reflect`);
  }

  return reasons.join('. ') || 'Neutral planetary influences';
}

/**
 * Interpret current aspects
 */
function interpretCurrentAspects(aspects: Aspect[], score: number): string {
  if (aspects.length === 0) {
    return 'No significant planetary aspects affecting this asset currently. Neutral timing.';
  }

  const interpretations: string[] = [];

  // Group by transit planet
  const byPlanet: { [key in Planet]?: Aspect[] } = {};
  aspects.forEach(aspect => {
    if (!byPlanet[aspect.planet1]) {
      byPlanet[aspect.planet1] = [];
    }
    byPlanet[aspect.planet1]!.push(aspect);
  });

  // Interpret major planet transits
  if (byPlanet.Jupiter && byPlanet.Jupiter.length > 0) {
    const harmonious = byPlanet.Jupiter.filter(a => getAspectInfo(a.type).nature === 'harmonious');
    if (harmonious.length > 0) {
      interpretations.push('Jupiter transits suggest expansion and growth potential');
    } else {
      interpretations.push('Jupiter transits indicate opportunities requiring careful navigation');
    }
  }

  if (byPlanet.Saturn && byPlanet.Saturn.length > 0) {
    interpretations.push('Saturn transits call for patience and disciplined approach');
  }

  if (byPlanet.Uranus && byPlanet.Uranus.length > 0) {
    interpretations.push('Uranus brings unexpected changes and volatility');
  }

  if (byPlanet.Pluto && byPlanet.Pluto.length > 0) {
    interpretations.push('Pluto indicates deep transformation and power dynamics');
  }

  // Overall assessment
  if (score >= 7) {
    interpretations.push('OVERALL: Favorable timing for entry or accumulation');
  } else if (score >= 5) {
    interpretations.push('OVERALL: Neutral timing - wait for clearer signals');
  } else {
    interpretations.push('OVERALL: Challenging period - consider waiting or reducing exposure');
  }

  return interpretations.join('. ') + '.';
}

/**
 * Get detailed transit analysis for key planets
 */
function getDetailedTransitAnalysis(
  currentPlanets: PlanetaryPosition[],
  natalPlanets: PlanetaryPosition[],
  transits: Aspect[]
): {
  jupiterTransit: string;
  saturnTransit: string;
  marsTransit: string;
  keyAspects: string[];
  retrogradeWarnings: string[];
} {
  const jupiter = currentPlanets.find(p => p.planet === 'Jupiter');
  const saturn = currentPlanets.find(p => p.planet === 'Saturn');
  const mars = currentPlanets.find(p => p.planet === 'Mars');

  const jupiterAspects = transits.filter(a => a.planet1 === 'Jupiter');
  const saturnAspects = transits.filter(a => a.planet1 === 'Saturn');
  const marsAspects = transits.filter(a => a.planet1 === 'Mars');

  const jupiterTransit = jupiter
    ? `Jupiter in ${jupiter.sign} (${jupiter.degree.toFixed(1)}°)` +
      (jupiterAspects.length > 0 ? ` - ${jupiterAspects.length} active aspects` : '')
    : 'Jupiter position unavailable';

  const saturnTransit = saturn
    ? `Saturn in ${saturn.sign} (${saturn.degree.toFixed(1)}°)` +
      (saturnAspects.length > 0 ? ` - ${saturnAspects.length} active aspects` : '')
    : 'Saturn position unavailable';

  const marsTransit = mars
    ? `Mars in ${mars.sign} (${mars.degree.toFixed(1)}°)` +
      (marsAspects.length > 0 ? ` - ${marsAspects.length} active aspects` : '')
    : 'Mars position unavailable';

  const keyAspects = transits
    .filter(a => a.strength > 70)
    .map(a => `${a.planet1} ${a.type} natal ${a.planet2} (${a.strength.toFixed(0)}% strength)`)
    .slice(0, 5);

  const retrogradeWarnings = currentPlanets
    .filter(p => p.retrograde)
    .map(p => `${p.planet} retrograde in ${p.sign} - delays and reviews in ${getPlanetKeyword(p.planet)} matters`);

  return {
    jupiterTransit,
    saturnTransit,
    marsTransit,
    keyAspects,
    retrogradeWarnings,
  };
}

/**
 * Get keyword for planet
 */
function getPlanetKeyword(planet: Planet): string {
  const keywords: { [key in Planet]: string } = {
    Sun: 'identity/vitality',
    Moon: 'emotions/instincts',
    Mercury: 'communication/thinking',
    Venus: 'value/harmony',
    Mars: 'action/energy',
    Jupiter: 'growth/expansion',
    Saturn: 'structure/discipline',
    Uranus: 'change/innovation',
    Neptune: 'spirituality/illusion',
    Pluto: 'transformation/power',
  };
  return keywords[planet];
}

/**
 * Generate recommendation based on analysis
 */
function generateRecommendation(
  currentScore: number,
  favorablePeriods: TimingPeriod[],
  challengingPeriods: TimingPeriod[]
): string {
  const recommendations: string[] = [];

  if (currentScore >= 7) {
    recommendations.push('Current timing is favorable for entry or adding to position.');
  } else if (currentScore >= 5) {
    recommendations.push('Current timing is neutral - no urgent action needed.');
  } else {
    recommendations.push('Current timing is challenging - consider waiting for better conditions.');
  }

  if (favorablePeriods.length > 0) {
    const nextFavorable = favorablePeriods[0];
    const daysUntil = Math.round((nextFavorable.start.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntil > 0 && daysUntil < 30) {
      recommendations.push(
        `Next favorable period begins in ${daysUntil} days (${nextFavorable.start.toDateString()}).`
      );
    } else if (daysUntil <= 0 && currentScore < 7) {
      recommendations.push('Currently in a favorable period - consider taking advantage.');
    }
  }

  if (challengingPeriods.length > 0) {
    const nextChallenging = challengingPeriods[0];
    const daysUntil = Math.round((nextChallenging.start.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntil > 0 && daysUntil < 14) {
      recommendations.push(
        `Warning: Challenging period approaching in ${daysUntil} days (${nextChallenging.start.toDateString()}).`
      );
    }
  }

  recommendations.push(
    'Disclaimer: This astrological analysis is for educational/entertainment purposes only. ' +
    'Always conduct fundamental and technical analysis before making investment decisions.'
  );

  return recommendations.join(' ');
}

/**
 * Main timing prediction function
 */
export function generateTimingPrediction(input: TimingPredictionInput): TimingPredictionOutput {
  const { assetId, assetSymbol, assetBirthChart, targetDate, timeframe } = input;

  const currentDate = targetDate || new Date();
  const natalPlanets = assetBirthChart.western.planets;

  // Calculate current planetary positions
  const currentPlanets = calculateAllPlanets(currentDate);

  // Calculate transits
  const currentTransits = calculateTransits(currentPlanets, natalPlanets);

  // Score current timing
  const currentScore = scoreTransitAspects(currentTransits);

  // Interpret current aspects
  const currentInterpretation = interpretCurrentAspects(currentTransits, currentScore);

  // Analyze future periods
  const { favorable, challenging } = analyzeFuturePeriods(currentDate, natalPlanets, timeframe);

  // Find best entry date
  const bestEntryDate = favorable.length > 0
    ? favorable.reduce((best, period) =>
        period.score > best.score ? period : best
      ).start
    : currentDate;

  // Find best exit date (sell high)
  const bestExitDate = favorable.length > 1
    ? favorable[favorable.length - 1].end
    : undefined;

  // Get detailed analysis
  const detailedAnalysis = getDetailedTransitAnalysis(currentPlanets, natalPlanets, currentTransits);

  // Generate recommendation
  const recommendation = generateRecommendation(currentScore, favorable, challenging);

  return {
    assetSymbol,
    assetId,
    currentDate,
    currentScore,
    currentAspects: currentTransits,
    currentInterpretation,
    favorablePeriods: favorable,
    challengingPeriods: challenging,
    bestEntryDate,
    bestExitDate,
    recommendation,
    detailedAnalysis,
  };
}

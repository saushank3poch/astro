/**
 * Planetary Positions Calculator
 * Uses astronomy-engine for precise calculations
 */

import * as Astronomy from 'astronomy-engine';
import { ZodiacSign, getSignFromDegree } from './zodiac';

export type Planet =
  | 'Sun'
  | 'Moon'
  | 'Mercury'
  | 'Venus'
  | 'Mars'
  | 'Jupiter'
  | 'Saturn'
  | 'Uranus'
  | 'Neptune'
  | 'Pluto';

export interface PlanetaryPosition {
  planet: Planet;
  sign: ZodiacSign;
  degree: number; // Degree within the sign (0-30)
  absoluteDegree: number; // Absolute degree (0-360)
  house: number; // House number (1-12)
  retrograde: boolean;
}

export interface PlanetaryChart {
  positions: PlanetaryPosition[];
  sunSign: ZodiacSign;
  moonSign: ZodiacSign;
  risingSign: ZodiacSign; // Ascendant
  dominantPlanet?: Planet;
}

/**
 * Calculate ecliptic longitude for a celestial body
 */
function calculateEclipticLongitude(
  body: Astronomy.Body,
  date: Date
): { longitude: number; latitude: number } {
  // Create a default observer at equator for geocentric calculations
  const observer = new Astronomy.Observer(0, 0, 0);
  const equator = Astronomy.Equator(body, date, observer, true, true);
  const ecliptic = Astronomy.Ecliptic(equator.vec);

  return {
    longitude: ecliptic.elon,
    latitude: ecliptic.elat,
  };
}

/**
 * Calculate position of a single planet
 */
export function calculatePlanetPosition(
  planet: Planet,
  date: Date,
  houseNumber: number = 1
): PlanetaryPosition {
  // Map our planet names to astronomy-engine Body enum
  const bodyMap: { [key in Planet]: Astronomy.Body } = {
    Sun: Astronomy.Body.Sun,
    Moon: Astronomy.Body.Moon,
    Mercury: Astronomy.Body.Mercury,
    Venus: Astronomy.Body.Venus,
    Mars: Astronomy.Body.Mars,
    Jupiter: Astronomy.Body.Jupiter,
    Saturn: Astronomy.Body.Saturn,
    Uranus: Astronomy.Body.Uranus,
    Neptune: Astronomy.Body.Neptune,
    Pluto: Astronomy.Body.Pluto,
  };

  const body = bodyMap[planet];
  const { longitude } = calculateEclipticLongitude(body, date);

  // Normalize to 0-360
  const absoluteDegree = ((longitude % 360) + 360) % 360;

  // Get zodiac sign and degree within sign
  const { sign, degreesInSign } = getSignFromDegree(absoluteDegree);

  // Check for retrograde motion (simplified)
  const retrograde = isRetrograde(planet, date);

  return {
    planet,
    sign,
    degree: degreesInSign,
    absoluteDegree,
    house: houseNumber,
    retrograde,
  };
}

/**
 * Check if a planet is in retrograde motion
 * Simplified version - checks velocity
 */
function isRetrograde(planet: Planet, date: Date): boolean {
  // Sun and Moon are never retrograde
  if (planet === 'Sun' || planet === 'Moon') {
    return false;
  }

  const bodyMap: { [key in Planet]?: Astronomy.Body } = {
    Mercury: Astronomy.Body.Mercury,
    Venus: Astronomy.Body.Venus,
    Mars: Astronomy.Body.Mars,
    Jupiter: Astronomy.Body.Jupiter,
    Saturn: Astronomy.Body.Saturn,
    Uranus: Astronomy.Body.Uranus,
    Neptune: Astronomy.Body.Neptune,
    Pluto: Astronomy.Body.Pluto,
  };

  const body = bodyMap[planet];
  if (!body) return false;

  try {
    // Calculate position at current time and 1 day later
    const pos1 = calculateEclipticLongitude(body, date);
    const futureDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
    const pos2 = calculateEclipticLongitude(body, futureDate);

    // If longitude decreased (accounting for wrap-around), it's retrograde
    let diff = pos2.longitude - pos1.longitude;

    // Handle wrap-around at 0/360 degrees
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    return diff < 0;
  } catch (error) {
    return false;
  }
}

/**
 * Calculate positions of all planets
 */
export function calculateAllPlanets(
  date: Date,
  houses: number[] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
): PlanetaryPosition[] {
  const planets: Planet[] = [
    'Sun',
    'Moon',
    'Mercury',
    'Venus',
    'Mars',
    'Jupiter',
    'Saturn',
    'Uranus',
    'Neptune',
    'Pluto',
  ];

  return planets.map((planet, index) =>
    calculatePlanetPosition(planet, date, houses[index] || 1)
  );
}

/**
 * Calculate Sun sign from birth date
 */
export function calculateSunSignFromDate(date: Date): ZodiacSign {
  const position = calculatePlanetPosition('Sun', date);
  return position.sign;
}

/**
 * Calculate Moon sign from birth date
 */
export function calculateMoonSign(date: Date): ZodiacSign {
  const position = calculatePlanetPosition('Moon', date);
  return position.sign;
}

/**
 * Calculate Rising Sign (Ascendant) from birth time and location
 */
export function calculateRisingSign(
  date: Date,
  latitude: number,
  longitude: number
): ZodiacSign {
  try {
    // Calculate local sidereal time using our utility function
    const { calculateJulianDay, calculateSiderealTime } = require('../utils/date-utils');

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();

    const jd = calculateJulianDay(year, month, day, hour, minute, 0);
    const lst = calculateSiderealTime(jd, longitude);

    // Convert LST to ecliptic longitude for ascendant
    // This is a simplified calculation
    const ascendantDegree = (lst + 90) % 360;

    const { sign } = getSignFromDegree(ascendantDegree);
    return sign;
  } catch (error) {
    // Fallback to sun sign if calculation fails
    return calculateSunSignFromDate(date);
  }
}

/**
 * Determine dominant planet based on positions and aspects
 */
export function determineDominantPlanet(positions: PlanetaryPosition[]): Planet | undefined {
  // Simplified: Count planets in each sign and their angular relationships
  const planetScores: { [key in Planet]?: number } = {};

  positions.forEach((pos) => {
    if (!planetScores[pos.planet]) {
      planetScores[pos.planet] = 0;
    }

    // Add score for angular houses (1, 4, 7, 10)
    if ([1, 4, 7, 10].includes(pos.house)) {
      planetScores[pos.planet]! += 3;
    }

    // Add score for being in own sign (dignity)
    const dignities: { [key in Planet]?: ZodiacSign[] } = {
      Sun: ['Leo'],
      Moon: ['Cancer'],
      Mercury: ['Gemini', 'Virgo'],
      Venus: ['Taurus', 'Libra'],
      Mars: ['Aries', 'Scorpio'],
      Jupiter: ['Sagittarius', 'Pisces'],
      Saturn: ['Capricorn', 'Aquarius'],
    };

    if (dignities[pos.planet]?.includes(pos.sign)) {
      planetScores[pos.planet]! += 2;
    }

    // Base score
    planetScores[pos.planet]! += 1;
  });

  // Find planet with highest score
  let dominantPlanet: Planet | undefined;
  let maxScore = 0;

  (Object.keys(planetScores) as Planet[]).forEach((planet) => {
    if (planetScores[planet]! > maxScore) {
      maxScore = planetScores[planet]!;
      dominantPlanet = planet;
    }
  });

  return dominantPlanet;
}

/**
 * Get planet characteristics
 */
export function getPlanetInfo(planet: Planet): {
  name: string;
  symbol: string;
  represents: string[];
  keywords: string[];
} {
  const planetInfo: {
    [key in Planet]: {
      name: string;
      symbol: string;
      represents: string[];
      keywords: string[];
    };
  } = {
    Sun: {
      name: 'Sun',
      symbol: '☉',
      represents: ['Self', 'Ego', 'Vitality', 'Conscious mind'],
      keywords: ['Identity', 'Purpose', 'Willpower', 'Life force'],
    },
    Moon: {
      name: 'Moon',
      symbol: '☽',
      represents: ['Emotions', 'Instincts', 'Subconscious', 'Habits'],
      keywords: ['Feelings', 'Intuition', 'Nurturing', 'Security'],
    },
    Mercury: {
      name: 'Mercury',
      symbol: '☿',
      represents: ['Communication', 'Intellect', 'Logic', 'Learning'],
      keywords: ['Thinking', 'Speaking', 'Writing', 'Analysis'],
    },
    Venus: {
      name: 'Venus',
      symbol: '♀',
      represents: ['Love', 'Beauty', 'Harmony', 'Values'],
      keywords: ['Relationships', 'Art', 'Pleasure', 'Attraction'],
    },
    Mars: {
      name: 'Mars',
      symbol: '♂',
      represents: ['Action', 'Energy', 'Desire', 'Aggression'],
      keywords: ['Drive', 'Passion', 'Courage', 'Competition'],
    },
    Jupiter: {
      name: 'Jupiter',
      symbol: '♃',
      represents: ['Expansion', 'Growth', 'Wisdom', 'Luck'],
      keywords: ['Optimism', 'Philosophy', 'Abundance', 'Higher learning'],
    },
    Saturn: {
      name: 'Saturn',
      symbol: '♄',
      represents: ['Structure', 'Discipline', 'Responsibility', 'Limitations'],
      keywords: ['Authority', 'Maturity', 'Karma', 'Time'],
    },
    Uranus: {
      name: 'Uranus',
      symbol: '♅',
      represents: ['Change', 'Innovation', 'Revolution', 'Independence'],
      keywords: ['Originality', 'Freedom', 'Technology', 'Awakening'],
    },
    Neptune: {
      name: 'Neptune',
      symbol: '♆',
      represents: ['Spirituality', 'Dreams', 'Illusion', 'Compassion'],
      keywords: ['Imagination', 'Mysticism', 'Inspiration', 'Transcendence'],
    },
    Pluto: {
      name: 'Pluto',
      symbol: '♇',
      represents: ['Transformation', 'Power', 'Rebirth', 'Intensity'],
      keywords: ['Regeneration', 'Control', 'Depth', 'Evolution'],
    },
  };

  return planetInfo[planet];
}

/**
 * Calculate planetary strength (dignity/debility)
 */
export function calculatePlanetaryStrength(position: PlanetaryPosition): number {
  let strength = 50; // Base strength

  // Dignity (in own sign)
  const dignities: { [key in Planet]?: ZodiacSign[] } = {
    Sun: ['Leo'],
    Moon: ['Cancer'],
    Mercury: ['Gemini', 'Virgo'],
    Venus: ['Taurus', 'Libra'],
    Mars: ['Aries', 'Scorpio'],
    Jupiter: ['Sagittarius', 'Pisces'],
    Saturn: ['Capricorn', 'Aquarius'],
    Uranus: ['Aquarius'],
    Neptune: ['Pisces'],
    Pluto: ['Scorpio'],
  };

  if (dignities[position.planet]?.includes(position.sign)) {
    strength += 20;
  }

  // Exaltation (highest strength)
  const exaltations: { [key in Planet]?: ZodiacSign } = {
    Sun: 'Aries',
    Moon: 'Taurus',
    Mercury: 'Virgo',
    Venus: 'Pisces',
    Mars: 'Capricorn',
    Jupiter: 'Cancer',
    Saturn: 'Libra',
  };

  if (exaltations[position.planet] === position.sign) {
    strength += 25;
  }

  // Detriment (opposite of dignity)
  const detriments: { [key in Planet]?: ZodiacSign[] } = {
    Sun: ['Aquarius'],
    Moon: ['Capricorn'],
    Mercury: ['Sagittarius', 'Pisces'],
    Venus: ['Aries', 'Scorpio'],
    Mars: ['Taurus', 'Libra'],
    Jupiter: ['Gemini', 'Virgo'],
    Saturn: ['Cancer', 'Leo'],
  };

  if (detriments[position.planet]?.includes(position.sign)) {
    strength -= 20;
  }

  // Fall (opposite of exaltation)
  const falls: { [key in Planet]?: ZodiacSign } = {
    Sun: 'Libra',
    Moon: 'Scorpio',
    Mercury: 'Pisces',
    Venus: 'Virgo',
    Mars: 'Cancer',
    Jupiter: 'Capricorn',
    Saturn: 'Aries',
  };

  if (falls[position.planet] === position.sign) {
    strength -= 25;
  }

  // Retrograde reduces strength
  if (position.retrograde) {
    strength -= 10;
  }

  // Angular houses increase strength
  if ([1, 4, 7, 10].includes(position.house)) {
    strength += 10;
  }

  // Ensure strength is between 0 and 100
  return Math.max(0, Math.min(100, strength));
}

/**
 * House System Calculator
 * Uses Placidus house system (most common in Western astrology)
 */

import { calculateJulianDay, calculateSiderealTime } from '../utils/date-utils';
import { ZodiacSign, getSignFromDegree } from './zodiac';

export interface House {
  number: number; // 1-12
  cusp: number; // Degree position of house cusp (0-360)
  sign: ZodiacSign; // Sign on the cusp
  signDegree: number; // Degree within the sign
}

export interface HouseSystem {
  houses: House[];
  ascendant: number; // 1st house cusp
  midheaven: number; // 10th house cusp (MC)
  descendant: number; // 7th house cusp
  imumCoeli: number; // 4th house cusp (IC)
}

/**
 * Calculate house cusps using Placidus system
 */
export function calculateHouses(
  date: Date,
  latitude: number,
  longitude: number
): HouseSystem {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  // Calculate Julian Day
  const jd = calculateJulianDay(year, month, day, hour, minute, second);

  // Calculate Local Sidereal Time
  const lst = calculateSiderealTime(jd, longitude);

  // Calculate RAMC (Right Ascension of Midheaven)
  const ramc = lst;

  // Calculate Midheaven (10th house cusp)
  const mc = calculateMidheaven(ramc, latitude);

  // Calculate Ascendant (1st house cusp)
  const asc = calculateAscendant(lst, latitude);

  // Calculate other house cusps using Placidus system
  const houses = calculatePlacidusHouses(asc, mc, latitude);

  return {
    houses,
    ascendant: asc,
    midheaven: mc,
    descendant: (asc + 180) % 360,
    imumCoeli: (mc + 180) % 360,
  };
}

/**
 * Calculate Midheaven (MC)
 */
function calculateMidheaven(ramc: number, latitude: number): number {
  // Simplified calculation
  // In a full implementation, this would use precise spherical trigonometry
  const mc = ramc % 360;
  return mc;
}

/**
 * Calculate Ascendant
 */
function calculateAscendant(lst: number, latitude: number): number {
  // Simplified Ascendant calculation
  // This is an approximation; exact calculation requires obliquity of ecliptic
  const obliquity = 23.4397; // Obliquity of the ecliptic in degrees

  // Convert LST to radians
  const lstRad = (lst * Math.PI) / 180;
  const latRad = (latitude * Math.PI) / 180;
  const oblRad = (obliquity * Math.PI) / 180;

  // Calculate Ascendant using simplified formula
  const x = Math.cos(lstRad);
  const y = -Math.sin(lstRad) * Math.cos(oblRad) - Math.tan(latRad) * Math.sin(oblRad);

  let asc = (Math.atan2(y, x) * 180) / Math.PI;

  // Normalize to 0-360
  asc = ((asc % 360) + 360) % 360;

  return asc;
}

/**
 * Calculate all 12 house cusps using Placidus system
 */
function calculatePlacidusHouses(
  ascendant: number,
  midheaven: number,
  latitude: number
): House[] {
  const houses: House[] = [];

  // Angular houses (1, 4, 7, 10) are fixed
  const cusps: number[] = new Array(12);
  cusps[0] = ascendant; // 1st house (ASC)
  cusps[9] = midheaven; // 10th house (MC)
  cusps[6] = (ascendant + 180) % 360; // 7th house (DESC)
  cusps[3] = (midheaven + 180) % 360; // 4th house (IC)

  // Calculate intermediate houses using Placidus method
  // This is a simplified version; full Placidus requires complex calculations

  // Houses 11 and 12 (between MC and ASC)
  cusps[10] = (midheaven + (ascendant - midheaven + 360) % 360 / 3) % 360; // 11th
  cusps[11] = (midheaven + (2 * (ascendant - midheaven + 360) % 360) / 3) % 360; // 12th

  // Houses 2 and 3 (between ASC and IC)
  const ascToIc = (cusps[3] - ascendant + 360) % 360;
  cusps[1] = (ascendant + ascToIc / 3) % 360; // 2nd
  cusps[2] = (ascendant + (2 * ascToIc) / 3) % 360; // 3rd

  // Houses 5 and 6 (between IC and DESC)
  const icToDesc = (cusps[6] - cusps[3] + 360) % 360;
  cusps[4] = (cusps[3] + icToDesc / 3) % 360; // 5th
  cusps[5] = (cusps[3] + (2 * icToDesc) / 3) % 360; // 6th

  // Houses 8 and 9 (between DESC and MC)
  const descToMc = (midheaven - cusps[6] + 360) % 360;
  cusps[7] = (cusps[6] + descToMc / 3) % 360; // 8th
  cusps[8] = (cusps[6] + (2 * descToMc) / 3) % 360; // 9th

  // Create house objects
  for (let i = 0; i < 12; i++) {
    const cusp = cusps[i];
    const { sign, degreesInSign } = getSignFromDegree(cusp);

    houses.push({
      number: i + 1,
      cusp,
      sign,
      signDegree: degreesInSign,
    });
  }

  return houses;
}

/**
 * Determine which house a planet is in based on its position
 */
export function getPlanetHouse(planetDegree: number, houses: House[]): number {
  // Normalize planet degree
  planetDegree = ((planetDegree % 360) + 360) % 360;

  // Find which house the planet is in
  for (let i = 0; i < houses.length; i++) {
    const currentHouse = houses[i];
    const nextHouse = houses[(i + 1) % 12];

    let currentCusp = currentHouse.cusp;
    let nextCusp = nextHouse.cusp;

    // Handle wrap-around at 360/0 degrees
    if (nextCusp < currentCusp) {
      if (planetDegree >= currentCusp || planetDegree < nextCusp) {
        return currentHouse.number;
      }
    } else {
      if (planetDegree >= currentCusp && planetDegree < nextCusp) {
        return currentHouse.number;
      }
    }
  }

  // Default to 1st house if not found
  return 1;
}

/**
 * Get house information and meaning
 */
export function getHouseInfo(houseNumber: number): {
  number: number;
  name: string;
  represents: string[];
  keywords: string[];
  lifeArea: string;
} {
  const houseInfo: {
    [key: number]: {
      name: string;
      represents: string[];
      keywords: string[];
      lifeArea: string;
    };
  } = {
    1: {
      name: 'First House (Ascendant)',
      represents: ['Self', 'Personality', 'Physical body', 'First impressions'],
      keywords: ['Identity', 'Appearance', 'Approach to life', 'Beginnings'],
      lifeArea: 'Self and Identity',
    },
    2: {
      name: 'Second House',
      represents: ['Money', 'Possessions', 'Values', 'Self-worth'],
      keywords: ['Resources', 'Security', 'Material assets', 'Earning ability'],
      lifeArea: 'Money and Values',
    },
    3: {
      name: 'Third House',
      represents: ['Communication', 'Siblings', 'Short trips', 'Learning'],
      keywords: ['Thinking', 'Writing', 'Neighbors', 'Early education'],
      lifeArea: 'Communication and Learning',
    },
    4: {
      name: 'Fourth House (IC)',
      represents: ['Home', 'Family', 'Roots', 'Private life'],
      keywords: ['Foundation', 'Parents', 'Ancestry', 'Inner emotions'],
      lifeArea: 'Home and Family',
    },
    5: {
      name: 'Fifth House',
      represents: ['Creativity', 'Romance', 'Children', 'Pleasure'],
      keywords: ['Self-expression', 'Fun', 'Hobbies', 'Speculation'],
      lifeArea: 'Creativity and Romance',
    },
    6: {
      name: 'Sixth House',
      represents: ['Work', 'Health', 'Service', 'Daily routines'],
      keywords: ['Duties', 'Habits', 'Pets', 'Physical wellness'],
      lifeArea: 'Work and Health',
    },
    7: {
      name: 'Seventh House (Descendant)',
      represents: ['Partnerships', 'Marriage', 'Relationships', 'Contracts'],
      keywords: ['Others', 'Cooperation', 'Balance', 'Commitment'],
      lifeArea: 'Relationships and Partnerships',
    },
    8: {
      name: 'Eighth House',
      represents: ['Transformation', 'Shared resources', 'Intimacy', 'Death/rebirth'],
      keywords: ['Mystery', 'Power', 'Inheritance', 'Deep connections'],
      lifeArea: 'Transformation and Shared Resources',
    },
    9: {
      name: 'Ninth House',
      represents: ['Philosophy', 'Higher education', 'Travel', 'Beliefs'],
      keywords: ['Wisdom', 'Religion', 'Foreign cultures', 'Exploration'],
      lifeArea: 'Philosophy and Higher Learning',
    },
    10: {
      name: 'Tenth House (Midheaven)',
      represents: ['Career', 'Public image', 'Ambitions', 'Authority'],
      keywords: ['Achievement', 'Reputation', 'Status', 'Life purpose'],
      lifeArea: 'Career and Public Life',
    },
    11: {
      name: 'Eleventh House',
      represents: ['Friendships', 'Groups', 'Hopes', 'Ideals'],
      keywords: ['Community', 'Social causes', 'Future goals', 'Networks'],
      lifeArea: 'Friends and Aspirations',
    },
    12: {
      name: 'Twelfth House',
      represents: ['Spirituality', 'Subconscious', 'Secrets', 'Isolation'],
      keywords: ['Hidden matters', 'Dreams', 'Karma', 'Self-undoing'],
      lifeArea: 'Spirituality and Unconscious',
    },
  };

  return {
    number: houseNumber,
    ...houseInfo[houseNumber],
  };
}

/**
 * Analyze house emphasis in a chart
 */
export function analyzeHouseEmphasis(planetHouses: number[]): {
  emphasis: { [key: number]: number };
  mostEmphasized: number[];
  leastEmphasized: number[];
} {
  const emphasis: { [key: number]: number } = {};

  // Initialize all houses
  for (let i = 1; i <= 12; i++) {
    emphasis[i] = 0;
  }

  // Count planets in each house
  planetHouses.forEach((house) => {
    emphasis[house]++;
  });

  // Find most and least emphasized houses
  const houses = Object.keys(emphasis).map(Number);
  const maxCount = Math.max(...Object.values(emphasis));
  const minCount = Math.min(...Object.values(emphasis));

  const mostEmphasized = houses.filter((h) => emphasis[h] === maxCount && maxCount > 0);
  const leastEmphasized = houses.filter((h) => emphasis[h] === minCount);

  return {
    emphasis,
    mostEmphasized,
    leastEmphasized,
  };
}

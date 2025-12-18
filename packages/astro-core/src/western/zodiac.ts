/**
 * Western Zodiac Calculator
 * Calculates Sun, Moon, and Rising signs
 */

export type ZodiacSign =
  | 'Aries'
  | 'Taurus'
  | 'Gemini'
  | 'Cancer'
  | 'Leo'
  | 'Virgo'
  | 'Libra'
  | 'Scorpio'
  | 'Sagittarius'
  | 'Capricorn'
  | 'Aquarius'
  | 'Pisces';

export type ZodiacElement = 'Fire' | 'Earth' | 'Air' | 'Water';
export type ZodiacModality = 'Cardinal' | 'Fixed' | 'Mutable';

export interface ZodiacSignInfo {
  sign: ZodiacSign;
  element: ZodiacElement;
  modality: ZodiacModality;
  rulingPlanet: string;
  symbol: string;
  dateRange: string;
  traits: string[];
  strengths: string[];
  weaknesses: string[];
}

/**
 * Zodiac date ranges (tropical zodiac)
 */
const ZODIAC_DATES: { sign: ZodiacSign; startMonth: number; startDay: number }[] = [
  { sign: 'Capricorn', startMonth: 12, startDay: 22 },
  { sign: 'Aquarius', startMonth: 1, startDay: 20 },
  { sign: 'Pisces', startMonth: 2, startDay: 19 },
  { sign: 'Aries', startMonth: 3, startDay: 21 },
  { sign: 'Taurus', startMonth: 4, startDay: 20 },
  { sign: 'Gemini', startMonth: 5, startDay: 21 },
  { sign: 'Cancer', startMonth: 6, startDay: 22 },
  { sign: 'Leo', startMonth: 7, startDay: 23 },
  { sign: 'Virgo', startMonth: 8, startDay: 23 },
  { sign: 'Libra', startMonth: 9, startDay: 23 },
  { sign: 'Scorpio', startMonth: 10, startDay: 23 },
  { sign: 'Sagittarius', startMonth: 11, startDay: 22 },
];

/**
 * Calculate Sun sign (tropical zodiac) from birth date
 */
export function calculateSunSign(birthDate: Date): ZodiacSign {
  const month = birthDate.getMonth() + 1; // 1-12
  const day = birthDate.getDate();

  for (let i = 0; i < ZODIAC_DATES.length; i++) {
    const current = ZODIAC_DATES[i];
    const next = ZODIAC_DATES[(i + 1) % ZODIAC_DATES.length];

    // Check if date falls within this sign's range
    if (month === current.startMonth && day >= current.startDay) {
      return current.sign;
    } else if (month === current.startMonth && day < current.startDay) {
      // Must be in previous sign
      const prevIndex = (i - 1 + ZODIAC_DATES.length) % ZODIAC_DATES.length;
      return ZODIAC_DATES[prevIndex].sign;
    } else if (
      month === next.startMonth &&
      month !== current.startMonth &&
      day < next.startDay
    ) {
      return current.sign;
    }
  }

  // Default (shouldn't reach here)
  return 'Aries';
}

/**
 * Get detailed information about a zodiac sign
 */
export function getZodiacSignInfo(sign: ZodiacSign): ZodiacSignInfo {
  const signData: { [key in ZodiacSign]: Omit<ZodiacSignInfo, 'sign'> } = {
    Aries: {
      element: 'Fire',
      modality: 'Cardinal',
      rulingPlanet: 'Mars',
      symbol: 'Ram',
      dateRange: 'March 21 - April 19',
      traits: ['Bold', 'Pioneering', 'Courageous', 'Energetic', 'Passionate'],
      strengths: ['Leadership', 'Initiative', 'Confidence', 'Enthusiasm'],
      weaknesses: ['Impulsive', 'Impatient', 'Short-tempered', 'Aggressive'],
    },
    Taurus: {
      element: 'Earth',
      modality: 'Fixed',
      rulingPlanet: 'Venus',
      symbol: 'Bull',
      dateRange: 'April 20 - May 20',
      traits: ['Reliable', 'Patient', 'Practical', 'Devoted', 'Stable'],
      strengths: ['Dependability', 'Patience', 'Determination', 'Sensuality'],
      weaknesses: ['Stubborn', 'Possessive', 'Uncompromising', 'Materialistic'],
    },
    Gemini: {
      element: 'Air',
      modality: 'Mutable',
      rulingPlanet: 'Mercury',
      symbol: 'Twins',
      dateRange: 'May 21 - June 21',
      traits: ['Adaptable', 'Outgoing', 'Intelligent', 'Curious', 'Expressive'],
      strengths: ['Communication', 'Versatility', 'Wit', 'Sociability'],
      weaknesses: ['Inconsistent', 'Indecisive', 'Nervous', 'Superficial'],
    },
    Cancer: {
      element: 'Water',
      modality: 'Cardinal',
      rulingPlanet: 'Moon',
      symbol: 'Crab',
      dateRange: 'June 22 - July 22',
      traits: ['Emotional', 'Intuitive', 'Protective', 'Sympathetic', 'Nurturing'],
      strengths: ['Empathy', 'Loyalty', 'Creativity', 'Tenacity'],
      weaknesses: ['Moody', 'Oversensitive', 'Clingy', 'Manipulative'],
    },
    Leo: {
      element: 'Fire',
      modality: 'Fixed',
      rulingPlanet: 'Sun',
      symbol: 'Lion',
      dateRange: 'July 23 - August 22',
      traits: ['Creative', 'Passionate', 'Generous', 'Warm-hearted', 'Cheerful'],
      strengths: ['Confidence', 'Charisma', 'Generosity', 'Leadership'],
      weaknesses: ['Arrogant', 'Stubborn', 'Self-centered', 'Inflexible'],
    },
    Virgo: {
      element: 'Earth',
      modality: 'Mutable',
      rulingPlanet: 'Mercury',
      symbol: 'Virgin',
      dateRange: 'August 23 - September 22',
      traits: ['Analytical', 'Practical', 'Diligent', 'Modest', 'Reliable'],
      strengths: ['Detail-oriented', 'Analytical', 'Helpful', 'Hardworking'],
      weaknesses: ['Overcritical', 'Perfectionist', 'Worrying', 'Conservative'],
    },
    Libra: {
      element: 'Air',
      modality: 'Cardinal',
      rulingPlanet: 'Venus',
      symbol: 'Scales',
      dateRange: 'September 23 - October 23',
      traits: ['Diplomatic', 'Gracious', 'Fair-minded', 'Social', 'Harmonious'],
      strengths: ['Diplomacy', 'Balance', 'Charm', 'Idealism'],
      weaknesses: ['Indecisive', 'Avoids confrontation', 'Self-pity', 'Superficial'],
    },
    Scorpio: {
      element: 'Water',
      modality: 'Fixed',
      rulingPlanet: 'Pluto',
      symbol: 'Scorpion',
      dateRange: 'October 24 - November 21',
      traits: ['Passionate', 'Resourceful', 'Brave', 'Magnetic', 'Intense'],
      strengths: ['Determination', 'Passion', 'Loyalty', 'Resourcefulness'],
      weaknesses: ['Jealous', 'Secretive', 'Resentful', 'Manipulative'],
    },
    Sagittarius: {
      element: 'Fire',
      modality: 'Mutable',
      rulingPlanet: 'Jupiter',
      symbol: 'Archer',
      dateRange: 'November 22 - December 21',
      traits: ['Optimistic', 'Freedom-loving', 'Philosophical', 'Adventurous', 'Honest'],
      strengths: ['Optimism', 'Honesty', 'Independence', 'Enthusiasm'],
      weaknesses: ['Tactless', 'Impatient', 'Irresponsible', 'Restless'],
    },
    Capricorn: {
      element: 'Earth',
      modality: 'Cardinal',
      rulingPlanet: 'Saturn',
      symbol: 'Goat',
      dateRange: 'December 22 - January 19',
      traits: ['Responsible', 'Disciplined', 'Ambitious', 'Practical', 'Patient'],
      strengths: ['Ambition', 'Discipline', 'Responsibility', 'Management'],
      weaknesses: ['Pessimistic', 'Stubborn', 'Unforgiving', 'Condescending'],
    },
    Aquarius: {
      element: 'Air',
      modality: 'Fixed',
      rulingPlanet: 'Uranus',
      symbol: 'Water Bearer',
      dateRange: 'January 20 - February 18',
      traits: ['Progressive', 'Original', 'Independent', 'Humanitarian', 'Innovative'],
      strengths: ['Innovation', 'Humanitarianism', 'Independence', 'Originality'],
      weaknesses: ['Detached', 'Unpredictable', 'Stubborn', 'Aloof'],
    },
    Pisces: {
      element: 'Water',
      modality: 'Mutable',
      rulingPlanet: 'Neptune',
      symbol: 'Fish',
      dateRange: 'February 19 - March 20',
      traits: ['Compassionate', 'Artistic', 'Intuitive', 'Gentle', 'Wise'],
      strengths: ['Compassion', 'Intuition', 'Creativity', 'Adaptability'],
      weaknesses: ['Overly trusting', 'Escapist', 'Idealistic', 'Victim mentality'],
    },
  };

  return {
    sign,
    ...signData[sign],
  };
}

/**
 * Calculate compatibility between two zodiac signs (0-100)
 */
export function calculateZodiacCompatibility(sign1: ZodiacSign, sign2: ZodiacSign): number {
  const info1 = getZodiacSignInfo(sign1);
  const info2 = getZodiacSignInfo(sign2);

  // Same sign
  if (sign1 === sign2) {
    return 75;
  }

  // Same element (trine aspect - 120 degrees)
  if (info1.element === info2.element) {
    return 85;
  }

  // Compatible elements
  const compatibleElements: { [key in ZodiacElement]: ZodiacElement[] } = {
    Fire: ['Air', 'Fire'],
    Earth: ['Water', 'Earth'],
    Air: ['Fire', 'Air'],
    Water: ['Earth', 'Water'],
  };

  if (compatibleElements[info1.element].includes(info2.element)) {
    return 70;
  }

  // Opposite signs (180 degrees) - can be complementary
  const opposites: { [key in ZodiacSign]: ZodiacSign } = {
    Aries: 'Libra',
    Taurus: 'Scorpio',
    Gemini: 'Sagittarius',
    Cancer: 'Capricorn',
    Leo: 'Aquarius',
    Virgo: 'Pisces',
    Libra: 'Aries',
    Scorpio: 'Taurus',
    Sagittarius: 'Gemini',
    Capricorn: 'Cancer',
    Aquarius: 'Leo',
    Pisces: 'Virgo',
  };

  if (opposites[sign1] === sign2) {
    return 65;
  }

  // Challenging aspects (square - 90 degrees)
  // Incompatible elements
  return 50;
}

/**
 * Get zodiac sign from degree position (0-360)
 */
export function getSignFromDegree(degree: number): { sign: ZodiacSign; degreesInSign: number } {
  // Normalize to 0-360
  degree = ((degree % 360) + 360) % 360;

  const signs: ZodiacSign[] = [
    'Aries',
    'Taurus',
    'Gemini',
    'Cancer',
    'Leo',
    'Virgo',
    'Libra',
    'Scorpio',
    'Sagittarius',
    'Capricorn',
    'Aquarius',
    'Pisces',
  ];

  const signIndex = Math.floor(degree / 30);
  const degreesInSign = degree % 30;

  return {
    sign: signs[signIndex],
    degreesInSign,
  };
}

/**
 * Get elements distribution in a chart
 */
export function analyzeElementDistribution(signs: ZodiacSign[]): {
  distribution: { [key in ZodiacElement]: number };
  dominant: ZodiacElement;
  deficient: ZodiacElement[];
} {
  const distribution: { [key in ZodiacElement]: number } = {
    Fire: 0,
    Earth: 0,
    Air: 0,
    Water: 0,
  };

  signs.forEach((sign) => {
    const info = getZodiacSignInfo(sign);
    distribution[info.element]++;
  });

  // Find dominant element
  let dominant: ZodiacElement = 'Fire';
  let maxCount = 0;
  (Object.keys(distribution) as ZodiacElement[]).forEach((element) => {
    if (distribution[element] > maxCount) {
      maxCount = distribution[element];
      dominant = element;
    }
  });

  // Find deficient elements
  const deficient: ZodiacElement[] = [];
  (Object.keys(distribution) as ZodiacElement[]).forEach((element) => {
    if (distribution[element] === 0) {
      deficient.push(element);
    }
  });

  return { distribution, dominant, deficient };
}

/**
 * Get modalities distribution
 */
export function analyzeModalityDistribution(signs: ZodiacSign[]): {
  distribution: { [key in ZodiacModality]: number };
  dominant: ZodiacModality;
} {
  const distribution: { [key in ZodiacModality]: number } = {
    Cardinal: 0,
    Fixed: 0,
    Mutable: 0,
  };

  signs.forEach((sign) => {
    const info = getZodiacSignInfo(sign);
    distribution[info.modality]++;
  });

  // Find dominant modality
  let dominant: ZodiacModality = 'Cardinal';
  let maxCount = 0;
  (Object.keys(distribution) as ZodiacModality[]).forEach((modality) => {
    if (distribution[modality] > maxCount) {
      maxCount = distribution[modality];
      dominant = modality;
    }
  });

  return { distribution, dominant };
}

/**
 * Chinese Zodiac Calculator
 * Determines zodiac animal based on birth year
 */

import { getChineseZodiacYear } from '../utils/date-utils';

export type ChineseZodiacAnimal =
  | 'Rat'
  | 'Ox'
  | 'Tiger'
  | 'Rabbit'
  | 'Dragon'
  | 'Snake'
  | 'Horse'
  | 'Goat'
  | 'Monkey'
  | 'Rooster'
  | 'Dog'
  | 'Pig';

export interface ChineseZodiacInfo {
  animal: ChineseZodiacAnimal;
  element: string; // From Bazi, not the fixed element
  characteristics: string[];
  luckyNumbers: number[];
  luckyColors: string[];
  compatibleSigns: ChineseZodiacAnimal[];
  incompatibleSigns: ChineseZodiacAnimal[];
}

/**
 * The 12 Chinese Zodiac animals in order
 */
const ZODIAC_ANIMALS: ChineseZodiacAnimal[] = [
  'Rat',
  'Ox',
  'Tiger',
  'Rabbit',
  'Dragon',
  'Snake',
  'Horse',
  'Goat',
  'Monkey',
  'Rooster',
  'Dog',
  'Pig',
];

/**
 * Calculate Chinese zodiac animal from birth date
 */
export function calculateChineseZodiac(birthDate: Date): ChineseZodiacAnimal {
  const zodiacYear = getChineseZodiacYear(birthDate);

  // The cycle started in 1924 (Year of the Rat)
  // Calculate position in 12-year cycle
  const baseYear = 1924; // A Rat year
  const yearsSinceBase = zodiacYear - baseYear;
  const position = ((yearsSinceBase % 12) + 12) % 12; // Ensure positive

  return ZODIAC_ANIMALS[position];
}

/**
 * Get detailed information about a zodiac sign
 */
export function getZodiacInfo(animal: ChineseZodiacAnimal): ChineseZodiacInfo {
  const zodiacData: { [key in ChineseZodiacAnimal]: Omit<ChineseZodiacInfo, 'animal' | 'element'> } = {
    Rat: {
      characteristics: ['Intelligent', 'Adaptable', 'Quick-witted', 'Charming', 'Resourceful'],
      luckyNumbers: [2, 3],
      luckyColors: ['Blue', 'Gold', 'Green'],
      compatibleSigns: ['Dragon', 'Monkey', 'Ox'],
      incompatibleSigns: ['Horse', 'Rooster'],
    },
    Ox: {
      characteristics: ['Loyal', 'Reliable', 'Thorough', 'Strong', 'Determined'],
      luckyNumbers: [1, 4],
      luckyColors: ['White', 'Yellow', 'Green'],
      compatibleSigns: ['Rat', 'Snake', 'Rooster'],
      incompatibleSigns: ['Goat', 'Horse', 'Dog'],
    },
    Tiger: {
      characteristics: ['Brave', 'Confident', 'Competitive', 'Charismatic', 'Independent'],
      luckyNumbers: [1, 3, 4],
      luckyColors: ['Blue', 'Grey', 'Orange'],
      compatibleSigns: ['Horse', 'Dog', 'Pig'],
      incompatibleSigns: ['Monkey', 'Snake'],
    },
    Rabbit: {
      characteristics: ['Gentle', 'Quiet', 'Elegant', 'Alert', 'Responsible'],
      luckyNumbers: [3, 4, 6],
      luckyColors: ['Red', 'Pink', 'Purple', 'Blue'],
      compatibleSigns: ['Goat', 'Dog', 'Pig'],
      incompatibleSigns: ['Rooster', 'Rat'],
    },
    Dragon: {
      characteristics: ['Confident', 'Intelligent', 'Enthusiastic', 'Charismatic', 'Ambitious'],
      luckyNumbers: [1, 6, 7],
      luckyColors: ['Gold', 'Silver', 'White'],
      compatibleSigns: ['Rat', 'Monkey', 'Rooster'],
      incompatibleSigns: ['Dog', 'Rabbit'],
    },
    Snake: {
      characteristics: ['Wise', 'Enigmatic', 'Intuitive', 'Graceful', 'Calm'],
      luckyNumbers: [2, 8, 9],
      luckyColors: ['Black', 'Red', 'Yellow'],
      compatibleSigns: ['Ox', 'Rooster', 'Monkey'],
      incompatibleSigns: ['Tiger', 'Pig'],
    },
    Horse: {
      characteristics: ['Energetic', 'Independent', 'Impatient', 'Cheerful', 'Warm-hearted'],
      luckyNumbers: [2, 3, 7],
      luckyColors: ['Yellow', 'Green'],
      compatibleSigns: ['Tiger', 'Goat', 'Dog'],
      incompatibleSigns: ['Rat', 'Ox'],
    },
    Goat: {
      characteristics: ['Calm', 'Gentle', 'Creative', 'Sympathetic', 'Persevering'],
      luckyNumbers: [2, 7],
      luckyColors: ['Brown', 'Red', 'Purple'],
      compatibleSigns: ['Rabbit', 'Horse', 'Pig'],
      incompatibleSigns: ['Ox', 'Dog'],
    },
    Monkey: {
      characteristics: ['Sharp', 'Smart', 'Curious', 'Playful', 'Clever'],
      luckyNumbers: [4, 9],
      luckyColors: ['White', 'Blue', 'Gold'],
      compatibleSigns: ['Rat', 'Dragon', 'Snake'],
      incompatibleSigns: ['Tiger', 'Pig'],
    },
    Rooster: {
      characteristics: ['Observant', 'Hardworking', 'Courageous', 'Confident', 'Honest'],
      luckyNumbers: [5, 7, 8],
      luckyColors: ['Gold', 'Brown', 'Yellow'],
      compatibleSigns: ['Ox', 'Dragon', 'Snake'],
      incompatibleSigns: ['Rabbit', 'Dog'],
    },
    Dog: {
      characteristics: ['Loyal', 'Honest', 'Prudent', 'Amiable', 'Kind'],
      luckyNumbers: [3, 4, 9],
      luckyColors: ['Red', 'Green', 'Purple'],
      compatibleSigns: ['Tiger', 'Rabbit', 'Horse'],
      incompatibleSigns: ['Dragon', 'Goat', 'Rooster'],
    },
    Pig: {
      characteristics: ['Compassionate', 'Generous', 'Diligent', 'Optimistic', 'Honest'],
      luckyNumbers: [2, 5, 8],
      luckyColors: ['Yellow', 'Grey', 'Brown'],
      compatibleSigns: ['Tiger', 'Rabbit', 'Goat'],
      incompatibleSigns: ['Snake', 'Monkey'],
    },
  };

  return {
    animal,
    element: '', // Will be filled by Bazi calculator
    ...zodiacData[animal],
  };
}

/**
 * Calculate compatibility between two zodiac animals (0-100)
 */
export function calculateZodiacCompatibility(
  animal1: ChineseZodiacAnimal,
  animal2: ChineseZodiacAnimal
): number {
  const info1 = getZodiacInfo(animal1);
  const info2 = getZodiacInfo(animal2);

  // Check if they are compatible
  if (info1.compatibleSigns.includes(animal2)) {
    return 85; // High compatibility
  }

  // Check if they are incompatible
  if (info1.incompatibleSigns.includes(animal2)) {
    return 30; // Low compatibility
  }

  // Neutral compatibility
  return 60;
}

/**
 * Get all years for a specific zodiac animal in a range
 */
export function getYearsForAnimal(
  animal: ChineseZodiacAnimal,
  startYear: number,
  endYear: number
): number[] {
  const years: number[] = [];
  const animalIndex = ZODIAC_ANIMALS.indexOf(animal);

  for (let year = startYear; year <= endYear; year++) {
    const position = ((year - 1924) % 12 + 12) % 12;
    if (position === animalIndex) {
      years.push(year);
    }
  }

  return years;
}

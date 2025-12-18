/**
 * Lucky Numbers Calculator
 * Determines auspicious numbers based on Bazi and zodiac
 */

import { Element, BaziChart } from './bazi';
import { ChineseZodiacAnimal } from './zodiac';

/**
 * Get element-based lucky numbers
 */
function getElementNumbers(element: Element): number[] {
  const elementNumberMap: { [key in Element]: number[] } = {
    Wood: [3, 8],
    Fire: [2, 7],
    Earth: [5, 0],
    Metal: [4, 9],
    Water: [1, 6],
  };

  return elementNumberMap[element];
}

/**
 * Get zodiac-based lucky numbers
 */
function getZodiacNumbers(animal: ChineseZodiacAnimal): number[] {
  const zodiacNumberMap: { [key in ChineseZodiacAnimal]: number[] } = {
    Rat: [2, 3],
    Ox: [1, 4],
    Tiger: [1, 3, 4],
    Rabbit: [3, 4, 6],
    Dragon: [1, 6, 7],
    Snake: [2, 8, 9],
    Horse: [2, 3, 7],
    Goat: [2, 7],
    Monkey: [4, 9],
    Rooster: [5, 7, 8],
    Dog: [3, 4, 9],
    Pig: [2, 5, 8],
  };

  return zodiacNumberMap[animal];
}

/**
 * Calculate lucky numbers from Bazi chart
 */
export function calculateLuckyNumbers(
  baziChart: BaziChart,
  zodiacAnimal: ChineseZodiacAnimal
): number[] {
  const luckyNumbers = new Set<number>();

  // Add numbers from Day Master element (most important)
  getElementNumbers(baziChart.dayMaster).forEach((num) => luckyNumbers.add(num));

  // Add numbers from favorable elements
  baziChart.favorableElements.forEach((element) => {
    getElementNumbers(element).forEach((num) => luckyNumbers.add(num));
  });

  // Add numbers from zodiac
  getZodiacNumbers(zodiacAnimal).forEach((num) => luckyNumbers.add(num));

  // Add numbers from dominant element
  getElementNumbers(baziChart.dominantElement).forEach((num) => luckyNumbers.add(num));

  // Convert to array and sort
  const numbers = Array.from(luckyNumbers).sort((a, b) => a - b);

  // If we have fewer than 3 numbers, add derived numbers
  if (numbers.length < 3) {
    // Add combinations
    if (numbers.length >= 2) {
      const sum = (numbers[0] + numbers[1]) % 10;
      if (!numbers.includes(sum)) {
        numbers.push(sum);
      }
    }
  }

  // Return top 5 numbers
  return numbers.slice(0, 5);
}

/**
 * Calculate unlucky numbers
 */
export function calculateUnluckyNumbers(baziChart: BaziChart): number[] {
  const unluckyNumbers = new Set<number>();

  // Numbers from unfavorable elements
  baziChart.unfavorableElements.forEach((element) => {
    getElementNumbers(element).forEach((num) => unluckyNumbers.add(num));
  });

  return Array.from(unluckyNumbers).sort((a, b) => a - b);
}

/**
 * Generate lottery-style lucky number combinations
 */
export function generateLuckyNumberCombinations(
  luckyNumbers: number[],
  count: number = 5
): number[][] {
  const combinations: number[][] = [];

  // Generate random combinations using lucky numbers
  for (let i = 0; i < count; i++) {
    const combo: number[] = [];
    const usedIndices = new Set<number>();

    // Pick 6 numbers
    while (combo.length < 6) {
      if (combo.length < luckyNumbers.length) {
        // Use lucky numbers first
        const index = Math.floor(Math.random() * luckyNumbers.length);
        if (!usedIndices.has(index)) {
          combo.push(luckyNumbers[index]);
          usedIndices.add(index);
        }
      } else {
        // Fill remaining with derived numbers
        const base = luckyNumbers[Math.floor(Math.random() * luckyNumbers.length)];
        const derived = (base * (i + 1) + combo.length) % 50;
        if (!combo.includes(derived) && derived > 0) {
          combo.push(derived);
        }
      }
    }

    combinations.push(combo.sort((a, b) => a - b));
  }

  return combinations;
}

/**
 * Calculate lucky dates of the month
 */
export function calculateLuckyDates(luckyNumbers: number[]): number[] {
  const luckyDates: number[] = [];

  luckyNumbers.forEach((num) => {
    // Add the number itself if valid date
    if (num > 0 && num <= 31) {
      luckyDates.push(num);
    }

    // Add number + 10 if valid
    if (num + 10 <= 31) {
      luckyDates.push(num + 10);
    }

    // Add number + 20 if valid
    if (num + 20 <= 31) {
      luckyDates.push(num + 20);
    }
  });

  return Array.from(new Set(luckyDates)).sort((a, b) => a - b);
}

/**
 * Check if a number is lucky for this chart
 */
export function isLuckyNumber(number: number, luckyNumbers: number[]): boolean {
  return luckyNumbers.includes(number) || luckyNumbers.includes(number % 10);
}

/**
 * Get number significance
 */
export function getNumberSignificance(number: number): string {
  const significanceMap: { [key: number]: string } = {
    0: 'Completion, wholeness, infinite potential',
    1: 'Independence, beginnings, leadership',
    2: 'Balance, partnership, harmony',
    3: 'Creativity, growth, expansion',
    4: 'Stability, structure, foundation',
    5: 'Change, freedom, adventure',
    6: 'Harmony, family, responsibility',
    7: 'Wisdom, spirituality, introspection',
    8: 'Abundance, power, success',
    9: 'Completion, humanitarianism, wisdom',
  };

  const digit = number % 10;
  return significanceMap[digit] || 'Personal significance';
}

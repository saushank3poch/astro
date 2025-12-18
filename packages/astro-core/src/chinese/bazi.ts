/**
 * Bazi (Four Pillars of Destiny) Calculator
 * Also known as "Eight Characters" - the foundation of Chinese astrology
 */

import { getChineseZodiacYear } from '../utils/date-utils';

export type HeavenlyStem =
  | '甲 (Jia - Wood Yang)'
  | '乙 (Yi - Wood Yin)'
  | '丙 (Bing - Fire Yang)'
  | '丁 (Ding - Fire Yin)'
  | '戊 (Wu - Earth Yang)'
  | '己 (Ji - Earth Yin)'
  | '庚 (Geng - Metal Yang)'
  | '辛 (Xin - Metal Yin)'
  | '壬 (Ren - Water Yang)'
  | '癸 (Gui - Water Yin)';

export type EarthlyBranch =
  | '子 (Zi - Rat)'
  | '丑 (Chou - Ox)'
  | '寅 (Yin - Tiger)'
  | '卯 (Mao - Rabbit)'
  | '辰 (Chen - Dragon)'
  | '巳 (Si - Snake)'
  | '午 (Wu - Horse)'
  | '未 (Wei - Goat)'
  | '申 (Shen - Monkey)'
  | '酉 (You - Rooster)'
  | '戌 (Xu - Dog)'
  | '亥 (Hai - Pig)';

export type Element = 'Wood' | 'Fire' | 'Earth' | 'Metal' | 'Water';
export type Polarity = 'Yang' | 'Yin';

export interface Pillar {
  heavenlyStem: HeavenlyStem;
  earthlyBranch: EarthlyBranch;
  element: Element;
  polarity: Polarity;
  hiddenStems: Element[]; // Hidden elements in the Earthly Branch
}

export interface BaziChart {
  yearPillar: Pillar;
  monthPillar: Pillar;
  dayPillar: Pillar;
  hourPillar: Pillar;
  dayMaster: Element; // The element of the Day Stem (most important)
  dominantElement: Element;
  elementCount: { [key in Element]: number };
  favorableElements: Element[];
  unfavorableElements: Element[];
}

/**
 * The 10 Heavenly Stems
 */
const HEAVENLY_STEMS: HeavenlyStem[] = [
  '甲 (Jia - Wood Yang)',
  '乙 (Yi - Wood Yin)',
  '丙 (Bing - Fire Yang)',
  '丁 (Ding - Fire Yin)',
  '戊 (Wu - Earth Yang)',
  '己 (Ji - Earth Yin)',
  '庚 (Geng - Metal Yang)',
  '辛 (Xin - Metal Yin)',
  '壬 (Ren - Water Yang)',
  '癸 (Gui - Water Yin)',
];

/**
 * The 12 Earthly Branches
 */
const EARTHLY_BRANCHES: EarthlyBranch[] = [
  '子 (Zi - Rat)',
  '丑 (Chou - Ox)',
  '寅 (Yin - Tiger)',
  '卯 (Mao - Rabbit)',
  '辰 (Chen - Dragon)',
  '巳 (Si - Snake)',
  '午 (Wu - Horse)',
  '未 (Wei - Goat)',
  '申 (Shen - Monkey)',
  '酉 (You - Rooster)',
  '戌 (Xu - Dog)',
  '亥 (Hai - Pig)',
];

/**
 * Map Heavenly Stems to Elements and Polarity
 */
function getStemElement(stem: HeavenlyStem): { element: Element; polarity: Polarity } {
  const stemMap: { [key in HeavenlyStem]: { element: Element; polarity: Polarity } } = {
    '甲 (Jia - Wood Yang)': { element: 'Wood', polarity: 'Yang' },
    '乙 (Yi - Wood Yin)': { element: 'Wood', polarity: 'Yin' },
    '丙 (Bing - Fire Yang)': { element: 'Fire', polarity: 'Yang' },
    '丁 (Ding - Fire Yin)': { element: 'Fire', polarity: 'Yin' },
    '戊 (Wu - Earth Yang)': { element: 'Earth', polarity: 'Yang' },
    '己 (Ji - Earth Yin)': { element: 'Earth', polarity: 'Yin' },
    '庚 (Geng - Metal Yang)': { element: 'Metal', polarity: 'Yang' },
    '辛 (Xin - Metal Yin)': { element: 'Metal', polarity: 'Yin' },
    '壬 (Ren - Water Yang)': { element: 'Water', polarity: 'Yang' },
    '癸 (Gui - Water Yin)': { element: 'Water', polarity: 'Yin' },
  };
  return stemMap[stem];
}

/**
 * Map Earthly Branches to Elements
 */
function getBranchElement(branch: EarthlyBranch): Element {
  const branchMap: { [key in EarthlyBranch]: Element } = {
    '子 (Zi - Rat)': 'Water',
    '丑 (Chou - Ox)': 'Earth',
    '寅 (Yin - Tiger)': 'Wood',
    '卯 (Mao - Rabbit)': 'Wood',
    '辰 (Chen - Dragon)': 'Earth',
    '巳 (Si - Snake)': 'Fire',
    '午 (Wu - Horse)': 'Fire',
    '未 (Wei - Goat)': 'Earth',
    '申 (Shen - Monkey)': 'Metal',
    '酉 (You - Rooster)': 'Metal',
    '戌 (Xu - Dog)': 'Earth',
    '亥 (Hai - Pig)': 'Water',
  };
  return branchMap[branch];
}

/**
 * Get hidden stems (hidden elements) in Earthly Branches
 */
function getHiddenStems(branch: EarthlyBranch): Element[] {
  const hiddenStemsMap: { [key in EarthlyBranch]: Element[] } = {
    '子 (Zi - Rat)': ['Water'],
    '丑 (Chou - Ox)': ['Earth', 'Water', 'Metal'],
    '寅 (Yin - Tiger)': ['Wood', 'Fire', 'Earth'],
    '卯 (Mao - Rabbit)': ['Wood'],
    '辰 (Chen - Dragon)': ['Earth', 'Wood', 'Water'],
    '巳 (Si - Snake)': ['Fire', 'Earth', 'Metal'],
    '午 (Wu - Horse)': ['Fire', 'Earth'],
    '未 (Wei - Goat)': ['Earth', 'Fire', 'Wood'],
    '申 (Shen - Monkey)': ['Metal', 'Water', 'Earth'],
    '酉 (You - Rooster)': ['Metal'],
    '戌 (Xu - Dog)': ['Earth', 'Metal', 'Fire'],
    '亥 (Hai - Pig)': ['Water', 'Wood'],
  };
  return hiddenStemsMap[branch];
}

/**
 * Calculate Year Pillar
 */
function calculateYearPillar(birthDate: Date): Pillar {
  const zodiacYear = getChineseZodiacYear(birthDate);

  // Base year 1924 is Jia-Zi (index 0 for both stems and branches)
  const baseYear = 1924;
  const yearsSinceBase = zodiacYear - baseYear;

  const stemIndex = ((yearsSinceBase % 10) + 10) % 10;
  const branchIndex = ((yearsSinceBase % 12) + 12) % 12;

  const heavenlyStem = HEAVENLY_STEMS[stemIndex];
  const earthlyBranch = EARTHLY_BRANCHES[branchIndex];
  const stemInfo = getStemElement(heavenlyStem);

  return {
    heavenlyStem,
    earthlyBranch,
    element: stemInfo.element,
    polarity: stemInfo.polarity,
    hiddenStems: getHiddenStems(earthlyBranch),
  };
}

/**
 * Calculate Month Pillar
 * Based on solar terms (24 divisions of the solar year)
 */
function calculateMonthPillar(birthDate: Date, yearStemIndex: number): Pillar {
  const month = birthDate.getMonth() + 1; // 1-12
  const day = birthDate.getDate();

  // Determine the month based on solar terms
  // This is simplified; accurate calculation requires solar term dates
  let solarMonth = month;

  // Adjust for solar terms (approximate)
  if (day < 6) {
    solarMonth = month - 1;
    if (solarMonth < 1) solarMonth = 12;
  }

  // Month stem depends on year stem
  // Formula: Month Stem = (Year Stem * 2 + Month) % 10
  const monthStemIndex = ((yearStemIndex * 2 + solarMonth) % 10 + 10) % 10;

  // Month branch follows the solar months
  // Tiger month (寅) starts in February (solar month 1)
  const monthBranchIndex = ((solarMonth + 1) % 12 + 12) % 12;

  const heavenlyStem = HEAVENLY_STEMS[monthStemIndex];
  const earthlyBranch = EARTHLY_BRANCHES[monthBranchIndex];
  const stemInfo = getStemElement(heavenlyStem);

  return {
    heavenlyStem,
    earthlyBranch,
    element: stemInfo.element,
    polarity: stemInfo.polarity,
    hiddenStems: getHiddenStems(earthlyBranch),
  };
}

/**
 * Calculate Day Pillar
 * This is the most important pillar - the Day Master
 */
function calculateDayPillar(birthDate: Date): Pillar {
  // Use Julian Day Number to calculate day pillar
  // Reference date: 1900-01-01 is Jia-Zi (day 0)
  const referenceDate = new Date(1900, 0, 1);
  const daysSinceReference = Math.floor(
    (birthDate.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const stemIndex = ((daysSinceReference % 10) + 10) % 10;
  const branchIndex = ((daysSinceReference % 12) + 12) % 12;

  const heavenlyStem = HEAVENLY_STEMS[stemIndex];
  const earthlyBranch = EARTHLY_BRANCHES[branchIndex];
  const stemInfo = getStemElement(heavenlyStem);

  return {
    heavenlyStem,
    earthlyBranch,
    element: stemInfo.element,
    polarity: stemInfo.polarity,
    hiddenStems: getHiddenStems(earthlyBranch),
  };
}

/**
 * Calculate Hour Pillar
 */
function calculateHourPillar(birthDate: Date, hour: number, dayStemIndex: number): Pillar {
  // Hour branches: Each represents 2 hours
  // 23:00-01:00 = Zi (Rat), 01:00-03:00 = Chou (Ox), etc.
  const hourBranchIndex = Math.floor(((hour + 1) % 24) / 2);

  // Hour stem depends on day stem
  // Formula: Hour Stem = (Day Stem * 2 + Hour Branch) % 10
  const hourStemIndex = ((dayStemIndex * 2 + hourBranchIndex) % 10 + 10) % 10;

  const heavenlyStem = HEAVENLY_STEMS[hourStemIndex];
  const earthlyBranch = EARTHLY_BRANCHES[hourBranchIndex];
  const stemInfo = getStemElement(heavenlyStem);

  return {
    heavenlyStem,
    earthlyBranch,
    element: stemInfo.element,
    polarity: stemInfo.polarity,
    hiddenStems: getHiddenStems(earthlyBranch),
  };
}

/**
 * Count elements in the Bazi chart
 */
function countElements(pillars: Pillar[]): { [key in Element]: number } {
  const count: { [key in Element]: number } = {
    Wood: 0,
    Fire: 0,
    Earth: 0,
    Metal: 0,
    Water: 0,
  };

  pillars.forEach((pillar) => {
    // Count main element
    count[pillar.element] += 2;

    // Count hidden elements (weighted less)
    pillar.hiddenStems.forEach((element) => {
      count[element] += 1;
    });
  });

  return count;
}

/**
 * Calculate full Bazi chart
 */
export function calculateBaziChart(birthDate: Date, birthHour: number = 12): BaziChart {
  // Calculate all four pillars
  const yearPillar = calculateYearPillar(birthDate);

  // Get year stem index for month calculation
  const yearStemIndex = HEAVENLY_STEMS.indexOf(yearPillar.heavenlyStem);
  const monthPillar = calculateMonthPillar(birthDate, yearStemIndex);

  const dayPillar = calculateDayPillar(birthDate);

  // Get day stem index for hour calculation
  const dayStemIndex = HEAVENLY_STEMS.indexOf(dayPillar.heavenlyStem);
  const hourPillar = calculateHourPillar(birthDate, birthHour, dayStemIndex);

  // The Day Master is the most important - it represents the person
  const dayMaster = dayPillar.element;

  // Count all elements
  const elementCount = countElements([yearPillar, monthPillar, dayPillar, hourPillar]);

  // Find dominant element
  let dominantElement: Element = 'Wood';
  let maxCount = 0;
  (Object.keys(elementCount) as Element[]).forEach((element) => {
    if (elementCount[element] > maxCount) {
      maxCount = elementCount[element];
      dominantElement = element;
    }
  });

  // Determine favorable and unfavorable elements based on Day Master
  const { favorableElements, unfavorableElements } = determineFavorableElements(
    dayMaster,
    elementCount
  );

  return {
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,
    dayMaster,
    dominantElement,
    elementCount,
    favorableElements,
    unfavorableElements,
  };
}

/**
 * Determine favorable and unfavorable elements
 * Based on the Five Elements production and destruction cycles
 */
function determineFavorableElements(
  dayMaster: Element,
  elementCount: { [key in Element]: number }
): { favorableElements: Element[]; unfavorableElements: Element[] } {
  // Five Elements cycles
  const productionCycle: { [key in Element]: Element } = {
    Wood: 'Fire',
    Fire: 'Earth',
    Earth: 'Metal',
    Metal: 'Water',
    Water: 'Wood',
  };

  const destructionCycle: { [key in Element]: Element } = {
    Wood: 'Earth',
    Earth: 'Water',
    Water: 'Fire',
    Fire: 'Metal',
    Metal: 'Wood',
  };

  // If Day Master is weak (low count), need supporting elements
  // If Day Master is strong (high count), need controlling elements
  const dayMasterCount = elementCount[dayMaster];
  const totalCount = Object.values(elementCount).reduce((a, b) => a + b, 0);
  const averageCount = totalCount / 5;

  let favorableElements: Element[] = [];
  let unfavorableElements: Element[] = [];

  if (dayMasterCount < averageCount) {
    // Day Master is weak - needs support
    // Favorable: Elements that produce Day Master
    const producesMe = (Object.keys(productionCycle) as Element[]).find(
      (key) => productionCycle[key] === dayMaster
    );
    if (producesMe) favorableElements.push(producesMe);

    // Also favorable: Same element
    favorableElements.push(dayMaster);

    // Unfavorable: Elements that Day Master produces (drains energy)
    unfavorableElements.push(productionCycle[dayMaster]);

    // Unfavorable: Elements that destroy Day Master
    const destroysMe = (Object.keys(destructionCycle) as Element[]).find(
      (key) => destructionCycle[key] === dayMaster
    );
    if (destroysMe) unfavorableElements.push(destroysMe);
  } else {
    // Day Master is strong - needs control
    // Favorable: Elements that Day Master produces (outlet for energy)
    favorableElements.push(productionCycle[dayMaster]);

    // Favorable: Elements that control Day Master
    const controlsMe = (Object.keys(destructionCycle) as Element[]).find(
      (key) => destructionCycle[key] === dayMaster
    );
    if (controlsMe) favorableElements.push(controlsMe);

    // Unfavorable: Same element (too much)
    unfavorableElements.push(dayMaster);

    // Unfavorable: Elements that produce Day Master (more strength)
    const producesMe = (Object.keys(productionCycle) as Element[]).find(
      (key) => productionCycle[key] === dayMaster
    );
    if (producesMe) unfavorableElements.push(producesMe);
  }

  return { favorableElements, unfavorableElements };
}

/**
 * Get a simple string representation of a pillar
 */
export function pillarToString(pillar: Pillar): string {
  return `${pillar.heavenlyStem} / ${pillar.earthlyBranch}`;
}

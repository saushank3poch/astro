/**
 * Divination Engine
 * Implements Tarot and I Ching for financial decision guidance
 * Uses deterministic randomness based on user + question + timestamp
 */

export interface TarotPredictionInput {
  question: string;
  userId?: string;
  spread: 'three_card' | 'celtic_cross';
  context?: {
    position?: 'long' | 'short';
    assetSymbol?: string;
    amount?: number;
    entryPrice?: number;
    targetPrice?: number;
  };
}

export interface TarotCard {
  name: string;
  suit: 'Major Arcana' | 'Wands' | 'Cups' | 'Swords' | 'Pentacles';
  number: number;
  reversed: boolean;
  uprightMeaning: string;
  reversedMeaning: string;
  financialInterpretation: string;
  financialReversed: string;
}

export interface TarotCardPosition {
  position: string;
  card: TarotCard;
  interpretation: string;
}

export interface TarotPredictionOutput {
  question: string;
  spread: string;
  cards: TarotCardPosition[];
  overallInterpretation: string;
  guidance: string;
  confidenceScore: number; // 1-10
  actionAdvice: string;
}

export interface IChingPredictionInput {
  question: string;
  userId?: string;
  context?: {
    position?: 'long' | 'short';
    assetSymbol?: string;
    amount?: number;
    targetProfit?: number;
  };
}

export interface IChingHexagram {
  number: number; // 1-64
  chineseName: string;
  englishName: string;
  binarySequence: string; // e.g., "111111" for hexagram 1
  judgement: string;
  image: string;
  interpretation: string;
  financialGuidance: string;
  changingLines: number[]; // Lines that are changing (1-6)
}

export interface IChingPredictionOutput {
  question: string;
  hexagram: IChingHexagram;
  futureHexagram?: IChingHexagram;
  guidance: string;
  keyDates?: Date[];
  confidenceScore: number; // 1-10
  actionAdvice: string;
}

/**
 * Generate deterministic seed from inputs
 */
function generateSeed(userId: string | undefined, question: string, timestamp?: Date): number {
  const baseString = `${userId || 'anonymous'}-${question}-${(timestamp || new Date()).getTime()}`;
  let hash = 0;
  for (let i = 0; i < baseString.length; i++) {
    const char = baseString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Seeded random number generator
 */
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

// ============================================================================
// TAROT CARD DEFINITIONS
// ============================================================================

const MAJOR_ARCANA: Omit<TarotCard, 'reversed'>[] = [
  {
    name: 'The Fool',
    suit: 'Major Arcana',
    number: 0,
    uprightMeaning: 'New beginnings, innocence, spontaneity, free spirit',
    reversedMeaning: 'Recklessness, risk-taking, inconsideration',
    financialInterpretation: 'Taking a leap of faith, new investment opportunity, unproven venture',
    financialReversed: 'Excessive risk, lack of planning, impulsive decisions',
  },
  {
    name: 'The Magician',
    suit: 'Major Arcana',
    number: 1,
    uprightMeaning: 'Manifestation, resourcefulness, power, inspired action',
    reversedMeaning: 'Manipulation, poor planning, untapped talents',
    financialInterpretation: 'Skilled execution, using all resources, manifesting wealth',
    financialReversed: 'Manipulation of markets, missing opportunities, poor strategy',
  },
  {
    name: 'The High Priestess',
    suit: 'Major Arcana',
    number: 2,
    uprightMeaning: 'Intuition, sacred knowledge, divine feminine, subconscious',
    reversedMeaning: 'Secrets, disconnection, hidden agendas',
    financialInterpretation: 'Trust your intuition, hidden information, patience required',
    financialReversed: 'Missing signals, ignoring gut feeling, deception in deals',
  },
  {
    name: 'The Emperor',
    suit: 'Major Arcana',
    number: 4,
    uprightMeaning: 'Authority, structure, control, leadership',
    reversedMeaning: 'Domination, excessive control, rigidity',
    financialInterpretation: 'Strategic planning, authority in markets, structured approach',
    financialReversed: 'Over-control, inflexibility, domineering approach',
  },
  {
    name: 'The Wheel of Fortune',
    suit: 'Major Arcana',
    number: 10,
    uprightMeaning: 'Good luck, karma, life cycles, destiny',
    reversedMeaning: 'Bad luck, lack of control, unwelcome changes',
    financialInterpretation: 'Market cycles, fortune favors you, turning point',
    financialReversed: 'Market reversal, bad timing, cycles working against you',
  },
  {
    name: 'Justice',
    suit: 'Major Arcana',
    number: 11,
    uprightMeaning: 'Justice, fairness, truth, cause and effect',
    reversedMeaning: 'Unfairness, lack of accountability, dishonesty',
    financialInterpretation: 'Fair valuation, balanced portfolio, legal matters resolved',
    financialReversed: 'Unfair dealing, imbalanced risk, legal complications',
  },
  {
    name: 'The Tower',
    suit: 'Major Arcana',
    number: 16,
    uprightMeaning: 'Sudden change, upheaval, chaos, revelation',
    reversedMeaning: 'Personal transformation, fear of change, averting disaster',
    financialInterpretation: 'Market crash, sudden loss, forced liquidation',
    financialReversed: 'Avoiding disaster, controlled exit, managed decline',
  },
  {
    name: 'The Star',
    suit: 'Major Arcana',
    number: 17,
    uprightMeaning: 'Hope, faith, purpose, renewal, spirituality',
    reversedMeaning: 'Lack of faith, despair, disconnection',
    financialInterpretation: 'Recovery ahead, renewed confidence, long-term gains',
    financialReversed: 'Lost hope, despair in markets, lack of direction',
  },
  {
    name: 'The Sun',
    suit: 'Major Arcana',
    number: 19,
    uprightMeaning: 'Success, radiance, abundance, vitality',
    reversedMeaning: 'Inner sadness, overly optimistic, pessimism',
    financialInterpretation: 'Success assured, clarity in decisions, abundant returns',
    financialReversed: 'Overconfidence, false optimism, dimmed prospects',
  },
  {
    name: 'Judgement',
    suit: 'Major Arcana',
    number: 20,
    uprightMeaning: 'Judgement, rebirth, inner calling, absolution',
    reversedMeaning: 'Self-doubt, refusal to learn, lack of self-awareness',
    financialInterpretation: 'Major decision point, evaluation time, awakening to reality',
    financialReversed: 'Poor judgment, refusing to accept reality, self-deception',
  },
  {
    name: 'The World',
    suit: 'Major Arcana',
    number: 21,
    uprightMeaning: 'Completion, accomplishment, travel, wholeness',
    reversedMeaning: 'Incompletion, lack of closure, seeking shortcuts',
    financialInterpretation: 'Goal achieved, global opportunities, completion of cycle',
    financialReversed: 'Unfulfilled potential, incomplete deals, delayed success',
  },
];

const MINOR_ARCANA_SAMPLES: Omit<TarotCard, 'reversed'>[] = [
  {
    name: 'Ace of Pentacles',
    suit: 'Pentacles',
    number: 1,
    uprightMeaning: 'New financial opportunity, prosperity, manifestation',
    reversedMeaning: 'Lost opportunity, lack of planning, scarcity',
    financialInterpretation: 'New investment opportunity, material gain, foundation for wealth',
    financialReversed: 'Missed opportunity, poor foundation, financial instability',
  },
  {
    name: 'Ten of Pentacles',
    suit: 'Pentacles',
    number: 10,
    uprightMeaning: 'Wealth, financial security, family, long-term success',
    reversedMeaning: 'Financial failure, loneliness, loss',
    financialInterpretation: 'Long-term wealth, generational assets, stable returns',
    financialReversed: 'Wealth loss, unstable legacy, short-term thinking',
  },
  {
    name: 'Five of Pentacles',
    suit: 'Pentacles',
    number: 5,
    uprightMeaning: 'Financial loss, poverty, insecurity, hardship',
    reversedMeaning: 'Recovery from loss, spiritual poverty',
    financialInterpretation: 'Temporary loss, need to seek help, difficult period',
    financialReversed: 'Recovery beginning, finding support, turning point',
  },
  {
    name: 'Ace of Wands',
    suit: 'Wands',
    number: 1,
    uprightMeaning: 'Inspiration, new opportunities, growth',
    reversedMeaning: 'Lack of direction, delays, false starts',
    financialInterpretation: 'New business venture, creative opportunity, energetic start',
    financialReversed: 'False start, delayed launch, lack of enthusiasm',
  },
  {
    name: 'Three of Swords',
    suit: 'Swords',
    number: 3,
    uprightMeaning: 'Heartbreak, pain, sorrow, grief',
    reversedMeaning: 'Recovery, forgiveness, moving on',
    financialInterpretation: 'Painful loss, betrayal in partnership, emotional impact of loss',
    financialReversed: 'Recovery from loss, learning from mistakes, healing',
  },
  {
    name: 'Nine of Cups',
    suit: 'Cups',
    number: 9,
    uprightMeaning: 'Contentment, satisfaction, wishes granted',
    reversedMeaning: 'Dissatisfaction, greed, superficiality',
    financialInterpretation: 'Wish fulfilled, satisfaction with returns, emotional wealth',
    financialReversed: 'Greed, never satisfied, material focus only',
  },
];

const FULL_TAROT_DECK = [...MAJOR_ARCANA, ...MINOR_ARCANA_SAMPLES];

/**
 * Draw tarot cards
 */
function drawTarotCards(count: number, random: SeededRandom): TarotCard[] {
  const shuffled = random.shuffle([...FULL_TAROT_DECK]);
  return shuffled.slice(0, count).map(card => ({
    ...card,
    reversed: random.next() > 0.5,
  }));
}

/**
 * Interpret tarot card in financial context
 */
function interpretTarotCard(card: TarotCard, position: string): string {
  const meaning = card.reversed ? card.financialReversed : card.financialInterpretation;
  const orientation = card.reversed ? '(Reversed)' : '';
  return `${position}: ${card.name} ${orientation} - ${meaning}`;
}

/**
 * Generate tarot prediction
 */
export function generateTarotPrediction(input: TarotPredictionInput): TarotPredictionOutput {
  const { question, userId, spread, context } = input;

  const seed = generateSeed(userId, question);
  const random = new SeededRandom(seed);

  let cards: TarotCardPosition[] = [];
  let guidance = '';

  if (spread === 'three_card') {
    const drawnCards = drawTarotCards(3, random);

    cards = [
      {
        position: 'Past/Foundation',
        card: drawnCards[0],
        interpretation: interpretTarotCard(drawnCards[0], 'Past/Foundation'),
      },
      {
        position: 'Present/Current Situation',
        card: drawnCards[1],
        interpretation: interpretTarotCard(drawnCards[1], 'Present'),
      },
      {
        position: 'Future/Outcome',
        card: drawnCards[2],
        interpretation: interpretTarotCard(drawnCards[2], 'Future'),
      },
    ];

    // Generate guidance based on cards
    const pastCard = drawnCards[0];
    const presentCard = drawnCards[1];
    const futureCard = drawnCards[2];

    guidance = `Your foundation (${pastCard.name}) suggests ${pastCard.reversed ? 'challenges' : 'strengths'} from past decisions. `;
    guidance += `Currently (${presentCard.name}), you are experiencing ${presentCard.reversed ? presentCard.reversedMeaning : presentCard.uprightMeaning}. `;
    guidance += `The future (${futureCard.name}) indicates ${futureCard.reversed ? futureCard.reversedMeaning : futureCard.uprightMeaning}.`;

  } else if (spread === 'celtic_cross') {
    const drawnCards = drawTarotCards(10, random);

    const positions = [
      'Present Situation',
      'Challenge/Obstacle',
      'Root Cause',
      'Recent Past',
      'Possible Future',
      'Near Future',
      'Your Approach',
      'External Influences',
      'Hopes and Fears',
      'Final Outcome',
    ];

    cards = drawnCards.map((card, index) => ({
      position: positions[index],
      card,
      interpretation: interpretTarotCard(card, positions[index]),
    }));

    guidance = `The Celtic Cross reveals a complex situation. Your present (${drawnCards[0].name}) shows `;
    guidance += `${drawnCards[0].reversed ? drawnCards[0].reversedMeaning : drawnCards[0].uprightMeaning}. `;
    guidance += `The main challenge (${drawnCards[1].name}) requires attention. `;
    guidance += `The final outcome (${drawnCards[9].name}) suggests ${drawnCards[9].reversed ? drawnCards[9].reversedMeaning : drawnCards[9].uprightMeaning}.`;
  }

  // Calculate confidence score based on card harmony
  const positiveCards = cards.filter(c => !c.card.reversed).length;
  const confidenceScore = Math.round((positiveCards / cards.length) * 10);

  // Generate action advice
  const actionAdvice = generateTarotActionAdvice(cards, context);

  const overallInterpretation = generateTarotOverallInterpretation(cards, context);

  return {
    question,
    spread: spread === 'three_card' ? 'Three Card Spread' : 'Celtic Cross',
    cards,
    overallInterpretation,
    guidance,
    confidenceScore,
    actionAdvice,
  };
}

function generateTarotActionAdvice(cards: TarotCardPosition[], context?: any): string {
  const futureCard = cards.find(c => c.position.includes('Future') || c.position.includes('Outcome'));
  if (!futureCard) return 'Proceed with caution and awareness.';

  if (futureCard.card.reversed) {
    if (context?.position === 'long') {
      return 'Consider reducing position size or taking profits. The cards suggest challenges ahead.';
    } else if (context?.position === 'short') {
      return 'Your short position may be justified. Maintain risk management.';
    }
    return 'Exercise caution. This may not be the optimal time for major moves.';
  } else {
    if (context?.position === 'long') {
      return 'The cards support your long position. Consider holding or adding on dips.';
    }
    return 'Favorable conditions indicated. Proceed with confidence but maintain discipline.';
  }
}

function generateTarotOverallInterpretation(cards: TarotCardPosition[], context?: any): string {
  const majorArcanaCount = cards.filter(c => c.card.suit === 'Major Arcana').length;
  const reversedCount = cards.filter(c => c.card.reversed).length;

  let interpretation = '';

  if (majorArcanaCount >= cards.length / 2) {
    interpretation += 'Significant karmic forces at play. This is a major decision point. ';
  }

  if (reversedCount > cards.length / 2) {
    interpretation += 'Many reversed cards suggest internal blocks or external challenges. Review your approach. ';
  } else {
    interpretation += 'Upright cards dominate, indicating forward momentum and clarity. ';
  }

  if (context?.assetSymbol) {
    interpretation += `For ${context.assetSymbol}: `;
  }

  const pentacles = cards.filter(c => c.card.suit === 'Pentacles');
  if (pentacles.length > 0) {
    interpretation += 'Pentacles present indicate material/financial matters are central. ';
  }

  return interpretation + 'Remember: Tarot provides guidance, not guarantees. Use wisdom and discernment.';
}

// ============================================================================
// I CHING HEXAGRAM DEFINITIONS
// ============================================================================

const HEXAGRAMS: Omit<IChingHexagram, 'changingLines'>[] = [
  {
    number: 1,
    chineseName: '乾 (Qian)',
    englishName: 'The Creative',
    binarySequence: '111111',
    judgement: 'The Creative works sublime success, furthering through perseverance.',
    image: 'The movement of heaven is full of power. Thus the superior man makes himself strong and untiring.',
    interpretation: 'Pure yang energy, creative force, leadership, initiative. Time for bold action.',
    financialGuidance: 'Strong bullish energy. Take initiative, lead, create. Excellent time for new ventures.',
  },
  {
    number: 2,
    chineseName: '坤 (Kun)',
    englishName: 'The Receptive',
    binarySequence: '000000',
    judgement: 'The Receptive brings supreme success, furthering through perseverance.',
    image: 'The earth\'s condition is receptive devotion. Thus the superior man carries all things.',
    interpretation: 'Pure yin energy, receptivity, patience, following. Time to receive and nurture.',
    financialGuidance: 'Receptive energy. Follow trends, be patient, accumulate. Not time to lead.',
  },
  {
    number: 3,
    chineseName: '屯 (Zhun)',
    englishName: 'Difficulty at the Beginning',
    binarySequence: '010001',
    judgement: 'Initial difficulty followed by success. Perseverance furthers.',
    image: 'Clouds and thunder: difficulty at the beginning. The superior man brings order out of chaos.',
    interpretation: 'Initial challenges, growth pains, perseverance needed. Order emerges from chaos.',
    financialGuidance: 'Difficult start but growth ahead. Don\'t give up. Organize and persist.',
  },
  {
    number: 11,
    chineseName: '泰 (Tai)',
    englishName: 'Peace',
    binarySequence: '000111',
    judgement: 'Peace. The small departs, the great approaches. Success and good fortune.',
    image: 'Heaven and earth unite: peace. The ruler divides and completes.',
    interpretation: 'Harmony, prosperity, heaven and earth in balance. Golden period.',
    financialGuidance: 'Harmony in markets. Excellent time for investment. Peace brings prosperity.',
  },
  {
    number: 12,
    chineseName: '否 (Pi)',
    englishName: 'Standstill',
    binarySequence: '111000',
    judgement: 'Standstill. Unfavorable for the superior man. The great departs, the small approaches.',
    image: 'Heaven and earth do not unite: standstill. The superior man withdraws.',
    interpretation: 'Stagnation, obstacles, withdrawal needed. Not time for action.',
    financialGuidance: 'Standstill in markets. Withdraw, preserve capital, wait for better times.',
  },
  {
    number: 23,
    chineseName: '剝 (Bo)',
    englishName: 'Splitting Apart',
    binarySequence: '100000',
    judgement: 'Splitting apart. It does not further one to go anywhere.',
    image: 'The mountain rests on the earth: splitting apart. Give generously to inferiors.',
    interpretation: 'Deterioration, yielding, letting go. Time to yield and preserve.',
    financialGuidance: 'Markets deteriorating. Sell, preserve capital, don\'t fight the trend.',
  },
  {
    number: 24,
    chineseName: '復 (Fu)',
    englishName: 'Return',
    binarySequence: '000001',
    judgement: 'Return. Success. Going out and coming in without error.',
    image: 'Thunder within the earth: return. The ancient kings closed passes at winter solstice.',
    interpretation: 'Turning point, renewal, return of light. Beginning of new cycle.',
    financialGuidance: 'Market bottom, turnaround. Good time to enter. Renewal begins.',
  },
  {
    number: 43,
    chineseName: '夬 (Guai)',
    englishName: 'Breakthrough',
    binarySequence: '011111',
    judgement: 'Breakthrough. Resolutely make the matter known. Danger must be announced.',
    image: 'The lake has risen up to heaven: breakthrough. Give counsel without growing weary.',
    interpretation: 'Breakthrough moment, decisive action, resolve. Act with determination.',
    financialGuidance: 'Breakthrough imminent. Decisive action needed. Break through resistance.',
  },
  {
    number: 50,
    chineseName: '鼎 (Ding)',
    englishName: 'The Cauldron',
    binarySequence: '101110',
    judgement: 'The Cauldron. Supreme good fortune. Success.',
    image: 'Fire over wood: the cauldron. Nourish men of ability.',
    interpretation: 'Transformation, nourishment, refinement. Cooking to perfection.',
    financialGuidance: 'Transformation of resources. Refinement brings value. Good fortune in alchemy.',
  },
  {
    number: 55,
    chineseName: '豐 (Feng)',
    englishName: 'Abundance',
    binarySequence: '001101',
    judgement: 'Abundance has success. The king attains abundance.',
    image: 'Thunder and lightning come: abundance. Decide lawsuits and carry out punishments.',
    interpretation: 'Peak prosperity, fullness, zenith. Enjoy but prepare for decline.',
    financialGuidance: 'Peak of abundance. Take profits. What goes up must come down.',
  },
];

/**
 * Cast I Ching hexagram
 */
function castHexagram(random: SeededRandom): { lines: number[]; changingLines: number[] } {
  const lines: number[] = [];
  const changingLines: number[] = [];

  for (let i = 0; i < 6; i++) {
    // Traditional coin toss method: 3 coins
    // 3 heads = 9 (changing yang)
    // 2 heads = 8 (stable yang)
    // 2 tails = 7 (stable yin)
    // 3 tails = 6 (changing yin)
    const coin1 = random.next() > 0.5 ? 3 : 2;
    const coin2 = random.next() > 0.5 ? 3 : 2;
    const coin3 = random.next() > 0.5 ? 3 : 2;
    const total = coin1 + coin2 + coin3;

    if (total === 6 || total === 9) {
      changingLines.push(i + 1); // Lines numbered 1-6 from bottom
    }

    // Convert to binary: yang = 1, yin = 0
    lines.push(total % 2); // 9,7 = 1 (yang), 8,6 = 0 (yin)
  }

  return { lines, changingLines };
}

/**
 * Find hexagram by binary sequence
 */
function findHexagram(lines: number[]): IChingHexagram {
  const binarySequence = lines.join('');
  const hexagram = HEXAGRAMS.find(h => h.binarySequence === binarySequence);

  if (hexagram) {
    return { ...hexagram, changingLines: [] };
  }

  // If not found in our subset, return a default
  return {
    number: 1,
    chineseName: '未知',
    englishName: 'Unknown',
    binarySequence,
    judgement: 'Hexagram not found in database.',
    image: 'Consult traditional I Ching text.',
    interpretation: 'This hexagram requires traditional consultation.',
    financialGuidance: 'Seek additional guidance.',
    changingLines: [],
  };
}

/**
 * Transform hexagram with changing lines
 */
function transformHexagram(original: number[], changingLines: number[]): number[] {
  const transformed = [...original];
  changingLines.forEach(line => {
    const index = line - 1;
    transformed[index] = transformed[index] === 1 ? 0 : 1;
  });
  return transformed;
}

/**
 * Generate I Ching prediction
 */
export function generateIChingPrediction(input: IChingPredictionInput): IChingPredictionOutput {
  const { question, userId, context } = input;

  const seed = generateSeed(userId, question);
  const random = new SeededRandom(seed);

  // Cast hexagram
  const { lines, changingLines } = castHexagram(random);
  const hexagram = findHexagram(lines);
  hexagram.changingLines = changingLines;

  // Calculate future hexagram if there are changing lines
  let futureHexagram: IChingHexagram | undefined;
  if (changingLines.length > 0) {
    const futureLines = transformHexagram(lines, changingLines);
    futureHexagram = findHexagram(futureLines);
  }

  // Generate guidance
  let guidance = `${hexagram.chineseName} - ${hexagram.englishName}: ${hexagram.judgement} `;
  guidance += `\n\n${hexagram.interpretation} `;
  guidance += `\n\nFinancial Guidance: ${hexagram.financialGuidance}`;

  if (futureHexagram) {
    guidance += `\n\nChanging lines indicate transformation to ${futureHexagram.chineseName} - ${futureHexagram.englishName}. `;
    guidance += `This suggests: ${futureHexagram.interpretation}`;
  }

  // Calculate confidence based on hexagram nature
  const confidenceScore = calculateIChingConfidence(hexagram, futureHexagram);

  // Generate action advice
  const actionAdvice = generateIChingActionAdvice(hexagram, futureHexagram, context);

  // Generate key dates based on changing lines
  const keyDates = generateKeyDates(changingLines);

  return {
    question,
    hexagram,
    futureHexagram,
    guidance,
    keyDates,
    confidenceScore,
    actionAdvice,
  };
}

function calculateIChingConfidence(hexagram: IChingHexagram, future?: IChingHexagram): number {
  // Favorable hexagrams
  const favorable = [1, 11, 24, 43, 50, 55]; // Creative, Peace, Return, Breakthrough, Cauldron, Abundance
  const unfavorable = [12, 23]; // Standstill, Splitting Apart

  let score = 5; // Base

  if (favorable.includes(hexagram.number)) {
    score += 3;
  } else if (unfavorable.includes(hexagram.number)) {
    score -= 3;
  }

  if (future && favorable.includes(future.number)) {
    score += 2;
  }

  return Math.max(1, Math.min(10, score));
}

function generateIChingActionAdvice(
  hexagram: IChingHexagram,
  future: IChingHexagram | undefined,
  context?: any
): string {
  const favorableActions = [1, 11, 24, 43, 50, 55];
  const cautiousActions = [12, 23, 2];

  if (favorableActions.includes(hexagram.number)) {
    return `${hexagram.englishName} favors action. Proceed with your plan regarding ${context?.assetSymbol || 'this asset'}. ${future ? `Transformation ahead suggests sustained momentum.` : ''}`;
  } else if (cautiousActions.includes(hexagram.number)) {
    return `${hexagram.englishName} counsels patience. Wait for better timing. ${future ? `Future transformation to ${future.englishName} suggests change coming.` : ''}`;
  }

  return 'Proceed with awareness and balance. Neither rush nor delay unduly.';
}

function generateKeyDates(changingLines: number[]): Date[] {
  if (changingLines.length === 0) return [];

  const dates: Date[] = [];
  const now = new Date();

  // Each changing line suggests a key period
  // Line 1 (bottom) = within 6 days
  // Line 2 = within 12 days
  // Line 3 = within 18 days
  // Line 4 = within 24 days
  // Line 5 = within 30 days
  // Line 6 (top) = within 36 days

  changingLines.forEach(line => {
    const daysAhead = line * 6;
    const keyDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
    dates.push(keyDate);
  });

  return dates.sort((a, b) => a.getTime() - b.getTime());
}

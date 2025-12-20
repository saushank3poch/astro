# Compatibility Algorithm Specification

**Version**: 1.0
**Last Updated**: 2025-12-20
**Status**: Design Document

---

## Overview

The compatibility algorithm matches users with financial assets based on astrological harmony. It combines Chinese Five Elements theory with Western planetary compatibility to generate a 1-10 compatibility score with detailed reasoning.

**Core Principles**:
1. **Element Harmony**: Primary scoring based on Five Elements productive/destructive cycles
2. **Planetary Compatibility**: Secondary scoring from birth chart planet alignments
3. **Weighted Combination**: 60% elements, 40% planets
4. **Transparent Reasoning**: Every score includes human-readable explanation

---

## Five Elements Theory (Chinese Astrology)

### The Five Elements

```
Wood (木) → Fire (火) → Earth (土) → Metal (金) → Water (水) → Wood...
```

**Element Characteristics**:

| Element | Nature | Financial Traits | Example Assets |
|---------|--------|------------------|----------------|
| **Wood** | Growth, expansion | Innovation, startups, high growth | Tech stocks, DeFi protocols |
| **Fire** | Speed, energy | Volatility, momentum, heat | Memecoins, high-frequency trading |
| **Earth** | Stability, foundation | Real assets, tangible value | Real estate, RWAs, stablecoins |
| **Metal** | Precision, value | Store of value, precious metals | Gold, Bitcoin, established crypto |
| **Water** | Flow, adaptation | Liquidity, derivatives, flexible | DEX, liquidity pools, bonds |

### Productive Cycle (相生 xiāngshēng)

Elements that **support and strengthen** each other:

```
Wood → Fire:  Wood feeds fire (Wood produces Fire)
Fire → Earth: Fire creates earth (ash/soil)
Earth → Metal: Earth contains metal (ores)
Metal → Water: Metal condenses water (dew on metal)
Water → Wood: Water nourishes wood (growth)
```

**Scoring**: When asset element is produced by user's favorable element, or when asset produces user's favorable element → **High compatibility (7-10)**

### Destructive Cycle (相克 xiāngkè)

Elements that **weaken or control** each other:

```
Wood → Earth:  Wood depletes earth (roots absorb nutrients)
Earth → Water: Earth dams water (earth blocks water)
Water → Fire:  Water extinguishes fire
Fire → Metal:  Fire melts metal
Metal → Wood:  Metal chops wood
```

**Scoring**: When asset element destroys user's favorable element, or vice versa → **Low compatibility (1-4)**

### Same Element

When asset element matches user's favorable element → **Strong compatibility (8-10)**

### Neutral Elements

Elements with no direct productive/destructive relationship → **Medium compatibility (5-7)**

---

## Element Compatibility Matrix

### Scoring Table

| User Element | Asset Element | Relationship | Base Score | Reasoning |
|--------------|---------------|--------------|------------|-----------|
| Wood | Wood | Same | 9 | Perfect resonance |
| Wood | Fire | Productive (W→F) | 8 | You feed its energy |
| Wood | Earth | Destructive (W→E) | 3 | You deplete it |
| Wood | Metal | Destructive (M→W) | 4 | It controls you |
| Wood | Water | Productive (Wa→W) | 8 | It nourishes you |
| Fire | Fire | Same | 9 | Perfect resonance |
| Fire | Earth | Productive (F→E) | 8 | You create stability |
| Fire | Metal | Destructive (F→M) | 3 | You weaken it |
| Fire | Water | Destructive (Wa→F) | 2 | It extinguishes you |
| Fire | Wood | Productive (W→F) | 8 | It fuels you |
| Earth | Earth | Same | 9 | Perfect resonance |
| Earth | Metal | Productive (E→M) | 8 | You create value |
| Earth | Water | Destructive (E→Wa) | 3 | You block it |
| Earth | Wood | Destructive (W→E) | 4 | It depletes you |
| Earth | Fire | Productive (F→E) | 8 | It strengthens you |
| Metal | Metal | Same | 9 | Perfect resonance |
| Metal | Water | Productive (M→Wa) | 8 | You create flow |
| Metal | Wood | Destructive (M→W) | 3 | You cut it down |
| Metal | Fire | Destructive (F→M) | 4 | It melts you |
| Metal | Earth | Productive (E→M) | 8 | It creates you |
| Water | Water | Same | 9 | Perfect resonance |
| Water | Wood | Productive (Wa→W) | 8 | You nurture growth |
| Water | Fire | Destructive (Wa→F) | 3 | You extinguish it |
| Water | Earth | Destructive (E→Wa) | 4 | It blocks you |
| Water | Metal | Productive (M→Wa) | 8 | It creates you |

---

## Algorithm Implementation

### Step 1: Extract User's Favorable Elements

From user's `BaziChart`:

```typescript
interface BaziChart {
  dayMaster: Element; // User's core element
  favorableElements: Element[]; // Elements that balance the chart
  unfavorableElements: Element[]; // Elements that create imbalance
}

type Element = 'wood' | 'fire' | 'earth' | 'metal' | 'water';
```

**Example**:
```typescript
const userProfile = {
  dayMaster: 'fire',
  favorableElements: ['earth', 'fire'], // Needs grounding
  unfavorableElements: ['water'] // Too much water weakens fire
};
```

### Step 2: Get Asset's Primary Element

From asset's astrological profile:

```typescript
interface AssetProfile {
  primaryElement: Element;
  secondaryElement?: Element;
  elementReasoning: string;
}
```

**Example**:
```typescript
const solanaAsset = {
  symbol: 'SOL',
  primaryElement: 'fire', // Fast, hot, energetic
  secondaryElement: 'metal', // Valuable, precise consensus
  elementReasoning: 'Fire dominant due to speed and energy of the network'
};
```

### Step 3: Calculate Element Harmony Score

```typescript
function calculateElementScore(
  userFavorableElements: Element[],
  userUnfavorableElements: Element[],
  assetPrimaryElement: Element,
  assetSecondaryElement?: Element
): {
  score: number; // 1-10
  harmonyType: 'productive' | 'destructive' | 'same' | 'neutral';
  strength: 'very_strong' | 'strong' | 'medium' | 'weak' | 'very_weak';
  reasoning: string;
} {
  let score = 5; // Start neutral
  let harmonyType = 'neutral';
  let strength = 'medium';

  // Check primary element against user's favorable elements
  for (const favorableElement of userFavorableElements) {
    if (assetPrimaryElement === favorableElement) {
      // Same element - perfect resonance
      score = 9;
      harmonyType = 'same';
      strength = 'very_strong';
      break;
    } else if (isProductive(favorableElement, assetPrimaryElement)) {
      // Productive cycle
      score = 8;
      harmonyType = 'productive';
      strength = 'strong';
    } else if (isProductive(assetPrimaryElement, favorableElement)) {
      // Reverse productive cycle
      score = 8;
      harmonyType = 'productive';
      strength = 'strong';
    }
  }

  // Check against unfavorable elements (penalty)
  for (const unfavorableElement of userUnfavorableElements) {
    if (assetPrimaryElement === unfavorableElement) {
      score = 2;
      harmonyType = 'destructive';
      strength = 'very_weak';
      break;
    } else if (isDestructive(unfavorableElement, assetPrimaryElement)) {
      score = 4;
      harmonyType = 'destructive';
      strength = 'weak';
    }
  }

  // Secondary element adds +1 or -1 adjustment
  if (assetSecondaryElement && userFavorableElements.includes(assetSecondaryElement)) {
    score = Math.min(10, score + 1);
  }

  const reasoning = generateElementReasoning(
    userFavorableElements,
    assetPrimaryElement,
    harmonyType
  );

  return { score, harmonyType, strength, reasoning };
}
```

### Step 4: Element Relationship Helpers

```typescript
// Five Elements productive cycle
const PRODUCTIVE_CYCLE: Record<Element, Element> = {
  wood: 'fire',   // Wood produces Fire
  fire: 'earth',  // Fire produces Earth
  earth: 'metal', // Earth produces Metal
  metal: 'water', // Metal produces Water
  water: 'wood',  // Water produces Wood
};

// Five Elements destructive cycle
const DESTRUCTIVE_CYCLE: Record<Element, Element> = {
  wood: 'earth',  // Wood destroys Earth
  earth: 'water', // Earth destroys Water
  water: 'fire',  // Water destroys Fire
  fire: 'metal',  // Fire destroys Metal
  metal: 'wood',  // Metal destroys Wood
};

function isProductive(element1: Element, element2: Element): boolean {
  return PRODUCTIVE_CYCLE[element1] === element2;
}

function isDestructive(element1: Element, element2: Element): boolean {
  return DESTRUCTIVE_CYCLE[element1] === element2;
}
```

---

## Planetary Compatibility (Western Astrology)

### Planet Meanings in Finance

| Planet | Financial Meaning | Asset Traits |
|--------|-------------------|--------------|
| **Sun** | Core identity, leadership | Blue-chip, market leaders |
| **Moon** | Emotions, volatility | Sentiment-driven, retail popular |
| **Mercury** | Communication, speed | Tech, information, high-frequency |
| **Venus** | Value, beauty | Luxury goods, art, aesthetics |
| **Mars** | Aggression, energy | High-risk, momentum plays |
| **Jupiter** | Growth, expansion | Growth stocks, venture bets |
| **Saturn** | Structure, limitation | Regulated, established, conservative |
| **Uranus** | Innovation, disruption | Blockchain, AI, emerging tech |
| **Neptune** | Illusion, speculation | Memecoins, hype-driven |
| **Pluto** | Transformation, power | Major market shifts, power plays |

### User Dominant Planet

Extract from user's birth chart:

```typescript
function determineDominantPlanet(birthChart: BirthChart): Planet {
  // Factors that determine dominance:
  // 1. Chart ruler (ruler of rising sign)
  // 2. Most aspected planet
  // 3. Planet in angular house (1, 4, 7, 10)
  // 4. Stellium (3+ planets in same sign)

  return dominantPlanet;
}
```

### Asset Dominant Planet

Determined by:
1. Asset type and characteristics
2. Birth chart if available
3. Sector classification

**Example Mappings**:
```typescript
const ASSET_PLANET_MAPPINGS = {
  BTC: 'saturn', // Structure, store of value, conservative
  ETH: 'uranus', // Innovation, smart contracts, disruption
  SOL: 'mars', // Speed, energy, aggressive scaling
  DOGE: 'neptune', // Meme, illusion, hype
  AAPL: 'sun', // Leadership, core holding
  TSLA: 'uranus', // Innovation, disruption
  GLD: 'venus', // Value, beauty, timeless
  // ... etc
};
```

### Planetary Compatibility Matrix

Compatibility between user's dominant planet and asset's dominant planet:

| Compatibility Level | Score | Planet Pairs |
|---------------------|-------|--------------|
| **Highly Compatible** | 8-10 | Sun-Jupiter, Venus-Jupiter, Sun-Mars, Mercury-Uranus |
| **Compatible** | 6-7 | Moon-Venus, Sun-Mercury, Mars-Jupiter, Mercury-Saturn |
| **Neutral** | 5 | Most other pairs |
| **Challenging** | 3-4 | Saturn-Uranus, Mars-Saturn, Sun-Saturn, Neptune-Saturn |
| **Very Challenging** | 1-2 | Saturn-Neptune, Uranus-Pluto (rare) |

```typescript
const PLANETARY_COMPATIBILITY_MATRIX: Record<string, Record<string, number>> = {
  sun: {
    sun: 9,
    moon: 7,
    mercury: 7,
    venus: 8,
    mars: 8,
    jupiter: 9,
    saturn: 4,
    uranus: 6,
    neptune: 5,
    pluto: 6,
  },
  // ... complete matrix
};

function calculatePlanetaryScore(
  userPlanet: Planet,
  assetPlanet: Planet
): number {
  return PLANETARY_COMPATIBILITY_MATRIX[userPlanet][assetPlanet];
}
```

---

## Combined Scoring Formula

### Weighted Average

```typescript
function calculateOverallCompatibility(
  elementScore: number,
  planetaryScore: number
): number {
  // Element harmony is more important in financial astrology
  const ELEMENT_WEIGHT = 0.6;
  const PLANET_WEIGHT = 0.4;

  const weightedScore =
    (elementScore * ELEMENT_WEIGHT) +
    (planetaryScore * PLANET_WEIGHT);

  return Math.round(weightedScore);
}
```

**Example Calculation**:
```
User: Fire element favorable, Jupiter dominant
Asset: Solana (Fire element, Mars dominant)

Element Score: 9 (same element)
Planetary Score: 9 (Jupiter-Mars compatible)

Overall = (9 * 0.6) + (9 * 0.4) = 5.4 + 3.6 = 9.0

Compatibility Score: 9/10
```

---

## Reasoning Generator

### Template Structure

```typescript
interface CompatibilityReasoning {
  score: number;
  elementAnalysis: string;
  planetaryAnalysis: string;
  whyGoodForUser: string;
  potentialChallenges?: string;
  bestTimingAdvice: string;
}

function generateReasoning(
  userProfile: UserProfile,
  assetProfile: AssetProfile,
  scores: Scores
): CompatibilityReasoning {
  const { elementScore, planetaryScore, overall } = scores;

  // Element analysis
  let elementAnalysis = '';
  if (scores.elementHarmony.harmonyType === 'same') {
    elementAnalysis = `${assetProfile.name}'s ${assetProfile.primaryElement} element perfectly resonates with your favorable ${userProfile.favorableElements[0]} element, creating ideal harmony.`;
  } else if (scores.elementHarmony.harmonyType === 'productive') {
    elementAnalysis = `${assetProfile.name}'s ${assetProfile.primaryElement} element exists in a productive cycle with your favorable ${userProfile.favorableElements[0]} element, creating supportive energy.`;
  } else if (scores.elementHarmony.harmonyType === 'destructive') {
    elementAnalysis = `${assetProfile.name}'s ${assetProfile.primaryElement} element conflicts with your favorable elements, suggesting caution.`;
  }

  // Planetary analysis
  const planetaryAnalysis = `Your ${userProfile.dominantPlanet}-dominant chart ${
    planetaryScore >= 7 ? 'harmonizes well with' : 'has neutral energy toward'
  } ${assetProfile.name}'s ${assetProfile.dominantPlanet} nature.`;

  // Personalized explanation
  const whyGoodForUser = generatePersonalizedAdvice(
    userProfile,
    assetProfile,
    overall
  );

  return {
    score: overall,
    elementAnalysis,
    planetaryAnalysis,
    whyGoodForUser,
    potentialChallenges: overall < 6 ? generateChallenges(scores) : undefined,
    bestTimingAdvice: generateTimingAdvice(userProfile, assetProfile),
  };
}
```

### Example Reasoning Outputs

**High Compatibility (Score 9)**:
```
"Solana's fire element perfectly resonates with your favorable fire element, creating
ideal harmony. Your Jupiter-dominant chart harmonizes well with Solana's Mars nature,
supporting bold expansion.

Why this is great for you: Your fire-dominant chart thrives on speed and momentum.
Solana's rapid transaction finality and energetic ecosystem align perfectly with your
natural inclinations. You'll intuitively understand this asset's volatility and can
ride its waves effectively.

Best timing: Enter during your fire periods (late spring, summer) or when Mars is
strong in the sky. Avoid water-heavy periods that might dampen your enthusiasm."
```

**Medium Compatibility (Score 5)**:
```
"Bitcoin's metal element is neutral to your earth-favorable profile, neither strongly
supporting nor opposing. Your Venus-dominant chart has moderate compatibility with
Bitcoin's Saturn nature.

Why this works: While not perfectly aligned, Bitcoin's stability and store-of-value
properties can ground your earth energy. Consider this a 'reasonable but not ideal'
match - you can work with it, but it won't feel as natural as earth or fire assets.

Best timing: During earth periods when you feel most grounded and patient. Avoid
impulsive entries during wood periods."
```

**Low Compatibility (Score 3)**:
```
"This asset's water element conflicts with your favorable fire element, suggesting
caution. Water extinguishes fire in the Five Elements cycle, creating natural tension.

Challenges: You may find this asset's fluid, adaptable nature frustrating to your
direct fire energy. Its movements might feel unpredictable or contrary to your
instincts.

If you must engage: Wait for strong fire transits to balance the water influence.
Keep positions small and set strict stop-losses. This asset requires extra vigilance
from you."
```

---

## Special Cases & Edge Handling

### No User Birth Chart

```typescript
if (!userProfile.birthChart) {
  return {
    error: 'INCOMPLETE_PROFILE',
    message: 'Please complete your birth chart to receive personalized recommendations',
    fallback: getPopularAssets() // Show trending instead
  };
}
```

### Multiple Favorable Elements

When user has 2+ favorable elements, check both:

```typescript
const scores = userProfile.favorableElements.map(element =>
  calculateElementScore(element, asset.primaryElement)
);
const bestScore = Math.max(...scores);
const bestElement = userProfile.favorableElements[scores.indexOf(bestScore)];
```

### Asset with No Element Data

```typescript
if (!asset.primaryElement) {
  // Use asset type defaults
  const defaultElement = ASSET_TYPE_DEFAULTS[asset.assetType];
  // Lower confidence in reasoning
  reasoning.confidence = 'medium';
}
```

### Conflicting Scores

If element score is high but planetary score is low (or vice versa):

```typescript
if (Math.abs(elementScore - planetaryScore) > 4) {
  reasoning.note = 'Mixed signals: Strong elemental harmony but challenging planetary aspects. Consider both factors in your decision.';
}
```

---

## Validation & Testing

### Test Cases

```typescript
describe('Compatibility Algorithm', () => {
  test('Same element gives 9/10 score', () => {
    const user = { favorableElements: ['fire'] };
    const asset = { primaryElement: 'fire' };
    const score = calculateElementScore(user, asset);
    expect(score).toBe(9);
  });

  test('Productive cycle gives 8/10 score', () => {
    const user = { favorableElements: ['wood'] };
    const asset = { primaryElement: 'fire' }; // Wood produces Fire
    const score = calculateElementScore(user, asset);
    expect(score).toBe(8);
  });

  test('Destructive cycle gives low score', () => {
    const user = { favorableElements: ['fire'] };
    const asset = { primaryElement: 'water' }; // Water destroys Fire
    const score = calculateElementScore(user, asset);
    expect(score).toBeLessThanOrEqual(3);
  });

  test('Unfavorable element match gives very low score', () => {
    const user = {
      favorableElements: ['fire'],
      unfavorableElements: ['water']
    };
    const asset = { primaryElement: 'water' };
    const score = calculateElementScore(user, asset);
    expect(score).toBe(2);
  });
});
```

### Peer Review Checklist

- [ ] Five Elements cycles are correct (consult Chinese astrology expert)
- [ ] Planetary meanings make sense for finance
- [ ] Reasoning templates are clear and helpful
- [ ] Scores feel intuitive (high = good, low = avoid)
- [ ] Edge cases handled gracefully

---

## Future Enhancements

### Version 2.0 Considerations

1. **Timing Modifiers**: Adjust scores based on current transits
2. **Risk Tolerance**: Factor in user's risk profile (Mars/Uranus = high risk tolerance)
3. **House Placements**: Where planets fall in user's chart
4. **Progressive Refinement**: Machine learning on user feedback
5. **Sector Compatibility**: Group assets by sector elements
6. **Multi-Asset Portfolios**: Elemental balance across holdings

---

## Reference Materials

### Five Elements Resources

- "The Four Pillars of Destiny" by Jerry King
- "Chinese Astrology" by Derek Walters
- "BaZi: The Destiny Code" by Joey Yap

### Financial Astrology Resources

- "The Bull, the Bear and the Planets" by Bill Meridian
- "Financial Astrology" by David Williams
- "Planetary Economics" by W.D. Gann

### Algorithm Design

- Weighted scoring methodology
- Normalization to 1-10 scale
- Transparent, explainable AI principles

---

**Algorithm Status**: Ready for Implementation
**Next Steps**: Backend service implementation, unit testing, peer review

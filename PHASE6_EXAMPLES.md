# Phase 6: User-Asset Matching Examples

**Version**: 1.0
**Last Updated**: 2025-12-20
**Purpose**: Example personas, compatibility calculations, and expected recommendations

---

## Example User Personas

### Persona 1: Sarah "Fire Dragon" Chen

**Profile**:
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440001",
  "name": "Sarah Chen",
  "nickname": "Fire Dragon",
  "birthDate": "1988-03-15",
  "birthTime": "14:30",
  "birthLocation": {
    "city": "Hong Kong",
    "country": "China",
    "latitude": 22.3193,
    "longitude": 114.1694
  }
}
```

**Astrological Profile**:
```json
{
  "chinese": {
    "zodiac": "Dragon",
    "element": "Earth",
    "baziChart": {
      "dayMaster": "fire",
      "favorableElements": ["fire", "earth"],
      "unfavorableElements": ["water"],
      "strength": "strong"
    },
    "luckyNumbers": [3, 8, 9],
    "luckyColors": ["red", "orange", "brown"]
  },
  "western": {
    "sunSign": "Pisces",
    "moonSign": "Leo",
    "risingSign": "Sagittarius",
    "dominantPlanet": "Jupiter",
    "elementDistribution": {
      "Fire": 40,
      "Earth": 30,
      "Air": 20,
      "Water": 10
    },
    "dominantElement": "Fire"
  }
}
```

**Investment Style**:
- Risk tolerance: High
- Prefers: Fast-moving, high-growth assets
- Trading style: Momentum-based, aggressive entries
- Favorite sectors: DeFi, Layer 1s, high-frequency protocols

---

### Persona 2: David "Earth Ox" Martinez

**Profile**:
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440002",
  "name": "David Martinez",
  "nickname": "Earth Ox",
  "birthDate": "1985-05-22",
  "birthTime": "08:15",
  "birthLocation": {
    "city": "Austin",
    "country": "USA",
    "latitude": 30.2672,
    "longitude": -97.7431
  }
}
```

**Astrological Profile**:
```json
{
  "chinese": {
    "zodiac": "Ox",
    "element": "Wood",
    "baziChart": {
      "dayMaster": "earth",
      "favorableElements": ["earth", "metal"],
      "unfavorableElements": ["wood"],
      "strength": "balanced"
    },
    "luckyNumbers": [1, 4, 5],
    "luckyColors": ["brown", "yellow", "white"]
  },
  "western": {
    "sunSign": "Gemini",
    "moonSign": "Taurus",
    "risingSign": "Capricorn",
    "dominantPlanet": "Saturn",
    "elementDistribution": {
      "Fire": 10,
      "Earth": 50,
      "Air": 25,
      "Water": 15
    },
    "dominantElement": "Earth"
  }
}
```

**Investment Style**:
- Risk tolerance: Low to Medium
- Prefers: Stable, long-term value storage
- Trading style: Buy-and-hold, conservative
- Favorite sectors: RWAs, stablecoins, blue-chip crypto

---

### Persona 3: Lisa "Water Snake" Kim

**Profile**:
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440003",
  "name": "Lisa Kim",
  "nickname": "Water Snake",
  "birthDate": "1989-08-12",
  "birthTime": "22:45",
  "birthLocation": {
    "city": "Seoul",
    "country": "South Korea",
    "latitude": 37.5665,
    "longitude": 126.9780
  }
}
```

**Astrological Profile**:
```json
{
  "chinese": {
    "zodiac": "Snake",
    "element": "Earth",
    "baziChart": {
      "dayMaster": "water",
      "favorableElements": ["water", "metal"],
      "unfavorableElements": ["earth"],
      "strength": "weak"
    },
    "luckyNumbers": [2, 7, 9],
    "luckyColors": ["blue", "black", "white"]
  },
  "western": {
    "sunSign": "Leo",
    "moonSign": "Scorpio",
    "risingSign": "Pisces",
    "dominantPlanet": "Neptune",
    "elementDistribution": {
      "Fire": 25,
      "Earth": 15,
      "Air": 20,
      "Water": 40
    },
    "dominantElement": "Water"
  }
}
```

**Investment Style**:
- Risk tolerance: Medium
- Prefers: Liquid, flexible assets
- Trading style: Adaptive, swing trading
- Favorite sectors: DEXs, liquidity pools, derivatives

---

### Persona 4: Michael "Metal Tiger" Thompson

**Profile**:
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440004",
  "name": "Michael Thompson",
  "nickname": "Metal Tiger",
  "birthDate": "1974-11-08",
  "birthTime": "06:00",
  "birthLocation": {
    "city": "London",
    "country": "UK",
    "latitude": 51.5074,
    "longitude": -0.1278
  }
}
```

**Astrological Profile**:
```json
{
  "chinese": {
    "zodiac": "Tiger",
    "element": "Wood",
    "baziChart": {
      "dayMaster": "metal",
      "favorableElements": ["metal", "water"],
      "unfavorableElements": ["fire"],
      "strength": "strong"
    },
    "luckyNumbers": [4, 7, 9],
    "luckyColors": ["white", "gold", "silver"]
  },
  "western": {
    "sunSign": "Scorpio",
    "moonSign": "Capricorn",
    "risingSign": "Virgo",
    "dominantPlanet": "Saturn",
    "elementDistribution": {
      "Fire": 15,
      "Earth": 35,
      "Air": 20,
      "Water": 30
    },
    "dominantElement": "Earth"
  }
}
```

**Investment Style**:
- Risk tolerance: Low
- Prefers: Store of value, precious metals
- Trading style: Long-term accumulation
- Favorite sectors: Bitcoin, gold, established value assets

---

## Compatibility Calculations

### Example 1: Sarah (Fire Dragon) × Solana (SOL)

**Asset Profile**:
```json
{
  "symbol": "SOL",
  "name": "Solana",
  "assetType": "crypto",
  "category": "Layer 1",
  "primaryElement": "fire",
  "secondaryElement": "metal",
  "dominantPlanet": "Mars",
  "elementReasoning": "Fire element due to extreme speed, heat generation, and energetic ecosystem"
}
```

**Calculation**:

**Step 1: Element Score**
- User favorable elements: `["fire", "earth"]`
- Asset primary element: `"fire"`
- Relationship: **Same element** → Perfect resonance
- Base score: **9/10**
- Secondary element (metal) is neutral to user
- **Element Score: 9/10**

**Step 2: Planetary Score**
- User dominant planet: `Jupiter` (expansion, growth)
- Asset dominant planet: `Mars` (speed, aggression)
- Jupiter-Mars compatibility: **9/10** (highly compatible - expansion + action)
- **Planetary Score: 9/10**

**Step 3: Combined Score**
```
Overall = (9 × 0.6) + (9 × 0.4)
        = 5.4 + 3.6
        = 9.0
```
**Overall Compatibility: 9/10**

**Reasoning**:
```
Solana's fire element perfectly resonates with your favorable fire element,
creating ideal harmony. Your Jupiter-dominant chart harmonizes beautifully
with Solana's Mars nature, supporting bold expansion through rapid action.

Why this is great for you: Your fire-dominant chart thrives on speed and
momentum. Solana's blazing-fast transaction finality (400ms) and energetic
ecosystem align perfectly with your natural inclinations. The Dragon's
affinity for heat and energy makes you intuitively attuned to Solana's
volatility - you can ride its waves effectively rather than being burned.

Your Jupiter placement suggests you'll benefit from Solana's expansive
ecosystem growth. Enter during fire-element periods (late spring, summer)
or when Mars is strong for maximum harmony. The combination of your Leo
Moon and Solana's aggressive energy creates natural synergy - trust your
instincts with this asset.

Best timing: Q2-Q3 (fire seasons), Mars transits, your personal fire periods.
```

---

### Example 2: Sarah (Fire Dragon) × Wrapped Bitcoin (WBTC)

**Asset Profile**:
```json
{
  "symbol": "WBTC",
  "name": "Wrapped Bitcoin",
  "assetType": "crypto",
  "category": "Store of Value",
  "primaryElement": "water",
  "secondaryElement": "metal",
  "dominantPlanet": "Saturn",
  "elementReasoning": "Water element due to fluid cross-chain nature, metal due to Bitcoin's value core"
}
```

**Calculation**:

**Step 1: Element Score**
- User favorable elements: `["fire", "earth"]`
- User unfavorable elements: `["water"]`
- Asset primary element: `"water"`
- Relationship: **Destructive** (Water destroys Fire)
- **Element Score: 2/10** (very low - direct conflict)

**Step 2: Planetary Score**
- User dominant planet: `Jupiter`
- Asset dominant planet: `Saturn`
- Jupiter-Saturn compatibility: **4/10** (challenging - expansion vs restriction)
- **Planetary Score: 4/10**

**Step 3: Combined Score**
```
Overall = (2 × 0.6) + (4 × 0.4)
        = 1.2 + 1.6
        = 2.8 ≈ 3
```
**Overall Compatibility: 3/10**

**Reasoning**:
```
WBTC's water element conflicts with your favorable fire element, suggesting
significant caution. Water extinguishes fire in the Five Elements cycle,
creating natural tension. Your Jupiter-dominant chart also clashes with
WBTC's Saturn nature (expansion vs restriction).

Challenges: You may find WBTC's slow, conservative nature frustrating to
your direct fire energy. Its cross-chain fluidity (water trait) might feel
unpredictable to you. The Saturn influence brings structure and limitation
that resists your Jupiter's desire for rapid growth.

If you must engage: Wait for strong fire transits to balance the water
influence. Keep positions small and set strict stop-losses. This asset
requires extra vigilance from you - it moves against your natural rhythms.
Consider it only as portfolio diversification, not a core holding.

Better alternatives: Look for fire or earth element assets that harmonize
with your chart. SOL, MATIC, or earth-element RWAs would serve you better.
```

---

### Example 3: David (Earth Ox) × ONDO Finance

**Asset Profile**:
```json
{
  "symbol": "ONDO",
  "name": "Ondo Finance",
  "assetType": "crypto",
  "category": "RWA",
  "primaryElement": "earth",
  "secondaryElement": "metal",
  "dominantPlanet": "Venus",
  "elementReasoning": "Earth element due to real-world asset backing and stable foundation"
}
```

**Calculation**:

**Step 1: Element Score**
- User favorable elements: `["earth", "metal"]`
- Asset primary element: `"earth"`
- Relationship: **Same element** → Perfect resonance
- Secondary element: `"metal"` also in favorable list
- **Element Score: 10/10** (maximum - both primary and secondary match)

**Step 2: Planetary Score**
- User dominant planet: `Saturn`
- Asset dominant planet: `Venus`
- Saturn-Venus compatibility: **7/10** (good - structure + value)
- **Planetary Score: 7/10**

**Step 3: Combined Score**
```
Overall = (10 × 0.6) + (7 × 0.4)
        = 6.0 + 2.8
        = 8.8 ≈ 9
```
**Overall Compatibility: 9/10**

**Reasoning**:
```
ONDO Finance's earth element perfectly matches your favorable earth element,
creating exceptional harmony. The secondary metal element also aligns with
your chart, suggesting near-perfect elemental balance. Your Saturn-dominant
personality appreciates ONDO's Venus nature (value and stability).

Why this is perfect for you: As an Earth Ox, you inherently understand
tangible value and stable foundations - exactly what RWAs represent. ONDO's
tokenization of real-world assets (US Treasuries, bonds) provides the grounded,
conservative approach that resonates with your Saturn-Capricorn rising nature.

Your risk-averse profile matches ONDO's stability focus. The earth-earth
resonance means you'll intuitively grasp when to accumulate and when to hold.
Your Taurus Moon adds extra affinity for Venus-ruled assets - this is a
natural fit that will feel comfortable, not stressful.

Best timing: Earth periods (late summer, transitions between seasons),
Saturn transits in earth signs (Taurus, Virgo, Capricorn). Accumulate
during market uncertainty when others flee to safety - your earth element
thrives in these conditions.

Strategy: Dollar-cost average during dips, hold long-term. This is a
core portfolio holding for your chart, not a trading vehicle.
```

---

### Example 4: Lisa (Water Snake) × Uniswap (UNI)

**Asset Profile**:
```json
{
  "symbol": "UNI",
  "name": "Uniswap",
  "assetType": "crypto",
  "category": "DeFi - DEX",
  "primaryElement": "water",
  "secondaryElement": "wood",
  "dominantPlanet": "Mercury",
  "elementReasoning": "Water element due to liquidity flow and adaptive market making"
}
```

**Calculation**:

**Step 1: Element Score**
- User favorable elements: `["water", "metal"]`
- Asset primary element: `"water"`
- Relationship: **Same element**
- **Element Score: 9/10**

**Step 2: Planetary Score**
- User dominant planet: `Neptune`
- Asset dominant planet: `Mercury`
- Neptune-Mercury compatibility: **6/10** (moderate - intuition + communication)
- **Planetary Score: 6/10**

**Step 3: Combined Score**
```
Overall = (9 × 0.6) + (6 × 0.4)
        = 5.4 + 2.4
        = 7.8 ≈ 8
```
**Overall Compatibility: 8/10**

**Reasoning**:
```
Uniswap's water element harmonizes perfectly with your favorable water
element, creating strong compatibility. As a Water Snake, you innately
understand liquidity flows and adaptive strategies - exactly what DEXs
embody.

Why this works for you: Your Scorpio Moon and Pisces Rising give you
intuitive feel for market liquidity. Uniswap's constant liquidity provision
mechanism mirrors your adaptive nature. The water-water resonance means
you'll sense when liquidity is drying up or flowing in, giving you edge
in timing.

Your Neptune dominance adds mystical understanding of decentralized systems
and emergent behavior. While Mercury's quick communication sometimes clashes
with Neptune's dreamy nature, in a DEX context this creates balance -
intuition (Neptune) + data (Mercury) for optimal trading decisions.

Best timing: Water periods (winter, night hours), Neptune transits, full
moons (emotional liquidity peaks). Provide liquidity when others hesitate,
remove when frenzy builds.

Strategy: Swing trade UNI token, provide liquidity in low-volatility pools,
use your water instincts to time market cycles. Trust your gut on when
to enter/exit positions.
```

---

### Example 5: Michael (Metal Tiger) × Bitcoin (BTC)

**Asset Profile**:
```json
{
  "symbol": "BTC",
  "name": "Bitcoin",
  "assetType": "crypto",
  "category": "Store of Value",
  "primaryElement": "metal",
  "secondaryElement": "earth",
  "dominantPlanet": "Saturn",
  "elementReasoning": "Metal element as digital gold, store of value, and precise consensus"
}
```

**Calculation**:

**Step 1: Element Score**
- User favorable elements: `["metal", "water"]`
- Asset primary element: `"metal"`
- Relationship: **Same element**
- Secondary element: `"earth"` (neutral to user)
- **Element Score: 9/10**

**Step 2: Planetary Score**
- User dominant planet: `Saturn`
- Asset dominant planet: `Saturn`
- Saturn-Saturn compatibility: **9/10** (same planet - perfect resonance)
- **Planetary Score: 9/10**

**Step 3: Combined Score**
```
Overall = (9 × 0.6) + (9 × 0.4)
        = 5.4 + 3.6
        = 9.0
```
**Overall Compatibility: 9/10**

**Reasoning**:
```
Bitcoin's metal element perfectly resonates with your favorable metal
element, creating ideal harmony. The Saturn-Saturn alignment is exceptional -
you're both structure-oriented, conservative, and value-focused.

Why this is your perfect asset: As a Metal Tiger, you embody the precise,
valuable nature of metals. Bitcoin's "digital gold" narrative aligns exactly
with your metal element's affinity for precious stores of value. Your
Saturn-Capricorn energy understands Bitcoin's slow, steady, conservative
approach - this isn't a get-rich-quick scheme, but a long-term foundation.

Your Scorpio Sun and Capricorn Moon create ideal psychology for Bitcoin
accumulation. You have patience (Saturn), intensity (Scorpio), and discipline
(Capricorn) - the exact traits needed for long-term Bitcoin holding through
cycles. The metal-metal resonance means you won't panic sell during dips;
you'll recognize them as accumulation opportunities.

Best timing: Metal periods (autumn, especially September-October), Saturn
transits in Capricorn/Aquarius, during market fear when others sell. Your
chart thrives in pessimistic conditions - buy when there's blood in the
streets.

Strategy: This is your core holding - potentially 40-60% of crypto portfolio.
Dollar-cost average through all conditions, HODL through cycles, add during
capitulation. Trust your Saturn patience - this is a multi-decade asset for
your chart.
```

---

## Expected Recommendations by Persona

### Sarah (Fire Dragon) - Top 10 Compatible Assets

| Rank | Symbol | Name | Score | Element | Reason |
|------|--------|------|-------|---------|--------|
| 1 | SOL | Solana | 9 | Fire | Perfect fire resonance, Mars-Jupiter harmony |
| 2 | MATIC | Polygon | 8 | Fire | Speed and energy, expansion-focused |
| 3 | NEAR | NEAR Protocol | 8 | Fire | Fast, hot ecosystem growth |
| 4 | PYTH | Pyth Network | 8 | Fire | Real-time data = fire energy |
| 5 | ONDO | Ondo Finance | 8 | Earth | Favorable earth element, stable growth |
| 6 | AVAX | Avalanche | 8 | Fire | High-speed consensus, aggressive scaling |
| 7 | RENDER | Render Network | 8 | Fire | GPU rendering = heat and power |
| 8 | FTM | Fantom | 7 | Fire | Fast consensus, energetic DeFi |
| 9 | RWA | Real World Assets | 7 | Earth | Grounding influence for fire chart |
| 10 | ICP | Internet Computer | 7 | Fire | Ambitious, expansive vision |

**Avoid** (Score < 4):
- WBTC (Water element, Saturn planet)
- USDT (Water element, too stable for fire)
- Most stablecoins (lack volatility fire craves)

---

### David (Earth Ox) - Top 10 Compatible Assets

| Rank | Symbol | Name | Score | Element | Reason |
|------|--------|------|-------|---------|--------|
| 1 | ONDO | Ondo Finance | 9 | Earth | Perfect earth match, RWA stability |
| 2 | BTC | Bitcoin | 8 | Metal | Favorable metal, Saturn alignment |
| 3 | USDC | USD Coin | 8 | Earth | Ultimate stability, earth grounding |
| 4 | PAXG | Pax Gold | 9 | Metal | Tokenized gold, metal element |
| 5 | GLD | Gold ETF | 9 | Metal | Pure metal element, Venus value |
| 6 | REALT | RealT | 8 | Earth | Real estate tokens, earth foundation |
| 7 | MKR | Maker | 7 | Earth | Stable protocol, earth governance |
| 8 | AAVE | Aave | 7 | Earth | Lending stability, structured approach |
| 9 | LINK | Chainlink | 7 | Metal | Oracle precision, metal accuracy |
| 10 | DOT | Polkadot | 6 | Metal | Structured, methodical approach |

**Avoid** (Score < 4):
- DOGE (Fire/air, Neptune illusion)
- SHIB (Fire, chaotic energy)
- High-volatility memecoins (conflict with earth stability)

---

### Lisa (Water Snake) - Top 10 Compatible Assets

| Rank | Symbol | Name | Score | Element | Reason |
|------|--------|------|-------|---------|--------|
| 1 | UNI | Uniswap | 8 | Water | Perfect liquidity flow match |
| 2 | AAVE | Aave | 8 | Water | Lending pools, adaptive rates |
| 3 | CRV | Curve Finance | 8 | Water | Liquidity curves, water flow |
| 4 | PENDLE | Pendle | 8 | Water | Yield trading, time flow |
| 5 | GMX | GMX | 7 | Water | Liquidity provision, adaptive |
| 6 | SUSHI | SushiSwap | 7 | Water | DEX liquidity, water element |
| 7 | BTC | Bitcoin | 7 | Metal | Metal produces water (favorable) |
| 8 | LDO | Lido | 7 | Water | Liquid staking, flow concept |
| 9 | COMP | Compound | 7 | Water | Lending liquidity, adaptive rates |
| 10 | ETH | Ethereum | 6 | Metal | Secondary water traits (gas flow) |

**Avoid** (Score < 4):
- ONDO (Earth element blocks water)
- Most RWAs (earth-heavy, restricts flow)
- Stablecoins (too rigid for adaptive water)

---

### Michael (Metal Tiger) - Top 10 Compatible Assets

| Rank | Symbol | Name | Score | Element | Reason |
|------|--------|------|-------|---------|--------|
| 1 | BTC | Bitcoin | 9 | Metal | Perfect metal-Saturn alignment |
| 2 | PAXG | Pax Gold | 9 | Metal | Tokenized gold, pure metal |
| 3 | GLD | Gold ETF | 9 | Metal | Physical gold, traditional value |
| 4 | LINK | Chainlink | 8 | Metal | Oracle precision, accuracy |
| 5 | XRP | Ripple | 7 | Metal | Banking precision, structured |
| 6 | ONDO | Ondo Finance | 7 | Earth | Earth produces metal (favorable) |
| 7 | USDC | USD Coin | 7 | Earth | Stable structure, conservative |
| 8 | MKR | Maker | 7 | Earth | Governance structure, stability |
| 9 | DOT | Polkadot | 7 | Metal | Precise interoperability |
| 10 | ATOM | Cosmos | 6 | Metal | Structured hub model |

**Avoid** (Score < 4):
- SOL (Fire melts metal)
- NEAR (Fire element)
- High-volatility fire assets

---

## Sample API Responses

### GET /api/personalization/top-assets (Sarah - Fire Dragon)

```json
{
  "success": true,
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440001",
    "userNickname": "Fire Dragon",
    "calculatedAt": "2025-12-20T10:30:00Z",
    "cached": true,
    "expiresAt": "2025-12-21T10:30:00Z",
    "assets": [
      {
        "assetId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "symbol": "SOL",
        "name": "Solana",
        "assetType": "crypto",
        "category": "Layer 1",
        "currentPrice": 98.45,
        "compatibilityScore": 9,
        "elementScore": 9,
        "planetScore": 9,
        "elementHarmony": {
          "userFavorableElements": ["fire", "earth"],
          "userUnfavorableElements": ["water"],
          "assetPrimaryElement": "fire",
          "assetSecondaryElement": "metal",
          "harmonyType": "same",
          "strength": "very_strong",
          "cycleDescription": "Fire resonates with fire - perfect elemental match"
        },
        "planetaryHarmony": {
          "userPlanet": "Jupiter",
          "assetPlanet": "Mars",
          "compatibility": 9,
          "description": "Jupiter's expansion harmonizes with Mars' action"
        },
        "reasoning": "Solana's fire element perfectly resonates with your favorable fire element...",
        "whyGoodForUser": "Your fire-dominant chart thrives on speed and momentum...",
        "tips": "Enter during fire-element periods (late spring, summer) or when Mars is strong",
        "bestEntryPeriods": ["2025-Q2", "2025-Q4", "Mars transits"],
        "recommendationLevel": "highly_recommended",
        "badges": ["perfect_match", "top_pick", "fire_element"]
      },
      {
        "assetId": "b2c3d4e5-f6g7-8901-bcde-f12345678901",
        "symbol": "MATIC",
        "name": "Polygon",
        "assetType": "crypto",
        "category": "Layer 2",
        "currentPrice": 0.87,
        "compatibilityScore": 8,
        "elementScore": 8,
        "planetScore": 8,
        "elementHarmony": {
          "userFavorableElements": ["fire", "earth"],
          "assetPrimaryElement": "fire",
          "assetSecondaryElement": "earth",
          "harmonyType": "same",
          "strength": "strong"
        },
        "reasoning": "Polygon's fire-earth combination matches both your favorable elements...",
        "whyGoodForUser": "Scaling solutions require fire energy (speed) with earth foundation (stability)...",
        "recommendationLevel": "recommended"
      }
      // ... 8 more assets
    ],
    "totalCompatibleAssets": 47,
    "totalAssets": 112,
    "filters": {
      "applied": {},
      "available": {
        "assetTypes": ["crypto", "stock", "rwa", "commodity"],
        "elements": ["wood", "fire", "earth", "metal", "water"],
        "categories": ["Layer 1", "Layer 2", "DeFi", "RWA", "Memecoin"]
      }
    },
    "userProfile": {
      "dominantElement": "Fire",
      "dominantPlanet": "Jupiter",
      "chineseZodiac": "Dragon",
      "sunSign": "Pisces"
    },
    "recommendations": {
      "focusOn": ["fire", "earth"],
      "avoid": ["water"],
      "bestTimings": ["Q2", "Q4", "Mars transits", "Fire seasons"]
    }
  }
}
```

---

### GET /api/personalization/compatibility/SOL (Sarah - Fire Dragon)

```json
{
  "success": true,
  "data": {
    "assetId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "symbol": "SOL",
    "name": "Solana",
    "assetType": "crypto",
    "compatibilityScore": 9,
    "breakdown": {
      "elementScore": 9,
      "elementWeight": 0.6,
      "planetaryScore": 9,
      "planetaryWeight": 0.4,
      "calculation": "(9 × 0.6) + (9 × 0.4) = 9.0"
    },
    "detailed": {
      "elementHarmony": {
        "userElements": {
          "dayMaster": "fire",
          "favorable": ["fire", "earth"],
          "unfavorable": ["water"]
        },
        "assetElements": {
          "primary": "fire",
          "secondary": "metal",
          "reasoning": "Fire element due to extreme speed (400ms finality), heat generation (network load), and energetic ecosystem growth"
        },
        "harmonyAnalysis": "Perfect fire-fire resonance creates ideal compatibility. Your fire day master naturally understands Solana's volatile, fast-moving nature. The secondary metal element adds precision to the raw fire energy.",
        "cycleType": "Same Element (相同)",
        "strengthLevel": "Very Strong (9/10)"
      },
      "planetaryHarmony": {
        "userPlanet": "Jupiter",
        "userPlanetMeaning": "Expansion, growth, optimism, abundance",
        "assetPlanet": "Mars",
        "assetPlanetMeaning": "Speed, aggression, energy, action",
        "compatibilityScore": 9,
        "analysis": "Jupiter-Mars is a highly compatible pairing. Your Jupiter's desire for expansion harmonizes perfectly with Solana's Mars-driven aggressive scaling. Mars provides the action, Jupiter provides the vision. Together they create dynamic growth potential."
      },
      "favorableAspects": [
        {
          "aspect": "Fire-Fire Resonance",
          "description": "You intuitively understand Solana's volatility and can ride its momentum effectively"
        },
        {
          "aspect": "Jupiter-Mars Synergy",
          "description": "Your expansion-oriented mindset aligns with Solana's aggressive growth strategy"
        },
        {
          "aspect": "Dragon Energy",
          "description": "Dragons are associated with yang energy and power - matches Solana's dominant presence"
        },
        {
          "aspect": "Leo Moon",
          "description": "Your Leo Moon loves attention and performance - Solana is a top performer"
        }
      ],
      "challengingAspects": [
        {
          "aspect": "Extreme Volatility",
          "description": "Fire-fire combinations can overheat. Watch for excessive exuberance during rallies."
        },
        {
          "aspect": "Network Outages",
          "description": "When Solana's fire element gets overwhelmed (outages), your fire chart may take it personally. Maintain emotional distance."
        }
      ]
    },
    "reasoning": "Solana's fire element perfectly resonates with your favorable fire element, creating ideal harmony. Your Jupiter-dominant chart harmonizes beautifully with Solana's Mars nature, supporting bold expansion through rapid action.\n\nWhy this is great for you: Your fire-dominant chart thrives on speed and momentum. Solana's blazing-fast transaction finality (400ms) and energetic ecosystem align perfectly with your natural inclinations. The Dragon's affinity for heat and energy makes you intuitively attuned to Solana's volatility - you can ride its waves effectively rather than being burned.\n\nYour Jupiter placement suggests you'll benefit from Solana's expansive ecosystem growth. Enter during fire-element periods (late spring, summer) or when Mars is strong for maximum harmony. The combination of your Leo Moon and Solana's aggressive energy creates natural synergy - trust your instincts with this asset.",
    "whyGoodForUser": "Perfect elemental resonance + planetary harmony + zodiac affinity = ideal match. This asset feels natural to you, not foreign.",
    "tips": "Trust your fire instincts but set stop-losses to prevent overheating. Your natural tendency is to hold through volatility - this works for SOL, but take profits at euphoria peaks. Rebalance when your position grows beyond 20% of portfolio.",
    "bestEntryPeriods": [
      {
        "period": "Late Spring (April-May)",
        "reason": "Fire element strengthens in late spring, Mars energy peaks"
      },
      {
        "period": "Summer (June-August)",
        "reason": "Peak fire season, aligns with your fire favorable element"
      },
      {
        "period": "Mars Transits in Aries",
        "reason": "Mars in its home sign amplifies Solana's energy"
      },
      {
        "period": "Your Birthday +/- 2 weeks",
        "reason": "Solar return brings fresh fire energy to your chart"
      }
    ],
    "warningPeriods": [
      {
        "period": "Winter (December-February)",
        "reason": "Water element peaks, may dampen fire enthusiasm"
      },
      {
        "period": "Mercury Retrograde",
        "reason": "Communication issues can trigger network outages"
      }
    ],
    "positionSizing": {
      "recommended": "10-20% of crypto portfolio",
      "reasoning": "High compatibility justifies core position, but fire-fire needs balance with earth/metal assets"
    },
    "calculatedAt": "2025-12-20T10:30:00Z",
    "expiresAt": "2025-12-21T10:30:00Z"
  }
}
```

---

## Dashboard UI Examples

### Sarah's Dashboard View

```
╔═══════════════════════════════════════════════════════════════╗
║              🐉 Your Personalized Asset Matches 🐉            ║
║                                                               ║
║  Fire Dragon Profile                                          ║
║  Favorable Elements: 🔥 Fire, 🌍 Earth                       ║
║  Dominant Planet: ♃ Jupiter (Expansion & Growth)             ║
╚═══════════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════════╗
║  Filters:  [All Types ▼] [All Elements ▼] [Score: 7+ ▼]     ║
╚═══════════════════════════════════════════════════════════════╝

┌───────────────────────────────────────────────────────────────┐
│ 1. SOL - Solana                          🔥 Fire  │  Score: 9 │
│    ⭐⭐⭐⭐⭐⭐⭐⭐⭐ (9/10)                                       │
│    "Perfect fire resonance - ideal for your chart!"           │
│    [View Details]                                              │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│ 2. MATIC - Polygon                  🔥 Fire 🌍 Earth │  Score: 8 │
│    ⭐⭐⭐⭐⭐⭐⭐⭐ (8/10)                                       │
│    "Fire-earth combo matches both favorable elements"         │
│    [View Details]                                              │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│ 3. NEAR - NEAR Protocol                  🔥 Fire  │  Score: 8 │
│    ⭐⭐⭐⭐⭐⭐⭐⭐ (8/10)                                       │
│    "Hot ecosystem growth aligns with Jupiter expansion"       │
│    [View Details]                                              │
└───────────────────────────────────────────────────────────────┘

... (7 more assets)

╔═══════════════════════════════════════════════════════════════╗
║  🚫 Assets to Avoid (Based on Your Chart)                    ║
║  • WBTC (Water destroys your fire)                            ║
║  • USDT (Too stable for fire energy)                          ║
║  • Pendle (Water element conflicts)                           ║
╚═══════════════════════════════════════════════════════════════╝
```

---

**Examples Status**: Complete and ready for reference
**Next Steps**: Use these examples during implementation and testing

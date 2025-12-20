# Prediction Types Reference

This document outlines the expected data structures for prediction results. Use this as a reference when implementing the backend prediction engines.

## Macro Prediction Result

```typescript
interface MacroPredictionResult {
  // Year information
  year: number;                        // e.g., 2025
  yearElement: ChineseElement;         // 'metal' | 'wood' | 'water' | 'fire' | 'earth'
  yearAnimal: string;                  // e.g., 'snake', 'horse', 'goat'

  // Overall analysis
  overview: string;                    // Brief overview of the year
  marketEnergy: number;                // Overall market vitality (1-10)

  // Asset class predictions
  assetClasses: AssetClassPrediction[];
}

interface AssetClassPrediction {
  assetClass: string;                  // 'crypto', 'us_stocks', etc.
  score: number;                       // Favorability score (1-10)
  element?: ChineseElement;            // Associated element
  favorablePeriods: string[];          // e.g., ['Q1 2025', 'July-September']
  recommendations: string[];           // Key recommendations
}
```

### Example Response
```json
{
  "id": "pred_123",
  "type": "macro",
  "method": "combined",
  "status": "completed",
  "predictionResult": {
    "year": 2025,
    "yearElement": "wood",
    "yearAnimal": "snake",
    "overview": "2025, the Year of the Wood Snake, brings transformative energy to markets...",
    "marketEnergy": 7.5,
    "assetClasses": [
      {
        "assetClass": "Crypto",
        "score": 8.5,
        "element": "metal",
        "favorablePeriods": [
          "Q1 2025 (January-March)",
          "September-October 2025"
        ],
        "recommendations": [
          "Focus on projects with strong fundamentals",
          "Watch for regulatory clarity in Q2"
        ]
      },
      {
        "assetClass": "US Stocks",
        "score": 6.2,
        "element": "earth",
        "favorablePeriods": ["May-June 2025"],
        "recommendations": [
          "Defensive positioning recommended",
          "Technology sector shows promise"
        ]
      }
    ]
  }
}
```

---

## Timing Prediction Result

```typescript
interface TimingPredictionResult {
  // Asset info
  assetSymbol: string;                 // e.g., 'BTC', 'AAPL'
  assetName: string;                   // e.g., 'Bitcoin', 'Apple Inc.'

  // Current analysis
  currentScore: number;                // Current timing score (1-10)
  bestEntryDate?: string;              // ISO date string

  // Period analysis
  favorablePeriods: TimingPeriod[];
  challengingPeriods: TimingPeriod[];

  // Recommendation
  recommendation: string;              // Overall timing recommendation

  // Calendar data
  heatmapData?: DayScore[];           // Daily scores for calendar view

  // Transit details (optional, for astrology enthusiasts)
  transitDetails?: {
    currentTransits: string[];         // Current astrological transits
    upcomingTransits: string[];        // Upcoming significant transits
  };
}

interface TimingPeriod {
  start: string;                       // ISO date string
  end: string;                         // ISO date string
  score: number;                       // Period score (1-10)
  aspects?: string[];                  // e.g., ['Jupiter trine', 'Saturn square']
  reasoning: string;                   // Why this period is favorable/challenging
}

interface DayScore {
  date: string;                        // ISO date string
  score: number;                       // Daily score (1-10)
}
```

### Example Response
```json
{
  "id": "pred_456",
  "type": "birth_date",
  "method": "combined",
  "status": "completed",
  "predictionResult": {
    "assetSymbol": "BTC",
    "assetName": "Bitcoin",
    "currentScore": 7.2,
    "bestEntryDate": "2025-03-15",
    "favorablePeriods": [
      {
        "start": "2025-03-10",
        "end": "2025-03-25",
        "score": 8.5,
        "aspects": ["Jupiter trine Bitcoin's Sun", "Venus in harmonious angle"],
        "reasoning": "Strong planetary support with Jupiter trine creating expansion energy and Venus bringing positive sentiment."
      }
    ],
    "challengingPeriods": [
      {
        "start": "2025-04-01",
        "end": "2025-04-15",
        "score": 4.2,
        "aspects": ["Saturn square", "Mercury retrograde"],
        "reasoning": "Saturn creates resistance while Mercury retrograde may cause technical issues or communication breakdowns."
      }
    ],
    "recommendation": "Current timing is favorable (7.2/10). Best entry window is March 10-25, with peak on March 15. Exercise caution during early April due to challenging aspects.",
    "heatmapData": [
      { "date": "2025-03-01", "score": 6.5 },
      { "date": "2025-03-02", "score": 6.8 },
      { "date": "2025-03-15", "score": 8.5 }
      // ... more days
    ],
    "transitDetails": {
      "currentTransits": [
        "Jupiter at 15° Gemini trine Bitcoin's natal Sun",
        "Saturn at 20° Pisces square Bitcoin's Moon"
      ],
      "upcomingTransits": [
        "Mars enters Taurus on March 20 - increasing stability",
        "Mercury retrograde April 1-25 - caution advised"
      ]
    }
  }
}
```

---

## Tarot Divination Result

```typescript
interface TarotDivinationResult {
  spread: 'three-card' | 'celtic-cross';
  cards: TarotCard[];
  overallReading: string;              // Synthesis of all cards
  guidance: string[];                  // Actionable recommendations
  confidenceScore: number;             // 0-100
}

interface TarotCard {
  name: string;                        // e.g., 'The Fool', 'Three of Pentacles'
  position: string;                    // e.g., 'Past', 'Present', 'Outcome'
  isReversed: boolean;                 // true if reversed
  interpretation: string;              // General card meaning
  financialMeaning: string;           // Specific to financial context
  imageUrl?: string;                   // Optional card image URL
}
```

### Example Response
```json
{
  "id": "pred_789",
  "type": "divination",
  "method": "tarot",
  "question": "Should I hold my Bitcoin position through Q1?",
  "status": "completed",
  "divinationResult": {
    "spread": "three-card",
    "cards": [
      {
        "name": "The Chariot",
        "position": "Past",
        "isReversed": false,
        "interpretation": "Victory through determination and willpower",
        "financialMeaning": "Your past decisions and momentum have positioned you well. You've maintained discipline and control over your investments.",
        "imageUrl": "https://example.com/cards/chariot.jpg"
      },
      {
        "name": "Two of Pentacles",
        "position": "Present",
        "isReversed": false,
        "interpretation": "Balancing multiple priorities, adaptability",
        "financialMeaning": "Currently managing portfolio volatility well. Stay flexible and ready to adjust as market conditions change."
      },
      {
        "name": "Ace of Pentacles",
        "position": "Future/Outcome",
        "isReversed": false,
        "interpretation": "New financial opportunities, prosperity",
        "financialMeaning": "Strong indication of profitable outcome. Holding position likely to manifest significant gains or new opportunities."
      }
    ],
    "overallReading": "The cards show a positive trajectory. Your disciplined approach (Chariot) combined with adaptability (Two of Pentacles) sets the stage for new financial opportunities (Ace of Pentacles). The spread suggests holding your position through Q1 could be beneficial, though maintaining flexibility is key.",
    "guidance": [
      "Hold your position but stay alert to market conditions",
      "Keep some liquidity available for opportunities",
      "Set clear profit-taking targets before entering Q1",
      "Trust your past decisions but remain adaptable",
      "Consider the Ace of Pentacles as a positive omen for Q1"
    ],
    "confidenceScore": 78
  }
}
```

---

## I Ching Divination Result

```typescript
interface IChingDivinationResult {
  primaryHexagram: Hexagram;
  futureHexagram?: Hexagram;          // Only if there are changing lines
  changingLines?: ChangingLine[];     // Lines in transition
  detailedInterpretation: string;     // Full reading
  keyDates?: string[];                // Significant timing
  actionableGuidance: string[];       // Specific actions to take
}

interface Hexagram {
  number: number;                      // 1-64
  chineseName: string;                // e.g., '乾 (Qián)'
  englishName: string;                // e.g., 'The Creative'
  lines: boolean[];                   // 6 elements: true = yang, false = yin
  judgement: string;                  // Traditional judgement text
  image: string;                      // Traditional image text
  interpretation: string;             // Modern interpretation for question
}

interface ChangingLine {
  position: number;                   // 1-6 (bottom to top)
  text: string;                       // Traditional line text
  guidance: string;                   // Interpretation for this changing line
}
```

### Example Response
```json
{
  "id": "pred_101",
  "type": "divination",
  "method": "iching",
  "question": "Is now the right time to sell my Ethereum holdings?",
  "status": "completed",
  "divinationResult": {
    "primaryHexagram": {
      "number": 15,
      "chineseName": "謙 (Qiān)",
      "englishName": "Modesty",
      "lines": [false, false, true, false, false, false],
      "judgement": "Modesty creates success. The superior person carries things through.",
      "image": "Within the earth, a mountain: The image of Modesty. Thus the superior person reduces that which is too much, and augments that which is too little.",
      "interpretation": "This hexagram suggests a time for humility and careful consideration rather than bold action. The mountain hidden within the earth represents valuable assets held modestly."
    },
    "changingLines": [
      {
        "position": 3,
        "text": "A person of modesty and merit carries things to conclusion. Good fortune.",
        "guidance": "Your prudent approach to this position shows merit. Completing your current strategy before making major changes would be wise."
      }
    ],
    "futureHexagram": {
      "number": 39,
      "chineseName": "蹇 (Jiǎn)",
      "englishName": "Obstruction",
      "lines": [false, false, false, false, false, false],
      "judgement": "In the face of obstruction, turning back brings good fortune.",
      "image": "Water upon the mountain: obstruction. Thus the superior person turns attention to oneself.",
      "interpretation": "The future hexagram suggests that selling now would lead to obstacles and regret. The obstruction indicates this is not the time for such action."
    },
    "detailedInterpretation": "The hexagram of Modesty with a changing line transforming into Obstruction provides clear guidance. Your current position, while humble (modestly held), contains value represented by the mountain within the earth. The changing third line indicates you're at a critical decision point. However, the transformation into Obstruction strongly suggests that selling now would create difficulties. The I Ching advises maintaining your position with continued humility and patience. The future hexagram's imagery of water on mountain (difficult flow) confirms that liquidating this position would not flow smoothly at this time.",
    "keyDates": [
      "Wait until Q2 2025 for clearer conditions",
      "Reevaluate during spring equinox (March 20)",
      "Avoid major decisions during Mercury retrograde periods"
    ],
    "actionableGuidance": [
      "Hold your Ethereum position for now - selling would create obstacles",
      "Practice patience and modest expectations during this period",
      "Use this time to research and strengthen your understanding",
      "Set clear criteria for what would constitute the right selling moment",
      "Consider partial position management rather than complete exit",
      "Trust your initial investment thesis while remaining alert to changes"
    ]
  }
}
```

---

## Status Field

All predictions should include these status values:

```typescript
type PredictionStatus = 'pending' | 'processing' | 'completed' | 'failed';
```

- **pending**: Just created, waiting to start
- **processing**: AI is actively generating the prediction
- **completed**: Prediction ready with full results
- **failed**: Something went wrong (include error details)

---

## Common Fields

Every prediction response should include:

```typescript
interface Prediction {
  id: string;                          // Unique prediction ID
  userId: string;                      // User who created it
  type: PredictionType;               // 'macro' | 'birth_date' | 'divination'
  method: PredictionMethod;           // 'chinese' | 'western' | 'combined' | 'tarot' | 'iching'
  status: PredictionStatus;           // Current status

  // Optional fields based on type
  question?: string;                   // For divination
  targetAssetId?: string;             // For timing
  targetAssetClass?: string;          // For macro
  timeframe?: Timeframe;              // For timing
  year?: number;                      // For macro

  // Results (populated when status = 'completed')
  predictionResult?: any;             // Type-specific result object
  divinationResult?: any;             // For divination predictions
  favorableScore?: number;            // Overall score if applicable
  confidenceScore?: number;           // Confidence in prediction
  reasoning?: string;                 // Brief reasoning

  // Timestamps
  createdAt: string;                  // ISO timestamp
  completedAt?: string;               // ISO timestamp

  // Metadata
  agentUsed?: string;                 // Which AI agent generated this
  creditsUsed?: number;              // Credits deducted
}
```

---

## Error Responses

When predictions fail, include helpful error information:

```json
{
  "id": "pred_error",
  "status": "failed",
  "error": {
    "code": "INSUFFICIENT_DATA",
    "message": "Unable to calculate birth chart for this asset",
    "details": {
      "assetId": "xyz123",
      "reason": "Asset birth date not found in database"
    }
  }
}
```

---

## Polling Pattern

Frontend polls every 1 second for up to 30 seconds:

```typescript
// Pseudo-code
const maxAttempts = 30;
const interval = 1000; // 1 second

for (let i = 0; i < maxAttempts; i++) {
  const result = await getPrediction(predictionId);

  if (result.status === 'completed') {
    // Show result
    break;
  } else if (result.status === 'failed') {
    // Show error
    break;
  }

  await sleep(interval);
}
```

Backend should aim for 5-10 second completion time for best UX.

---

## Credits Deduction

After successful prediction:
1. Backend deducts credits from user account
2. Frontend polls `/auth/me` to get updated balance
3. Navbar automatically refreshes to show new balance

---

## Testing Checklist

For each prediction type, test:
- ✅ Creating prediction with valid data
- ✅ Polling until completion
- ✅ Displaying all result fields
- ✅ Error handling (insufficient credits, API errors)
- ✅ Share functionality
- ✅ History list display
- ✅ Mobile responsive layout
- ✅ Animation performance

---

## Notes for Backend Developers

1. **Processing Time**: Aim for 5-10 seconds for best UX experience
2. **Caching**: Consider caching similar predictions (same asset, close timeframes)
3. **Queue**: Use job queue for prediction generation (Redis, Bull, etc.)
4. **Rate Limiting**: Prevent abuse (max X predictions per hour)
5. **Data Validation**: Validate all inputs before creating prediction
6. **Idempotency**: Handle duplicate requests gracefully
7. **Monitoring**: Log prediction generation times and success rates
8. **Error Logging**: Capture detailed errors for debugging

---

For questions or clarification on any prediction type, refer to the frontend components:
- `/components/predictions/MacroResult.tsx`
- `/components/predictions/TimingResult.tsx`
- `/components/predictions/TarotResult.tsx`
- `/components/predictions/IChingResult.tsx`

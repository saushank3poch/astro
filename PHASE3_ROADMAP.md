# Phase 3: Prediction Engines - Detailed Roadmap

**Duration**: Weeks 7-9 (3 weeks)
**Status**: Planning
**Goal**: Build three core prediction engines with AI agent integration

---

## Executive Summary

Phase 3 implements the core value proposition of the Astro platform: intelligent, AI-powered predictions combining ancient astrological wisdom with modern financial analysis. This phase builds three distinct prediction engines:

1. **Macro Predictions**: Asset class performance forecasts based on elemental cycles
2. **Birth Date Predictions**: Ticker-specific timing using asset birth charts
3. **Divination**: Personal question guidance via Tarot and I Ching

**Key Deliverables**:
- ✅ 3 working prediction engines (macro, timing, divination)
- ✅ AI agent system with Claude/GPT-4 integration
- ✅ Backend API endpoints for all prediction types
- ✅ Frontend forms and animated result displays
- ✅ Credits system and rate limiting
- ✅ Prediction history and tracking

---

## Current State (Post-Phase 2)

### What We Have
✅ **Authentication System**
- Email/password + Web3 wallet auth
- JWT token management
- Multi-wallet support

✅ **Birth Chart Engine** (`packages/astro-core/`)
- Chinese astrology (Bazi, zodiac, elements, lucky numbers)
- Western astrology (planets, houses, aspects)
- Birth chart calculation for users and assets
- Compatibility scoring

✅ **Database Schema**
- Users with astrological profiles
- Assets with birth dates
- Predictions table (structure ready)
- Credits and usage tracking tables

✅ **Frontend Infrastructure**
- Next.js 14 app with authentication
- Dashboard shell
- UI component library
- Animations (Framer Motion)

### What We Need to Build
❌ **Prediction Engines**
- MacroStrategyAgent
- AssetTimingAgent
- DivinationAgent

❌ **AI System** (`apps/ml-engine/`)
- Python FastAPI server
- LangChain agent framework
- RAG knowledge base
- Tarot and I Ching systems

❌ **API Integration**
- Prediction request endpoints
- Result streaming/polling
- History retrieval
- Credits validation

❌ **Frontend Prediction UI**
- Prediction request forms
- Loading animations
- Result display pages
- History view

---

## Implementation Priorities

### Why Start With Divination?

**Decision**: Build Divination Engine FIRST (Week 7)

**Reasoning**:
1. **Fastest Time-to-Value**: Users can get immediate, engaging predictions
2. **Simplest Implementation**: No complex transit calculations or backtesting required
3. **Highest Entertainment Value**: Tarot/I Ching are inherently mystical and fun
4. **User Feedback Loop**: Get early user reactions to guide other engines
5. **AI Agent Testing Ground**: Perfect for testing LLM interpretation quality
6. **No Dependencies**: Doesn't require extensive asset birth date research

**Then Build**:
- Week 8: Macro Predictions (broader market analysis)
- Week 9: Birth Date Predictions (most complex, requires research)

---

## Week 7: Divination Engine

**Goal**: Users can ask specific questions and receive Tarot or I Ching readings

### Day 1-2: ML Engine Foundation

**Backend Setup** (`apps/ml-engine/`)

```bash
# Initialize Python project
apps/ml-engine/
├── main.py                    # FastAPI app
├── requirements.txt           # Dependencies
├── .env.example
├── Dockerfile
├── agents/
│   ├── __init__.py
│   ├── base.py               # BaseAgent class
│   └── divination_agent.py   # DivinationAgent
├── divination/
│   ├── __init__.py
│   ├── tarot/
│   │   ├── deck.py          # 78-card deck
│   │   ├── spreads.py       # 3-card, Celtic Cross
│   │   └── meanings.json    # Card interpretations
│   └── iching/
│       ├── hexagrams.py     # 64 hexagrams
│       ├── casting.py       # Hexagram generation
│       └── meanings.json    # Hexagram interpretations
├── models/
│   └── schemas.py           # Pydantic models
└── utils/
    ├── llm.py              # Claude/GPT-4 client
    └── logger.py
```

**Tasks**:
- [ ] Initialize FastAPI app with health endpoint
- [ ] Set up environment variables (ANTHROPIC_API_KEY, OPENAI_API_KEY)
- [ ] Create Pydantic models for requests/responses
- [ ] Implement logging with Python logging module
- [ ] Create Dockerfile for containerization

**Tarot System**:
- [ ] Create 78-card deck data structure (JSON)
  - 22 Major Arcana
  - 56 Minor Arcana (Cups, Wands, Swords, Pentacles)
  - Upright and reversed meanings
- [ ] Implement 3-card spread (Past-Present-Future)
- [ ] Implement Celtic Cross spread (10 cards)
- [ ] Create card drawing algorithm (seeded randomness)

**I Ching System**:
- [ ] Create 64 hexagram database (JSON)
  - Hexagram numbers, Chinese names, English names
  - Judgement, Image, Line meanings
- [ ] Implement hexagram casting (6 lines)
- [ ] Implement changing lines logic
- [ ] Calculate future hexagram from changing lines

**Dependencies**:
```txt
fastapi==0.104.1
uvicorn==0.24.0
pydantic==2.5.0
anthropic==0.7.1
openai==1.3.7
python-dotenv==1.0.0
```

**API Endpoints**:
```python
POST /api/divination/tarot
{
  "question": "Will Maple Finance help me earn $5000 by end of December?",
  "spread_type": "three_card",  // or "celtic_cross"
  "context": {
    "asset": "MAPLE",
    "position": "long",
    "quantity": 10000,
    "entry_price": 0.50,
    "target_price": 1.00,
    "target_date": "2025-12-31"
  }
}

POST /api/divination/iching
{
  "question": "Should I buy SOL now?",
  "context": {
    "asset": "SOL",
    "current_price": 100,
    "budget": 5000
  }
}
```

### Day 3-4: AI Agent Integration

**DivinationAgent Implementation**

```python
class DivinationAgent:
    def __init__(self):
        self.llm = Anthropic()  # or OpenAI
        self.tarot_deck = TarotDeck()
        self.iching = IChing()

    async def perform_tarot_reading(
        self,
        question: str,
        spread_type: str,
        context: dict
    ) -> dict:
        # 1. Draw cards
        cards = self.tarot_deck.draw(spread_type)

        # 2. Construct LLM prompt
        prompt = self._build_tarot_prompt(question, cards, context)

        # 3. Get AI interpretation
        interpretation = await self.llm.generate(prompt)

        # 4. Structure response
        return {
            "cards": cards,
            "interpretation": interpretation,
            "confidence": self._calculate_confidence(cards),
            "recommendations": self._extract_recommendations(interpretation)
        }
```

**LLM Prompt Engineering**:
```python
def _build_tarot_prompt(self, question, cards, context):
    return f"""You are an expert Tarot reader and financial astrologer.

Question: {question}

Context:
- Asset: {context['asset']}
- Position: {context['position']}
- Entry: ${context['entry_price']}
- Target: ${context['target_price']}

Cards Drawn (3-Card Spread):
1. PAST: {cards[0]['name']} ({cards[0]['orientation']})
   Meaning: {cards[0]['meaning']}

2. PRESENT: {cards[1]['name']} ({cards[1]['orientation']})
   Meaning: {cards[1]['meaning']}

3. FUTURE: {cards[2]['name']} ({cards[2]['orientation']})
   Meaning: {cards[2]['meaning']}

Provide a reading that:
1. Interprets each card in the context of the financial question
2. Synthesizes the narrative arc (past → present → future)
3. Gives specific, actionable guidance
4. Assigns a favorability score (1-10)
5. Maintains an entertaining, mystical tone

Format as JSON:
{{
  "narrative": "Overall story...",
  "card_interpretations": [...],
  "favorability_score": 7,
  "key_insights": [...],
  "recommendations": [...]
}}
"""
```

**Tasks**:
- [ ] Implement DivinationAgent class
- [ ] Create Tarot interpretation prompts
- [ ] Create I Ching interpretation prompts
- [ ] Add financial context awareness
- [ ] Test with real questions
- [ ] Tune prompts for entertainment + insight balance

### Day 5: Node.js API Integration

**Backend API** (`apps/api/src/`)

```typescript
// src/services/prediction.service.ts
export class PredictionService {
  async createDivinationPrediction(
    userId: string,
    request: DivinationRequest
  ): Promise<Prediction> {
    // 1. Validate user credits
    const credits = await this.checkCredits(userId);
    if (credits < DIVINATION_COST) {
      throw new InsufficientCreditsError();
    }

    // 2. Create pending prediction
    const prediction = await prisma.prediction.create({
      data: {
        userId,
        predictionType: 'divination',
        divinationMethod: request.method,
        question: request.question,
        status: 'pending'
      }
    });

    // 3. Call ML engine
    const result = await this.callMLEngine('/api/divination/tarot', request);

    // 4. Update prediction with results
    await prisma.prediction.update({
      where: { id: prediction.id },
      data: {
        status: 'completed',
        divinationResult: result.cards,
        predictionResult: result.interpretation,
        favorabilityScore: result.favorability_score,
        reasoning: result.narrative,
        completedAt: new Date()
      }
    });

    // 5. Deduct credits
    await this.deductCredits(userId, DIVINATION_COST);

    return prediction;
  }
}

// src/routes/prediction.routes.ts
router.post('/v1/predictions/divination', authenticate, async (req, res) => {
  const result = await predictionService.createDivinationPrediction(
    req.user.id,
    req.body
  );
  res.json({ success: true, data: result });
});
```

**Tasks**:
- [ ] Create PredictionService class
- [ ] Implement ML engine HTTP client
- [ ] Add credits validation
- [ ] Create divination prediction endpoints
- [ ] Add error handling
- [ ] Test end-to-end flow

**API Endpoints**:
```
POST   /v1/predictions/divination         # Create divination prediction
GET    /v1/predictions/:id                # Get prediction by ID
GET    /v1/predictions/user/:userId       # Get user prediction history
DELETE /v1/predictions/:id                # Delete prediction
```

### Day 6-7: Frontend Implementation

**Prediction Request Form** (`apps/web/app/predictions/divination/page.tsx`)

```typescript
export default function DivinationPage() {
  const [method, setMethod] = useState<'tarot' | 'iching'>('tarot');
  const [question, setQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const response = await fetch('/api/predictions/divination', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method, question, context: {} })
    });

    const data = await response.json();
    setResult(data);
    setIsSubmitting(false);
  };

  return (
    <div>
      {/* Method Selection */}
      <div className="flex gap-4 mb-6">
        <Button
          variant={method === 'tarot' ? 'primary' : 'outline'}
          onClick={() => setMethod('tarot')}
        >
          🃏 Tarot Reading
        </Button>
        <Button
          variant={method === 'iching' ? 'primary' : 'outline'}
          onClick={() => setMethod('iching')}
        >
          ☯️ I Ching Consultation
        </Button>
      </div>

      {/* Question Input */}
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask your question... (e.g., 'Will Bitcoin reach $100k by March?')"
        className="w-full h-32 p-4 rounded-lg"
      />

      {/* Submit */}
      <Button onClick={handleSubmit} isLoading={isSubmitting}>
        Consult the Oracle
      </Button>

      {/* Loading Animation */}
      {isSubmitting && <OracleAnimation method={method} />}

      {/* Results */}
      {result && <DivinationResult result={result} />}
    </div>
  );
}
```

**Loading Animation Component**:
```typescript
function OracleAnimation({ method }: { method: 'tarot' | 'iching' }) {
  const messages = [
    "Shuffling the cosmic deck...",
    "Consulting ancient wisdom...",
    "Reading the symbols...",
    "Interpreting the signs...",
    "Channeling insights..."
  ];

  return (
    <motion.div className="flex flex-col items-center gap-4 py-12">
      {/* Animated Cards/Hexagram */}
      {method === 'tarot' ? (
        <AnimatedTarotCards />
      ) : (
        <AnimatedHexagram />
      )}

      {/* Rotating Messages */}
      <AnimatePresence mode="wait">
        <motion.p
          key={currentMessage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-cosmic-silver"
        >
          {messages[currentMessage]}
        </motion.p>
      </AnimatePresence>
    </motion.div>
  );
}
```

**Result Display Component**:
```typescript
function TarotResult({ result }) {
  return (
    <div className="space-y-6">
      {/* Cards Display */}
      <div className="grid grid-cols-3 gap-4">
        {result.cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, rotateY: 180 }}
            animate={{ opacity: 1, rotateY: 0 }}
            transition={{ delay: i * 0.3 }}
          >
            <TarotCard card={card} />
          </motion.div>
        ))}
      </div>

      {/* Favorability Score */}
      <div className="text-center">
        <div className="text-5xl font-bold mb-2">
          {result.favorability_score}/10
        </div>
        <div className="text-cosmic-silver">Favorability</div>
      </div>

      {/* Narrative */}
      <Card>
        <CardHeader>
          <CardTitle>The Reading</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg leading-relaxed">
            {result.narrative}
          </p>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Guidance</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {result.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-cosmic-cyan">▸</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Tasks**:
- [ ] Create divination prediction page
- [ ] Build method selection UI (Tarot vs I Ching)
- [ ] Create question input form
- [ ] Implement loading animation (cards shuffling, hexagram forming)
- [ ] Build Tarot result display with card animations
- [ ] Build I Ching result display with hexagram visualization
- [ ] Add result sharing functionality
- [ ] Create prediction history page

### Week 7 Success Criteria

✅ **Divination Engine Working**
- Tarot readings generate valid 3-card spreads
- I Ching readings generate valid hexagrams
- AI interpretations are contextual and actionable

✅ **API Integration Complete**
- ML engine endpoints functional
- Node.js API routes working
- Credits properly deducted

✅ **Frontend Polish**
- Smooth animations during prediction
- Beautiful result display
- Mobile-responsive design

✅ **Quality Benchmarks**
- Prediction generation < 10 seconds
- User satisfaction > 70% (beta testing)
- No critical bugs

---

## Week 8: Macro Predictions Engine

**Goal**: Predict asset class performance based on elemental cycles and planetary transits

### Day 1-2: Asset Class Research

**Element Mapping Research**

Create comprehensive asset class taxonomy with elemental associations:

```typescript
// Asset class element mapping
const ASSET_CLASS_ELEMENTS = {
  // Crypto Sectors
  "Layer1": {
    primary: "fire",      // Innovation, energy
    secondary: "metal",   // Technology, precision
    examples: ["BTC", "ETH", "SOL", "AVAX"]
  },
  "Layer2": {
    primary: "water",     // Flow, flexibility
    secondary: "metal",
    examples: ["ARB", "OP", "MATIC"]
  },
  "DeFi": {
    primary: "water",     // Liquidity, flow
    secondary: "wood",    // Growth
    examples: ["UNI", "AAVE", "CRV"]
  },
  "RWA": {
    primary: "earth",     // Stability, real assets
    secondary: "metal",   // Value storage
    examples: ["ONDO", "MKR", "POLYX"]
  },
  "AI_Crypto": {
    primary: "metal",     // Precision, computation
    secondary: "fire",    // Innovation
    examples: ["RENDER", "FET", "AGIX"]
  },
  "Meme_Coins": {
    primary: "wind",      // Volatility, social
    secondary: "fire",    // Hype, energy
    examples: ["DOGE", "SHIB", "PEPE"]
  },

  // Traditional Markets
  "US_Stocks": {
    primary: "metal",     // Established, structured
    secondary: "water",   // Liquidity
    examples: ["SPY", "QQQ"]
  },
  "Tech_Stocks": {
    primary: "fire",      // Innovation
    secondary: "metal",   // Technology
    examples: ["AAPL", "MSFT", "GOOGL"]
  },
  "Gold": {
    primary: "metal",     // Metal element literal
    secondary: "earth",   // Store of value
    examples: ["GLD"]
  },
  "Real_Estate": {
    primary: "earth",     // Physical property
    secondary: "wood",    // Growth over time
    examples: ["VNQ"]
  }
};

// Chinese year cycles (2024-2030)
const YEAR_ELEMENTS = {
  2024: { element: "wood", animal: "dragon", yin_yang: "yang" },
  2025: { element: "wood", animal: "snake", yin_yang: "yin" },
  2026: { element: "fire", animal: "horse", yin_yang: "yang" },
  2027: { element: "fire", animal: "goat", yin_yang: "yin" },
  2028: { element: "earth", animal: "monkey", yin_yang: "yang" },
  2029: { element: "earth", animal: "rooster", yin_yang: "yin" },
  2030: { element: "metal", animal: "dog", yin_yang: "yang" }
};
```

**Tasks**:
- [ ] Research element associations for 20+ asset classes
- [ ] Document reasoning for each mapping
- [ ] Create element interaction scoring matrix
- [ ] Research historical correlations (backtesting data)

### Day 3-4: MacroStrategyAgent Implementation

**ML Engine Code** (`apps/ml-engine/agents/macro_strategy_agent.py`)

```python
class MacroStrategyAgent:
    def __init__(self):
        self.llm = Anthropic()
        self.element_calculator = ElementCalculator()

    async def predict_asset_class(
        self,
        asset_class: str,
        year: int,
        timeframe: str  # short_term, medium_term, long_term
    ) -> dict:
        # 1. Get year element
        year_element = self._get_year_element(year)

        # 2. Get asset class elements
        asset_elements = ASSET_CLASS_ELEMENTS[asset_class]

        # 3. Calculate element harmony
        chinese_score = self._calculate_element_harmony(
            year_element,
            asset_elements
        )

        # 4. Get Western planetary transits
        planetary_score = await self._analyze_planetary_transits(
            asset_class,
            year
        )

        # 5. Combine scores
        overall_score = (chinese_score * 0.6) + (planetary_score * 0.4)

        # 6. Generate AI reasoning
        reasoning = await self._generate_reasoning(
            asset_class, year_element, chinese_score, planetary_score
        )

        # 7. Identify key periods
        key_periods = self._identify_favorable_periods(
            year, asset_class
        )

        return {
            "asset_class": asset_class,
            "year": year,
            "overall_score": overall_score,
            "chinese_analysis": {
                "year_element": year_element,
                "harmony_score": chinese_score,
                "interaction": self._explain_interaction(year_element, asset_elements)
            },
            "western_analysis": {
                "planetary_score": planetary_score,
                "key_transits": []
            },
            "favorability_score": round(overall_score * 10),
            "reasoning": reasoning,
            "key_periods": key_periods,
            "recommendations": self._generate_recommendations(overall_score)
        }

    def _calculate_element_harmony(self, year_element, asset_elements):
        """
        Five Elements Interaction:
        - Production (生): +10 (Wood→Fire→Earth→Metal→Water→Wood)
        - Reduction (剋): -8 (Wood→Earth→Water→Fire→Metal→Wood)
        - Same element: +5
        - No relation: 0
        """
        primary = asset_elements['primary']
        secondary = asset_elements.get('secondary')

        # Check production cycle
        if self._is_production_cycle(year_element, primary):
            score = 85
        # Check destruction cycle
        elif self._is_destruction_cycle(year_element, primary):
            score = 25
        # Same element
        elif year_element == primary:
            score = 75
        else:
            score = 50

        # Adjust for secondary element
        if secondary:
            if self._is_production_cycle(year_element, secondary):
                score += 10
            elif self._is_destruction_cycle(year_element, secondary):
                score -= 10

        return min(100, max(0, score))
```

**LLM Prompt for Macro Reasoning**:
```python
def _generate_reasoning(self, asset_class, year_element, chinese_score, planetary_score):
    prompt = f"""You are a financial astrologer analyzing market trends.

Asset Class: {asset_class}
Year Element: {year_element['element']} {year_element['animal']} ({year_element['yin_yang']})

Chinese Harmony Score: {chinese_score}/100
Western Planetary Score: {planetary_score}/100

Provide macro market analysis that:
1. Explains the elemental interaction
2. Discusses the year animal's influence
3. Identifies which months/quarters are most favorable
4. Gives specific investment themes (e.g., "Value over growth", "Risk on vs risk off")
5. Maintains professional yet mystical tone

Format as JSON:
{{
  "summary": "2-3 sentence overview",
  "elemental_analysis": "...",
  "seasonal_outlook": {{
    "Q1": "...",
    "Q2": "...",
    "Q3": "...",
    "Q4": "..."
  }},
  "investment_themes": [...],
  "risk_level": "low/medium/high"
}}
"""
    return await self.llm.generate(prompt)
```

**Tasks**:
- [ ] Implement MacroStrategyAgent
- [ ] Create element harmony calculator
- [ ] Add planetary transit analyzer (simplified)
- [ ] Build quarterly forecasting
- [ ] Test with 2026 predictions
- [ ] Validate outputs make sense

### Day 5: API Integration

**Backend Endpoints** (`apps/api/src/services/prediction.service.ts`)

```typescript
async createMacroPrediction(
  userId: string,
  request: MacroRequest
): Promise<Prediction> {
  // Similar pattern to divination
  const result = await this.callMLEngine('/api/agents/macro', {
    asset_class: request.assetClass,
    year: request.year,
    timeframe: request.timeframe
  });

  // Store prediction
  return await prisma.prediction.create({
    data: {
      userId,
      predictionType: 'macro',
      targetAssetClass: request.assetClass,
      timeframe: request.timeframe,
      predictionResult: result,
      favorabilityScore: result.favorability_score,
      reasoning: result.reasoning,
      status: 'completed',
      completedAt: new Date()
    }
  });
}
```

**Tasks**:
- [ ] Create macro prediction endpoint
- [ ] Add caching for duplicate requests
- [ ] Implement quarterly prediction updates
- [ ] Add prediction comparison feature

### Day 6-7: Frontend

**Macro Prediction Page** (`apps/web/app/predictions/macro/page.tsx`)

```typescript
export default function MacroPredictionPage() {
  return (
    <div>
      {/* Asset Class Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {ASSET_CLASSES.map(cls => (
          <AssetClassCard
            key={cls.id}
            name={cls.name}
            icon={cls.icon}
            element={cls.element}
            onClick={() => setSelected(cls.id)}
            selected={selected === cls.id}
          />
        ))}
      </div>

      {/* Year Selection */}
      <YearSelector value={year} onChange={setYear} />

      {/* Timeframe */}
      <TimeframeSelector value={timeframe} onChange={setTimeframe} />

      {/* Submit */}
      <Button onClick={handlePredict}>
        Analyze Market Trends
      </Button>

      {/* Results */}
      {result && (
        <motion.div>
          {/* Overall Score Gauge */}
          <FavorabilityGauge score={result.favorability_score} />

          {/* Elemental Analysis */}
          <ElementInteractionChart
            year={result.chinese_analysis.year_element}
            asset={result.asset_class}
          />

          {/* Quarterly Forecast */}
          <QuarterlyTimeline periods={result.key_periods} />

          {/* Investment Themes */}
          <ThemesList themes={result.recommendations} />
        </motion.div>
      )}
    </div>
  );
}
```

**Visual Components**:
- [ ] Asset class cards with element icons
- [ ] Year selector with animal icons
- [ ] Favorability gauge (0-10 with animated needle)
- [ ] Element interaction visualization
- [ ] Quarterly timeline with favorable periods highlighted
- [ ] Investment themes display

### Week 8 Success Criteria

✅ **Macro Engine Functional**
- Element harmony calculations correct
- Year cycles properly mapped
- AI reasoning coherent and actionable

✅ **Asset Coverage**
- 15+ asset classes mapped
- Element associations documented
- Historical correlation data collected

✅ **User Experience**
- Intuitive asset class selection
- Clear visualization of favorable periods
- Actionable investment themes

---

## Week 9: Birth Date Predictions Engine

**Goal**: Ticker-specific timing predictions using asset birth charts

### Day 1-2: Asset Birth Date Research

**Critical Research Phase**

```typescript
// Asset birth date database
const ASSET_BIRTH_DATES = {
  // Crypto (Genesis block or token launch)
  "BTC": {
    date: "2009-01-03",
    time: "18:15:05",
    location: { lat: 51.5074, lng: -0.1278 },  // London (Satoshi location unknown, using GMT)
    confidence: "high",
    source: "Genesis block timestamp",
    alternatives: [{
      date: "2008-10-31",
      reason: "Whitepaper release",
      confidence: "medium"
    }]
  },
  "ETH": {
    date: "2015-07-30",
    time: "03:26:13",
    location: { lat: 52.5200, lng: 13.4050 },  // Berlin
    confidence: "high",
    source: "Genesis block"
  },
  "SOL": {
    date: "2020-03-16",
    time: "00:00:00",
    location: { lat: 37.7749, lng: -122.4194 },  // San Francisco
    confidence: "medium",
    source: "Mainnet launch"
  },

  // Stocks (IPO date)
  "AAPL": {
    date: "1980-12-12",
    time: "09:30:00",
    location: { lat: 40.7128, lng: -74.0060 },  // NYSE
    confidence: "high",
    source: "IPO date"
  },
  "TSLA": {
    date: "2010-06-29",
    time: "09:30:00",
    location: { lat: 40.7128, lng: -74.0060 },
    confidence: "high",
    source: "IPO date"
  },

  // RWA Tokens (requires research)
  "ONDO": {
    date: "2023-01-18",
    time: "12:00:00",
    location: { lat: 40.7128, lng: -74.0060 },
    confidence: "low",
    source: "Token launch (estimated)"
  }
};
```

**Tasks**:
- [ ] Research top 50 crypto assets
  - Genesis block timestamps
  - Token launch dates
  - Location (if available)
- [ ] Research top 50 stocks
  - IPO dates
  - Exchange location
- [ ] Research RWA tokens (ONDO, MKR, POLYX, etc.)
- [ ] Document confidence levels
- [ ] Store in database

**Research Sources**:
- CoinGecko API (launch dates)
- Block explorers (genesis timestamps)
- SEC EDGAR (IPO data)
- Project documentation

### Day 3-5: AssetTimingAgent Implementation

**ML Engine** (`apps/ml-engine/agents/asset_timing_agent.py`)

```python
class AssetTimingAgent:
    def __init__(self):
        self.llm = Anthropic()
        self.ephemeris = SwissEphemeris()

    async def predict_asset_timing(
        self,
        asset_symbol: str,
        timeframe: str,  # "next_7_days", "next_30_days", "next_90_days"
        action: str = "buy"  # "buy", "sell", "hold"
    ) -> dict:
        # 1. Get asset birth chart
        asset = await self._get_asset_data(asset_symbol)
        birth_chart = self._calculate_birth_chart(
            asset.birth_date,
            asset.birth_time,
            asset.birth_location
        )

        # 2. Calculate current transits
        current_date = datetime.now()
        end_date = current_date + self._parse_timeframe(timeframe)

        transits = []
        for date in self._date_range(current_date, end_date):
            daily_transits = self._calculate_transits(birth_chart, date)
            transits.append({
                "date": date,
                "transits": daily_transits,
                "score": self._score_transits(daily_transits)
            })

        # 3. Find favorable and challenging periods
        favorable_periods = self._identify_favorable_periods(transits)
        challenging_periods = self._identify_challenging_periods(transits)

        # 4. Chinese luck pillar analysis
        chinese_score = self._analyze_chinese_cycles(asset, current_date)

        # 5. Generate AI interpretation
        interpretation = await self._generate_timing_advice(
            asset,
            birth_chart,
            transits,
            favorable_periods,
            chinese_score,
            action
        )

        return {
            "asset": asset_symbol,
            "timeframe": timeframe,
            "current_score": transits[0]['score'],
            "favorable_periods": favorable_periods,
            "challenging_periods": challenging_periods,
            "peak_date": max(transits, key=lambda x: x['score'])['date'],
            "worst_date": min(transits, key=lambda x: x['score'])['date'],
            "recommendations": interpretation['recommendations'],
            "reasoning": interpretation['reasoning'],
            "key_aspects": interpretation['key_aspects']
        }

    def _calculate_transits(self, birth_chart, target_date):
        """
        Find aspects between current planetary positions and natal chart
        """
        current_planets = self.ephemeris.get_planetary_positions(target_date)
        aspects = []

        for transit_planet, transit_pos in current_planets.items():
            for natal_planet, natal_pos in birth_chart['planets'].items():
                aspect = self._find_aspect(transit_pos, natal_pos)
                if aspect:
                    aspects.append({
                        "transit_planet": transit_planet,
                        "natal_planet": natal_planet,
                        "aspect": aspect['type'],
                        "orb": aspect['orb'],
                        "nature": aspect['nature']  # "beneficial", "challenging", "neutral"
                    })

        return aspects

    def _find_aspect(self, pos1, pos2):
        """
        Major aspects:
        - Conjunction (0°): Powerful, depends on planets
        - Sextile (60°): Beneficial, opportunity
        - Square (90°): Challenging, tension
        - Trine (120°): Beneficial, flow
        - Opposition (180°): Challenging, polarity
        """
        angle = abs(pos1 - pos2) % 360
        if angle > 180:
            angle = 360 - angle

        aspects_map = {
            0: {"type": "conjunction", "orb": 8, "nature": "neutral"},
            60: {"type": "sextile", "orb": 6, "nature": "beneficial"},
            90: {"type": "square", "orb": 8, "nature": "challenging"},
            120: {"type": "trine", "orb": 8, "nature": "beneficial"},
            180: {"type": "opposition", "orb": 8, "nature": "challenging"}
        }

        for aspect_angle, data in aspects_map.items():
            if abs(angle - aspect_angle) <= data['orb']:
                return {
                    **data,
                    "orb": abs(angle - aspect_angle)
                }

        return None

    def _score_transits(self, transits):
        """
        Score daily transits:
        - Beneficial aspects: +10 to +30 (trines +30, sextiles +20)
        - Challenging aspects: -10 to -30 (squares -20, oppositions -30)
        - Jupiter transits: 1.5x multiplier
        - Saturn transits: 1.2x multiplier
        - Outer planets: 1.3x multiplier
        """
        score = 50  # Neutral baseline

        for transit in transits:
            base_score = 0

            if transit['nature'] == 'beneficial':
                if transit['aspect'] == 'trine':
                    base_score = 30
                elif transit['aspect'] == 'sextile':
                    base_score = 20
            elif transit['nature'] == 'challenging':
                if transit['aspect'] == 'square':
                    base_score = -20
                elif transit['aspect'] == 'opposition':
                    base_score = -30

            # Planet multipliers
            if transit['transit_planet'] == 'Jupiter':
                base_score *= 1.5
            elif transit['transit_planet'] == 'Saturn':
                base_score *= 1.2
            elif transit['transit_planet'] in ['Uranus', 'Neptune', 'Pluto']:
                base_score *= 1.3

            score += base_score

        return max(0, min(100, score))
```

**Tasks**:
- [ ] Implement transit calculator
- [ ] Create aspect finder
- [ ] Build daily scoring algorithm
- [ ] Add Chinese luck pillar analysis
- [ ] Test with known market events
- [ ] Validate transit calculations

### Day 6: API Integration & Asset Seeding

**Seed Asset Database**

```typescript
// apps/api/src/scripts/seed-assets.ts
const assets = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    assetType: "crypto",
    category: "Layer1",
    birthDate: new Date("2009-01-03"),
    birthTime: "18:15:05",
    birthLocation: { lat: 51.5074, lng: -0.1278 },
    birthDateConfidence: "high",
    primaryElement: "earth",
    secondaryElement: "metal"
  },
  // ... 50+ assets
];

await prisma.asset.createMany({ data: assets });

// Generate birth charts for all assets
for (const asset of assets) {
  await birthChartService.generateAssetBirthChart(asset.id);
}
```

**API Endpoint**

```typescript
router.post('/v1/predictions/asset-timing', authenticate, async (req, res) => {
  const { assetSymbol, timeframe, action } = req.body;

  const result = await predictionService.createAssetTimingPrediction(
    req.user.id,
    assetSymbol,
    timeframe,
    action
  );

  res.json({ success: true, data: result });
});
```

**Tasks**:
- [ ] Seed 50+ assets with birth dates
- [ ] Generate birth charts for all assets
- [ ] Create asset timing endpoint
- [ ] Add asset search/autocomplete
- [ ] Implement prediction caching

### Day 7: Frontend

**Asset Timing Page** (`apps/web/app/predictions/timing/page.tsx`)

```typescript
export default function AssetTimingPage() {
  return (
    <div>
      {/* Asset Search */}
      <AssetSearchAutocomplete
        onSelect={setAsset}
        placeholder="Search for an asset (e.g., BTC, AAPL)"
      />

      {/* Action Selection */}
      <div className="flex gap-4">
        <Button
          variant={action === 'buy' ? 'primary' : 'outline'}
          onClick={() => setAction('buy')}
        >
          🟢 Buy
        </Button>
        <Button
          variant={action === 'sell' ? 'primary' : 'outline'}
          onClick={() => setAction('sell')}
        >
          🔴 Sell
        </Button>
      </div>

      {/* Timeframe */}
      <TimeframeSelector value={timeframe} onChange={setTimeframe} />

      {/* Submit */}
      <Button onClick={handlePredict}>
        Analyze Timing
      </Button>

      {/* Results */}
      {result && (
        <div>
          {/* Calendar View */}
          <TimingCalendar
            periods={result.favorable_periods}
            challengingPeriods={result.challenging_periods}
            peakDate={result.peak_date}
          />

          {/* Current Score */}
          <CurrentTimingScore score={result.current_score} />

          {/* Key Aspects */}
          <AspectsList aspects={result.key_aspects} />

          {/* Recommendations */}
          <RecommendationsCard recommendations={result.recommendations} />
        </div>
      )}
    </div>
  );
}
```

**Visual Components**:
- [ ] Asset search with autocomplete
- [ ] Action selector (buy/sell/hold)
- [ ] Calendar with colored date highlights
- [ ] Current timing gauge
- [ ] Transit aspects list with symbols
- [ ] Recommendations card

### Week 9 Success Criteria

✅ **Asset Coverage**
- 50+ assets with birth dates
- High confidence on major assets
- Birth charts generated

✅ **Timing Engine Accurate**
- Transit calculations validated
- Aspect detection working
- Scoring algorithm reasonable

✅ **User Value**
- Clear favorable/unfavorable periods
- Actionable timing recommendations
- Calendar export functionality

---

## Credits & Rate Limiting System

### Credit Costs

```typescript
const PREDICTION_COSTS = {
  divination_tarot_3card: 1,
  divination_tarot_celtic: 3,
  divination_iching: 2,
  macro_prediction: 2,
  asset_timing_7days: 1,
  asset_timing_30days: 2,
  asset_timing_90days: 3
};

const SUBSCRIPTION_CREDITS = {
  free: 3,        // per month
  basic: 50,      // per month
  pro: -1         // unlimited
};
```

### Rate Limiting

```typescript
// Redis-based rate limiting
const rateLimits = {
  free: {
    predictions_per_day: 1,
    predictions_per_hour: 1
  },
  basic: {
    predictions_per_day: 10,
    predictions_per_hour: 3
  },
  pro: {
    predictions_per_day: -1,  // unlimited
    predictions_per_hour: 10
  }
};
```

### Implementation

```typescript
// apps/api/src/middleware/rate-limit.middleware.ts
export async function checkRateLimit(req, res, next) {
  const userId = req.user.id;
  const tier = req.user.subscriptionTier;

  const dailyKey = `rate:${userId}:daily:${getToday()}`;
  const hourlyKey = `rate:${userId}:hourly:${getCurrentHour()}`;

  const dailyCount = await redis.incr(dailyKey);
  const hourlyCount = await redis.incr(hourlyKey);

  await redis.expire(dailyKey, 86400);  // 24 hours
  await redis.expire(hourlyKey, 3600);  // 1 hour

  const limits = rateLimits[tier];

  if (limits.predictions_per_day !== -1 && dailyCount > limits.predictions_per_day) {
    throw new RateLimitError('Daily limit exceeded');
  }

  if (hourlyCount > limits.predictions_per_hour) {
    throw new RateLimitError('Hourly limit exceeded');
  }

  next();
}
```

---

## AI Agent Architecture

### Model Selection

**Primary LLM: Anthropic Claude 3.5 Sonnet**
- Reasoning: Better at nuanced interpretation, maintains mystical tone
- Use for: All divination, macro reasoning, timing advice
- Cost: ~$3/1M input tokens, ~$15/1M output tokens

**Secondary LLM: OpenAI GPT-4**
- Reasoning: Backup for high-demand periods, structured output
- Use for: Backtesting analysis, technical summaries
- Cost: ~$10/1M input tokens, ~$30/1M output tokens

**Cost Estimates**:
- Average prediction: ~2,000 tokens input, ~800 tokens output
- Cost per prediction: ~$0.02
- 1,000 predictions: ~$20
- Target margin: 80% (charge $0.10-0.20 per prediction via credits)

### Prompt Engineering Best Practices

```python
# Base system prompt template
SYSTEM_PROMPT_BASE = """You are an expert astrological advisor for financial markets.

Your role:
- Interpret astrological patterns in the context of finance
- Provide actionable, specific guidance
- Maintain an entertaining yet professional tone
- Balance mysticism with practical advice
- Always acknowledge this is for entertainment purposes

Your outputs should:
- Be structured and consistent
- Include confidence scores
- Provide clear recommendations
- Explain reasoning transparently
- Use financial terminology appropriately

Remember: Users are seeking both insight and entertainment.
"""

# Agent-specific additions
DIVINATION_AGENT_PROMPT = SYSTEM_PROMPT_BASE + """
Specialty: Tarot and I Ching divination for financial questions

When interpreting readings:
- Connect card/hexagram symbolism to market dynamics
- Tell a coherent narrative across the spread
- Identify key timing windows
- Give specific action items
- Maintain the mystery and magic of divination
"""

MACRO_AGENT_PROMPT = SYSTEM_PROMPT_BASE + """
Specialty: Asset class performance based on elemental cycles

When analyzing markets:
- Explain Five Elements interactions clearly
- Connect year element to market sectors
- Provide quarterly forecasts
- Identify investment themes
- Support claims with astrological logic
"""

TIMING_AGENT_PROMPT = SYSTEM_PROMPT_BASE + """
Specialty: Individual asset timing via transit analysis

When analyzing timing:
- Focus on major transits (Jupiter, Saturn, outer planets)
- Explain aspect meanings in trading terms
- Identify specific favorable dates
- Warn about challenging aspects
- Balance technical astrology with accessibility
"""
```

### Response Format Standardization

```python
# Standardized prediction response
class PredictionResponse(BaseModel):
    favorability_score: int  # 1-10
    confidence: float  # 0.0-1.0
    summary: str  # 2-3 sentences
    detailed_analysis: str  # Full interpretation
    key_insights: List[str]  # 3-5 bullet points
    recommendations: List[Recommendation]
    warnings: Optional[List[str]]
    best_action_date: Optional[date]
    worst_action_date: Optional[date]

class Recommendation(BaseModel):
    action: str  # "buy", "sell", "hold", "wait"
    reasoning: str
    timing: Optional[str]  # "immediate", "wait for", "before X date"
    confidence: float
```

---

## Prediction Data Structure

### Database Schema (Already Exists)

```prisma
model Prediction {
  id                   String    @id @default(uuid())
  userId               String?
  predictionType       String    // "macro", "birth_date", "divination"
  method               String?   // "tarot", "iching", "chinese", "western"

  // Input
  question             String?
  targetAssetId        String?
  targetAssetClass     String?
  timeframe            String?

  // Output
  predictionResult     Json
  confidenceScore      Decimal?
  favorabilityScore    Int?
  reasoning            String?
  recommendations      Json?

  // Divination specific
  divinationMethod     String?
  divinationResult     Json?    // Cards or hexagrams

  // Tracking
  status               String    // "pending", "completed", "failed"
  createdAt            DateTime
  completedAt          DateTime?
}
```

### JSON Structure Examples

**Tarot Prediction Result**:
```json
{
  "spread_type": "three_card",
  "cards": [
    {
      "position": "past",
      "card": "The Fool",
      "suit": "major_arcana",
      "number": 0,
      "orientation": "upright",
      "image_url": "/tarot/fool.png",
      "meaning": "New beginnings, innocence, spontaneity",
      "interpretation": "Your journey with this asset began with optimism..."
    },
    {
      "position": "present",
      "card": "The Emperor",
      "suit": "major_arcana",
      "number": 4,
      "orientation": "upright",
      "meaning": "Authority, structure, control",
      "interpretation": "Currently, the market shows strength and structure..."
    },
    {
      "position": "future",
      "card": "The Star",
      "suit": "major_arcana",
      "number": 17,
      "orientation": "upright",
      "meaning": "Hope, faith, renewal",
      "interpretation": "The outlook is optimistic, suggesting renewal..."
    }
  ],
  "narrative": "Your investment journey shows a progression from initial enthusiasm through a period of consolidation toward a brighter future...",
  "favorability_score": 8,
  "key_insights": [
    "Past enthusiasm laid a solid foundation",
    "Current market structure is stable",
    "Future shows renewal and growth potential"
  ],
  "recommendations": [
    {
      "action": "hold",
      "reasoning": "The Star suggests patience will be rewarded",
      "timing": "next 30-60 days"
    }
  ]
}
```

**Macro Prediction Result**:
```json
{
  "asset_class": "DeFi",
  "year": 2026,
  "year_element": {
    "element": "fire",
    "animal": "horse",
    "yin_yang": "yang"
  },
  "chinese_analysis": {
    "harmony_score": 85,
    "interaction": "Fire produces Earth, neutral with Water",
    "explanation": "DeFi's Water element (liquidity, flow) is neutral with Fire year..."
  },
  "western_analysis": {
    "jupiter_position": "Libra",
    "saturn_position": "Pisces",
    "key_transits": [
      {
        "planet": "Jupiter",
        "sign": "Libra",
        "impact": "Favorable for partnerships and balanced protocols"
      }
    ]
  },
  "quarterly_forecast": {
    "Q1_2026": {
      "score": 7,
      "outlook": "Strong start with new innovations"
    },
    "Q2_2026": {
      "score": 9,
      "outlook": "Peak period, major protocol launches"
    },
    "Q3_2026": {
      "score": 6,
      "outlook": "Consolidation, profit-taking"
    },
    "Q4_2026": {
      "score": 8,
      "outlook": "Year-end rally, institutional adoption"
    }
  },
  "investment_themes": [
    "Yield aggregators and optimization protocols",
    "Cross-chain liquidity solutions",
    "Real-world asset tokenization platforms"
  ],
  "risk_level": "medium",
  "favorability_score": 8
}
```

**Asset Timing Result**:
```json
{
  "asset": "BTC",
  "timeframe": "next_30_days",
  "action": "buy",
  "current_score": 65,
  "favorable_periods": [
    {
      "start_date": "2025-12-25",
      "end_date": "2025-12-28",
      "score": 85,
      "reason": "Jupiter trine natal Sun, very favorable"
    },
    {
      "start_date": "2026-01-10",
      "end_date": "2026-01-15",
      "score": 78,
      "reason": "Venus sextile natal Venus, supportive"
    }
  ],
  "challenging_periods": [
    {
      "start_date": "2026-01-03",
      "end_date": "2026-01-06",
      "score": 35,
      "reason": "Mars square natal Mars, volatility"
    }
  ],
  "peak_date": "2025-12-26",
  "worst_date": "2026-01-04",
  "key_aspects": [
    {
      "date": "2025-12-26",
      "transit_planet": "Jupiter",
      "natal_planet": "Sun",
      "aspect": "trine",
      "interpretation": "Major expansion and growth energy"
    }
  ],
  "recommendations": [
    {
      "action": "buy",
      "timing": "December 25-28",
      "reasoning": "Jupiter transit provides optimal entry window",
      "confidence": 0.82
    }
  ]
}
```

---

## Success Criteria & Testing

### Phase 3 Complete When:

✅ **All Three Engines Working**
- [ ] Divination (Tarot + I Ching) generates valid readings
- [ ] Macro predictions cover 15+ asset classes
- [ ] Asset timing works for 50+ assets

✅ **API Complete**
- [ ] All prediction endpoints functional
- [ ] Credits properly deducted
- [ ] Rate limiting enforced
- [ ] Prediction history retrievable

✅ **Frontend Complete**
- [ ] Request forms intuitive
- [ ] Loading animations engaging
- [ ] Results beautifully displayed
- [ ] Mobile responsive

✅ **Quality Benchmarks**
- [ ] Prediction generation < 10 seconds (p95)
- [ ] API uptime > 99%
- [ ] User satisfaction > 70% (beta testing)
- [ ] Zero critical bugs

### Testing Plan

**Week 7: Divination**
- [ ] Test 20+ real user questions
- [ ] Validate Tarot spreads are coherent
- [ ] Validate I Ching hexagrams make sense
- [ ] Get user feedback on entertainment value

**Week 8: Macro**
- [ ] Test all asset classes
- [ ] Validate element interactions are correct
- [ ] Compare predictions to historical performance
- [ ] Ensure seasonal forecasts are actionable

**Week 9: Asset Timing**
- [ ] Test major assets (BTC, ETH, AAPL, TSLA)
- [ ] Validate transit calculations against ephemeris
- [ ] Compare favorable dates to actual price action
- [ ] Test multiple timeframes

**Integration Testing**
- [ ] End-to-end: User signup → prediction → result display
- [ ] Credits deduction working
- [ ] Rate limiting triggers correctly
- [ ] Prediction history saves properly

### Beta Testing

**Beta Group**: 20-30 users
- Mix of crypto natives and astrology enthusiasts
- Various subscription tiers
- Different platforms (web/mobile)

**Feedback Metrics**:
- Prediction accuracy (subjective)
- Entertainment value (1-10)
- Clarity of recommendations
- UI/UX satisfaction
- Feature requests

---

## AI Cost Management

### Cost Projections

**Claude 3.5 Sonnet Pricing**:
- Input: $3 per 1M tokens
- Output: $15 per 1M tokens

**Average Prediction**:
- Input: ~2,000 tokens (system prompt + context)
- Output: ~800 tokens (interpretation)
- Cost: ~$0.018 per prediction

**Monthly Projections**:
```
100 users × 10 predictions/month = 1,000 predictions
Cost: 1,000 × $0.018 = $18

1,000 users × 15 predictions/month = 15,000 predictions
Cost: 15,000 × $0.018 = $270

10,000 users × 20 predictions/month = 200,000 predictions
Cost: 200,000 × $0.018 = $3,600
```

### Cost Optimization Strategies

1. **Caching**:
   - Cache macro predictions (same asset class + year)
   - TTL: 7 days for macro, 24 hours for timing
   - Expected reduction: 30-40%

2. **Tiered Models**:
   - Free tier: GPT-3.5 (cheaper)
   - Paid tier: Claude 3.5 Sonnet (better)
   - Expected reduction: 50% on free tier costs

3. **Batch Processing**:
   - Queue predictions during high load
   - Process in batches
   - Reduce API overhead

4. **Prompt Optimization**:
   - Compress system prompts
   - Use structured outputs (less verbose)
   - Expected reduction: 15-20%

**Target Economics**:
- Prediction cost: $0.02
- Revenue per prediction: $0.10-0.20 (via credits)
- Gross margin: 80-90%
- Additional revenue: Subscriptions

---

## Risk Mitigation

### Technical Risks

**Risk**: ML engine downtime affects all predictions
**Mitigation**:
- Deploy ML engine to multiple regions
- Implement circuit breaker pattern
- Graceful degradation (cached predictions)

**Risk**: LLM API rate limits
**Mitigation**:
- Multiple API keys
- Fallback to alternative models (GPT-4 ↔ Claude)
- Queue system with retries

**Risk**: Prediction quality inconsistency
**Mitigation**:
- Extensive prompt testing
- User feedback loop
- Human review of flagged predictions

### Business Risks

**Risk**: Users expect financial accuracy
**Mitigation**:
- Clear disclaimers on every page
- "Entertainment purposes only" messaging
- Transparency about methodology

**Risk**: Low user engagement
**Mitigation**:
- Make predictions fun and engaging
- Gamification (accuracy tracking, leaderboards)
- Social sharing features

**Risk**: High churn rate
**Mitigation**:
- Personalization (user-asset compatibility)
- Push notifications for favorable periods
- Content marketing (educational blog posts)

---

## Next Steps After Phase 3

### Phase 4 Priorities

1. **Polymarket Integration**
   - Event prediction engine
   - Astrological event analysis
   - Betting recommendations

2. **Personalization System**
   - User-asset compatibility matching
   - Personalized dashboards
   - Favorable period alerts

3. **Analytics & Tracking**
   - Prediction accuracy tracking
   - Performance analytics
   - User behavior insights

4. **Mobile App**
   - React Native / Expo
   - Push notifications
   - In-app purchases

---

## Team & Timeline

### Week 7: Divination
**Backend**: 3 days (ML engine + API)
**Frontend**: 2 days (UI + animations)
**Testing**: 2 days

### Week 8: Macro
**Research**: 2 days (asset class mapping)
**Backend**: 3 days (ML agent + API)
**Frontend**: 2 days (UI)

### Week 9: Asset Timing
**Research**: 2 days (birth date research)
**Backend**: 3 days (transit calculator + API)
**Frontend**: 2 days (UI)

**Total**: 21 days (3 weeks)

### Resource Requirements

**Developers**:
- 1 Backend (Python/FastAPI)
- 1 Backend (Node.js/TypeScript)
- 1 Frontend (React/Next.js)

**Other**:
- 0.5 Astrologer consultant (prompt engineering, validation)
- 0.25 Designer (UI components, animations)

---

## Conclusion

Phase 3 transforms the Astro platform from infrastructure to product by delivering the core prediction engines. By prioritizing **Divination first**, we get to market fastest with the most engaging feature, then build out the more complex macro and timing engines.

**Key Success Factors**:
1. ✅ Start with simplest (divination) to learn user preferences
2. ✅ Invest in quality AI prompts for entertainment value
3. ✅ Make predictions fast (<10s) and beautiful
4. ✅ Clear disclaimers to manage expectations
5. ✅ Build feedback loops to improve accuracy

After Phase 3, we'll have a functional prediction platform that delivers real value to users while maintaining the entertainment-first approach. The foundation will be ready for Phase 4's advanced features (Polymarket, personalization, mobile app).

**Let's build something magical!** 🔮✨

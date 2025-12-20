# Prediction Engines - Usage Examples

Quick reference for integrating prediction engines in your application.

## Frontend Integration Examples

### 1. Macro Prediction - Market Forecast Page

```typescript
// components/MarketForecast.tsx
import { useState } from 'react';

export function MarketForecast() {
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);

  const generateForecast = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/v1/predictions/macro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId, // If authenticated
        },
        body: JSON.stringify({
          year: 2026,
          assetClasses: ['crypto', 'US_stocks', 'HK_stocks', 'DeFi', 'RWA'],
          method: 'combined',
          enhanceWithAI: true,
        }),
      });

      const data = await response.json();
      setPrediction(data.data);
    } catch (error) {
      console.error('Prediction failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="market-forecast">
      <h2>2026 Market Forecast</h2>
      <button onClick={generateForecast} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Forecast'}
      </button>

      {prediction && (
        <div className="results">
          <div className="year-info">
            <h3>Year of the {prediction.result.chineseYearAnimal}</h3>
            <p>Element: {prediction.result.chineseYearElement}</p>
            <p>Market Energy: <strong>{prediction.result.overallMarketEnergy}</strong></p>
          </div>

          <div className="predictions">
            <h4>Asset Class Outlook</h4>
            {prediction.result.predictions.map(p => (
              <div key={p.assetClass} className="asset-prediction">
                <div className="score">{p.score}/10</div>
                <div className="asset-name">{p.assetClass}</div>
                <p className="reasoning">{p.reasoning}</p>
                {p.favorablePeriods.length > 0 && (
                  <div className="periods">
                    <strong>Favorable:</strong>
                    {p.favorablePeriods.map((period, i) => (
                      <span key={i}>
                        {new Date(period.start).toLocaleDateString()} - {new Date(period.end).toLocaleDateString()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {prediction.aiEnhancement && (
            <div className="ai-insights">
              <h4>AI Analysis</h4>
              <p className="summary">{prediction.aiEnhancement.summary}</p>
              <ul className="insights">
                {prediction.aiEnhancement.keyInsights.map((insight, i) => (
                  <li key={i}>{insight}</li>
                ))}
              </ul>
              <div className="advice">
                <strong>Actionable Advice:</strong>
                <p>{prediction.aiEnhancement.actionableAdvice}</p>
              </div>
              <div className="warnings">
                {prediction.aiEnhancement.riskWarnings.map((warning, i) => (
                  <div key={i} className="warning">⚠️ {warning}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

### 2. Timing Prediction - Asset Detail Page

```typescript
// components/AssetTiming.tsx
import { useEffect, useState } from 'react';

export function AssetTiming({ assetId, symbol }) {
  const [timing, setTiming] = useState(null);
  const [timeframe, setTimeframe] = useState('medium_term');

  const fetchTiming = async () => {
    const response = await fetch(
      `http://localhost:3001/v1/predictions/timing/${assetId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
        },
        body: JSON.stringify({
          timeframe,
          enhanceWithAI: true,
        }),
      }
    );

    const data = await response.json();
    if (data.success) {
      setTiming(data.data);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 7) return 'green';
    if (score >= 5) return 'yellow';
    return 'red';
  };

  return (
    <div className="asset-timing">
      <h3>Timing Analysis for {symbol}</h3>

      <div className="timeframe-selector">
        <button onClick={() => setTimeframe('short_term')}>Short (30 days)</button>
        <button onClick={() => setTimeframe('medium_term')}>Medium (90 days)</button>
        <button onClick={() => setTimeframe('long_term')}>Long (1 year)</button>
      </div>

      <button onClick={fetchTiming}>Analyze Timing (2 credits)</button>

      {timing && (
        <div className="timing-results">
          <div className="current-score" style={{ color: getScoreColor(timing.result.currentScore) }}>
            <h2>{timing.result.currentScore}/10</h2>
            <p>Current Timing Score</p>
          </div>

          <div className="interpretation">
            <p>{timing.result.currentInterpretation}</p>
          </div>

          <div className="transits">
            <h4>Planetary Influences</h4>
            <div className="transit">
              <strong>Jupiter:</strong> {timing.result.detailedAnalysis.jupiterTransit}
            </div>
            <div className="transit">
              <strong>Saturn:</strong> {timing.result.detailedAnalysis.saturnTransit}
            </div>
            <div className="transit">
              <strong>Mars:</strong> {timing.result.detailedAnalysis.marsTransit}
            </div>
          </div>

          {timing.result.favorablePeriods.length > 0 && (
            <div className="favorable-periods">
              <h4>📈 Favorable Entry Windows</h4>
              {timing.result.favorablePeriods.map((period, i) => (
                <div key={i} className="period">
                  <div className="dates">
                    {new Date(period.start).toLocaleDateString()} - {new Date(period.end).toLocaleDateString()}
                  </div>
                  <div className="score">{period.score}/10</div>
                  <div className="aspects">
                    {period.aspects.map((aspect, j) => (
                      <span key={j} className="aspect">{aspect}</span>
                    ))}
                  </div>
                  <p>{period.reasoning}</p>
                </div>
              ))}
            </div>
          )}

          <div className="recommendation">
            <h4>Recommendation</h4>
            <p>{timing.result.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
}
```

### 3. Divination - Decision Helper

```typescript
// components/DivinationTool.tsx
import { useState } from 'react';

export function DivinationTool() {
  const [method, setMethod] = useState('tarot');
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState(null);
  const [spread, setSpread] = useState('three_card');

  const getDivination = async () => {
    const response = await fetch('http://localhost:3001/v1/predictions/divination', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        method,
        spread: method === 'tarot' ? spread : undefined,
        enhanceWithAI: true,
      }),
    });

    const data = await response.json();
    if (data.success) {
      setResult(data.data);
    }
  };

  return (
    <div className="divination-tool">
      <h2>Seek Guidance</h2>

      <div className="method-selector">
        <button onClick={() => setMethod('tarot')} className={method === 'tarot' ? 'active' : ''}>
          🃏 Tarot
        </button>
        <button onClick={() => setMethod('iching')} className={method === 'iching' ? 'active' : ''}>
          ☯️ I Ching
        </button>
      </div>

      {method === 'tarot' && (
        <div className="spread-selector">
          <label>
            <input
              type="radio"
              value="three_card"
              checked={spread === 'three_card'}
              onChange={(e) => setSpread(e.target.value)}
            />
            Three Card (Past/Present/Future)
          </label>
          <label>
            <input
              type="radio"
              value="celtic_cross"
              checked={spread === 'celtic_cross'}
              onChange={(e) => setSpread(e.target.value)}
            />
            Celtic Cross (10 cards)
          </label>
        </div>
      )}

      <textarea
        placeholder="Ask your question..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        rows={3}
      />

      <button onClick={getDivination} disabled={!question.trim()}>
        Consult the Oracle (1 credit)
      </button>

      {result && method === 'tarot' && (
        <div className="tarot-result">
          <h3>Your Reading</h3>
          <div className="cards">
            {result.result.cards.map((cardPos, i) => (
              <div key={i} className="card-position">
                <h4>{cardPos.position}</h4>
                <div className={`tarot-card ${cardPos.card.reversed ? 'reversed' : ''}`}>
                  <div className="card-name">{cardPos.card.name}</div>
                  {cardPos.card.reversed && <span className="reversed-label">Reversed</span>}
                </div>
                <p className="interpretation">{cardPos.interpretation}</p>
              </div>
            ))}
          </div>

          <div className="overall">
            <h4>Overall Interpretation</h4>
            <p>{result.result.overallInterpretation}</p>
          </div>

          <div className="guidance">
            <h4>Guidance</h4>
            <p>{result.result.guidance}</p>
          </div>

          <div className="action-advice">
            <strong>Action Advice:</strong>
            <p>{result.result.actionAdvice}</p>
          </div>
        </div>
      )}

      {result && method === 'iching' && (
        <div className="iching-result">
          <h3>Your Hexagram</h3>

          <div className="hexagram">
            <h2>{result.result.hexagram.chineseName}</h2>
            <h3>{result.result.hexagram.englishName}</h3>
            <div className="binary">{result.result.hexagram.binarySequence}</div>
          </div>

          <div className="judgement">
            <h4>Judgement</h4>
            <p>{result.result.hexagram.judgement}</p>
          </div>

          <div className="interpretation">
            <h4>Interpretation</h4>
            <p>{result.result.hexagram.interpretation}</p>
          </div>

          <div className="financial-guidance">
            <h4>Financial Guidance</h4>
            <p>{result.result.hexagram.financialGuidance}</p>
          </div>

          {result.result.hexagram.changingLines.length > 0 && (
            <div className="changing-lines">
              <h4>Changing Lines</h4>
              <p>Lines {result.result.hexagram.changingLines.join(', ')} are changing</p>
              {result.result.futureHexagram && (
                <div className="future-hexagram">
                  <p>Transforms to:</p>
                  <h3>{result.result.futureHexagram.chineseName} - {result.result.futureHexagram.englishName}</h3>
                </div>
              )}
            </div>
          )}

          {result.result.keyDates && result.result.keyDates.length > 0 && (
            <div className="key-dates">
              <h4>Key Dates</h4>
              {result.result.keyDates.map((date, i) => (
                <div key={i}>{new Date(date).toLocaleDateString()}</div>
              ))}
            </div>
          )}

          <div className="action-advice">
            <strong>Action Advice:</strong>
            <p>{result.result.actionAdvice}</p>
          </div>
        </div>
      )}
    </div>
  );
}
```

### 4. Credits Display

```typescript
// components/CreditsBalance.tsx
import { useEffect, useState } from 'react';

export function CreditsBalance({ userId }) {
  const [credits, setCredits] = useState(null);

  useEffect(() => {
    fetchCredits();
  }, [userId]);

  const fetchCredits = async () => {
    const response = await fetch('http://localhost:3001/v1/predictions/credits/balance', {
      headers: {
        'X-User-Id': userId,
      },
    });

    const data = await response.json();
    if (data.success) {
      setCredits(data.data);
    }
  };

  if (!credits) return null;

  return (
    <div className="credits-balance">
      <div className="current-balance">
        <span className="amount">{credits.currentBalance}</span>
        <span className="label">Credits</span>
      </div>

      <div className="stats">
        <div className="stat">
          <span className="value">{credits.lifetimeUsed}</span>
          <span className="label">Used</span>
        </div>
        <div className="stat">
          <span className="value">{credits.lifetimePurchased}</span>
          <span className="label">Purchased</span>
        </div>
      </div>

      <button onClick={() => window.location.href = '/buy-credits'}>
        Buy More Credits
      </button>
    </div>
  );
}
```

## Mobile App Examples (React Native)

### Timing Prediction Screen

```typescript
// screens/TimingScreen.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';

export function TimingScreen({ route }) {
  const { assetId, symbol } = route.params;
  const [timing, setTiming] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeTiming = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/v1/predictions/timing/${assetId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': userId,
          },
          body: JSON.stringify({
            timeframe: 'medium_term',
            enhanceWithAI: true,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setTiming(data.data);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Timing Analysis</Text>
      <Text style={styles.symbol}>{symbol}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={analyzeTiming}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Analyze (2 credits)</Text>
        )}
      </TouchableOpacity>

      {timing && (
        <View style={styles.results}>
          <View style={[styles.scoreCard, { backgroundColor: getScoreColor(timing.result.currentScore) }]}>
            <Text style={styles.scoreText}>{timing.result.currentScore}/10</Text>
            <Text style={styles.scoreLabel}>Current Timing</Text>
          </View>

          <Text style={styles.interpretation}>
            {timing.result.currentInterpretation}
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommendation</Text>
            <Text>{timing.result.recommendation}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}
```

## API Client Helper

```typescript
// utils/predictionsApi.ts
class PredictionsAPI {
  baseUrl: string;
  userId?: string;

  constructor(baseUrl: string, userId?: string) {
    this.baseUrl = baseUrl;
    this.userId = userId;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.userId) {
      headers['X-User-Id'] = this.userId;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Request failed');
    }

    return data.data;
  }

  async generateMacro(year: number, assetClasses: string[], method: string) {
    return this.request('/v1/predictions/macro', {
      method: 'POST',
      body: JSON.stringify({ year, assetClasses, method, enhanceWithAI: true }),
    });
  }

  async generateTiming(assetId: string, timeframe: string) {
    return this.request(`/v1/predictions/timing/${assetId}`, {
      method: 'POST',
      body: JSON.stringify({ timeframe, enhanceWithAI: true }),
    });
  }

  async generateTarot(question: string, spread: string, context?: any) {
    return this.request('/v1/predictions/divination', {
      method: 'POST',
      body: JSON.stringify({
        question,
        method: 'tarot',
        spread,
        context,
        enhanceWithAI: true,
      }),
    });
  }

  async generateIChing(question: string, context?: any) {
    return this.request('/v1/predictions/divination', {
      method: 'POST',
      body: JSON.stringify({
        question,
        method: 'iching',
        context,
        enhanceWithAI: true,
      }),
    });
  }

  async getCredits() {
    return this.request('/v1/predictions/credits/balance');
  }

  async getPrediction(id: string) {
    return this.request(`/v1/predictions/${id}`);
  }

  async listPredictions(filters?: any) {
    const params = new URLSearchParams(filters);
    return this.request(`/v1/predictions?${params}`);
  }

  async submitFeedback(predictionId: string, rating: number, feedback?: string) {
    return this.request(`/v1/predictions/${predictionId}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ rating, feedback }),
    });
  }
}

// Usage
const api = new PredictionsAPI('http://localhost:3001', userId);
const macro = await api.generateMacro(2026, ['crypto', 'DeFi'], 'combined');
```

## Error Handling

```typescript
// utils/errorHandler.ts
export function handlePredictionError(error: any) {
  if (error.message.includes('Insufficient credits')) {
    return {
      type: 'credits',
      message: 'You need more credits to generate this prediction',
      action: 'buy_credits',
    };
  }

  if (error.message.includes('birth chart not available')) {
    return {
      type: 'missing_data',
      message: 'This asset needs to be researched first',
      action: 'research_asset',
    };
  }

  if (error.message.includes('Authentication required')) {
    return {
      type: 'auth',
      message: 'Please sign in to use this feature',
      action: 'login',
    };
  }

  return {
    type: 'unknown',
    message: error.message || 'Something went wrong',
    action: 'retry',
  };
}
```

## Testing with cURL

```bash
# Get credit pricing
curl http://localhost:3001/v1/predictions/credits/pricing

# Macro prediction (anonymous)
curl -X POST http://localhost:3001/v1/predictions/macro \
  -H "Content-Type: application/json" \
  -d '{
    "year": 2026,
    "assetClasses": ["crypto", "US_stocks"],
    "method": "combined"
  }'

# Tarot (with user)
curl -X POST http://localhost:3001/v1/predictions/divination \
  -H "Content-Type: application/json" \
  -H "X-User-Id: test-user" \
  -d '{
    "question": "Should I buy now?",
    "method": "tarot",
    "spread": "three_card"
  }'

# Get prediction
curl http://localhost:3001/v1/predictions/PREDICTION_ID \
  -H "X-User-Id: test-user"
```

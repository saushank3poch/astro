# Astro API Specification

Version: 1.0
Base URL: `https://api.astro.app/v1`
Development: `http://localhost:3001/v1`

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### Token Acquisition

Obtain tokens via `/auth/login` or `/auth/register` endpoints.

**Token Structure:**
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "role": "user",
  "subscriptionTier": "pro",
  "iat": 1234567890,
  "exp": 1234571490
}
```

---

## API Endpoints

## Authentication & Authorization

### POST /auth/register

Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "username": "astrouser",
  "birthDate": "1990-05-15",
  "birthTime": "14:30:00",
  "birthLocation": {
    "lat": 40.7128,
    "lng": -74.0060,
    "city": "New York",
    "country": "USA"
  },
  "timezone": "America/New_York"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "astrouser",
    "subscriptionTier": "free",
    "createdAt": "2025-12-10T10:00:00Z"
  },
  "tokens": {
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token",
    "expiresIn": 3600
  }
}
```

### POST /auth/login

Login to existing account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "astrouser",
    "subscriptionTier": "pro"
  },
  "tokens": {
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token",
    "expiresIn": 3600
  }
}
```

### POST /auth/logout

Logout and invalidate tokens.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (204):**
No content

### POST /auth/refresh

Refresh access token using refresh token.

**Request:**
```json
{
  "refreshToken": "refresh_token"
}
```

**Response (200):**
```json
{
  "accessToken": "new_jwt_token",
  "expiresIn": 3600
}
```

### POST /auth/oauth/google

OAuth login/register with Google.

**Request:**
```json
{
  "code": "google_auth_code",
  "redirectUri": "https://app.astro.com/auth/callback"
}
```

**Response (200):**
Same as `/auth/login`

### GET /auth/me

Get current authenticated user.

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "astrouser",
  "birthDate": "1990-05-15",
  "subscriptionTier": "pro",
  "subscriptionExpiresAt": "2026-01-10T00:00:00Z",
  "creditsBalance": 150,
  "astrologySystem": "both"
}
```

---

## Users

### GET /users/:userId

Get user profile.

**Response (200):**
```json
{
  "id": "uuid",
  "username": "astrouser",
  "birthDate": "1990-05-15",
  "birthTime": "14:30:00",
  "birthLocation": {
    "lat": 40.7128,
    "lng": -74.0060,
    "city": "New York",
    "country": "USA"
  },
  "timezone": "America/New_York",
  "subscriptionTier": "pro",
  "createdAt": "2025-01-01T00:00:00Z"
}
```

### PATCH /users/:userId

Update user profile.

**Request:**
```json
{
  "username": "newusername",
  "astrologySystem": "chinese",
  "language": "zh",
  "notificationsEnabled": true
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "username": "newusername",
  "astrologySystem": "chinese",
  "language": "zh",
  "updatedAt": "2025-12-10T10:30:00Z"
}
```

### GET /users/:userId/birth-chart

Get user's astrological profile.

**Response (200):**
```json
{
  "userId": "uuid",
  "chineseAstrology": {
    "zodiac": "Horse",
    "element": "Metal",
    "baziChart": {
      "year": { "stem": "庚", "branch": "午" },
      "month": { "stem": "辛", "branch": "巳" },
      "day": { "stem": "壬", "branch": "寅" },
      "hour": { "stem": "丁", "branch": "未" }
    },
    "favorableElements": {
      "primary": "earth",
      "secondary": "fire"
    },
    "unfavorableElements": {
      "primary": "water"
    },
    "luckyNumbers": [2, 7, 9],
    "luckyColors": ["yellow", "red", "brown"]
  },
  "westernAstrology": {
    "sunSign": "Taurus",
    "moonSign": "Leo",
    "risingSign": "Capricorn",
    "birthChart": {
      "sun": { "sign": "Taurus", "degree": 24.5, "house": 5 },
      "moon": { "sign": "Leo", "degree": 12.3, "house": 8 },
      "mercury": { "sign": "Gemini", "degree": 5.7, "house": 6 }
      // ... other planets
    },
    "dominantElements": {
      "earth": 40,
      "fire": 30,
      "water": 20,
      "air": 10
    },
    "chartPatterns": ["grand_trine", "stellium"]
  },
  "calculatedAt": "2025-12-10T10:00:00Z"
}
```

### POST /users/:userId/birth-chart

Create or update user's birth chart.

**Request:**
```json
{
  "birthDate": "1990-05-15",
  "birthTime": "14:30:00",
  "birthLocation": {
    "lat": 40.7128,
    "lng": -74.0060,
    "city": "New York",
    "country": "USA"
  },
  "timezone": "America/New_York"
}
```

**Response (201):**
Same as GET /users/:userId/birth-chart

---

## Predictions

### POST /predictions

Create a new prediction request.

**Request (Macro Prediction):**
```json
{
  "type": "macro",
  "method": "chinese",
  "targetAssetClass": "crypto",
  "timeframe": "long_term",
  "year": 2026
}
```

**Request (Birth Date Prediction):**
```json
{
  "type": "birth_date",
  "method": "combined",
  "targetAssetId": "uuid-btc",
  "timeframe": "medium_term",
  "specificDate": "2025-12-31"
}
```

**Request (Divination):**
```json
{
  "type": "divination",
  "method": "iching",
  "question": "Will Maple Finance help me earn $5000 by end of December?",
  "context": {
    "position": "long",
    "amount": 10000,
    "entryPrice": 0.50,
    "targetPrice": 1.00
  }
}
```

**Response (202 Accepted):**
```json
{
  "id": "prediction-uuid",
  "status": "pending",
  "type": "divination",
  "method": "iching",
  "createdAt": "2025-12-10T10:00:00Z",
  "estimatedCompletionTime": "2025-12-10T10:00:15Z"
}
```

### GET /predictions/:predictionId

Get prediction result.

**Response (200 - Completed):**
```json
{
  "id": "prediction-uuid",
  "userId": "user-uuid",
  "type": "divination",
  "method": "iching",
  "status": "completed",
  "question": "Will Maple Finance help me earn $5000 by end of December?",
  "result": {
    "hexagram": {
      "number": 14,
      "chineseName": "大有",
      "englishName": "Possession in Great Measure",
      "judgement": "Supreme success.",
      "image": "Fire in heaven above: Possession in Great Measure.",
      "changingLines": [2, 5],
      "futureHexagram": {
        "number": 26,
        "name": "Great Accumulation"
      }
    },
    "interpretation": "Strong favorable energy detected. Current position shows potential for significant gains, but timing is crucial. The changing lines suggest a transition period approaching mid-month.",
    "guidance": "Hold through minor turbulence expected Dec 12-17. Peak favorable period: Dec 18-25. Consider taking partial profits during this window.",
    "favorabilityScore": 8,
    "confidenceScore": 0.75,
    "keyDates": [
      { "date": "2025-12-12", "type": "caution", "note": "Minor turbulence begins" },
      { "date": "2025-12-18", "type": "favorable", "note": "Peak period starts" },
      { "date": "2025-12-25", "type": "action", "note": "Consider profit taking" }
    ]
  },
  "agentUsed": "DivinationAgent",
  "supportingAgents": ["ExplanationAgent"],
  "creditsUsed": 1,
  "createdAt": "2025-12-10T10:00:00Z",
  "completedAt": "2025-12-10T10:00:12Z"
}
```

**Response (200 - Processing):**
```json
{
  "id": "prediction-uuid",
  "status": "processing",
  "progress": {
    "stage": "analyzing",
    "message": "Analyzing planetary transits...",
    "percentage": 65
  },
  "createdAt": "2025-12-10T10:00:00Z"
}
```

**Response (200 - Failed):**
```json
{
  "id": "prediction-uuid",
  "status": "failed",
  "error": {
    "code": "INSUFFICIENT_DATA",
    "message": "Asset birth date not available"
  },
  "createdAt": "2025-12-10T10:00:00Z",
  "failedAt": "2025-12-10T10:00:05Z"
}
```

### GET /predictions

List user's predictions.

**Query Parameters:**
- `type` (optional): Filter by prediction type
- `status` (optional): Filter by status
- `limit` (default: 20): Number of results
- `offset` (default: 0): Pagination offset

**Response (200):**
```json
{
  "predictions": [
    {
      "id": "uuid",
      "type": "macro",
      "status": "completed",
      "favorabilityScore": 7,
      "createdAt": "2025-12-09T10:00:00Z"
    },
    // ... more predictions
  ],
  "pagination": {
    "total": 45,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

### POST /predictions/:predictionId/feedback

Submit feedback on a prediction.

**Request:**
```json
{
  "rating": 5,
  "feedback": "Very accurate! The timing was spot on.",
  "actualOutcome": "favorable"
}
```

**Response (200):**
```json
{
  "id": "prediction-uuid",
  "userFeedbackRating": 5,
  "userFeedbackText": "Very accurate! The timing was spot on.",
  "actualOutcome": "favorable",
  "feedbackReceivedAt": "2025-12-25T10:00:00Z"
}
```

---

## Assets

### GET /assets

List all assets.

**Query Parameters:**
- `type` (optional): Filter by asset type (crypto, stock, commodity)
- `category` (optional): Filter by category (DeFi, RWA, Layer1, etc.)
- `search` (optional): Search by symbol or name
- `limit` (default: 50)
- `offset` (default: 0)

**Response (200):**
```json
{
  "assets": [
    {
      "id": "uuid",
      "symbol": "BTC",
      "name": "Bitcoin",
      "assetType": "crypto",
      "category": "Layer1",
      "primaryElement": "water",
      "secondaryElement": "metal",
      "marketCap": 850000000000,
      "currentPrice": 42500.00,
      "isResearched": true
    },
    // ... more assets
  ],
  "pagination": {
    "total": 250,
    "limit": 50,
    "offset": 0
  }
}
```

### GET /assets/:assetId

Get asset details.

**Response (200):**
```json
{
  "id": "uuid",
  "symbol": "BTC",
  "name": "Bitcoin",
  "assetType": "crypto",
  "category": "Layer1",
  "exchange": "Multiple",
  "birthDate": "2009-01-03",
  "birthTime": "18:15:05",
  "birthLocation": null,
  "birthDateSource": "Genesis block timestamp",
  "birthDateConfidence": "high",
  "primaryElement": "water",
  "secondaryElement": "metal",
  "elementReasoning": "Water represents flow and decentralization; Metal represents digital/technological nature",
  "chineseZodiac": "Rat",
  "sunSign": "Capricorn",
  "dominantPlanet": "Uranus",
  "marketCap": 850000000000,
  "currentPrice": 42500.00,
  "isActive": true,
  "isResearched": true,
  "createdAt": "2025-01-01T00:00:00Z"
}
```

### GET /assets/:assetId/birth-chart

Get asset's astrological birth chart.

**Response (200):**
```json
{
  "assetId": "uuid",
  "symbol": "BTC",
  "chineseAstrology": {
    "zodiac": "Rat",
    "element": "Earth",
    "baziChart": {
      "year": { "stem": "己", "branch": "丑" },
      "month": { "stem": "丙", "branch": "子" },
      "day": { "stem": "甲", "branch": "寅" },
      "hour": { "stem": "辛", "branch": "酉" }
    }
  },
  "westernAstrology": {
    "sunSign": "Capricorn",
    "birthChart": {
      "sun": { "sign": "Capricorn", "degree": 13.2, "house": 10 },
      "moon": { "sign": "Cancer", "degree": 25.8, "house": 4 },
      // ... other planets
    }
  },
  "calculatedAt": "2025-12-10T00:00:00Z"
}
```

### GET /assets/search

Search assets by keyword.

**Query Parameters:**
- `q` (required): Search query
- `limit` (default: 20)

**Response (200):**
```json
{
  "results": [
    {
      "id": "uuid",
      "symbol": "BTC",
      "name": "Bitcoin",
      "assetType": "crypto",
      "matchScore": 1.0
    },
    {
      "id": "uuid",
      "symbol": "MSTR",
      "name": "MicroStrategy",
      "assetType": "stock",
      "matchScore": 0.65
    }
  ]
}
```

---

## Compatibility

### GET /compatibility/:userId/:assetId

Get user-asset compatibility analysis.

**Response (200):**
```json
{
  "userId": "user-uuid",
  "assetId": "asset-uuid",
  "asset": {
    "symbol": "WALRUS",
    "name": "Walrus Protocol",
    "primaryElement": "earth"
  },
  "compatibilityScore": 9,
  "elementCompatibilityScore": 10,
  "planetaryCompatibilityScore": 8,
  "timingCompatibilityScore": 7,
  "elementHarmony": {
    "userElements": {
      "primary": "earth",
      "secondary": "fire"
    },
    "assetElements": {
      "primary": "earth",
      "secondary": "metal"
    },
    "harmony": {
      "userPrimary_assetPrimary": "perfect_match",
      "userSecondary_assetPrimary": "productive_cycle",
      "analysis": "Earth-earth resonance creates strong foundation"
    }
  },
  "recommendationLevel": "highly_favorable",
  "reasoning": "Your earth-dominant chart has excellent resonance with Walrus's earth element nature. This suggests natural affinity and potential for steady, grounded growth.",
  "whyGoodForUser": "The earth element match indicates this asset aligns with your natural energy patterns and investment style.",
  "tips": "Best entry during earth-favorable periods. Current transit of Saturn in Pisces provides grounding influence.",
  "bestEntryPeriods": [
    {
      "start": "2025-12-15",
      "end": "2025-12-20",
      "score": 9,
      "reason": "Moon in Taurus, earth energy peak"
    }
  ],
  "calculatedAt": "2025-12-10T10:00:00Z",
  "expiresAt": "2025-12-17T10:00:00Z"
}
```

### GET /compatibility/:userId/top

Get user's top compatible assets.

**Query Parameters:**
- `limit` (default: 10): Number of results
- `assetType` (optional): Filter by asset type
- `minScore` (default: 7): Minimum compatibility score

**Response (200):**
```json
{
  "userId": "user-uuid",
  "topAssets": [
    {
      "assetId": "uuid",
      "symbol": "WALRUS",
      "name": "Walrus Protocol",
      "compatibilityScore": 9,
      "recommendationLevel": "highly_favorable",
      "primaryReason": "Perfect element match"
    },
    {
      "assetId": "uuid",
      "symbol": "RENDER",
      "name": "Render Token",
      "compatibilityScore": 8,
      "recommendationLevel": "favorable",
      "primaryReason": "Fire element alignment with secondary element"
    }
    // ... more assets
  ]
}
```

---

## Polymarket

### GET /polymarket/events

List Polymarket events with astrological analysis.

**Query Parameters:**
- `category` (optional): Filter by category
- `active` (default: true): Only active events
- `limit` (default: 20)
- `offset` (default: 0)

**Response (200):**
```json
{
  "events": [
    {
      "id": "uuid",
      "polymarketId": "pm-123456",
      "title": "Will Bitcoin reach $100k by Dec 31, 2025?",
      "category": "crypto",
      "endDate": "2025-12-31T23:59:59Z",
      "outcomes": [
        { "id": "yes", "name": "Yes" },
        { "id": "no", "name": "No" }
      ],
      "currentOdds": {
        "yes": 0.65,
        "no": 0.35
      },
      "volume": 1250000,
      "astrologicalPrediction": {
        "favorableOutcome": "yes",
        "favorableOutcomeName": "Yes",
        "confidenceScore": 0.72,
        "reasoning": "Jupiter transit through Taurus suggests growth in material assets. Strong earth energy supports BTC's upward momentum."
      },
      "relatedAssets": ["btc-uuid"],
      "lastAnalyzedAt": "2025-12-10T08:00:00Z"
    }
    // ... more events
  ],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 0
  }
}
```

### GET /polymarket/events/:eventId

Get detailed event with prediction.

**Response (200):**
```json
{
  "id": "uuid",
  "polymarketId": "pm-123456",
  "title": "Will Bitcoin reach $100k by Dec 31, 2025?",
  "description": "This market will resolve to 'Yes' if Bitcoin (BTC) reaches or exceeds $100,000 USD...",
  "category": "crypto",
  "startDate": "2025-01-01T00:00:00Z",
  "endDate": "2025-12-31T23:59:59Z",
  "outcomes": [
    { "id": "yes", "name": "Yes", "description": "BTC >= $100k" },
    { "id": "no", "name": "No", "description": "BTC < $100k" }
  ],
  "currentOdds": {
    "yes": 0.65,
    "no": 0.35
  },
  "volume": 1250000,
  "liquidity": 450000,
  "astrologicalPrediction": {
    "favorableOutcome": "yes",
    "favorableOutcomeName": "Yes",
    "confidenceScore": 0.72,
    "detailedAnalysis": {
      "chineseAstrology": {
        "yearElement": "fire",
        "elementMatch": "favorable",
        "reasoning": "Fire year energizes metal (BTC), creating productive cycle"
      },
      "westernAstrology": {
        "keyTransits": [
          {
            "transit": "Jupiter in Taurus",
            "influence": "Growth in material wealth, bullish for crypto",
            "score": 8
          },
          {
            "transit": "Uranus in Gemini",
            "influence": "Innovation and technology breakthroughs",
            "score": 7
          }
        ]
      },
      "favorablePeriods": [
        {
          "start": "2025-03-15",
          "end": "2025-04-30",
          "reason": "Jupiter-Uranus conjunction, strong upward pressure"
        },
        {
          "start": "2025-11-01",
          "end": "2025-12-15",
          "reason": "Final push towards target, Mars in Sagittarius"
        }
      ],
      "challengingPeriods": [
        {
          "start": "2025-06-15",
          "end": "2025-07-30",
          "reason": "Mercury retrograde, potential pullback"
        }
      ]
    },
    "recommendation": "Moderate confidence in 'Yes' outcome. Multiple favorable astrological factors align with target achievement, but timing suggests volatility in mid-year.",
    "agentUsed": "PolymarketAgent"
  },
  "relatedAssets": [
    {
      "id": "btc-uuid",
      "symbol": "BTC",
      "correlation": "direct"
    }
  ],
  "actualOutcome": null,
  "resolvedAt": null,
  "lastAnalyzedAt": "2025-12-10T08:00:00Z"
}
```

### POST /polymarket/events/:eventId/analyze

Trigger fresh astrological analysis for an event.

**Response (202 Accepted):**
```json
{
  "eventId": "uuid",
  "status": "analyzing",
  "estimatedCompletionTime": "2025-12-10T10:00:15Z"
}
```

---

## Payments

### POST /payments/crypto/create

Create a crypto payment request.

**Request:**
```json
{
  "amount": 19.99,
  "currency": "USDC",
  "blockchain": "solana",
  "productType": "credits",
  "creditsAmount": 50
}
```

**Response (201):**
```json
{
  "transactionId": "uuid",
  "paymentRequest": {
    "amount": 19.99,
    "currency": "USDC",
    "blockchain": "solana",
    "recipientAddress": "GqR...xyz",
    "memo": "ASTRO-txn-uuid",
    "qrCode": "data:image/png;base64,...",
    "deepLink": "solana:GqR...xyz?amount=19.99&spl-token=EPjFW..."
  },
  "expiresAt": "2025-12-10T10:15:00Z",
  "status": "pending"
}
```

### POST /payments/crypto/confirm

Confirm crypto payment (called by frontend after user signs).

**Request:**
```json
{
  "transactionId": "uuid",
  "transactionHash": "5kD...abc"
}
```

**Response (200):**
```json
{
  "transactionId": "uuid",
  "status": "confirming",
  "confirmations": 1,
  "requiredConfirmations": 32,
  "estimatedConfirmationTime": "2025-12-10T10:02:00Z"
}
```

### GET /payments/transactions/:transactionId

Get transaction status.

**Response (200):**
```json
{
  "id": "uuid",
  "amount": 19.99,
  "currency": "USDC",
  "blockchain": "solana",
  "transactionHash": "5kD...abc",
  "status": "completed",
  "confirmations": 32,
  "creditsGranted": 50,
  "createdAt": "2025-12-10T10:00:00Z",
  "confirmedAt": "2025-12-10T10:01:30Z",
  "completedAt": "2025-12-10T10:01:45Z"
}
```

### POST /payments/iap/validate

Validate App Store / Google Play purchase.

**Request (iOS):**
```json
{
  "platform": "ios",
  "receiptData": "base64_encoded_receipt",
  "productId": "com.astro.pro_monthly"
}
```

**Request (Android):**
```json
{
  "platform": "android",
  "purchaseToken": "google_purchase_token",
  "productId": "com.astro.pro_monthly",
  "packageName": "com.astro.mobile"
}
```

**Response (200):**
```json
{
  "transactionId": "uuid",
  "status": "completed",
  "subscriptionTier": "pro",
  "subscriptionExpiresAt": "2026-01-10T00:00:00Z",
  "creditsGranted": 0,
  "validatedAt": "2025-12-10T10:00:00Z"
}
```

### GET /payments/transactions

List user's payment transactions.

**Query Parameters:**
- `status` (optional): Filter by status
- `limit` (default: 20)
- `offset` (default: 0)

**Response (200):**
```json
{
  "transactions": [
    {
      "id": "uuid",
      "amount": 19.99,
      "currency": "USDC",
      "paymentMethod": "solana",
      "status": "completed",
      "creditsGranted": 50,
      "createdAt": "2025-12-10T10:00:00Z"
    }
    // ... more transactions
  ],
  "pagination": {
    "total": 15,
    "limit": 20,
    "offset": 0
  }
}
```

### GET /payments/credits

Get user's credit balance.

**Response (200):**
```json
{
  "userId": "uuid",
  "creditsBalance": 42,
  "creditsUsedLifetime": 158,
  "creditsPurchasedLifetime": 200,
  "lastPurchaseAt": "2025-11-15T10:00:00Z"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      // Additional context (optional)
    }
  }
}
```

### Common Error Codes

| Status | Code | Description |
|--------|------|-------------|
| 400 | VALIDATION_ERROR | Request validation failed |
| 401 | UNAUTHORIZED | Missing or invalid authentication |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Resource conflict (e.g., duplicate) |
| 429 | RATE_LIMIT_EXCEEDED | Too many requests |
| 500 | INTERNAL_ERROR | Server error |
| 503 | SERVICE_UNAVAILABLE | Service temporarily unavailable |

### Domain-Specific Error Codes

| Code | Description |
|------|-------------|
| INSUFFICIENT_CREDITS | User doesn't have enough credits |
| SUBSCRIPTION_REQUIRED | Feature requires subscription |
| PREDICTION_FAILED | AI agent failed to generate prediction |
| ASSET_BIRTH_DATE_UNKNOWN | Asset birth date not researched |
| PAYMENT_TIMEOUT | Payment request expired |
| TRANSACTION_NOT_FOUND | Blockchain transaction not found |
| INVALID_RECEIPT | IAP receipt validation failed |

---

## Rate Limiting

Rate limits are tier-based:

| Tier | Requests per 15 min |
|------|---------------------|
| Anonymous | 10 |
| Free | 50 |
| Basic | 200 |
| Pro | 1000 |

Rate limit headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 987
X-RateLimit-Reset: 1702384800
```

---

## Webhooks

### Payment Confirmation Webhook

**POST to client-provided URL:**
```json
{
  "event": "payment.completed",
  "timestamp": "2025-12-10T10:01:45Z",
  "data": {
    "transactionId": "uuid",
    "userId": "user-uuid",
    "amount": 19.99,
    "currency": "USDC",
    "creditsGranted": 50
  }
}
```

### Subscription Update Webhook (from RevenueCat)

```json
{
  "event": "subscription.renewed",
  "timestamp": "2025-12-10T00:00:00Z",
  "data": {
    "userId": "user-uuid",
    "subscriptionTier": "pro",
    "expiresAt": "2026-01-10T00:00:00Z"
  }
}
```

---

## WebSocket Events

Connect to: `wss://api.astro.app/ws`

Authenticate: Send JWT token on connection

### Events

#### Prediction Status Update
```json
{
  "event": "prediction.status",
  "data": {
    "predictionId": "uuid",
    "status": "processing",
    "progress": {
      "stage": "analyzing",
      "percentage": 65
    }
  }
}
```

#### Prediction Completed
```json
{
  "event": "prediction.completed",
  "data": {
    "predictionId": "uuid",
    "favorabilityScore": 8,
    "completedAt": "2025-12-10T10:00:12Z"
  }
}
```

#### Payment Confirmed
```json
{
  "event": "payment.confirmed",
  "data": {
    "transactionId": "uuid",
    "creditsGranted": 50,
    "newBalance": 92
  }
}
```

#### Polymarket Odds Update
```json
{
  "event": "polymarket.odds_update",
  "data": {
    "eventId": "uuid",
    "odds": {
      "yes": 0.67,
      "no": 0.33
    }
  }
}
```

---

## Pagination

List endpoints support cursor-based pagination:

**Request:**
```
GET /assets?limit=50&offset=0
```

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "total": 250,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

---

## Versioning

API versioning is done via URL path:
- Current: `/v1/...`
- Future: `/v2/...`

Breaking changes will result in a new version. Non-breaking changes (new fields, new endpoints) are added to the current version.

---

**Document Version**: 1.0
**Last Updated**: 2025-12-10
**Maintained By**: API Team

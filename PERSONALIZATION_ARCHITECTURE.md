# Personalization System Architecture

**Version**: 1.0
**Last Updated**: 2025-12-20
**Status**: Design Document

---

## System Overview

The Personalization System calculates and caches astrological compatibility between users and financial assets, powering the "Best Assets For You" experience. It combines real-time calculations with intelligent caching to deliver sub-second personalized recommendations.

**Key Components**:
1. **CompatibilityService**: Core algorithm implementation
2. **PersonalizationAgent**: AI-powered explanation generator
3. **BatchProcessor**: Background job system for bulk calculations
4. **CacheLayer**: Redis-based caching with smart invalidation
5. **API Layer**: RESTful endpoints for frontend consumption

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                       │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │         Personalized Dashboard Component               │    │
│  │  - usePersonalization() hook                           │    │
│  │  - Asset card list with scores                         │    │
│  │  - Filters (type, element, score)                      │    │
│  └─────────────────────┬──────────────────────────────────┘    │
└────────────────────────┼───────────────────────────────────────┘
                         │
                         │ HTTP/REST
                         │
┌────────────────────────▼───────────────────────────────────────┐
│                    API Server (Express)                         │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │      Personalization Routes                              │  │
│  │  GET /api/personalization/top-assets                     │  │
│  │  GET /api/personalization/compatibility/:assetId         │  │
│  │  POST /api/personalization/recalculate                   │  │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       │                                          │
│  ┌────────────────────▼─────────────────────────────────────┐  │
│  │      Compatibility Service                               │  │
│  │  - calculateCompatibility(userId, assetId)               │  │
│  │  - getTopAssets(userId, limit)                           │  │
│  │  - invalidateCache(userId)                               │  │
│  └──────┬─────────────┬──────────────────┬──────────────────┘  │
│         │             │                  │                      │
│    ┌────▼──────┐ ┌────▼────────┐  ┌──────▼─────────┐          │
│    │Algorithm  │ │   Cache     │  │  Batch         │          │
│    │Calculator │ │   Manager   │  │  Processor     │          │
│    └───────────┘ └─────┬───────┘  └────────┬───────┘          │
└──────────────────────┬─┴──────────────┬─────┼──────────────────┘
                       │                │     │
                  ┌────▼────┐      ┌────▼────┐│
                  │ Prisma  │      │  Redis  ││
                  │ Client  │      │  Cache  ││
                  └────┬────┘      └─────────┘│
                       │                       │
┌──────────────────────▼───────────────────────▼──────────────────┐
│                     Data Layer                                   │
│                                                                  │
│  ┌────────────────────┐       ┌──────────────────────────┐     │
│  │   PostgreSQL       │       │       Redis              │     │
│  │                    │       │                          │     │
│  │ - users            │       │ - compatibility:user:*   │     │
│  │ - user_astrological│       │ - asset:list:*           │     │
│  │ - assets           │       │ - batch:jobs:*           │     │
│  │ - user_asset_      │       │                          │     │
│  │   compatibility    │       │                          │     │
│  └────────────────────┘       └──────────────────────────┘     │
└──────────────────────────────────────────────────────────────────┘
                       │
                       │ HTTP
                       │
┌──────────────────────▼───────────────────────────────────────────┐
│              PersonalizationAgent (AI Service)                    │
│              - Explanation generation                             │
│              - Reasoning enhancement                              │
│              - Natural language descriptions                      │
│              (Optional: Can use template-based fallback)          │
└───────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### 1. Initial Dashboard Load (Cold Cache)

```
User → Frontend
   ↓
Frontend: GET /api/personalization/top-assets
   ↓
API: Check Redis cache
   ↓ (MISS)
API: Check database (user_asset_compatibility table)
   ↓ (MISS or STALE)
API: Trigger batch calculation job
   ↓
BatchProcessor: Calculate compatibility for all assets (100+)
   ↓
BatchProcessor: For each asset:
   ├─ Fetch user profile (astrological_profile)
   ├─ Fetch asset profile (assets table)
   ├─ Run compatibility algorithm
   │   ├─ Element harmony score
   │   ├─ Planetary compatibility score
   │   └─ Combined weighted score
   ├─ Call PersonalizationAgent for reasoning (optional)
   └─ Save to database + Redis cache
   ↓
API: Fetch top 10 from cache/database
   ↓
API: Return sorted list to frontend
   ↓
Frontend: Render dashboard with asset cards
```

**Timeline**: ~2-3 seconds total

---

### 2. Subsequent Dashboard Load (Warm Cache)

```
User → Frontend
   ↓
Frontend: GET /api/personalization/top-assets
   ↓
API: Check Redis cache
   ↓ (HIT)
API: Return cached data immediately
   ↓
Frontend: Render dashboard
```

**Timeline**: ~100-200ms total

---

### 3. User Profile Update Flow

```
User updates birth date/time/location
   ↓
Frontend: PUT /api/birth-chart/update
   ↓
API: Update user record
   ↓
API: Trigger compatibility recalculation
   ├─ Invalidate Redis cache for user
   ├─ Delete old compatibility records
   └─ Queue batch calculation job
   ↓
BatchProcessor: Recalculate all asset compatibility
   ↓
API: Return success
   ↓
Frontend: Show "Recalculating..." message
   ↓
(Background job completes)
   ↓
Frontend: Auto-refresh dashboard with new scores
```

---

### 4. Single Asset Detail View

```
User clicks asset card for details
   ↓
Frontend: GET /api/personalization/compatibility/:assetId
   ↓
API: Check Redis cache (specific asset)
   ↓ (HIT or MISS)
API: Calculate if needed, otherwise return cached
   ↓
Frontend: Show detailed modal
   ├─ Compatibility score gauge
   ├─ Element harmony breakdown
   ├─ Planetary analysis
   └─ Full reasoning text
```

---

## Database Schema Additions

### Already Exists (from schema.prisma)

```prisma
model UserAssetCompatibility {
  id      String @id @default(uuid())
  userId  String
  assetId String

  // Scores
  overallCompatibilityScore    Int?
  elementCompatibilityScore    Int?
  planetaryCompatibilityScore  Int?
  timingCompatibilityScore     Int?

  // Analysis
  elementHarmony       Json?
  planetaryHarmony     Json?
  favorableAspects     Json?
  challengingAspects   Json?

  // Recommendations
  recommendationLevel String?
  reasoning           String?
  bestEntryPeriods    Json?
  warningPeriods      Json?

  // Personalized
  whyGoodForUser        String?
  whyChallengingForUser String?
  tips                  String?

  // Metadata
  calculatedAt DateTime @default(now())
  expiresAt    DateTime?

  @@unique([userId, assetId])
  @@index([userId])
  @@index([overallCompatibilityScore(sort: Desc)])
  @@index([userId, overallCompatibilityScore(sort: Desc)])
}
```

### Additional Indexes Needed

```sql
-- For efficient filtering by asset type
CREATE INDEX idx_assets_type_element ON assets(asset_type, primary_element);

-- For efficient user profile lookups
CREATE INDEX idx_user_profile_calculated ON user_astrological_profiles(user_id, calculated_at);

-- For batch job tracking
CREATE INDEX idx_compatibility_expires ON user_asset_compatibility(expires_at)
  WHERE expires_at IS NOT NULL;
```

---

## API Endpoint Specifications

### GET /api/personalization/top-assets

**Purpose**: Fetch user's most compatible assets

**Request**:
```http
GET /api/personalization/top-assets?limit=10&assetType=crypto&minScore=7
Authorization: Bearer {jwt_token}
```

**Query Parameters**:
- `limit` (optional, default: 10): Number of assets to return
- `assetType` (optional): Filter by type (crypto, stock, rwa, commodity)
- `minScore` (optional): Minimum compatibility score (1-10)
- `element` (optional): Filter by element (wood, fire, earth, metal, water)

**Response**:
```typescript
{
  success: true,
  data: {
    userId: string;
    calculatedAt: string; // ISO timestamp
    cached: boolean;
    expiresAt: string;
    assets: Array<{
      assetId: string;
      symbol: string;
      name: string;
      assetType: string;
      category: string;
      compatibilityScore: number; // 1-10
      elementScore: number;
      planetScore: number;
      elementHarmony: {
        userFavorableElements: string[];
        assetPrimaryElement: string;
        harmonyType: 'productive' | 'destructive' | 'same' | 'neutral';
        strength: string;
      };
      reasoning: string;
      whyGoodForUser: string;
      tips?: string;
      bestEntryPeriods?: string[];
    }>;
    totalCompatibleAssets: number;
    filters: {
      applied: Record<string, any>;
      available: {
        assetTypes: string[];
        elements: string[];
      };
    };
  };
}
```

**Error Responses**:
```typescript
// User has no birth chart
{
  success: false,
  error: {
    code: 'INCOMPLETE_PROFILE',
    message: 'Please complete your birth chart to receive personalized recommendations',
    action: 'redirect_to_birth_chart'
  }
}

// Calculation in progress
{
  success: true,
  data: {
    status: 'calculating',
    progress: 45, // percentage
    estimatedCompletion: '2025-12-20T12:34:56Z'
  }
}
```

---

### GET /api/personalization/compatibility/:assetId

**Purpose**: Get detailed compatibility for specific asset

**Request**:
```http
GET /api/personalization/compatibility/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer {jwt_token}
```

**Response**:
```typescript
{
  success: true,
  data: {
    assetId: string;
    symbol: string;
    name: string;
    compatibilityScore: number;
    breakdown: {
      elementScore: number;
      elementWeight: number; // 0.6
      planetaryScore: number;
      planetaryWeight: number; // 0.4
      timingScore?: number;
    };
    detailed: {
      elementHarmony: {
        userElements: {
          dayMaster: string;
          favorable: string[];
          unfavorable: string[];
        };
        assetElements: {
          primary: string;
          secondary?: string;
          reasoning: string;
        };
        harmonyAnalysis: string;
        cycleType: string;
      };
      planetaryHarmony: {
        userPlanet: string;
        assetPlanet: string;
        compatibilityScore: number;
        analysis: string;
      };
      favorableAspects: Array<{
        aspect: string;
        description: string;
      }>;
      challengingAspects: Array<{
        aspect: string;
        description: string;
      }>;
    };
    reasoning: string; // Full detailed explanation
    whyGoodForUser: string;
    whyChallengingForUser?: string;
    tips: string;
    bestEntryPeriods: Array<{
      period: string;
      reason: string;
    }>;
    calculatedAt: string;
    expiresAt: string;
  };
}
```

---

### POST /api/personalization/recalculate

**Purpose**: Force recalculation of compatibility (called after profile update)

**Request**:
```http
POST /api/personalization/recalculate
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "reason": "birth_chart_updated"
}
```

**Response**:
```typescript
{
  success: true,
  data: {
    jobId: string;
    status: 'queued' | 'processing' | 'completed';
    queuePosition: number;
    estimatedDuration: number; // seconds
    estimatedCompletion: string; // ISO timestamp
  };
}
```

**Job Status Polling**:
```http
GET /api/personalization/job-status/:jobId
```

---

## Caching Strategy

### Redis Cache Structure

```
Key Pattern: compatibility:{userId}:assets
Value: JSON array of top 100 compatible assets
TTL: 24 hours
```

```typescript
interface CachedCompatibility {
  userId: string;
  calculatedAt: string;
  expiresAt: string;
  assets: Array<{
    assetId: string;
    score: number;
    // ... other fields
  }>;
}
```

### Cache Operations

**Set Cache**:
```typescript
async function setCachedCompatibility(
  userId: string,
  data: CachedCompatibility
): Promise<void> {
  const key = `compatibility:${userId}:assets`;
  await redis.setex(
    key,
    86400, // 24 hours
    JSON.stringify(data)
  );
}
```

**Get Cache**:
```typescript
async function getCachedCompatibility(
  userId: string
): Promise<CachedCompatibility | null> {
  const key = `compatibility:${userId}:assets`;
  const cached = await redis.get(key);

  if (!cached) return null;

  const data = JSON.parse(cached);

  // Check if expired
  if (new Date(data.expiresAt) < new Date()) {
    await redis.del(key);
    return null;
  }

  return data;
}
```

**Invalidate Cache**:
```typescript
async function invalidateUserCache(userId: string): Promise<void> {
  const keys = [
    `compatibility:${userId}:assets`,
    `compatibility:${userId}:*`,
  ];

  for (const pattern of keys) {
    const matchingKeys = await redis.keys(pattern);
    if (matchingKeys.length > 0) {
      await redis.del(...matchingKeys);
    }
  }
}
```

### Cache Warming Strategy

**On User Registration**:
- Queue low-priority batch job to calculate compatibility
- Don't block registration flow
- Calculate top 20 assets first, then fill in rest

**On Peak Hours**:
- Pre-calculate for active users
- Refresh cache before expiry
- Background refresh during low traffic

---

## Batch Processing System

### Job Queue Architecture

Using **BullMQ** for reliable job processing:

```typescript
import { Queue, Worker, Job } from 'bullmq';

const compatibilityQueue = new Queue('compatibility-calculations', {
  connection: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
});

const worker = new Worker(
  'compatibility-calculations',
  async (job: Job) => {
    const { userId, assets } = job.data;

    await processCompatibilityBatch(userId, assets);

    return { success: true, processedCount: assets.length };
  },
  {
    connection: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
    },
    concurrency: 5, // Process 5 users in parallel
  }
);
```

### Job Types

**1. Full Calculation Job**:
```typescript
await compatibilityQueue.add(
  'calculate-full',
  {
    userId: 'uuid',
    priority: 'normal',
    calculateAll: true,
  },
  {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  }
);
```

**2. Incremental Update Job**:
```typescript
await compatibilityQueue.add(
  'calculate-incremental',
  {
    userId: 'uuid',
    assetIds: ['asset1', 'asset2'], // Only these assets
    priority: 'high',
  }
);
```

**3. Cache Refresh Job**:
```typescript
await compatibilityQueue.add(
  'refresh-cache',
  {
    userId: 'uuid',
    priority: 'low',
  },
  {
    delay: 3600000, // Run in 1 hour
  }
);
```

### Batch Processing Logic

```typescript
async function processCompatibilityBatch(
  userId: string,
  assetIds?: string[]
): Promise<void> {
  // 1. Fetch user profile
  const userProfile = await prisma.userAstrologicalProfile.findUnique({
    where: { userId },
  });

  if (!userProfile) {
    throw new Error('User profile not found');
  }

  // 2. Fetch assets (all or specific)
  const assets = assetIds
    ? await prisma.asset.findMany({
        where: { id: { in: assetIds } },
      })
    : await prisma.asset.findMany({
        where: { isActive: true },
      });

  // 3. Calculate compatibility for each asset
  const compatibilities = await Promise.all(
    assets.map(async (asset) => {
      const compatibility = await calculateCompatibility(userProfile, asset);

      // Optionally enhance with AI
      if (compatibility.score >= 7) {
        const reasoning = await personalizationAgent.generateReasoning(
          userProfile,
          asset,
          compatibility
        );
        compatibility.reasoning = reasoning;
      }

      return {
        userId,
        assetId: asset.id,
        ...compatibility,
        calculatedAt: new Date(),
        expiresAt: new Date(Date.now() + 86400000), // 24 hours
      };
    })
  );

  // 4. Batch upsert to database
  await prisma.$transaction(
    compatibilities.map((comp) =>
      prisma.userAssetCompatibility.upsert({
        where: {
          userId_assetId: {
            userId: comp.userId,
            assetId: comp.assetId,
          },
        },
        create: comp,
        update: comp,
      })
    )
  );

  // 5. Update cache
  const sorted = compatibilities
    .sort((a, b) => b.overallCompatibilityScore - a.overallCompatibilityScore)
    .slice(0, 100);

  await setCachedCompatibility(userId, {
    userId,
    calculatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    assets: sorted,
  });
}
```

### Performance Optimization

**Parallel Processing**:
```typescript
// Process assets in chunks to avoid memory issues
const CHUNK_SIZE = 20;
const chunks = chunkArray(assets, CHUNK_SIZE);

for (const chunk of chunks) {
  await Promise.all(
    chunk.map(asset => calculateCompatibility(userProfile, asset))
  );
}
```

**Database Query Optimization**:
```typescript
// Single query for all user profiles
const userProfiles = await prisma.userAstrologicalProfile.findMany({
  where: {
    userId: { in: userIds },
  },
  select: {
    userId: true,
    favorableElements: true,
    unfavorableElements: true,
    // ... only needed fields
  },
});
```

---

## PersonalizationAgent Integration

### Agent Service

```typescript
class PersonalizationAgentService {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async generateReasoning(
    userProfile: UserProfile,
    assetProfile: AssetProfile,
    compatibility: CompatibilityScore
  ): Promise<string> {
    const systemPrompt = `You are a financial astrology expert specializing in personalized asset recommendations. Your task is to explain why a particular asset is compatible with a user based on their astrological profile.

Use engaging, mystical language while remaining grounded and actionable. Focus on the "why" behind the compatibility score.`;

    const userPrompt = `
User Profile:
- Favorable Elements: ${userProfile.favorableElements.join(', ')}
- Unfavorable Elements: ${userProfile.unfavorableElements.join(', ')}
- Dominant Planet: ${userProfile.dominantPlanet}
- Sun/Moon/Rising: ${userProfile.sunSign}/${userProfile.moonSign}/${userProfile.risingSign}

Asset Profile:
- Name: ${assetProfile.name} (${assetProfile.symbol})
- Primary Element: ${assetProfile.primaryElement}
- Dominant Planet: ${assetProfile.dominantPlanet}
- Type: ${assetProfile.assetType}

Compatibility Scores:
- Overall: ${compatibility.overallScore}/10
- Element Harmony: ${compatibility.elementScore}/10
- Planetary Compatibility: ${compatibility.planetScore}/10

Generate a personalized explanation (2-3 paragraphs) for why this asset matches this user. Include:
1. Element harmony analysis
2. Planetary compatibility insights
3. Practical advice for entry timing or position sizing
`;

    const message = await this.client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    return message.content[0].text;
  }
}
```

### Template-Based Fallback

If AI costs are too high or API is down:

```typescript
function generateTemplateReasoning(
  userProfile: UserProfile,
  assetProfile: AssetProfile,
  compatibility: CompatibilityScore
): string {
  const templates = {
    high: `${assetProfile.name}'s ${assetProfile.primaryElement} element harmonizes beautifully with your favorable ${userProfile.favorableElements[0]} element. This creates a natural affinity that will help you intuitively understand this asset's movements. Your ${userProfile.dominantPlanet}-dominant chart supports ${assetProfile.name}'s ${assetProfile.dominantPlanet} energy, suggesting smooth interaction.`,

    medium: `${assetProfile.name}'s ${assetProfile.primaryElement} element is moderately compatible with your astrological profile. While not perfectly aligned, this asset can work well in your portfolio with mindful entry timing. Consider ${userProfile.favorableElements[0]}-element periods for best results.`,

    low: `${assetProfile.name}'s ${assetProfile.primaryElement} element challenges your favorable ${userProfile.favorableElements[0]} element, suggesting extra caution. This doesn't mean complete avoidance, but rather heightened awareness and strict risk management.`,
  };

  const level = compatibility.overallScore >= 7 ? 'high' :
                compatibility.overallScore >= 5 ? 'medium' : 'low';

  return templates[level];
}
```

---

## Monitoring & Observability

### Key Metrics

**Performance Metrics**:
- Batch calculation time (target: <2s for 100 assets)
- API response time (target: <300ms p95)
- Cache hit rate (target: >90%)
- Database query time (target: <50ms)

**Business Metrics**:
- Dashboard view rate
- Filter usage patterns
- Asset detail view rate
- User satisfaction (ratings)

### Logging

```typescript
logger.info('Compatibility calculated', {
  userId,
  assetId,
  score: compatibility.overallScore,
  duration: Date.now() - startTime,
  cached: false,
});

logger.error('Batch job failed', {
  userId,
  error: error.message,
  assetsProcessed: completedCount,
  assetsTotal: totalCount,
});
```

### Alerts

- Batch job failure rate >5%
- Cache hit rate <80%
- API error rate >1%
- Response time p95 >1s

---

## Security Considerations

**Data Privacy**:
- Birth chart data is sensitive (GDPR compliance)
- Cache encryption in Redis
- Audit logs for data access

**Rate Limiting**:
```typescript
app.use('/api/personalization', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
}));
```

**Authorization**:
- JWT validation on all endpoints
- Users can only access their own compatibility data
- No public access to raw algorithm

---

## Deployment Architecture

**Production Setup**:
```
- API Server: 2x Node.js instances (load balanced)
- Redis: 1x primary + 1x replica (high availability)
- Database: PostgreSQL with read replicas
- Worker: 3x BullMQ workers (horizontal scaling)
- AI Service: Optional microservice (can disable)
```

**Environment Variables**:
```bash
# Redis
REDIS_URL=redis://localhost:6379
REDIS_CLUSTER_MODE=false

# Caching
COMPATIBILITY_CACHE_TTL=86400
ENABLE_AI_REASONING=true

# Batch Processing
BATCH_JOB_CONCURRENCY=5
BATCH_JOB_TIMEOUT=300000

# AI Service
ANTHROPIC_API_KEY=sk-...
PERSONALIZATION_AGENT_MODEL=claude-3-5-sonnet-20241022
```

---

**Architecture Status**: Ready for Implementation
**Next Steps**: Service implementation, testing, deployment

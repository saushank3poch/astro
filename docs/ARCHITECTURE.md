# Astro Platform - Technical Architecture

## System Overview

The Astro platform is a microservices-based architecture designed for scalability, maintainability, and performance. The system combines traditional web/mobile applications with advanced AI/ML capabilities.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
├───────────────────────────────┬─────────────────────────────────┤
│   Web App (Next.js)           │   Mobile App (Expo)             │
│   - SSR/SSG                   │   - iOS/Android                 │
│   - React Components          │   - React Native                │
│   - Crypto Payments           │   - IAP Subscriptions           │
└───────────────┬───────────────┴─────────────┬───────────────────┘
                │                             │
                └──────────────┬──────────────┘
                               │
                ┌──────────────▼──────────────┐
                │      Load Balancer/CDN      │
                │      (Vercel/CloudFront)    │
                └──────────────┬──────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
┌───────▼───────┐    ┌─────────▼────────┐   ┌────────▼────────┐
│   API Gateway │    │  WebSocket       │   │   Static Assets │
│   (Express)   │    │  Server          │   │   (S3/CDN)      │
└───────┬───────┘    └─────────┬────────┘   └─────────────────┘
        │                      │
        └──────────┬───────────┘
                   │
        ┌──────────▼──────────────────────────────────────┐
        │           Application Services Layer             │
        ├──────────┬──────────┬──────────┬────────────────┤
        │  Auth    │  Users   │  Assets  │  Predictions   │
        │  Service │  Service │  Service │  Service       │
        └──────────┴──────────┴──────────┴────────┬───────┘
                                                   │
                                    ┌──────────────▼──────────────┐
                                    │   ML Engine (Python/FastAPI)│
                                    │   - AI Agents               │
                                    │   - Astrology Calculations  │
                                    │   - RAG System              │
                                    └──────────────┬──────────────┘
                                                   │
        ┌──────────────────────────────────────────┼──────────────────┐
        │                                          │                  │
┌───────▼───────┐    ┌─────────▼────────┐   ┌────▼──────┐   ┌──────▼──────┐
│  PostgreSQL   │    │     Redis        │   │  Pinecone │   │   BullMQ    │
│  (Primary DB) │    │  (Cache/Session) │   │ (Vector)  │   │   (Queue)   │
└───────────────┘    └──────────────────┘   └───────────┘   └─────────────┘
        │
        │
┌───────▼───────────────────────────────────────┐
│         External Services                      │
├────────────┬──────────┬──────────┬────────────┤
│  Solana    │ Ethereum │Polymarket│  RevenueCat│
│  Blockchain│Blockchain│   API    │    IAP     │
└────────────┴──────────┴──────────┴────────────┘
```

## Component Details

### 1. Client Layer

#### Web Application (Next.js)
- **Framework**: Next.js 14+ with App Router
- **Rendering**: Server-Side Rendering (SSR) for SEO, Static Site Generation (SSG) for performance
- **State Management**: Zustand for global state, React hooks for local state
- **Styling**: TailwindCSS for utility-first styling, Framer Motion for animations
- **Payment Integration**: Solana Pay, Phantom Wallet, MetaMask

**Key Features**:
- SEO-optimized landing pages
- Real-time prediction updates via WebSocket
- Responsive design (mobile-first)
- Progressive Web App (PWA) capabilities
- Code splitting for optimal performance

#### Mobile Application (Expo)
- **Framework**: Expo SDK 50+
- **Navigation**: Expo Router (file-based)
- **State Management**: Zustand + React Context
- **Payments**: RevenueCat wrapper for Apple/Google IAP
- **Push Notifications**: Expo Notifications
- **Offline Support**: AsyncStorage + background sync

**Key Features**:
- Native iOS and Android builds
- Biometric authentication
- Push notifications for favorable periods
- Home screen widget (daily outlook)
- Offline prediction viewing

### 2. API Gateway Layer

#### API Server (Node.js/Express)
- **Runtime**: Node.js 18+
- **Framework**: Express with TypeScript
- **Authentication**: JWT with refresh tokens
- **Validation**: Zod schemas
- **Rate Limiting**: Redis-based
- **API Documentation**: OpenAPI/Swagger

**Responsibilities**:
- Request routing
- Authentication/Authorization
- Input validation
- Rate limiting
- API versioning
- Error handling
- Logging & monitoring

**Middleware Stack**:
```typescript
app.use(helmet())           // Security headers
app.use(cors())             // CORS handling
app.use(compression())      // Response compression
app.use(rateLimit)          // Rate limiting
app.use(authenticate)       // JWT verification
app.use(requestLogger)      // Request logging
```

#### WebSocket Server
- **Library**: Socket.io
- **Authentication**: JWT tokens
- **Use Cases**:
  - Real-time prediction status updates
  - Live Polymarket odds updates
  - User notifications

### 3. Application Services

#### Auth Service
- User registration (email/password)
- OAuth2 integration (Google, Apple, Facebook)
- JWT token generation & validation
- Password reset flows
- Session management (Redis)

#### Users Service
- User profile management
- Birth chart creation & storage
- Subscription management
- Credit balance tracking
- Preferences & settings

#### Assets Service
- Asset catalog management
- Birth date research tracking
- Element classification
- Market data caching
- Search & filtering

#### Predictions Service
- Prediction request orchestration
- ML Engine communication
- Result storage & retrieval
- Accuracy tracking
- User feedback collection

#### Payments Service
- Crypto payment processing (Solana, Ethereum)
- IAP receipt validation (Apple, Google)
- Transaction tracking
- Credit allocation
- Subscription status sync

#### Polymarket Service
- Event fetching & syncing
- Odds monitoring
- Astrological analysis caching
- Result validation

### 4. ML Engine (Python/FastAPI)

#### AI Agent System
```python
class AgentOrchestrator:
    def __init__(self):
        self.agents = {
            'macro': MacroStrategyAgent(),
            'timing': AssetTimingAgent(),
            'divination': DivinationAgent(),
            'compatibility': PersonalizationAgent(),
            'polymarket': PolymarketAgent(),
            'explanation': ExplanationAgent()
        }

    async def process_prediction(self, request):
        # 1. Route to primary agent
        primary_agent = self.select_agent(request.type)

        # 2. Execute primary analysis
        result = await primary_agent.analyze(request)

        # 3. Enrich with supporting agents
        enriched = await self.enrich(result, request)

        # 4. Translate to user-friendly format
        final = await self.agents['explanation'].translate(enriched)

        return final
```

#### Astrological Calculation Engine
- **Swiss Ephemeris**: Planetary position calculations
- **Bazi Calculator**: Chinese Four Pillars analysis
- **Natal Chart**: Western birth chart generation
- **Transit Calculator**: Current planetary aspects
- **Element Harmony**: Five elements compatibility

#### RAG (Retrieval Augmented Generation)
```python
class AstroRAG:
    def __init__(self):
        self.vectordb = PineconeIndex()
        self.embeddings = OpenAIEmbeddings()

    def query(self, question, context):
        # 1. Generate embedding
        query_embedding = self.embeddings.embed(question)

        # 2. Retrieve relevant docs
        docs = self.vectordb.similarity_search(
            query_embedding,
            k=5,
            filter={'domain': context.domain}
        )

        # 3. Augment LLM context
        augmented_prompt = self.build_prompt(question, docs)

        return augmented_prompt
```

**Knowledge Base Collections**:
- Chinese astrology (Bazi, elements, zodiac)
- Western astrology (natal charts, transits, aspects)
- Tarot card meanings
- I Ching hexagrams
- Financial astrology historical data
- Asset birth date research

### 5. Data Layer

#### PostgreSQL (Primary Database)
- **Version**: 14+
- **Hosting**: Supabase / Neon (managed Postgres)
- **Features**:
  - JSONB for flexible astrological data
  - Full-text search for assets
  - Triggers for automatic timestamp updates
  - Views for common queries
  - Row-level security (RLS)

**Optimization Strategies**:
- Connection pooling (PgBouncer)
- Read replicas for heavy queries
- Partitioning (predictions table by month)
- Materialized views for analytics
- Index optimization

#### Redis (Cache & Session Store)
- **Version**: 7+
- **Hosting**: Upstash (serverless Redis)
- **Use Cases**:
  - Session storage
  - API response caching
  - Rate limiting counters
  - Real-time data (Polymarket odds)
  - Job queue backend

**Cache Strategy**:
```typescript
// Layered caching
const getAsset = async (id: string) => {
  // 1. Check Redis cache
  const cached = await redis.get(`asset:${id}`)
  if (cached) return JSON.parse(cached)

  // 2. Query database
  const asset = await db.asset.findUnique({ where: { id } })

  // 3. Cache result (1 hour TTL)
  await redis.setex(`asset:${id}`, 3600, JSON.stringify(asset))

  return asset
}
```

#### Pinecone (Vector Database)
- **Purpose**: RAG system for astrological knowledge
- **Dimensions**: 1536 (OpenAI ada-002 embeddings)
- **Indexes**:
  - `astro-knowledge` - General astrological knowledge
  - `asset-research` - Asset-specific research & patterns
  - `prediction-history` - Historical predictions for learning

#### BullMQ (Job Queue)
- **Backend**: Redis
- **Use Cases**:
  - Prediction processing (async)
  - Crypto payment monitoring
  - Polymarket sync jobs
  - Compatibility calculations (batch)
  - Email sending

**Queue Configuration**:
```typescript
const predictionQueue = new Queue('predictions', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 }
  }
})
```

### 6. External Integrations

#### Blockchain (Crypto Payments)
- **Solana**: Solana Pay protocol, Phantom wallet
- **Ethereum**: WalletConnect, MetaMask
- **Base**: L2 for lower fees

**Transaction Flow**:
```
1. User initiates payment
2. Generate payment request (amount, recipient)
3. User signs with wallet
4. Backend monitors blockchain for confirmation
5. On confirmation: credit user account
6. Emit WebSocket event to frontend
```

#### Polymarket API
- **Base URL**: `https://api.polymarket.com`
- **Endpoints**:
  - `/events` - List events
  - `/events/:id/odds` - Get current odds
  - `/markets` - List markets

**Sync Strategy**:
- Cron job every 15 minutes
- Fetch active events
- Update odds
- Trigger astrological analysis for new events

#### RevenueCat (Mobile IAP)
- **Purpose**: Unified IAP management for iOS/Android
- **Features**:
  - Subscription status
  - Receipt validation
  - Cross-platform support
  - Analytics

**Integration Flow**:
```
1. User purchases subscription in app
2. App sends receipt to RevenueCat
3. RevenueCat validates with Apple/Google
4. Webhook to our backend
5. Update user subscription status
6. Sync credits/access
```

## Data Flow Diagrams

### Prediction Request Flow

```
User → Web/Mobile App
  ↓
[1] POST /api/predictions
  ↓
API Gateway (auth, validation)
  ↓
[2] Create prediction record (status: pending)
  ↓
[3] Enqueue job in BullMQ
  ↓
Worker picks up job
  ↓
[4] Call ML Engine: POST /api/agents/{type}
  ↓
ML Engine:
  ├─ [5a] Retrieve user birth chart (PostgreSQL)
  ├─ [5b] Retrieve asset data (PostgreSQL + Redis cache)
  ├─ [5c] Query knowledge base (Pinecone RAG)
  ├─ [5d] Execute AI agent (Claude/GPT-4)
  ├─ [5e] Calculate astrological factors
  └─ [5f] Generate prediction result
  ↓
[6] Return result to API worker
  ↓
[7] Update prediction record (status: completed)
  ↓
[8] Deduct credits from user
  ↓
[9] Emit WebSocket event to client
  ↓
Client displays result with animation
```

### Crypto Payment Flow

```
User → Web App
  ↓
[1] POST /api/payments/crypto/create
  {amount: 19.99, currency: 'USDC'}
  ↓
[2] Generate payment address/request
  ↓
[3] Create transaction record (status: pending)
  ↓
Return payment details to client
  ↓
User approves in wallet (Phantom/MetaMask)
  ↓
Transaction broadcast to blockchain
  ↓
[4] Background worker monitors blockchain
  ↓
[5] Detect transaction (confirmations: 1/32)
  ↓
[6] Update transaction (status: confirming)
  ↓
[7] Wait for full confirmation (32 on Solana, 12 on Ethereum)
  ↓
[8] Update transaction (status: completed)
  ↓
[9] Credit user account
  ↓
[10] Emit WebSocket event
  ↓
Client shows success notification
```

## Scalability Considerations

### Horizontal Scaling

#### API Servers
- Stateless design (session in Redis)
- Load balancer distributes requests
- Auto-scaling based on CPU/memory
- Deploy multiple instances across regions

#### ML Engine
- Stateless prediction workers
- Queue-based processing
- Independent scaling from API
- GPU instances for heavy computations

### Vertical Scaling

#### Database
- Increase instance size for write-heavy workloads
- Add read replicas for read-heavy queries
- Partition large tables (predictions, usage_logs)

### Caching Strategy

```
┌─────────────────────────────────────────┐
│         Caching Layers                  │
├─────────────────────────────────────────┤
│ 1. Browser Cache                        │
│    - Static assets (CSS, JS, images)    │
│    - TTL: 1 year                        │
├─────────────────────────────────────────┤
│ 2. CDN Cache (CloudFront/Vercel)        │
│    - SSG pages                          │
│    - API responses (public data)        │
│    - TTL: 1 hour - 1 day                │
├─────────────────────────────────────────┤
│ 3. Redis Cache                          │
│    - User sessions                      │
│    - API responses (user-specific)      │
│    - Asset data                         │
│    - Polymarket odds                    │
│    - TTL: 5 min - 1 hour                │
├─────────────────────────────────────────┤
│ 4. Application Cache (in-memory)        │
│    - Ephemeris calculations             │
│    - Configuration                      │
│    - TTL: Process lifetime              │
└─────────────────────────────────────────┘
```

### Database Optimization

#### Indexing Strategy
```sql
-- User queries
CREATE INDEX idx_predictions_user_created ON predictions(user_id, created_at DESC);
CREATE INDEX idx_predictions_user_type ON predictions(user_id, prediction_type);

-- Asset searches
CREATE INDEX idx_assets_symbol_gin ON assets USING gin(to_tsvector('english', symbol));
CREATE INDEX idx_assets_category ON assets(category, asset_type);

-- Compatibility lookups
CREATE INDEX idx_compatibility_user_score ON user_asset_compatibility(user_id, overall_compatibility_score DESC);
```

#### Partitioning
```sql
-- Monthly partitions for predictions
CREATE TABLE predictions_2025_01 PARTITION OF predictions
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE predictions_2025_02 PARTITION OF predictions
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
```

## Security Architecture

### Authentication & Authorization

```typescript
// JWT-based authentication
interface JWTPayload {
  userId: string
  email: string
  role: 'user' | 'admin'
  subscriptionTier: 'free' | 'basic' | 'pro'
  iat: number
  exp: number
}

// Access control middleware
const requireSubscription = (minTier: SubscriptionTier) => {
  return (req, res, next) => {
    const userTier = req.user.subscriptionTier
    if (!hasAccess(userTier, minTier)) {
      return res.status(403).json({ error: 'Insufficient subscription' })
    }
    next()
  }
}
```

### Data Security

- **Encryption at Rest**: PostgreSQL with encryption enabled
- **Encryption in Transit**: TLS 1.3 for all connections
- **Secret Management**: Environment variables, no hardcoded secrets
- **API Keys**: Rotated regularly, scoped permissions
- **PII Protection**: Birth dates stored encrypted, GDPR compliant

### Rate Limiting

```typescript
// Redis-based rate limiting
const rateLimiter = rateLimit({
  store: new RedisStore({ client: redis }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req) => {
    // Tier-based limits
    switch (req.user?.subscriptionTier) {
      case 'pro': return 1000
      case 'basic': return 200
      case 'free': return 50
      default: return 10
    }
  }
})
```

## Monitoring & Observability

### Logging
- **Application Logs**: Winston (Node.js), Python logging
- **Centralized**: Datadog / New Relic
- **Levels**: ERROR, WARN, INFO, DEBUG
- **Structured**: JSON format with request IDs

### Metrics
- **API**: Request rate, latency, error rate
- **ML Engine**: Prediction processing time, agent performance
- **Database**: Query performance, connection pool
- **Queue**: Job processing time, queue depth

### Alerting
- API error rate > 5%
- Database connection pool exhausted
- Queue depth > 1000 jobs
- ML Engine timeout > 30 seconds
- Payment processing failures

### Tracing
- **Tool**: OpenTelemetry
- **Spans**: Request → API → ML Engine → Database
- **Visualization**: Jaeger / Datadog APM

## Disaster Recovery

### Backup Strategy
- **Database**: Daily full backups, hourly incremental
- **Retention**: 30 days
- **Storage**: Separate region
- **Testing**: Monthly restore drills

### High Availability
- **Database**: Multi-AZ deployment, automatic failover
- **API**: Multi-region deployment
- **Redis**: Cluster mode with replication

### Incident Response
1. Detection (monitoring alerts)
2. Assessment (severity level)
3. Mitigation (rollback, scale, failover)
4. Communication (status page)
5. Post-mortem (root cause analysis)

## Deployment Architecture

### Environments
- **Development**: Local development
- **Staging**: Production-like for testing
- **Production**: Live system

### CI/CD Pipeline

```yaml
# GitHub Actions workflow
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    - Run linting
    - Run unit tests
    - Run integration tests

  build:
    - Build web app (Next.js)
    - Build mobile app (Expo)
    - Build API (Docker)
    - Build ML engine (Docker)

  deploy:
    - Deploy web to Vercel
    - Deploy API to Railway
    - Deploy ML engine to Railway
    - Run database migrations
    - Invalidate CDN cache
    - Run smoke tests
```

### Infrastructure as Code
- **Tool**: Terraform / Pulumi
- **Resources**: Database, Redis, load balancer, DNS
- **Version Control**: Git repository
- **Review**: PR-based changes

## Cost Optimization

### Estimated Monthly Costs (1000 active users)

```
Infrastructure:
- Vercel (web): $20
- Railway/Render (API + ML): $100
- Supabase/Neon (Postgres): $50
- Upstash (Redis): $30
- Pinecone (vector DB): $70
Total Infrastructure: $270

AI/ML:
- Anthropic Claude API: ~$500 (2000 predictions/month)
- OpenAI embeddings: ~$50
Total AI/ML: $550

External Services:
- RevenueCat: $0 (free tier)
- Blockchain RPC: $0 (public endpoints)
Total External: $0

TOTAL: ~$820/month
```

### Cost Optimization Strategies
- Cache LLM responses for similar queries
- Use smaller models (Haiku) for simple tasks
- Batch processing for non-urgent predictions
- Precompute macro predictions monthly
- Use free blockchain RPC endpoints

## Future Enhancements

### Phase 2 Features
- Real-time alerts (push notifications)
- Social features (share predictions)
- Prediction marketplace (user-generated)
- Mobile widget (iOS home screen)

### Technical Improvements
- GraphQL API (Apollo Server)
- Microservices migration (one service per domain)
- Event-driven architecture (Kafka/RabbitMQ)
- Edge computing (Cloudflare Workers)
- ML model fine-tuning (custom astrology models)

---

**Document Version**: 1.0
**Last Updated**: 2025-12-10
**Maintained By**: Engineering Team

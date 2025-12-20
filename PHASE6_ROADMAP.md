# Phase 6 Roadmap: User-Asset Matching System

**Duration**: 3 weeks
**Start Date**: Week 15
**End Date**: Week 17
**Status**: Planning

---

## Executive Summary

Phase 6 implements a personalized compatibility matching system that analyzes astrological harmony between users and financial assets. This creates a "best assets for you" experience based on Five Elements theory and planetary compatibility.

**Key Deliverables**:
- Compatibility algorithm (element + planet scoring)
- PersonalizationAgent (AI-powered recommendations)
- Personalized dashboard UI
- Batch processing system with caching
- Support for 50-100+ assets

---

## Week-by-Week Breakdown

### Week 1: Backend Foundation (Days 1-7)

#### Backend Tasks

**Day 1-2: Compatibility Algorithm Core**
- [ ] Implement `CompatibilityCalculator` class
  - Element harmony scoring (Five Elements theory)
  - Planet compatibility matrix
  - Combined scoring formula (1-10 scale)
  - Reasoning generator
- [ ] Create unit tests for algorithm
- [ ] Test against example personas

**Day 3-4: PersonalizationAgent Implementation**
- [ ] Create PersonalizationAgent in ML engine
- [ ] Implement profile analysis system prompts
- [ ] Build recommendation explanation generator
- [ ] Add context-aware reasoning
- [ ] Test agent responses

**Day 5-6: Batch Processing System**
- [ ] Create `CompatibilityBatchProcessor` service
- [ ] Implement async job queue (BullMQ)
- [ ] Add Redis caching layer
- [ ] Create invalidation logic (on profile update)
- [ ] Set up background worker

**Day 7: API Endpoints**
- [ ] `GET /api/personalization/top-assets` - Top 10 compatible assets
- [ ] `GET /api/personalization/compatibility/:assetId` - Single asset score
- [ ] `POST /api/personalization/recalculate` - Force recalculation
- [ ] `GET /api/personalization/filters` - Filter by asset type/element
- [ ] Add authentication middleware
- [ ] Write integration tests

**Deliverables**:
- ✅ Compatibility algorithm working
- ✅ PersonalizationAgent operational
- ✅ Batch processor with caching
- ✅ API endpoints deployed

---

### Week 2: Frontend Dashboard (Days 8-14)

#### Frontend Tasks

**Day 8-9: Dashboard Layout**
- [ ] Create `PersonalizedDashboard` component
- [ ] Design "Best Assets For You" section
- [ ] Add filter controls (asset type, element, score range)
- [ ] Implement responsive layout
- [ ] Add skeleton loaders

**Day 10-11: Asset Card Components**
- [ ] Create `CompatibilityAssetCard` component
  - Compatibility score gauge (1-10)
  - Element symbols/icons
  - Color coding by harmony level
  - Reasoning snippet (expandable)
- [ ] Add `AssetElementBadge` component
- [ ] Create `CompatibilityGauge` visualization
- [ ] Implement expand/collapse for full reasoning

**Day 12-13: Interactive Features**
- [ ] Filter by asset class dropdown
- [ ] Filter by element chips
- [ ] Sort by compatibility score
- [ ] Search by asset name/symbol
- [ ] Pagination (10 per page)
- [ ] Loading states and error handling

**Day 14: Animations & Polish**
- [ ] Framer Motion card entrance animations
- [ ] Gauge fill animations
- [ ] Smooth filter transitions
- [ ] Hover effects and micro-interactions
- [ ] Mobile responsive polish

**Deliverables**:
- ✅ Personalized dashboard live
- ✅ Asset cards with scores
- ✅ Filter/sort/search working
- ✅ Animations smooth and delightful

---

### Week 3: Integration & Testing (Days 15-21)

#### Integration Tasks

**Day 15-16: End-to-End Integration**
- [ ] Connect frontend to API endpoints
- [ ] Implement optimistic updates
- [ ] Add real-time cache updates
- [ ] Test profile change flow
  - User updates birth info
  - Compatibility recalculates
  - Dashboard refreshes
- [ ] Handle edge cases (no birth info, no compatible assets)

**Day 17-18: Performance Optimization**
- [ ] Profile batch calculation performance
  - Target: <2 seconds for 100 assets
  - Optimize database queries
  - Add database indexes
- [ ] Implement Redis caching strategy
  - Cache TTL: 24 hours
  - Invalidate on profile update
  - LRU eviction policy
- [ ] Frontend performance
  - Lazy load asset cards
  - Virtualized scrolling for long lists
  - Bundle size optimization

**Day 19: Testing & QA**
- [ ] Unit tests (backend)
  - Algorithm correctness
  - Edge cases (missing data, invalid elements)
- [ ] Integration tests
  - API endpoints
  - Batch processor
  - Cache invalidation
- [ ] E2E tests (frontend)
  - Dashboard load
  - Filter interactions
  - Asset card expansion
- [ ] Manual QA testing

**Day 20: Documentation**
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Algorithm documentation
- [ ] Code comments and JSDoc
- [ ] User-facing help content
- [ ] Admin documentation (cache management)

**Day 21: Launch Preparation**
- [ ] Deploy to staging
- [ ] Load testing (1000+ users)
- [ ] Monitoring setup (Datadog/Sentry)
- [ ] Feature flag configuration
- [ ] Soft launch to beta users

**Deliverables**:
- ✅ Full integration working
- ✅ Performance targets met
- ✅ All tests passing
- ✅ Documentation complete
- ✅ Ready for production

---

## Technical Requirements

### Backend

**Dependencies**:
```json
{
  "bullmq": "^4.x",
  "ioredis": "^5.x",
  "@anthropic-ai/sdk": "^0.9.x"
}
```

**New Files**:
- `/apps/api/src/services/compatibility.service.ts` - Core algorithm
- `/apps/api/src/services/personalization-agent.service.ts` - AI agent
- `/apps/api/src/services/batch-processor.service.ts` - Background jobs
- `/apps/api/src/routes/personalization.routes.ts` - API routes
- `/apps/api/src/utils/element-harmony.ts` - Five Elements logic
- `/apps/api/src/utils/planet-compatibility.ts` - Planet matrix

**Environment Variables**:
```bash
REDIS_URL=redis://localhost:6379
COMPATIBILITY_CACHE_TTL=86400  # 24 hours
BATCH_JOB_CONCURRENCY=5
```

### Frontend

**Dependencies**:
```json
{
  "framer-motion": "^11.x",
  "react-virtualized-auto-sizer": "^1.x"
}
```

**New Components**:
- `/apps/web/src/components/PersonalizedDashboard.tsx`
- `/apps/web/src/components/CompatibilityAssetCard.tsx`
- `/apps/web/src/components/CompatibilityGauge.tsx`
- `/apps/web/src/components/AssetElementBadge.tsx`
- `/apps/web/src/components/ElementFilterChips.tsx`
- `/apps/web/src/hooks/usePersonalization.ts`

---

## API Specification

### GET /api/personalization/top-assets

**Description**: Get top 10 most compatible assets for current user

**Authentication**: Required (JWT)

**Query Parameters**:
- `limit` (optional, default: 10): Number of assets to return
- `assetType` (optional): Filter by type (crypto, stock, rwa)
- `minScore` (optional): Minimum compatibility score (1-10)

**Response**:
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "calculatedAt": "2025-12-20T00:00:00Z",
    "cached": true,
    "assets": [
      {
        "assetId": "uuid",
        "symbol": "SOL",
        "name": "Solana",
        "assetType": "crypto",
        "compatibilityScore": 9,
        "elementScore": 10,
        "planetScore": 8,
        "elementHarmony": {
          "userFavorableElements": ["fire", "earth"],
          "assetPrimaryElement": "fire",
          "harmonyType": "productive",
          "strength": "very_strong"
        },
        "reasoning": "Solana's fire element (speed, energy) harmonizes perfectly with your favorable fire element...",
        "whyGoodForUser": "Your fire-dominant chart loves fast-moving, energetic assets...",
        "bestEntryPeriods": ["2025-Q2", "2025-Q4"]
      }
    ],
    "totalCompatibleAssets": 47
  }
}
```

### GET /api/personalization/compatibility/:assetId

**Description**: Get detailed compatibility analysis for specific asset

**Authentication**: Required (JWT)

**Path Parameters**:
- `assetId`: UUID of asset

**Response**:
```json
{
  "success": true,
  "data": {
    "assetId": "uuid",
    "symbol": "BTC",
    "compatibilityScore": 7,
    "elementCompatibilityScore": 8,
    "planetaryCompatibilityScore": 6,
    "detailed": {
      "elementHarmony": { /* detailed element analysis */ },
      "planetaryHarmony": { /* detailed planet analysis */ },
      "favorableAspects": [],
      "challengingAspects": []
    },
    "reasoning": "Full detailed reasoning...",
    "tips": "Consider entering during Earth periods for stability...",
    "calculatedAt": "2025-12-20T00:00:00Z"
  }
}
```

### POST /api/personalization/recalculate

**Description**: Force recalculation of compatibility (after profile update)

**Authentication**: Required (JWT)

**Response**:
```json
{
  "success": true,
  "data": {
    "jobId": "uuid",
    "status": "queued",
    "estimatedCompletionTime": "2025-12-20T00:01:00Z"
  }
}
```

---

## Success Criteria

### Performance Metrics

- [ ] **Calculation Speed**: Batch processing 100 assets in <2 seconds
- [ ] **API Response Time**: Top assets endpoint <300ms (p95)
- [ ] **Cache Hit Rate**: >90% for repeated requests
- [ ] **Database Query Time**: Compatibility fetch <50ms

### Quality Metrics

- [ ] **Algorithm Accuracy**: Makes astrological sense (peer review)
- [ ] **Test Coverage**: >80% for compatibility logic
- [ ] **Zero Breaking Changes**: All existing features still work
- [ ] **Mobile Responsive**: Dashboard works on all screen sizes

### User Experience

- [ ] **Personalization Feel**: Dashboard feels unique to each user
- [ ] **Clear Reasoning**: Users understand why assets match
- [ ] **Visual Delight**: Animations are smooth and purposeful
- [ ] **Actionable Insights**: Users can act on recommendations

### Business Metrics

- [ ] **Engagement**: 60%+ of users view personalized dashboard
- [ ] **Retention**: 15%+ increase in D7 retention
- [ ] **Feature Satisfaction**: >4/5 user rating
- [ ] **Performance**: No increase in server costs

---

## Risk Mitigation

### Technical Risks

**Risk**: Batch processing is too slow
- **Mitigation**: Parallel processing, optimize algorithm, add more workers
- **Fallback**: Calculate on-demand for top 20 assets only

**Risk**: Cache invalidation bugs
- **Mitigation**: Comprehensive tests, manual QA, feature flag rollout
- **Fallback**: Disable caching, calculate real-time

**Risk**: AI agent costs too high
- **Mitigation**: Cache agent responses, batch API calls, use smaller model
- **Fallback**: Use template-based reasoning instead of AI

### Product Risks

**Risk**: Algorithm recommendations don't feel accurate
- **Mitigation**: Peer review with astrology consultant, user testing
- **Fallback**: Allow manual asset favorites

**Risk**: Users don't understand compatibility scores
- **Mitigation**: Clear tooltips, onboarding tutorial, help docs
- **Fallback**: Simplify to "High/Medium/Low" labels

**Risk**: Low engagement with dashboard
- **Mitigation**: Prominent placement, onboarding flow, email alerts
- **Fallback**: Integrate into existing prediction flows

---

## Testing Strategy

### Unit Tests

```typescript
describe('CompatibilityCalculator', () => {
  test('should give max score for productive element cycle', () => {
    // Wood produces Fire
    const score = calculateElementScore('wood', 'fire', ['fire']);
    expect(score).toBeGreaterThanOrEqual(8);
  });

  test('should give low score for destructive cycle', () => {
    // Water destroys Fire
    const score = calculateElementScore('water', 'fire', ['fire']);
    expect(score).toBeLessThanOrEqual(3);
  });

  test('should handle missing user profile gracefully', () => {
    const result = calculateCompatibility(null, assetProfile);
    expect(result).toHaveProperty('error');
  });
});
```

### Integration Tests

```typescript
describe('Personalization API', () => {
  test('GET /api/personalization/top-assets returns sorted list', async () => {
    const response = await request(app)
      .get('/api/personalization/top-assets')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(response.body.data.assets).toHaveLength(10);
    expect(response.body.data.assets[0].compatibilityScore).toBeGreaterThanOrEqual(
      response.body.data.assets[9].compatibilityScore
    );
  });

  test('should recalculate after profile update', async () => {
    // Update birth info
    await request(app)
      .put('/api/birth-chart/update')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ birthDate: '1990-05-15' });

    // Check compatibility recalculated
    const response = await request(app)
      .get('/api/personalization/top-assets')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(response.body.data.cached).toBe(false);
  });
});
```

### E2E Tests

```typescript
test('User can view and filter personalized dashboard', async ({ page }) => {
  await page.goto('/dashboard/personalized');

  // Wait for assets to load
  await page.waitForSelector('[data-testid="asset-card"]');

  // Check asset cards are visible
  const cards = await page.$$('[data-testid="asset-card"]');
  expect(cards.length).toBeGreaterThan(0);

  // Filter by crypto
  await page.click('[data-testid="filter-crypto"]');
  await page.waitForTimeout(500);

  // Check only crypto assets shown
  const cryptoCards = await page.$$('[data-testid="asset-card"][data-type="crypto"]');
  expect(cryptoCards.length).toBeGreaterThan(0);
});
```

---

## Deployment Plan

### Phase 1: Staging (Day 15-17)
- Deploy to staging environment
- Internal team testing
- Fix critical bugs

### Phase 2: Beta (Day 18-19)
- Enable for 10% of users via feature flag
- Monitor metrics and errors
- Collect user feedback

### Phase 3: Gradual Rollout (Day 20-21)
- 25% → 50% → 75% → 100% rollout
- Monitor server load and errors
- Be ready to rollback if issues

### Phase 4: Full Launch (Day 21+)
- 100% of users
- Marketing announcement
- Monitor engagement metrics

---

## Post-Launch Iteration

### Week 4+ Improvements

**High Priority**:
- [ ] Add "Why this score?" tooltip explanations
- [ ] Email alerts for new highly compatible assets
- [ ] Comparison view (compare 2-3 assets)
- [ ] Historical compatibility tracking

**Medium Priority**:
- [ ] Export compatibility report (PDF)
- [ ] Share favorite assets with friends
- [ ] Asset watchlist with compatibility alerts
- [ ] Mobile app integration

**Low Priority**:
- [ ] Machine learning to improve algorithm
- [ ] A/B test different scoring formulas
- [ ] User feedback on accuracy
- [ ] Integration with Polymarket for compatible events

---

## Team Roles & Responsibilities

**Backend Engineer**:
- Compatibility algorithm
- PersonalizationAgent integration
- Batch processor & caching
- API endpoints

**Frontend Engineer**:
- Dashboard UI components
- Filter/sort/search logic
- Animations and interactions
- Mobile responsive

**Full-Stack Engineer**:
- E2E integration testing
- Performance optimization
- Deployment & monitoring
- Bug fixes

**Product Manager**:
- Feature prioritization
- User testing coordination
- Success metrics tracking
- Stakeholder communication

**Designer** (Part-time):
- Compatibility gauge designs
- Element icon system
- Dashboard layout review
- Mobile UX polish

---

## Dependencies

**Blocked By**:
- ✅ Phase 1: Authentication (Complete)
- ✅ Phase 2: Birth chart engine (Complete)
- ✅ User astrological profiles exist in database
- ✅ Asset birth charts populated (minimum 50 assets)

**Blocking**:
- Phase 7: Polymarket integration (can use compatibility data)
- Phase 10: Mobile app (needs API endpoints)

---

## Rollback Plan

If critical issues arise post-launch:

1. **Feature Flag Disable**: Turn off dashboard via LaunchDarkly
2. **Cache Clear**: Clear Redis cache if corrupt data
3. **API Fallback**: Return empty/mock data instead of errors
4. **Database Rollback**: Restore UserAssetCompatibility table
5. **Code Revert**: Git revert to pre-Phase 6 commit

**Monitoring Alerts**:
- Error rate >1%
- API response time >1s (p95)
- Cache miss rate >50%
- Batch job failures

---

## Success Definition

Phase 6 is successful when:

✅ **Functional**: All users can view personalized compatible assets
✅ **Performant**: Dashboard loads in <2 seconds, smooth interactions
✅ **Accurate**: Algorithm makes astrological sense (validated)
✅ **Engaging**: 60%+ users visit dashboard, avg 2+ minutes
✅ **Stable**: <0.1% error rate, 99.9% uptime
✅ **Scalable**: Handles 10,000+ users without degradation

**Launch Date Target**: End of Week 17 (Day 21)

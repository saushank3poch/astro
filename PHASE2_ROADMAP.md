# Phase 2 Roadmap: Birth Chart Engine
**Duration:** Weeks 4-6 (3 weeks)
**Status:** Ready to Begin
**Phase 1 Complete:** ✅ Authentication, Database, Basic UI

---

## 🎯 Phase 2 Objectives

Build the core astrological calculation engine that:
1. ✅ Calculates user birth charts (Chinese + Western)
2. ✅ Calculates asset birth charts (Chinese + Western)
3. ✅ Stores astrological profiles in database
4. ✅ Provides APIs for birth chart retrieval
5. ✅ Displays birth charts in the UI
6. ✅ Completes asset birth date research for top 50 assets

**Success Criteria:**
- Users can view their complete astrological profile after signup
- We have 50+ researched asset birth charts in the database
- Birth chart data is accurately calculated and stored
- Foundation ready for Phase 3 (Prediction Engine)

---

## 📋 What We Already Have (Phase 1)

**Database Schema:**
- ✅ `users` table with birth_date, birth_time, birth_location, birth_timezone
- ✅ `user_astrological_profiles` table (empty, ready for data)
- ✅ `assets` table with birth date fields (empty, ready for data)

**Frontend:**
- ✅ Signup form collecting: birthDate, birthTime, birthCity, birthCountry
- ✅ UI component library (Button, Input, Card, etc.)
- ✅ Dashboard page (empty, ready for profile display)

**Backend:**
- ✅ Auth service and routes
- ✅ Database connection
- ✅ User creation flow (but NOT calculating astrology yet)

**Packages:**
- ✅ `packages/astro-core/` directory (empty, ready for calculation libraries)
- ✅ `packages/database/` with schema

---

## 🚀 Week 4: Chinese Astrology Calculator

### Backend Tasks

**1. Chinese Astrology Calculation Library**
*Package: `packages/astro-core/chinese/`*
*Owner: Backend Developer*
*Priority: CRITICAL PATH*

Create the following modules:

**`packages/astro-core/chinese/zodiac.ts`**
- Function: `calculateChineseZodiac(birthDate: Date): ChineseZodiac`
- Returns: 'rat' | 'ox' | 'tiger' | 'rabbit' | 'dragon' | 'snake' | 'horse' | 'goat' | 'monkey' | 'rooster' | 'dog' | 'pig'
- Logic: Based on lunar year (1924 = Rat, cycles every 12 years)
- Dependency: Need lunar calendar conversion library

**`packages/astro-core/chinese/bazi.ts`**
- Function: `calculateBazi(birthDate: Date, birthTime: string, timezone: string): BaziChart`
- Returns: Four Pillars (Year, Month, Day, Hour) with Heavenly Stems and Earthly Branches
- Logic:
  - Year Pillar: Based on lunar year
  - Month Pillar: Based on lunar month
  - Day Pillar: Based on solar calendar cycle
  - Hour Pillar: Based on birth time
- Output Structure:
```typescript
interface BaziChart {
  year: { stem: string; branch: string; element: string };
  month: { stem: string; branch: string; element: string };
  day: { stem: string; branch: string; element: string };
  hour: { stem: string; branch: string; element: string };
}
```

**`packages/astro-core/chinese/elements.ts`**
- Function: `extractFavorableElements(baziChart: BaziChart): FavorableElements`
- Logic: Analyze Day Master (Day Stem) and determine which elements support it
- Returns: `{ primary: 'earth', secondary: 'fire', tertiary: 'metal' }`
- Note: This is complex - may need consultation with astrologer or use established algorithm

**`packages/astro-core/chinese/lucky-numbers.ts`**
- Function: `calculateLuckyNumbers(baziChart: BaziChart): number[]`
- Logic: Based on favorable elements and birth data
- Returns: Array of 6-8 lucky numbers

**External Library Decision:**
- **RECOMMENDED**: `lunar-javascript` or `chinese-lunar` npm package for lunar calendar conversion
- **License Check**: Ensure MIT/Apache 2.0 compatible
- **Fallback**: Implement own lunar calendar lookup table (1900-2100)

**2. Chinese Astrology API Endpoint**
*File: `apps/api/src/routes/astrology.routes.ts`*
*Owner: Backend Developer*

```typescript
POST /api/v1/astrology/calculate-chinese
Body: { birthDate, birthTime, timezone }
Response: { chineseZodiac, baziChart, favorableElements, luckyNumbers }

GET /api/v1/astrology/profile/:userId
Response: { chinese: {...}, western: {...} }
```

**3. Update User Registration Flow**
*File: `apps/api/src/services/auth.service.ts`*
*Owner: Backend Developer*

Modify `registerUser()` to:
1. Create user in database
2. Call Chinese astrology calculator
3. Store results in `user_astrological_profiles` table
4. Return user + astrological profile

**4. Asset Chinese Astrology Calculation**
*File: `apps/api/src/services/astrology.service.ts`*
*Owner: Backend Developer*

```typescript
calculateAssetChineseProfile(asset: Asset): ChineseAstrologyProfile
```
- Same logic as user profiles
- Will be used in asset seeding (Week 6)

### Frontend Tasks

**5. User Profile Display - Chinese Section**
*File: `apps/web/app/profile/page.tsx`*
*Owner: Frontend Developer*

Components to create:
- `<ChineseZodiacDisplay>` - Show zodiac animal with image/icon
- `<BaziChart>` - Display Four Pillars in traditional format
- `<ElementsDisplay>` - Show favorable/unfavorable elements with colors
- `<LuckyNumbersDisplay>` - Display lucky numbers

Design notes:
- Use cosmic theme with Chinese aesthetic
- Zodiac animal illustrations
- Element colors: Wood (green), Fire (red), Earth (yellow), Metal (white), Water (blue)

**6. Profile API Integration**
*File: `apps/web/app/profile/page.tsx`*
*Owner: Frontend Developer*

- Fetch user's astrological profile on page load
- Loading states with cosmic animations
- Error handling

### Testing & Validation

**7. Unit Tests for Chinese Calculations**
*File: `packages/astro-core/chinese/__tests__/`*
*Owner: Backend Developer*

Test cases:
- Known birth dates → Expected zodiac animals
- Bazi calculation accuracy (compare with online calculators)
- Edge cases: leap years, timezone conversions

**8. Manual Validation**
- Test with 5-10 real birth dates
- Compare results with professional Bazi calculators online
- Document any discrepancies

### Week 4 Deliverables

✅ Chinese astrology calculation library (zodiac, bazi, elements, lucky numbers)
✅ API endpoints for Chinese astrology
✅ User registration automatically calculates Chinese profile
✅ Profile page displays Chinese astrology data
✅ Unit tests with 80%+ coverage

---

## 🔭 Week 5: Western Astrology Calculator

### Backend Tasks

**1. Western Astrology Calculation Library**
*Package: `packages/astro-core/western/`*
*Owner: Backend Developer*
*Priority: CRITICAL PATH*

**LIBRARY DECISION - CRITICAL:**

**Option A: Swiss Ephemeris (RECOMMENDED)**
- **Library**: `swisseph` npm package (node-swisseph)
- **Pros**: Industry standard, highly accurate, comprehensive
- **Cons**: Native C bindings (needs compilation), larger bundle
- **License**: AGPL/GPL (⚠️ May require commercial license for closed-source)
- **Alternative License**: Dual-licensed, can purchase commercial license

**Option B: Astronomia**
- **Library**: `astronomia` npm package
- **Pros**: Pure JavaScript, MIT license, lightweight
- **Cons**: Less accurate, limited features
- **License**: MIT ✅

**Option C: External API**
- **Service**: AstroSeek API, Astro-Charts API
- **Pros**: No calculation complexity, always up-to-date
- **Cons**: API costs, rate limits, dependency on external service
- **Cost**: ~$0.01-0.05 per calculation

**DECISION NEEDED:**
- For MVP: Use **Astronomia** (pure JS, MIT license, good enough accuracy)
- For production: Evaluate Swiss Ephemeris commercial license or API service
- User input required before proceeding with Week 5

**Assuming Astronomia for MVP:**

**`packages/astro-core/western/zodiac.ts`**
```typescript
calculateSunSign(birthDate: Date): ZodiacSign
calculateMoonSign(birthDate: Date, birthTime: string, location: LatLng): ZodiacSign
calculateRisingSign(birthDate: Date, birthTime: string, location: LatLng): ZodiacSign
```

**`packages/astro-core/western/planets.ts`**
```typescript
calculatePlanetaryPositions(birthDate: Date, birthTime: string): PlanetaryPositions

interface PlanetaryPositions {
  sun: { sign: string; degree: number; house: number };
  moon: { sign: string; degree: number; house: number };
  mercury: { sign: string; degree: number; house: number };
  venus: { sign: string; degree: number; house: number };
  mars: { sign: string; degree: number; house: number };
  jupiter: { sign: string; degree: number; house: number };
  saturn: { sign: string; degree: number; house: number };
  uranus: { sign: string; degree: number; house: number };
  neptune: { sign: string; degree: number; house: number };
  pluto: { sign: string; degree: number; house: number };
}
```

**`packages/astro-core/western/houses.ts`**
```typescript
calculateHouses(birthDate: Date, birthTime: string, location: LatLng): Houses
// Using Placidus house system (most common)
```

**`packages/astro-core/western/aspects.ts`**
```typescript
findAspects(planets: PlanetaryPositions): Aspect[]

interface Aspect {
  planet1: string;
  planet2: string;
  type: 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile';
  angle: number;
  orb: number;
}
```

**2. Geocoding Service**
*File: `apps/api/src/services/geocoding.service.ts`*
*Owner: Backend Developer*

Currently, signup sends `lat: 0, lng: 0` - we need actual coordinates.

**Options:**
- **Free**: Nominatim (OpenStreetMap) - rate limited but free
- **Paid**: Google Geocoding API (~$5 per 1000 requests)
- **Hybrid**: Cache common cities, use API for rare locations

Implement:
```typescript
async geocodeCity(city: string, country: string): Promise<{ lat: number; lng: number }>
```

Store results in database or cache to avoid repeated API calls.

**3. Western Astrology API Endpoint**
*File: `apps/api/src/routes/astrology.routes.ts`*
*Owner: Backend Developer*

```typescript
POST /api/v1/astrology/calculate-western
Body: { birthDate, birthTime, location: {lat, lng} }
Response: { sunSign, moonSign, risingSign, birthChart, planets, houses, aspects }
```

**4. Update User Registration Flow**
*File: `apps/api/src/services/auth.service.ts`*
*Owner: Backend Developer*

Modify `registerUser()` to also:
1. Geocode birth city/country → lat/lng
2. Call Western astrology calculator
3. Store results in `user_astrological_profiles`
4. Update user's birth_location with correct coordinates

**5. Asset Western Astrology Calculation**
*File: `apps/api/src/services/astrology.service.ts`*
*Owner: Backend Developer*

```typescript
calculateAssetWesternProfile(asset: Asset): WesternAstrologyProfile
```

### Frontend Tasks

**6. User Profile Display - Western Section**
*File: `apps/web/app/profile/page.tsx`*
*Owner: Frontend Developer*

Components to create:
- `<ZodiacSignsDisplay>` - Sun/Moon/Rising signs with icons
- `<NatalChartWheel>` - Visual birth chart (circular diagram)
  - Option A: Use Chart.js with custom rendering
  - Option B: Use SVG with manual drawing
  - Option C: Pre-rendered images based on data
- `<PlanetaryPositionsTable>` - Table of all planets with signs/houses
- `<AspectsDisplay>` - Major aspects between planets

**Complexity Note:** Natal chart wheel is complex - consider MVP without it first, just show data in table format. Add visualization in later phase.

**7. Profile Page Polish**
*File: `apps/web/app/profile/page.tsx`*
*Owner: Frontend Developer*

- Tabs for Chinese vs Western astrology
- Responsive design (mobile + desktop)
- Loading states
- Share profile feature (optional)

### Testing & Validation

**8. Western Calculation Validation**
*Owner: Backend Developer*

- Compare with Astro.com, AstroSeek.com for known birth data
- Test edge cases: southern hemisphere, different timezones
- Verify house calculations

### Week 5 Deliverables

✅ Western astrology calculation library (signs, planets, houses, aspects)
✅ Geocoding service for birth location
✅ API endpoints for Western astrology
✅ User registration calculates Western profile
✅ Profile page displays Western astrology data
✅ Complete astrological profile (Chinese + Western) for all users

**⚠️ BLOCKER:** Library licensing decision needed (see above)

---

## 📊 Week 6: Asset Birth Date Research & Data Population

### Research Tasks

**1. Asset Birth Date Research**
*Owner: Backend Developer + Research Assistant*
*Priority: HIGH*

**Target: 50 Crypto Assets + 50 Stocks = 100 Total**

Research process (see ASSET_RESEARCH_TEMPLATE.md):
1. Identify asset
2. Find official birth date (IPO, token launch, genesis block, etc.)
3. Determine confidence level (high/medium/low)
4. Document source
5. Find birth time if available (often not available for crypto)
6. Determine birth location (exchange, company HQ, etc.)

**Asset Selection Criteria:**
- **Crypto**: Top 50 by market cap from CoinGecko
  - Must include: BTC, ETH, SOL, BNB, XRP, ADA, DOGE, MATIC, DOT, AVAX
  - Include category diversity: Layer1, Layer2, DeFi, RWA, Meme, AI
- **Stocks**: Top 50 US stocks by market cap
  - Must include: AAPL, MSFT, GOOGL, AMZN, NVDA, META, TSLA, etc.
  - Include category diversity: Tech, Finance, Healthcare, Consumer, Energy

**Time Estimate:** 2-3 hours per 10 assets = 20-30 hours total

**2. Asset Data Entry**
*File: `apps/api/src/scripts/seed-assets.ts`*
*Owner: Backend Developer*

Create seed script:
```typescript
const ASSETS = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    asset_type: 'crypto',
    category: 'Layer1',
    birth_date: '2009-01-03',
    birth_time: '18:15:05',
    birth_location: { lat: 0, lng: 0, city: 'Unknown', country: 'Global' },
    birth_date_source: 'Genesis Block Timestamp',
    birth_date_confidence: 'high',
    alternative_birth_dates: [
      { date: '2008-10-31', source: 'Whitepaper Release', confidence: 'medium' }
    ]
  },
  // ... 99 more assets
];

async function seedAssets() {
  for (const asset of ASSETS) {
    // Insert into database
    // Calculate Chinese astrology
    // Calculate Western astrology (if time/location available)
    // Store in assets + calculate element assignments
  }
}
```

**3. Element Assignment Logic**
*File: `packages/astro-core/classification/asset-elements.ts`*
*Owner: Backend Developer*

For assets without precise birth time/location, use categorical element mapping:

```typescript
const CATEGORY_ELEMENTS = {
  // Crypto categories
  'Layer1': { primary: 'fire', secondary: 'metal' }, // Foundation, hot
  'Layer2': { primary: 'water', secondary: 'earth' }, // Flow, supporting
  'DeFi': { primary: 'water', secondary: 'metal' }, // Liquid, currency
  'RWA': { primary: 'earth', secondary: 'metal' }, // Real assets, solid
  'Meme': { primary: 'fire', secondary: 'water' }, // Hot, volatile
  'AI': { primary: 'metal', secondary: 'fire' }, // Technology, energy

  // Stock categories
  'Tech': { primary: 'fire', secondary: 'metal' },
  'Finance': { primary: 'water', secondary: 'metal' },
  'Healthcare': { primary: 'earth', secondary: 'water' },
  'Consumer': { primary: 'earth', secondary: 'fire' },
  'Energy': { primary: 'fire', secondary: 'earth' }
};
```

If we have accurate birth chart → use actual elements from chart
If no birth chart → use category-based assignment
Store reasoning in `element_reasoning` field

### Backend Tasks

**4. Asset Management API**
*File: `apps/api/src/routes/assets.routes.ts`*
*Owner: Backend Developer*

```typescript
GET /api/v1/assets
Query: ?type=crypto&category=DeFi&limit=20
Response: List of assets with basic info

GET /api/v1/assets/:symbol
Response: Full asset profile including astrological data

GET /api/v1/assets/:symbol/birth-chart
Response: Detailed birth chart visualization data

POST /api/v1/assets (admin only)
Body: Asset data
Response: Created asset with calculated astrology
```

**5. Admin Asset Management UI** (Optional for Week 6)
*File: `apps/web/app/admin/assets/page.tsx`*
*Owner: Frontend Developer*

Simple CRUD interface:
- List all assets
- Add new asset
- Edit asset birth data
- Recalculate astrology
- Mark as researched

### Frontend Tasks

**6. Asset Directory Page**
*File: `apps/web/app/assets/page.tsx`*
*Owner: Frontend Developer*

Features:
- Search assets by symbol or name
- Filter by type (crypto/stock)
- Filter by category
- Display list with basic info
- Click to view detailed asset page

**7. Asset Detail Page**
*File: `apps/web/app/assets/[symbol]/page.tsx`*
*Owner: Frontend Developer*

Display:
- Asset basic info (name, symbol, type, category)
- Birth date and source
- Confidence level indicator
- Chinese astrology profile
- Western astrology profile (if available)
- Element assignments with reasoning

**8. Asset Search Component**
*File: `apps/web/components/AssetSearch.tsx`*
*Owner: Frontend Developer*

Autocomplete search component (will be reused in Phase 3 for predictions)

### Testing & Validation

**9. Data Quality Review**
*Owner: Backend Developer + QA*

- Verify all 100 assets have entries
- Check birth date accuracy (spot check 20 assets)
- Verify astrological calculations
- Test API endpoints
- Review UI display

### Week 6 Deliverables

✅ 100 researched assets in database (50 crypto + 50 stocks)
✅ All assets have Chinese astrology profiles
✅ Assets with accurate birth data have Western profiles
✅ Category-based element assignments for incomplete data
✅ Asset management APIs
✅ Asset directory and detail pages
✅ Asset search functionality

---

## 🔄 Dependencies & Critical Path

```
Week 4: Chinese Astrology
  ↓ (Can start Week 5 in parallel after day 2-3)
Week 5: Western Astrology
  ↓ (Can start Week 6 research immediately)
Week 6: Asset Research & Population
```

**Parallel Work Opportunities:**
- Frontend can start on UI mockups immediately
- Asset research can begin Week 4 (doesn't need calculators)
- Western astrology can start after Chinese library structure is established

**Critical Blockers:**
1. ⚠️ **Week 5**: Ephemeris library licensing decision (see Week 5)
2. ⚠️ **Week 4**: Lunar calendar library selection
3. ⚠️ **Week 6**: Asset research time (20-30 hours)

---

## 📚 External Libraries & APIs

### Required Libraries

**Chinese Astrology:**
- `lunar-javascript` or `chinese-lunar` (lunar calendar)
- License: MIT ✅
- Backup: Custom lookup table

**Western Astrology:**
- **MVP**: `astronomia` (pure JS, less accurate)
  - License: MIT ✅
  - Cost: Free
- **Production**: `swisseph` or Astro API
  - License: AGPL (needs commercial license) or API costs
  - Cost: TBD (commercial license ~$500-1000 one-time OR API ~$0.01/calc)

**Geocoding:**
- **Free Tier**: Nominatim (OpenStreetMap)
  - Limit: 1 request/second
  - Cost: Free with attribution
- **Paid Option**: Google Geocoding API
  - Limit: 40,000 requests/month free, then $5/1000
  - Cost: Free for MVP, minimal cost in production

### No External APIs Required for MVP
- Can work fully offline with chosen libraries
- Geocoding can cache common cities

---

## 🎨 UI/UX Priorities

### Must-Have for Phase 2:
1. ✅ User profile page with astrological data
2. ✅ Asset directory (list view)
3. ✅ Asset detail page with astrology
4. ✅ Basic responsive design
5. ✅ Loading states

### Nice-to-Have (can defer to Phase 3):
- 🔲 Natal chart wheel visualization (complex)
- 🔲 Interactive birth chart
- 🔲 Profile sharing
- 🔲 PDF export
- 🔲 Comparison view (user vs asset)

**MVP Approach:** Focus on displaying data clearly in tables/cards. Add fancy visualizations in Phase 3.

---

## 🧪 Testing Strategy

### Week 4 Tests:
- Unit tests for Chinese zodiac calculation
- Unit tests for Bazi calculation
- Integration tests for user registration with Chinese profile
- Manual validation: 10 known birth dates

### Week 5 Tests:
- Unit tests for Western zodiac signs
- Unit tests for planetary position calculation
- Integration tests for user registration with Western profile
- Manual validation: Compare with Astro.com for 10 birth dates

### Week 6 Tests:
- Data quality tests (all 100 assets present)
- Asset API endpoint tests
- UI rendering tests for asset pages
- End-to-end test: Search asset → View profile

### Acceptance Criteria:
- ✅ All unit tests pass (80%+ coverage)
- ✅ Manual validation matches professional calculators (±1° for planets)
- ✅ 100 assets researched and seeded
- ✅ User can view their complete astrological profile
- ✅ User can browse asset astrological profiles

---

## 📊 Success Metrics

**Technical Metrics:**
- Chinese astrology calculation: <100ms per user
- Western astrology calculation: <500ms per user
- Asset search: <200ms response time
- Profile page load: <2 seconds

**Data Metrics:**
- 100+ assets in database
- 100% of users have astrological profiles calculated
- 80%+ of assets have "high" confidence birth dates
- 100% of assets have element assignments

**User Experience Metrics:**
- Profile page bounce rate <30%
- Asset exploration: avg 3+ assets viewed per session
- Mobile responsive (works on iOS/Android)

---

## 🚨 Risk Mitigation

### Risk 1: Calculation Accuracy
**Impact:** High - incorrect astrology = bad predictions in Phase 3
**Mitigation:**
- Compare with multiple professional calculators
- Consult with professional astrologer for validation
- Start with simpler calculations, iterate
- Document algorithm sources

### Risk 2: Ephemeris Library Licensing
**Impact:** High - could block Week 5
**Mitigation:**
- Decision required by Week 4 Day 3
- Have backup plan (Astronomia for MVP)
- Budget for commercial license if needed

### Risk 3: Asset Research Time
**Impact:** Medium - could delay Week 6
**Mitigation:**
- Start research early (Week 4)
- Parallelize: 2 people researching
- Accept lower initial count (50 total instead of 100)
- Can add more assets in Phase 3

### Risk 4: Geocoding Rate Limits
**Impact:** Low - mostly affects batch operations
**Mitigation:**
- Cache common cities
- Use free tier with rate limiting
- Upgrade to paid if needed

### Risk 5: Complex UI Development
**Impact:** Medium - could delay frontend
**Mitigation:**
- Start with simple table/card layout
- Defer complex visualizations to Phase 3
- Use existing chart libraries (Chart.js)

---

## 👥 Team Assignments

### Backend Developer (Primary):
- Chinese astrology library (Week 4)
- Western astrology library (Week 5)
- API endpoints (Weeks 4-6)
- Geocoding service (Week 5)
- Asset seeding script (Week 6)
- Integration with user registration

### Frontend Developer (Primary):
- Profile page UI (Weeks 4-5)
- Asset directory (Week 6)
- Asset detail page (Week 6)
- Asset search component (Week 6)
- Responsive design
- Loading states and error handling

### Backend Developer (Secondary) or Research Assistant:
- Asset birth date research (Week 6)
- Data entry and validation
- Element assignment review

### Optional - Astrology Consultant (Part-time):
- Validate calculation algorithms
- Review element assignment logic
- Provide domain expertise
- 5-10 hours total

---

## 📅 Daily Breakdown

### Week 4 - Chinese Astrology
**Mon-Tue:** Lunar calendar library integration + Chinese zodiac calculator
**Wed-Thu:** Bazi (Four Pillars) calculation + element extraction
**Fri:** Lucky numbers + API integration + testing

### Week 5 - Western Astrology
**Mon:** Ephemeris library decision + integration
**Tue-Wed:** Sun/Moon/Rising calculation + planetary positions
**Thu:** Houses + aspects + geocoding service
**Fri:** API integration + profile page completion

### Week 6 - Asset Research
**Mon-Tue:** Asset research (crypto focus)
**Wed-Thu:** Asset research (stocks focus) + data entry
**Fri:** Asset UI pages + testing + polish

---

## 🎯 Phase 2 Completion Checklist

Before moving to Phase 3, verify:

**Functionality:**
- [ ] User signup calculates full astrological profile
- [ ] Profile page displays Chinese astrology data
- [ ] Profile page displays Western astrology data
- [ ] 100+ assets in database with astrological profiles
- [ ] Asset directory page working
- [ ] Asset detail pages working
- [ ] Asset search working

**Quality:**
- [ ] All unit tests passing (80%+ coverage)
- [ ] Manual validation completed (10 birth dates tested)
- [ ] API response times meet targets (<500ms)
- [ ] Mobile responsive design verified
- [ ] No console errors in production build

**Documentation:**
- [ ] API endpoints documented
- [ ] Calculation algorithms documented
- [ ] Asset research documented (sources, confidence)
- [ ] Known limitations documented

**Handoff to Phase 3:**
- [ ] User profiles ready for compatibility matching
- [ ] Asset profiles ready for timing predictions
- [ ] APIs ready for prediction engine integration
- [ ] UI foundation ready for prediction display

---

## 🔜 Phase 3 Preview

With Phase 2 complete, Phase 3 will build the prediction engines:

**Week 7-9: Macro Predictions**
- Asset class element mapping
- Year-based predictions
- MacroStrategyAgent implementation

**Week 10-12: Birth Date Predictions**
- Transit calculations
- Asset timing analysis
- AssetTimingAgent implementation

**Phase 2 Foundation Enables:**
- User-asset element matching (compatibility)
- Favorable period calculations (transits)
- Personalized predictions (user chart + asset chart)

---

## 📞 Questions & Decisions Needed

**Before Week 5 Starts:**
1. ⚠️ **CRITICAL**: Ephemeris library licensing decision
   - Option A: Astronomia (MIT, less accurate) for MVP
   - Option B: Swiss Ephemeris commercial license (~$500-1000)
   - Option C: External API service (~$0.01/calculation)
   - **Recommendation:** Start with Astronomia, evaluate Swiss Ephemeris for production

**Before Week 6 Starts:**
2. Asset count target: 100 (50 crypto + 50 stocks) or start with 50 total?
   - **Recommendation:** Start with 50 total (25 crypto + 25 stocks), expand to 100 in Phase 3

**Optional Enhancements:**
3. Hire astrology consultant for validation? ($500-1000, 5-10 hours)
   - **Recommendation:** Yes, worth it for accuracy validation

4. Natal chart wheel visualization in Phase 2 or defer?
   - **Recommendation:** Defer to Phase 3, focus on data accuracy first

---

## 💰 Budget Estimate (Phase 2 Only)

**Development Time:**
- Backend Developer: 120 hours (3 weeks × 40 hours)
- Frontend Developer: 120 hours (3 weeks × 40 hours)
- Research Assistant: 30 hours (asset research)
- Total: 270 hours

**External Costs:**
- Lunar calendar library: Free (MIT)
- Ephemeris library (MVP): Free (Astronomia MIT)
- Geocoding API: Free tier (sufficient for Phase 2)
- Astrology consultant (optional): $500-1000
- **Total External Costs: $0-1000**

**Team Cost Estimate (if hiring):**
- 2 developers × 120 hours × $50-100/hour = $12,000-24,000
- Research assistant × 30 hours × $25-50/hour = $750-1,500
- **Total: $12,750-25,500**

---

## 📈 Success Criteria Summary

**Phase 2 is complete when:**

1. ✅ Every user has a complete astrological profile (Chinese + Western)
2. ✅ 50-100 assets have researched birth dates and astrological profiles
3. ✅ APIs exist for retrieving birth chart data
4. ✅ Profile page displays user's astrology beautifully
5. ✅ Asset pages display asset astrology clearly
6. ✅ All calculations are validated for accuracy
7. ✅ Foundation ready for Phase 3 prediction engines

**We will know Phase 2 succeeded if:**
- Users can view and understand their astrological profile
- We have enough asset data to begin building predictions
- Calculation accuracy matches professional tools
- Team is confident in the foundation for Phase 3

---

**Last Updated:** 2025-12-18
**Status:** Ready to Begin
**Next Review:** End of Week 4 (Chinese Astrology Complete)

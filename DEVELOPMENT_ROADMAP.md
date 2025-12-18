# Development Roadmap - Phase 1: Foundation

**Timeline**: Weeks 1-3 (15-18 working days)
**Goal**: Production-ready authentication system, database setup, and basic infrastructure
**Status**: Pre-Development

---

## Table of Contents

1. [Phase 1 Overview](#phase-1-overview)
2. [Team Structure](#team-structure)
3. [Priority Tasks (Start NOW)](#priority-tasks-start-now)
4. [Backend Tasks](#backend-tasks)
5. [Frontend Tasks](#frontend-tasks)
6. [Shared/DevOps Tasks](#shareddevops-tasks)
7. [Task Dependencies](#task-dependencies)
8. [Success Criteria](#success-criteria)
9. [Risk Mitigation](#risk-mitigation)
10. [Next Steps (Phase 2)](#next-steps-phase-2)

---

## Phase 1 Overview

### Objectives

**Core Deliverables:**
- ✅ Fully functional multi-auth system (Email, OAuth, Wallet)
- ✅ PostgreSQL database with complete schema
- ✅ Next.js web application with routing and auth UI
- ✅ Node.js API with authentication endpoints
- ✅ Basic design system and UI components
- ✅ Deployed to staging environment

**Non-Goals (Phase 2+):**
- ❌ AI/ML prediction engine
- ❌ Astrological calculations
- ❌ Payment systems
- ❌ Mobile app development
- ❌ Production deployment

### Tech Stack Confirmation

| Component | Technology | Version |
|-----------|-----------|---------|
| Frontend | Next.js (App Router) | 14.0+ |
| Backend | Node.js + Express | 18.0+ / 4.18+ |
| Database | PostgreSQL | 14+ |
| Cache/Queue | Redis | 7+ |
| ORM | Prisma | 5.7+ |
| Auth | JWT + OAuth | - |
| Wallet Auth | Solana Web3.js / Ethers.js | - |
| Styling | TailwindCSS | 3.4+ |
| Validation | Zod | 3.22+ |
| State | Zustand | 4.4+ |

---

## Team Structure

### Backend Team (2 developers)
**Lead**: Backend Developer 1
**Focus**: API, Authentication, Database
**Languages**: TypeScript, SQL

### Frontend Team (2 developers)
**Lead**: Frontend Developer 1
**Focus**: Next.js, UI Components, User Flows
**Languages**: TypeScript, React, TailwindCSS

### DevOps (0.5 FTE)
**Focus**: Infrastructure setup, CI/CD, deployment
**Tools**: Railway/Render, Vercel, GitHub Actions

---

## Priority Tasks (Start NOW)

These are the absolute highest priority tasks to unblock development:

### 🔥 P0 - Critical Path (Days 1-3)

| # | Task | Owner | Time | Status |
|---|------|-------|------|--------|
| 1 | Set up PostgreSQL database (Supabase/Neon) | Backend | 2h | 🔴 TODO |
| 2 | Run schema.sql and validate | Backend | 1h | 🔴 TODO |
| 3 | Initialize Prisma with existing schema | Backend | 3h | 🔴 TODO |
| 4 | Initialize Next.js app (App Router) | Frontend | 2h | 🔴 TODO |
| 5 | Initialize Express API with TypeScript | Backend | 3h | 🔴 TODO |
| 6 | Set up environment variables (.env files) | Both | 1h | 🔴 TODO |
| 7 | Create shared TypeScript types package | Backend | 2h | 🔴 TODO |
| 8 | Deploy staging infrastructure | DevOps | 4h | 🔴 TODO |

**Goal**: By end of Day 3, both teams can run local development servers and connect to a real database.

---

## Backend Tasks

### Week 1: Foundation & Database (Days 1-5)

#### Task 1.1: Database Setup
**Owner**: Backend Dev 1
**Time**: 4 hours
**Priority**: P0

**Steps:**
1. Create PostgreSQL instance on Supabase or Neon
2. Run `schema.sql` to create all tables
3. Verify all tables, indexes, and constraints created
4. Set up connection pooling (PgBouncer)
5. Create database users and permissions

**Deliverables:**
- Database URL in `.env`
- All tables created
- Sample data seeded (test users, assets)

**Blockers**: None

---

#### Task 1.2: Prisma Integration
**Owner**: Backend Dev 1
**Time**: 6 hours
**Priority**: P0
**Dependencies**: Task 1.1

**Steps:**
1. Initialize Prisma in `packages/database/`
2. Run `npx prisma db pull` to introspect existing schema
3. Review and fix Prisma schema if needed
4. Generate Prisma Client
5. Create database helper utilities
6. Add seed scripts for development data

**Deliverables:**
- `packages/database/prisma/schema.prisma`
- `packages/database/src/index.ts` (exports Prisma client)
- Seed script with test data

**Files to Create:**
```
packages/database/
├── package.json
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── index.ts
│   └── client.ts
└── tsconfig.json
```

---

#### Task 1.3: Express API Foundation
**Owner**: Backend Dev 2
**Time**: 8 hours
**Priority**: P0

**Steps:**
1. Initialize Express app in `apps/api/`
2. Set up TypeScript configuration
3. Add middleware: CORS, helmet, compression, morgan
4. Create error handling middleware
5. Set up request validation with Zod
6. Create health check endpoint
7. Add rate limiting with express-rate-limit + Redis

**Deliverables:**
- `apps/api/src/index.ts` (entry point)
- `apps/api/src/middleware/` (auth, validation, error handling)
- `apps/api/src/config/` (environment, database)
- Working API at `localhost:3001`

**Dependencies:**
```json
{
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "helmet": "^7.1.0",
  "morgan": "^1.10.0",
  "compression": "^1.7.4",
  "express-rate-limit": "^7.1.5",
  "zod": "^3.22.4",
  "@prisma/client": "^5.7.0"
}
```

---

#### Task 1.4: JWT Authentication System
**Owner**: Backend Dev 2
**Time**: 6 hours
**Priority**: P0
**Dependencies**: Task 1.3

**Steps:**
1. Create JWT token generation utilities
2. Implement access token + refresh token pattern
3. Create authentication middleware
4. Add token validation and refresh logic
5. Implement session management (Redis)

**Deliverables:**
- `apps/api/src/auth/jwt.ts`
- `apps/api/src/middleware/authenticate.ts`
- Token expiry: Access (1h), Refresh (7d)

**Key Functions:**
- `generateAccessToken(userId)`
- `generateRefreshToken(userId)`
- `verifyToken(token)`
- `refreshAccessToken(refreshToken)`

---

#### Task 1.5: Email/Password Authentication
**Owner**: Backend Dev 2
**Time**: 8 hours
**Priority**: P0
**Dependencies**: Task 1.4

**Steps:**
1. Implement `/auth/register` endpoint
2. Implement `/auth/login` endpoint
3. Implement `/auth/logout` endpoint
4. Implement `/auth/refresh` endpoint
5. Add password hashing with bcrypt
6. Add email validation
7. Create user creation flow

**Deliverables:**
- `apps/api/src/routes/auth.ts`
- `apps/api/src/services/auth.service.ts`
- All email/password endpoints working

**Endpoints:**
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/refresh`
- `GET /api/v1/auth/me`

---

### Week 2: Multi-Auth Implementation (Days 6-10)

#### Task 2.1: Wallet Authentication (Solana)
**Owner**: Backend Dev 1
**Time**: 10 hours
**Priority**: P0

**Steps:**
1. Install Solana Web3.js dependencies
2. Implement nonce generation system
3. Create signature verification logic
4. Implement `/auth/wallet/nonce` endpoint
5. Implement `/auth/wallet/verify` endpoint
6. Add wallet_connections table management
7. Test with Phantom wallet

**Deliverables:**
- `apps/api/src/auth/wallet-solana.ts`
- Nonce generation and cleanup cron
- Working Solana wallet auth

**Dependencies:**
```json
{
  "@solana/web3.js": "^1.87.6",
  "tweetnacl": "^1.0.3",
  "bs58": "^5.0.0"
}
```

**Security Checklist:**
- ✅ Nonce expires after 5 minutes
- ✅ Nonce can only be used once
- ✅ Message includes timestamp
- ✅ Signature verification is server-side
- ✅ Rate limiting on nonce requests

---

#### Task 2.2: Wallet Authentication (Ethereum)
**Owner**: Backend Dev 1
**Time**: 6 hours
**Priority**: P0
**Dependencies**: Task 2.1

**Steps:**
1. Install ethers.js
2. Implement Ethereum signature verification
3. Add support for MetaMask, WalletConnect
4. Update wallet endpoints to support Ethereum
5. Test with MetaMask

**Deliverables:**
- `apps/api/src/auth/wallet-ethereum.ts`
- Multi-chain wallet support

**Dependencies:**
```json
{
  "ethers": "^6.9.0"
}
```

---

#### Task 2.3: OAuth Integration (Twitter/X)
**Owner**: Backend Dev 2
**Time**: 8 hours
**Priority**: P1

**Steps:**
1. Set up Twitter OAuth 2.0 app
2. Implement OAuth flow (PKCE)
3. Create `/auth/oauth/twitter` redirect endpoint
4. Create `/auth/twitter/callback` endpoint
5. Handle token exchange
6. Store OAuth tokens in `oauth_connections`
7. Link to existing user or create new user

**Deliverables:**
- `apps/api/src/auth/oauth-twitter.ts`
- Twitter OAuth flow working

**Environment Variables:**
```
TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=
TWITTER_REDIRECT_URI=
```

---

#### Task 2.4: Account Linking System
**Owner**: Backend Dev 1
**Time**: 8 hours
**Priority**: P1
**Dependencies**: Tasks 1.5, 2.1, 2.3

**Steps:**
1. Implement email linking for wallet users
2. Implement wallet linking for email users
3. Implement Twitter linking
4. Add email verification codes
5. Create account unlinking logic
6. Add validation (prevent duplicate links)

**Deliverables:**
- `apps/api/src/routes/account.ts`
- All linking endpoints working

**Endpoints:**
- `GET /api/v1/account/linked`
- `POST /api/v1/account/link/email`
- `POST /api/v1/account/link/email/verify`
- `POST /api/v1/account/link/wallet/nonce`
- `POST /api/v1/account/link/wallet/verify`
- `DELETE /api/v1/account/unlink/:type/:id`

**Validation Rules:**
- ✅ Cannot unlink last authentication method
- ✅ Wallet can only be linked to one account
- ✅ Email can only be linked to one account
- ✅ Must verify ownership before linking

---

### Week 3: API Completion & Testing (Days 11-15)

#### Task 3.1: User Profile Endpoints
**Owner**: Backend Dev 2
**Time**: 4 hours
**Priority**: P1

**Steps:**
1. Implement `GET /users/:userId`
2. Implement `PATCH /users/:userId`
3. Add input validation
4. Add authorization checks

**Deliverables:**
- User profile CRUD operations
- `apps/api/src/routes/users.ts`

---

#### Task 3.2: Redis Setup & Integration
**Owner**: Backend Dev 1
**Time**: 4 hours
**Priority**: P1

**Steps:**
1. Set up Redis instance (Upstash or local)
2. Create Redis client wrapper
3. Implement session storage
4. Implement rate limiting with Redis
5. Add cache utilities

**Deliverables:**
- `apps/api/src/lib/redis.ts`
- Session management working
- Rate limiting operational

**Dependencies:**
```json
{
  "ioredis": "^5.3.2"
}
```

---

#### Task 3.3: Email Service Integration
**Owner**: Backend Dev 2
**Time**: 3 hours
**Priority**: P2

**Steps:**
1. Choose email provider (SendGrid, Resend, AWS SES)
2. Create email templates (verification, welcome)
3. Implement email sending utility
4. Add email verification flow

**Deliverables:**
- `apps/api/src/services/email.service.ts`
- Email verification working

---

#### Task 3.4: API Documentation
**Owner**: Backend Dev 1
**Time**: 3 hours
**Priority**: P2

**Steps:**
1. Set up Swagger/OpenAPI
2. Document all authentication endpoints
3. Add example requests/responses
4. Generate API documentation site

**Deliverables:**
- Swagger UI at `/api/docs`
- OpenAPI spec file

---

#### Task 3.5: API Testing
**Owner**: Backend Dev 2
**Time**: 8 hours
**Priority**: P1

**Steps:**
1. Set up Jest testing framework
2. Write unit tests for auth functions
3. Write integration tests for endpoints
4. Add test database seeding
5. Set up CI test pipeline

**Deliverables:**
- Test coverage > 70%
- All auth flows tested
- CI pipeline passing

**Test Files:**
```
apps/api/tests/
├── unit/
│   ├── auth.test.ts
│   ├── jwt.test.ts
│   └── wallet.test.ts
├── integration/
│   ├── auth-email.test.ts
│   ├── auth-wallet.test.ts
│   └── account-linking.test.ts
└── fixtures/
    └── test-data.ts
```

---

## Frontend Tasks

### Week 1: Next.js Foundation (Days 1-5)

#### Task F1.1: Next.js App Initialization
**Owner**: Frontend Dev 1
**Time**: 4 hours
**Priority**: P0

**Steps:**
1. Initialize Next.js 14 with App Router
2. Set up TypeScript configuration
3. Install and configure TailwindCSS
4. Set up project structure (app/, components/, lib/)
5. Configure ESLint and Prettier
6. Add basic layout and routing

**Deliverables:**
- `apps/web/` fully set up
- App running at `localhost:3000`
- Basic routing working

**Folder Structure:**
```
apps/web/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── (auth)/
│   │   ├── login/
│   │   ├── signup/
│   │   └── layout.tsx
│   └── (dashboard)/
│       ├── dashboard/
│       └── layout.tsx
├── components/
│   ├── ui/
│   ├── forms/
│   └── layout/
├── lib/
│   ├── api/
│   ├── hooks/
│   └── utils/
└── public/
```

---

#### Task F1.2: Design System & UI Components
**Owner**: Frontend Dev 2
**Time**: 12 hours
**Priority**: P0

**Steps:**
1. Set up TailwindCSS custom theme
2. Define color palette, typography, spacing
3. Create base UI components:
   - Button
   - Input
   - Card
   - Modal
   - Loading spinner
   - Toast notifications
4. Create form components:
   - Form wrapper
   - Input field
   - Checkbox
   - Select dropdown
5. Document components in Storybook (optional)

**Deliverables:**
- `apps/web/components/ui/` with all base components
- Consistent design system
- Reusable form components

**Components:**
```tsx
// apps/web/components/ui/button.tsx
export function Button({ variant, size, children, ...props })

// apps/web/components/ui/input.tsx
export function Input({ label, error, ...props })

// apps/web/components/ui/card.tsx
export function Card({ children, ...props })
```

---

#### Task F1.3: API Client Setup
**Owner**: Frontend Dev 1
**Time**: 6 hours
**Priority**: P0

**Steps:**
1. Create API client wrapper (axios/fetch)
2. Add authentication token handling
3. Add request/response interceptors
4. Create API route types from backend
5. Add error handling

**Deliverables:**
- `apps/web/lib/api/client.ts`
- Type-safe API client
- Auto token refresh

**Example:**
```tsx
// apps/web/lib/api/client.ts
export const api = {
  auth: {
    login: (credentials) => post('/auth/login', credentials),
    register: (data) => post('/auth/register', data),
    logout: () => post('/auth/logout'),
  },
  // ...
}
```

---

#### Task F1.4: Authentication State Management
**Owner**: Frontend Dev 1
**Time**: 6 hours
**Priority**: P0

**Steps:**
1. Set up Zustand store
2. Create auth store (user, tokens, loading states)
3. Add login/logout actions
4. Implement token storage (localStorage/cookies)
5. Add auto-refresh logic
6. Create protected route wrapper

**Deliverables:**
- `apps/web/lib/stores/auth.ts`
- Authentication state management
- Protected routes working

**Store Structure:**
```tsx
interface AuthStore {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email, password) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
}
```

---

### Week 2: Authentication UI (Days 6-10)

#### Task F2.1: Login Page
**Owner**: Frontend Dev 2
**Time**: 6 hours
**Priority**: P0

**Steps:**
1. Create login page UI
2. Add email/password form
3. Add form validation (Zod)
4. Connect to auth API
5. Add error handling
6. Add loading states
7. Add "forgot password" link (placeholder)

**Deliverables:**
- `apps/web/app/(auth)/login/page.tsx`
- Working email login

**Features:**
- Email validation
- Password visibility toggle
- Remember me checkbox
- Error messages
- Redirect after login

---

#### Task F2.2: Signup Page
**Owner**: Frontend Dev 2
**Time**: 6 hours
**Priority**: P0

**Steps:**
1. Create signup page UI
2. Add registration form (email, password, username)
3. Add password strength indicator
4. Add terms of service checkbox
5. Connect to auth API
6. Add success redirect

**Deliverables:**
- `apps/web/app/(auth)/signup/page.tsx`
- Working email registration

**Features:**
- Email validation
- Password confirmation
- Username availability check
- Password strength meter
- ToS acceptance

---

#### Task F2.3: Wallet Connection UI
**Owner**: Frontend Dev 1
**Time**: 10 hours
**Priority**: P0

**Steps:**
1. Install wallet adapter libraries
2. Create wallet connection button component
3. Implement Phantom wallet integration
4. Implement MetaMask integration
5. Add signature request flow
6. Connect to wallet auth API
7. Handle wallet errors

**Deliverables:**
- `apps/web/components/wallet/connect-button.tsx`
- Working wallet authentication

**Dependencies:**
```json
{
  "@solana/wallet-adapter-react": "^0.15.35",
  "@solana/wallet-adapter-wallets": "^0.19.26",
  "ethers": "^6.9.0"
}
```

**Flow:**
1. User clicks "Connect Wallet"
2. Select wallet (Phantom/MetaMask)
3. Request nonce from API
4. Sign message in wallet
5. Verify signature with API
6. Redirect to dashboard/onboarding

---

#### Task F2.4: OAuth Integration (Twitter)
**Owner**: Frontend Dev 1
**Time**: 4 hours
**Priority**: P1

**Steps:**
1. Create Twitter login button
2. Implement OAuth redirect flow
3. Create callback page
4. Handle OAuth errors
5. Add loading states

**Deliverables:**
- Twitter OAuth button working
- `apps/web/app/(auth)/callback/twitter/page.tsx`

---

#### Task F2.5: Account Linking UI
**Owner**: Frontend Dev 2
**Time**: 8 hours
**Priority**: P1

**Steps:**
1. Create account settings page
2. Show linked authentication methods
3. Add "Link Email" flow
4. Add "Link Wallet" flow
5. Add "Link Twitter" button
6. Add unlink confirmation modals
7. Show primary wallet designation

**Deliverables:**
- `apps/web/app/(dashboard)/settings/page.tsx`
- Full account linking UI

**Features:**
- Display all linked methods
- Add new methods
- Unlink methods (with safeguards)
- Set primary wallet
- Email verification UI

---

### Week 3: Dashboard & Polish (Days 11-15)

#### Task F3.1: Landing Page
**Owner**: Frontend Dev 2
**Time**: 8 hours
**Priority**: P1

**Steps:**
1. Design hero section
2. Add feature highlights
3. Add CTA buttons (Login/Signup)
4. Make responsive
5. Add simple animations

**Deliverables:**
- `apps/web/app/page.tsx`
- Marketing landing page

---

#### Task F3.2: Dashboard Shell
**Owner**: Frontend Dev 1
**Time**: 6 hours
**Priority**: P1

**Steps:**
1. Create dashboard layout
2. Add navigation sidebar
3. Add user menu dropdown
4. Add placeholder sections
5. Make responsive

**Deliverables:**
- `apps/web/app/(dashboard)/layout.tsx`
- Basic dashboard structure

**Sections:**
- Navigation sidebar
- User profile menu
- Quick stats cards (placeholders)
- Empty state messages

---

#### Task F3.3: User Profile Page
**Owner**: Frontend Dev 1
**Time**: 4 hours
**Priority**: P2

**Steps:**
1. Create profile page UI
2. Show user info (username, email, joined date)
3. Add edit profile form
4. Connect to user API

**Deliverables:**
- `apps/web/app/(dashboard)/profile/page.tsx`
- Profile viewing and editing

---

#### Task F3.4: Loading & Error States
**Owner**: Frontend Dev 2
**Time**: 4 hours
**Priority**: P1

**Steps:**
1. Create loading skeletons
2. Create error boundary components
3. Add retry mechanisms
4. Create 404 page
5. Create 500 error page

**Deliverables:**
- Consistent loading states
- Error handling across app

---

#### Task F3.5: Testing & Accessibility
**Owner**: Frontend Dev 1
**Time**: 6 hours
**Priority**: P2

**Steps:**
1. Set up React Testing Library
2. Write component tests
3. Write integration tests for auth flows
4. Add accessibility audit (axe-core)
5. Fix accessibility issues

**Deliverables:**
- Test coverage > 60%
- WCAG 2.1 AA compliance

---

## Shared/DevOps Tasks

### Task D1: Environment Setup
**Owner**: DevOps
**Time**: 4 hours
**Priority**: P0

**Steps:**
1. Create `.env.example` files for all apps
2. Document all environment variables
3. Set up secrets management (GitHub Secrets)
4. Create staging environment configs

**Deliverables:**
- `.env.example` in all apps
- Environment documentation

---

### Task D2: CI/CD Pipeline
**Owner**: DevOps
**Time**: 6 hours
**Priority**: P1

**Steps:**
1. Create GitHub Actions workflows
2. Add linting and testing jobs
3. Add build jobs
4. Add deployment jobs (staging)
5. Set up deployment notifications

**Deliverables:**
- `.github/workflows/ci.yml`
- `.github/workflows/deploy-staging.yml`
- Auto-deploy on merge to `main`

---

### Task D3: Staging Deployment
**Owner**: DevOps
**Time**: 8 hours
**Priority**: P1

**Steps:**
1. Deploy database to Supabase/Neon
2. Deploy Redis to Upstash
3. Deploy API to Railway/Render
4. Deploy web app to Vercel
5. Configure domain names
6. Set up SSL certificates
7. Configure CORS properly

**Deliverables:**
- Staging URLs:
  - Web: `https://staging.astro.app`
  - API: `https://api-staging.astro.app`
- All services communicating

---

### Task D4: Monitoring Setup
**Owner**: DevOps
**Time**: 4 hours
**Priority**: P2

**Steps:**
1. Set up application logging
2. Set up error tracking (Sentry)
3. Add basic metrics
4. Create status page

**Deliverables:**
- Sentry integration
- Basic monitoring dashboard

---

## Task Dependencies

### Critical Path (Must complete in order)

```
Database Setup (1.1)
    ↓
Prisma Integration (1.2)
    ↓
Express API Foundation (1.3)
    ↓
JWT Auth (1.4)
    ↓
Email/Password Auth (1.5)
    ↓
Next.js Setup (F1.1) + API Client (F1.3)
    ↓
Auth State Management (F1.4)
    ↓
Login/Signup Pages (F2.1, F2.2)
    ↓
Wallet Auth Backend (2.1, 2.2) → Wallet Auth Frontend (F2.3)
    ↓
Account Linking Backend (2.4) → Account Linking Frontend (F2.5)
```

### Parallel Workstreams

**Backend Team can work in parallel:**
- Stream A: Email/Password → OAuth → Account Linking
- Stream B: Wallet Solana → Wallet Ethereum

**Frontend Team can work in parallel:**
- Stream A: UI Components → Design System
- Stream B: Auth Pages → Wallet Integration

---

## Success Criteria

### Phase 1 Complete When:

**Functionality:**
- ✅ User can sign up with email/password
- ✅ User can log in with email/password
- ✅ User can log in with Solana wallet (Phantom)
- ✅ User can log in with Ethereum wallet (MetaMask)
- ✅ User can log in with Twitter OAuth
- ✅ User can link email to wallet account
- ✅ User can link wallet to email account
- ✅ User can link Twitter to any account
- ✅ User can unlink auth methods (with safeguards)
- ✅ User can view and edit profile
- ✅ User stays logged in (refresh token working)
- ✅ Protected routes redirect to login

**Technical:**
- ✅ Database schema deployed and tested
- ✅ All API endpoints documented
- ✅ API test coverage > 70%
- ✅ Frontend test coverage > 60%
- ✅ No critical security vulnerabilities
- ✅ Staging environment deployed
- ✅ CI/CD pipeline operational
- ✅ Monitoring and logging set up

**Quality:**
- ✅ Code passes linting (ESLint)
- ✅ Code is formatted (Prettier)
- ✅ No TypeScript errors
- ✅ Responsive design (mobile + desktop)
- ✅ WCAG 2.1 AA accessibility compliance
- ✅ Error handling works correctly
- ✅ Loading states implemented

---

## Risk Mitigation

### Risk 1: Wallet Integration Complexity
**Probability**: Medium
**Impact**: High

**Mitigation:**
- Start wallet integration early (Week 2)
- Test with real wallets from day 1
- Have backup plan (email-only for MVP)
- Document common wallet errors

---

### Risk 2: OAuth Rate Limits / Approval Delays
**Probability**: Medium
**Impact**: Medium

**Mitigation:**
- Apply for Twitter OAuth early
- Use development credentials for testing
- Have email auth working first
- Document OAuth setup process

---

### Risk 3: Database Performance Issues
**Probability**: Low
**Impact**: Medium

**Mitigation:**
- Use managed database (Supabase/Neon)
- Add proper indexes from start
- Monitor query performance
- Use connection pooling

---

### Risk 4: Team Blockers / Dependencies
**Probability**: Medium
**Impact**: Medium

**Mitigation:**
- Clear task ownership
- Daily standups
- Async communication (Slack)
- Document all decisions
- Parallel workstreams where possible

---

## Next Steps (Phase 2)

Once Phase 1 is complete, we move to **Phase 2: Birth Chart Engine (Weeks 4-6)**:

### Immediate Next Priorities:

1. **Birth Chart Calculation System**
   - Chinese astrology calculator (Bazi)
   - Western astrology calculator (Swiss Ephemeris)
   - User birth chart input form
   - Asset birth date research

2. **User Onboarding Flow**
   - Birth date/time/location collection
   - Birth chart generation
   - Profile completion wizard

3. **Asset Database**
   - Research top 50 crypto assets
   - Research top 50 stocks
   - Populate assets table
   - Element classification

4. **Basic Predictions (Preview)**
   - Simple macro prediction (no AI yet)
   - Element compatibility scoring
   - Foundation for Phase 3 AI agents

---

## Task Board Setup

### Kanban Columns

1. **Backlog** - All Phase 1 tasks
2. **Ready** - Tasks with no blockers
3. **In Progress** - Currently being worked on
4. **Review** - PR created, needs review
5. **Testing** - In QA/testing
6. **Done** - Merged and deployed to staging

### Sprint Planning

**Sprint 1 (Week 1)**: Database + API Foundation + Next.js Setup
**Sprint 2 (Week 2)**: Multi-auth implementation
**Sprint 3 (Week 3)**: Polish, testing, deployment

---

## Communication

### Daily Standups (15 min)
- What did you complete yesterday?
- What are you working on today?
- Any blockers?

### Weekly Demo (Friday, 30 min)
- Show completed features
- Test in staging environment
- Discuss next week's priorities

### Retrospective (End of Phase 1)
- What went well?
- What could improve?
- Action items for Phase 2

---

## Appendix: Quick Start Commands

### Backend Developer Setup

```bash
# Clone and install
git clone https://github.com/yourusername/astro.git
cd astro
npm install

# Set up database
cp apps/api/.env.example apps/api/.env
# Edit .env with your database URL
cd apps/api
npm run db:migrate
npm run db:seed

# Start API
npm run dev
# API runs at http://localhost:3001
```

### Frontend Developer Setup

```bash
# Install dependencies
cd astro
npm install

# Set up environment
cp apps/web/.env.example apps/web/.env
# Edit .env with API URL

# Start web app
cd apps/web
npm run dev
# Web runs at http://localhost:3000
```

### Full Stack Local Development

```bash
# From root directory
npm run dev
# Runs all apps concurrently
```

---

## Resources

### Documentation
- [PROJECT_PLAN.md](./PROJECT_PLAN.md) - Complete 12-phase plan
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - Technical architecture
- [API.md](./docs/API.md) - API specification
- [WEB3_AUTH.md](./docs/WEB3_AUTH.md) - Wallet auth guide
- [schema.sql](./schema.sql) - Database schema

### External Docs
- [Next.js 14 Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)
- [Ethers.js](https://docs.ethers.org/)
- [Twitter OAuth 2.0](https://developer.twitter.com/en/docs/authentication/oauth-2-0)

---

**Document Version**: 1.0
**Last Updated**: 2025-12-18
**Next Review**: End of Week 1

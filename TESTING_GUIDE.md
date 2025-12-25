# 🧪 Testing Guide - Astro Web Application

This guide will help you test the complete web application locally.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database running (local or cloud)
- Git installed

## Quick Start (5 Minutes)

### Step 1: Install Dependencies

```bash
# From project root
cd /home/user/astro
npm install

# Install API dependencies
cd apps/api
npm install

# Install Web dependencies
cd ../web
npm install

# Install packages
cd ../../packages/database
npm install

cd ../astro-core
npm install
```

### Step 2: Set Up Database

**Option A: Local PostgreSQL**

```bash
# Make sure PostgreSQL is running
# Default connection: postgresql://localhost:5432/astro

# Create database
createdb astro

# Or using psql
psql -U postgres -c "CREATE DATABASE astro;"
```

**Option B: Use Existing Connection**

Update `apps/api/.env` with your database URL.

### Step 3: Configure Environment

```bash
cd /home/user/astro/apps/api

# Copy example env file (already exists as .env)
# Edit .env and update DATABASE_URL
nano .env

# Minimum required:
DATABASE_URL="postgresql://localhost:5432/astro"
JWT_SECRET="your-secret-key-here"
PORT=3001
```

### Step 4: Initialize Database

```bash
cd /home/user/astro/apps/api

# Generate Prisma Client
npm run db:generate

# Push schema to database (creates tables)
npm run db:push

# Seed database with test data (optional but recommended)
npm run db:seed
```

### Step 5: Start Backend API

```bash
cd /home/user/astro/apps/api
npm run dev

# Should see:
# ✓ Server running on http://localhost:3001
# ✓ Database connected
# ✓ Transaction monitor started
# ✓ Notification scheduler started
```

### Step 6: Start Frontend Web App

Open a **new terminal**:

```bash
cd /home/user/astro/apps/web
npm run dev

# Should see:
# ▲ Next.js 14.0.4
# - Local:        http://localhost:3000
# - Ready in 2.3s
```

### Step 7: Open Browser

Navigate to: **http://localhost:3000**

You should see the Astro landing page! 🎉

## Testing Scenarios

### 1. Authentication Flow

#### Sign Up
1. Go to http://localhost:3000
2. Click "Sign Up" or "Get Started"
3. Fill in:
   - Email: `test@example.com`
   - Password: `password123`
   - Name: `Test User`
4. Submit
5. Should redirect to dashboard

#### Sign In
1. Click "Login"
2. Enter credentials from signup
3. Should see dashboard with:
   - Credit balance
   - Quick prediction buttons
   - Best Assets For You (if profile complete)

#### Wallet Authentication (Requires Phantom/MetaMask)
1. Have Phantom or MetaMask installed
2. Click "Connect Phantom" or "Connect MetaMask"
3. Approve connection
4. Sign message
5. Should be logged in

### 2. Birth Chart & Profile

#### Complete Profile
1. Go to `/profile` or click "Profile" in navbar
2. Fill in birth information:
   - Birth Date: `1990-01-01`
   - Birth Time: `12:00`
   - Birth Location: `New York, NY`
   - Timezone: `America/New_York`
3. Save
4. Should see:
   - Chinese Astrology section (Zodiac, Bazi Chart)
   - Western Astrology section (Sun/Moon/Rising, Birth Chart Wheel)
   - Element distribution

### 3. Predictions

#### Macro Prediction (2 credits)
1. Go to `/predictions` or click "Predictions" tab
2. Click "Macro Prediction"
3. Select year: `2025`
4. Select asset classes:
   - ☑️ Crypto
   - ☑️ US Stocks
   - ☑️ Gold
5. Click "Generate Prediction"
6. Wait for processing animation
7. Should see:
   - Predictions ranked by score (1-10)
   - Reasoning for each asset class
   - Favorable periods
   - Share button

#### Timing Prediction (1 credit)
1. Go to `/predictions/timing`
2. Enter asset: `BTC` or `ETH`
3. Select date range
4. Click "Generate Prediction"
5. Should see:
   - Calendar heatmap with daily scores
   - Favorable periods highlighted
   - Best entry/exit dates

#### Divination (1 credit)
1. Go to `/predictions/divination`
2. Enter question: `Should I buy Bitcoin this month?`
3. Select method: Tarot or I Ching
4. Click "Generate Reading"
5. Should see:
   - Card reveal animation (Tarot) or hexagram (I Ching)
   - Interpretation
   - Guidance

### 4. Compatibility

#### View Compatible Assets
1. Go to `/compatibility`
2. Should see:
   - Top compatible assets for you
   - Compatibility scores (1-10)
   - Element badges
   - Filter by asset type
3. Click on an asset
4. Should see:
   - Large compatibility gauge
   - Element harmony diagram
   - Detailed reasoning
   - "Generate Timing Prediction" button

### 5. Credits & Payments

#### Check Credit Balance
- Look at navbar (top right): Shows credit count with gem icon
- Click on it to see dropdown with:
  - Current balance
  - "Purchase Credits" link
  - "Transaction History" link

#### Purchase Credits (Crypto Payment)
1. Click "Purchase Credits"
2. Go to `/credits/purchase`
3. See 4 pricing tiers:
   - 10 Credits - $4.99
   - 50 Credits - $19.99
   - 100 Credits - $34.99
   - Unlimited Monthly - $49.99
4. Select a package
5. Choose blockchain: Solana, Ethereum, or Base
6. Choose token: SOL/USDC or ETH/USDC/USDT
7. Click "Proceed to Payment"

**For Solana:**
- QR code appears
- Scan with Phantom wallet
- Confirm payment
- See status update to "Confirmed!"
- Credits added automatically

**For Ethereum/Base:**
- Copy payment address
- Send payment from wallet
- Enter transaction hash
- Click "Verify"
- Credits added after confirmation

#### Transaction History
1. Go to `/credits/history`
2. See all your purchases
3. Filter by status
4. Click transaction hash to view on explorer

### 6. Feedback System

#### Rate a Prediction
1. After viewing a prediction, wait 10 seconds
2. Feedback prompt appears (bottom-right)
3. Click "Rate It"
4. Rate 1-5 stars
5. Answer "Was this helpful?" (Yes/No)
6. Answer "Did this come true?" (Yes/No/Too early)
7. Optionally add comment
8. Submit
9. See confetti if 5 stars! 🎉

### 7. Admin Dashboard (Admin Users Only)

#### Access Admin Panel
1. Set user as admin in database:
   ```sql
   UPDATE users SET is_admin = true WHERE email = 'test@example.com';
   ```
2. Refresh page
3. See "Admin" link in navbar dropdown
4. Click to go to `/admin`

#### View Dashboards
- **Overview**: Users, revenue, predictions, AI costs
- **AI Costs**: Cost breakdown, budget tracking
- **Performance**: Response times, cache stats
- **Errors**: Error logs with resolution
- **Feedback**: User ratings and comments

## Test Data from Seed

If you ran `npm run db:seed`, you have:

**Test Users:**
- `alice@example.com` / `password123`
- `bob@example.com` / `password123`
- `charlie@example.com` / `password123`

All test users have:
- 10 starting credits
- Complete birth chart data
- Birth dates in different years (for Chinese zodiac testing)

**Test Assets:**
- BTC, ETH, SOL (Crypto)
- AAPL, GOOGL, TSLA (Stocks)
- GOLD (Commodity)

All with birth dates and astrological data.

## Common Issues & Solutions

### Issue: Database Connection Error

```
Error: Can't reach database server
```

**Solution:**
1. Make sure PostgreSQL is running
2. Check DATABASE_URL in `apps/api/.env`
3. Create database if it doesn't exist: `createdb astro`

### Issue: Prisma Client Not Generated

```
Error: @prisma/client not found
```

**Solution:**
```bash
cd apps/api
npm run db:generate
```

### Issue: Port Already in Use

```
Error: Port 3001 already in use
```

**Solution:**
```bash
# Find process using port
lsof -i :3001

# Kill process
kill -9 <PID>

# Or change port in apps/api/.env
PORT=3002
```

### Issue: Wallet Not Connecting

**Solution:**
- Install Phantom (Solana) or MetaMask (Ethereum)
- Make sure wallet is unlocked
- Check browser console for errors
- Try switching networks in wallet

### Issue: Predictions Not Generating

**Solution:**
1. Check if you have credits: Look at navbar
2. Check API logs for errors
3. Verify AI service is responding (may need API keys for Claude/GPT-4)

## Environment Variables Reference

### Required (apps/api/.env):

```bash
# Database
DATABASE_URL="postgresql://localhost:5432/astro"

# Server
PORT=3001
NODE_ENV="development"

# Auth
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"
```

### Optional (for full functionality):

```bash
# AI Services (for prediction enhancement)
ANTHROPIC_API_KEY="sk-ant-..."
OPENAI_API_KEY="sk-..."

# Solana (for crypto payments)
SOLANA_RPC_URL="https://api.mainnet-beta.solana.com"
SOLANA_MERCHANT_WALLET="YOUR_WALLET_ADDRESS"

# Ethereum (for crypto payments)
ETHEREUM_RPC_URL="https://eth-mainnet.alchemyapi.io/v2/YOUR_KEY"
ETHEREUM_MERCHANT_WALLET="0xYOUR_WALLET"

# Price APIs
COINGECKO_API_KEY="optional"

# Mobile (for push notifications)
EXPO_ACCESS_TOKEN="optional"
REVENUECAT_API_KEY="optional"
```

## Performance Testing

### Load Testing
```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Test API endpoint
ab -n 1000 -c 10 http://localhost:3001/health

# Should see:
# - Requests per second: >100
# - Response time (p95): <500ms
```

### Monitoring
1. Go to `/admin/performance`
2. See real-time metrics:
   - Response times (p50, p95, p99)
   - Request count
   - Error rate
   - Cache hit rate

## Next Steps

After testing locally:

1. **Deploy Backend**: Railway, Render, AWS, or Heroku
2. **Deploy Frontend**: Vercel, Netlify, or Cloudflare Pages
3. **Set Up Production Database**: Neon, Supabase, or AWS RDS
4. **Configure Domain**: Point DNS to deployments
5. **Add API Keys**: For AI services, payment processing
6. **Enable SSL**: HTTPS for production
7. **Set Up Monitoring**: Error tracking, analytics

## Support

If you encounter issues:

1. Check logs: `apps/api` console output
2. Check browser console for frontend errors
3. Review `QUICKSTART.md` in `apps/api/`
4. Check database with: `npm run db:studio`

---

Happy Testing! 🚀🔮✨

# 🌟 Astro - AI-Powered Astrology Prediction Platform

> Combining ancient astrology wisdom with modern AI to predict financial market trends and personalized compatibility.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (local or cloud)
- Git

### 1. Install Dependencies
```bash
npm install
cd apps/api && npm install
cd ../web && npm install
```

### 2. Set Up Database

**Option A: Use Cloud Database (Recommended)**
```bash
# Get free PostgreSQL from:
# - Neon.tech: https://neon.tech
# - Supabase: https://supabase.com
# - Railway: https://railway.app

# Update apps/api/.env with your DATABASE_URL
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
```

**Option B: Local PostgreSQL**
```bash
# Start PostgreSQL
sudo service postgresql start

# Create database
createdb astro_db

# Or using psql:
sudo -u postgres psql -c "CREATE DATABASE astro_db;"
```

### 3. Initialize Database
```bash
cd apps/api

# Generate Prisma Client (if network issues, add PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1)
npm run db:generate

# Create tables
npm run db:push

# Seed test data (optional but recommended)
npm run db:seed
```

### 4. Start Development Servers

**Terminal 1 - API Server:**
```bash
cd apps/api
npm run dev
# → http://localhost:3001
```

**Terminal 2 - Web App:**
```bash
cd apps/web
npm run dev
# → http://localhost:3000
```

### 5. Open Browser
Navigate to **http://localhost:3000** and start testing! 🎉

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [QUICK_TEST.md](./QUICK_TEST.md) | 5-minute quick start guide |
| [TESTING_GUIDE.md](./TESTING_GUIDE.md) | Comprehensive testing scenarios |
| [TEST_STATUS.md](./TEST_STATUS.md) | Current status and troubleshooting |
| [PROJECT_PLAN.md](./PROJECT_PLAN.md) | Complete project architecture |
| [start-dev.sh](./start-dev.sh) | Automated setup script |

## ✨ Features

### 🔮 Three Prediction Types
1. **Macro Predictions** (2 credits)
   - Chinese year elements + Western planetary transits
   - Predicts favorable asset classes for the year
   - Rankings from 1-10 with detailed reasoning

2. **Timing Predictions** (1 credit)
   - Personal birth chart + ticker birth date analysis
   - Best entry/exit dates for specific assets
   - Calendar heatmap visualization

3. **Divination** (1 credit)
   - Tarot card readings
   - I Ching hexagram interpretations
   - Answer specific questions about investments

### 🌐 Multi-Platform
- **Web App**: Full-featured desktop/mobile responsive
- **Mobile App**: React Native with IAP subscriptions (apps/mobile)

### 🔐 Authentication
- Email/password signup
- Phantom wallet (Solana)
- MetaMask wallet (Ethereum)
- Account linking supported

### 💎 Credits & Payments
**Web (Crypto):**
- Solana Pay with QR codes
- Ethereum/Base with transaction verification
- USDC, USDT, SOL, ETH supported

**Mobile (IAP):**
- RevenueCat integration
- Free: 3 credits/month
- Basic: $9.99/month (50 credits)
- Pro: $29.99/month (unlimited)

### 🎯 Personalization
- Complete birth chart (Chinese + Western)
- User-asset compatibility matching
- Personalized recommendations
- Element harmony analysis

### 📊 Admin Dashboard
- User analytics
- Revenue vs AI costs tracking
- Performance monitoring (p50, p95, p99)
- Error tracking with resolution
- Feedback analysis

## 🏗️ Architecture

```
┌──────────────────┐     ┌──────────────────┐
│   Web (Next.js)  │────▶│  Mobile (Expo)   │
│   localhost:3000 │     │  React Native    │
└────────┬─────────┘     └────────┬─────────┘
         │                        │
         │        HTTP/REST       │
         │                        │
         └────────┬───────────────┘
                  │
         ┌────────▼─────────┐
         │  API (Express)   │
         │  localhost:3001  │
         └────────┬─────────┘
                  │
         ┌────────▼─────────┐
         │   PostgreSQL     │
         │   Database       │
         └──────────────────┘
```

## 🛠️ Tech Stack

**Frontend:**
- Next.js 16 (App Router)
- React 19
- TypeScript 5
- TailwindCSS 4
- Framer Motion
- Zustand

**Backend:**
- Node.js + Express
- TypeScript
- Prisma ORM
- JWT Authentication
- Redis (optional)

**Mobile:**
- React Native
- Expo SDK
- RevenueCat

**Astrology:**
- astronomy-engine (MIT license)
- Custom Bazi calculations
- Five Elements (Wu Xing)
- Western natal charts

**AI:**
- Anthropic Claude 3.5 Sonnet
- Prompt versioning
- Cost tracking ($3/M input, $15/M output)

**Payments:**
- Solana Pay
- ethers.js (Ethereum)
- RevenueCat (Mobile IAP)

## 📝 Test Credentials

If you ran `npm run db:seed`:

| Email | Password | Credits | Zodiac |
|-------|----------|---------|--------|
| alice@example.com | password123 | 10 | Rat (Metal) |
| bob@example.com | password123 | 10 | Dragon (Wood) |
| charlie@example.com | password123 | 10 | Monkey (Fire) |

## 🧪 Testing Checklist

- [ ] Sign up with email
- [ ] Connect Phantom/MetaMask wallet
- [ ] Complete birth chart profile
- [ ] Generate macro prediction
- [ ] Generate timing prediction
- [ ] Try divination reading
- [ ] Check compatibility matches
- [ ] Purchase credits (test mode)
- [ ] Submit feedback on prediction
- [ ] View admin dashboard (set is_admin=true first)

## 🚧 Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5432

# Verify DATABASE_URL in apps/api/.env
cat apps/api/.env | grep DATABASE_URL
```

### Port Already in Use
```bash
# Kill process on port 3001 (API)
lsof -i :3001 && kill -9 <PID>

# Kill process on port 3000 (Web)
lsof -i :3000 && kill -9 <PID>
```

### Prisma Client Not Generated
```bash
cd apps/api
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npm run db:generate
npm run db:push
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

cd apps/api
rm -rf node_modules package-lock.json
npm install

cd ../web
rm -rf node_modules package-lock.json
npm install
```

## 📦 Project Structure

```
astro/
├── apps/
│   ├── api/              # Backend API (Express + TypeScript)
│   │   ├── src/
│   │   │   ├── routes/   # API endpoints
│   │   │   ├── services/ # Business logic
│   │   │   ├── middleware/
│   │   │   └── utils/
│   │   └── package.json
│   ├── web/              # Frontend Web App (Next.js)
│   │   ├── app/          # App Router pages
│   │   ├── components/   # React components
│   │   ├── lib/          # Utilities
│   │   └── package.json
│   └── mobile/           # Mobile App (React Native + Expo)
│       ├── app/          # Expo Router screens
│       ├── components/
│       └── package.json
├── packages/
│   ├── database/         # Prisma schema & migrations
│   │   └── prisma/
│   │       └── schema.prisma
│   └── astro-core/       # Core astrology engine
│       ├── src/
│       │   ├── chinese/  # Bazi, Wu Xing, I Ching
│       │   ├── western/  # Natal charts, transits
│       │   ├── predictions/
│       │   └── compatibility/
│       └── package.json
├── QUICK_TEST.md         # 5-minute quick start
├── TESTING_GUIDE.md      # Comprehensive testing guide
├── TEST_STATUS.md        # Current status & troubleshooting
├── PROJECT_PLAN.md       # Complete project plan
└── start-dev.sh          # Automated setup script
```

## 🎯 Implementation Status

| Phase | Feature | Status |
|-------|---------|--------|
| 1 | Authentication (Email + Wallet) | ✅ Complete |
| 2 | Birth Chart Engine | ✅ Complete |
| 3 | Prediction Engines | ✅ Complete |
| 4 | Credits System | ✅ Complete |
| 5 | AI Enhancement | ✅ Complete |
| 6 | Compatibility Matching | ✅ Complete |
| 7 | Polymarket Integration | ⏭️ Skipped |
| 8 | Payment Systems | ✅ Complete |
| 9 | Production Readiness | ✅ Complete |
| 10 | Mobile App | ✅ Complete |

## 🌙 What Makes This Special

1. **Dual Astrology System**: Combines Chinese (Bazi, Wu Xing) with Western (planets, aspects) for comprehensive analysis

2. **AI-Enhanced Predictions**: Claude 3.5 Sonnet enhances predictions with market context and refined reasoning

3. **Personalization**: User-asset compatibility based on birth chart harmony, not just general predictions

4. **Multi-Chain Payments**: Supports Solana, Ethereum, and Base for maximum accessibility

5. **Production-Ready**: Built-in monitoring, caching, cost tracking, and error handling from day one

6. **Mobile-First**: Full feature parity between web and mobile with native IAP support

## 🔮 Sample Use Cases

**Scenario 1: Crypto Investor**
- Signs in with Phantom wallet
- Completes birth profile
- Gets personalized BTC/ETH compatibility scores
- Generates timing prediction for best entry dates
- Purchases credits with USDC

**Scenario 2: Stock Trader**
- Signs up with email
- Generates macro prediction for 2025
- Sees that "Fire" assets score high
- Checks which stocks align with personal elements
- Uses divination for specific trade decisions

**Scenario 3: Financial Advisor**
- Creates admin account
- Tracks popular predictions
- Monitors AI costs
- Reviews user feedback
- Analyzes prediction accuracy over time

## 📈 Future Enhancements

- [ ] Polymarket integration for prediction markets
- [ ] RAG system for enhanced astrology knowledge
- [ ] Social features (share predictions, follow users)
- [ ] Portfolio tracking integration
- [ ] Advanced chart patterns (aspects, transits)
- [ ] Multi-language support
- [ ] Email notifications
- [ ] API for third-party integrations

## 🤝 Contributing

This is a complete implementation ready for deployment. To contribute:

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is proprietary. All rights reserved.

## 🙏 Acknowledgments

- astronomy-engine for planetary calculations
- Anthropic Claude for AI enhancement
- Solana Pay for crypto payments
- RevenueCat for mobile subscriptions
- The ancient wisdom of Bazi and I Ching

---

**Ready to explore the cosmos?** 🌟🔮✨

For questions or support, refer to the testing guides or check TEST_STATUS.md for troubleshooting.

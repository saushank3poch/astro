# Astro Prediction Platform

An AI-powered astrological prediction platform for financial assets, combining Chinese and Western astrology with modern AI agents.

## Overview

Astro is a dual-platform (web + mobile) system that provides:
- **Macro Predictions**: Asset class predictions based on elemental cycles
- **Birth Date Predictions**: Ticker-specific timing using astrological charts
- **Divination**: Tarot and I Ching readings for specific questions
- **Personalized Matching**: User-asset compatibility analysis
- **Polymarket Integration**: Event outcome predictions

## Project Structure

```
astro/
├── apps/
│   ├── web/          # Next.js web application
│   ├── mobile/       # Expo/React Native mobile app
│   ├── api/          # Node.js/Express backend API
│   └── ml-engine/    # Python FastAPI AI/ML services
├── packages/
│   ├── ui/           # Shared React components
│   ├── astro-core/   # Astrological calculation library
│   ├── database/     # Prisma schema and migrations
│   └── types/        # Shared TypeScript types
├── docs/             # Documentation
└── .github/          # GitHub Actions workflows
```

## Tech Stack

### Frontend
- **Web**: Next.js 14+, React, TypeScript, TailwindCSS
- **Mobile**: Expo, React Native, TypeScript

### Backend
- **API**: Node.js, Express/Fastify, TypeScript
- **ML Engine**: Python, FastAPI, LangChain
- **Database**: PostgreSQL, Redis
- **Queue**: BullMQ

### AI/ML
- **LLMs**: Anthropic Claude, OpenAI GPT-4
- **Vector DB**: Pinecone
- **Framework**: LangChain

### Payments
- **Web**: Solana Pay, Phantom, MetaMask
- **Mobile**: RevenueCat (Apple/Google IAP)

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 14+
- Redis 7+

### Installation

1. Clone the repository:
```bash
git clone https://github.com/saushank3poch/astro.git
cd astro
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up the database:
```bash
npm run db:migrate
npm run db:seed
```

5. Start development servers:
```bash
# All services
npm run dev

# Individual services
npm run web      # Web app
npm run mobile   # Mobile app
npm run api      # Backend API
npm run ml       # ML engine
```

## Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Formatting
```bash
npm run format
```

### Database Migrations
```bash
npm run db:migrate
```

## Deployment

- **Web**: Vercel
- **API**: Railway / Render
- **ML Engine**: Railway / Render
- **Database**: Supabase / Neon
- **Mobile**: Expo EAS Build

## Documentation

- [Project Plan](./PROJECT_PLAN.md)
- [Database Schema](./schema.sql)
- [API Documentation](./docs/API.md)
- [Architecture](./docs/ARCHITECTURE.md)

## Contributing

This is a private project. Please contact the team for contribution guidelines.

## License

Proprietary - All rights reserved

## Contact

For questions or support, contact: [your-email@example.com]

# Astro API

Node.js/TypeScript backend API for the Astro platform.

## Features

- RESTful API
- WebSocket support for real-time predictions
- JWT authentication
- PostgreSQL database (Prisma ORM)
- Redis caching & sessions
- BullMQ job queue
- Crypto payment processing
- IAP receipt validation
- Rate limiting
- API documentation (OpenAPI/Swagger)

## Tech Stack

- Node.js 18+
- TypeScript
- Express / Fastify
- Prisma (ORM)
- PostgreSQL
- Redis
- BullMQ
- Socket.io
- Joi/Zod (validation)

## Getting Started

```bash
cd apps/api
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

API runs on [http://localhost:3001](http://localhost:3001)

## Environment Variables

See `.env.example` in the root directory.

## Database

```bash
# Generate Prisma client
npm run prisma:generate

# Create migration
npm run db:migrate:create

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Open Prisma Studio
npm run prisma:studio
```

## Project Structure

```
api/
├── src/
│   ├── routes/          # API routes
│   │   ├── auth/       # Authentication
│   │   ├── users/      # User management
│   │   ├── predictions/# Prediction endpoints
│   │   ├── assets/     # Asset endpoints
│   │   └── payments/   # Payment processing
│   ├── services/        # Business logic
│   │   ├── auth/
│   │   ├── predictions/
│   │   ├── astrology/
│   │   └── payments/
│   ├── middleware/      # Express middleware
│   ├── jobs/            # Background jobs
│   ├── utils/           # Utilities
│   ├── types/           # TypeScript types
│   ├── config/          # Configuration
│   └── index.ts         # Entry point
├── prisma/
│   ├── schema.prisma    # Database schema
│   ├── migrations/      # Migration files
│   └── seed.ts          # Seed data
└── tests/               # Test files
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/:id` - Get user
- `PATCH /api/users/:id` - Update user
- `POST /api/users/:id/birth-chart` - Create birth chart
- `GET /api/users/:id/birth-chart` - Get birth chart

### Predictions
- `POST /api/predictions` - Create prediction
- `GET /api/predictions/:id` - Get prediction
- `GET /api/predictions` - List user predictions
- `POST /api/predictions/:id/feedback` - Submit feedback

### Assets
- `GET /api/assets` - List assets
- `GET /api/assets/:id` - Get asset
- `GET /api/assets/:id/birth-chart` - Get asset birth chart
- `GET /api/assets/search` - Search assets

### Compatibility
- `GET /api/compatibility/:userId/:assetId` - Get compatibility
- `GET /api/compatibility/:userId/top` - Top compatible assets

### Polymarket
- `GET /api/polymarket/events` - List events
- `GET /api/polymarket/events/:id` - Get event
- `GET /api/polymarket/events/:id/prediction` - Get prediction

### Payments
- `POST /api/payments/crypto/create` - Create crypto payment
- `POST /api/payments/crypto/confirm` - Confirm payment
- `POST /api/payments/iap/validate` - Validate IAP receipt
- `GET /api/payments/transactions` - List transactions

## Background Jobs

Jobs are processed via BullMQ:

- `prediction-processor` - Process prediction requests
- `polymarket-sync` - Sync Polymarket events
- `compatibility-calculator` - Calculate user-asset compatibility
- `crypto-payment-monitor` - Monitor blockchain transactions
- `macro-prediction-generator` - Generate macro predictions

## Development

```bash
npm run dev          # Start dev server with hot reload
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Lint code
npm run test         # Run tests
npm run test:watch   # Watch mode
npm run prisma:studio # Open database GUI
```

## Testing

```bash
npm run test              # Run all tests
npm run test:unit         # Unit tests only
npm run test:integration  # Integration tests
npm run test:e2e          # End-to-end tests
npm run test:coverage     # Coverage report
```

## API Documentation

Swagger documentation available at:
- Development: http://localhost:3001/api-docs
- Production: https://api.astro.app/api-docs

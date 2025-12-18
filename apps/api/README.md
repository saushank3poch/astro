# Astro Prediction Platform - Backend API

Production-ready Node.js + TypeScript backend API for the Astro prediction platform.

## Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL 14+ with Prisma ORM
- **Cache**: Redis
- **Authentication**: JWT + Wallet Signatures (Solana & Ethereum)
- **Validation**: Zod
- **Logging**: Winston

## Project Structure

```
apps/api/
├── src/
│   ├── routes/          # API route handlers
│   │   └── auth.routes.ts
│   ├── services/        # Business logic layer
│   │   └── auth.service.ts
│   ├── middleware/      # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── request-logger.middleware.ts
│   ├── utils/           # Utility functions
│   │   ├── jwt.ts
│   │   ├── password.ts
│   │   ├── wallet.ts
│   │   ├── validation.ts
│   │   └── logger.ts
│   ├── types/           # TypeScript type definitions
│   │   └── index.ts
│   ├── scripts/         # CLI scripts
│   │   └── seed.ts
│   └── index.ts         # Application entry point
├── package.json
├── tsconfig.json
└── .env.example
```

## Setup Instructions

### 1. Prerequisites

Ensure you have the following installed:
- Node.js 18+ and npm
- PostgreSQL 14+
- Redis (optional, for caching)

### 2. Install Dependencies

From the project root:

```bash
cd apps/api
npm install
```

Install database package:

```bash
cd ../../packages/database
npm install
```

### 3. Environment Configuration

Create `.env` file in `apps/api/`:

```bash
cp .env.example .env
```

Update the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/astro_db"

# JWT Secret (CHANGE THIS!)
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# API Configuration
API_PORT=3001
NODE_ENV="development"

# Blockchain RPC URLs (for wallet verification)
SOLANA_RPC_URL="https://api.mainnet-beta.solana.com"
ETHEREUM_RPC_URL="https://eth-mainnet.g.alchemy.com/v2/your-key"
```

### 4. Database Setup

Create PostgreSQL database:

```bash
createdb astro_db
```

Generate Prisma client:

```bash
npm run db:generate
```

Push schema to database:

```bash
npm run db:push
```

Or run migrations:

```bash
npm run db:migrate
```

### 5. Seed Database (Optional)

Populate database with test data:

```bash
npm run db:seed
```

This creates:
- Email user: `test@astro.app` / `Test1234!`
- Wallet user with test wallet address
- Sample assets (BTC, ETH, SOL)

### 6. Start Development Server

```bash
npm run dev
```

The API will start on `http://localhost:3001`.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build production bundle |
| `npm start` | Start production server |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database (no migrations) |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed database with test data |
| `npm run db:studio` | Open Prisma Studio (database GUI) |

## API Endpoints

### Health Check

```
GET /health
```

Returns server status and uptime.

### Authentication

All authentication endpoints are under `/v1/auth`:

#### Register with Email

```
POST /v1/auth/register
Content-Type: application/json

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

#### Login with Email

```
POST /v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

#### Request Wallet Nonce

```
POST /v1/auth/wallet/nonce
Content-Type: application/json

{
  "walletAddress": "7gxF...abc",
  "blockchain": "solana"
}
```

#### Verify Wallet Signature

```
POST /v1/auth/wallet/verify
Content-Type: application/json

{
  "walletAddress": "7gxF...abc",
  "blockchain": "solana",
  "signature": "5k2j...xyz",
  "nonce": "a1b2c3d4e5f6"
}
```

#### Get Current User

```
GET /v1/auth/me
Authorization: Bearer <jwt_token>
```

#### Refresh Token

```
POST /v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh_token_here"
}
```

#### Logout

```
POST /v1/auth/logout
Authorization: Bearer <jwt_token>
```

## Authentication

The API supports three authentication methods:

1. **Email/Password**: Traditional authentication
2. **Wallet (Web3)**: Solana and Ethereum wallet signatures
3. **OAuth**: Google, Apple, Twitter (structure in place)

### Using JWT Tokens

After login/register, you'll receive:

```json
{
  "user": { ... },
  "tokens": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "expiresIn": 3600
  }
}
```

Include the access token in subsequent requests:

```
Authorization: Bearer <accessToken>
```

### Wallet Authentication Flow

1. **Request Nonce**: Client calls `/auth/wallet/nonce`
2. **Sign Message**: User signs the message with their wallet
3. **Verify Signature**: Client sends signature to `/auth/wallet/verify`
4. **Receive JWT**: Server verifies signature and returns JWT tokens

Supported blockchains:
- `solana` - Solana (Phantom, Solflare)
- `ethereum` - Ethereum mainnet (MetaMask, Coinbase Wallet)
- `base` - Base L2
- `polygon` - Polygon

## Error Handling

All errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

Common error codes:
- `VALIDATION_ERROR` (400) - Request validation failed
- `UNAUTHORIZED` (401) - Missing/invalid authentication
- `FORBIDDEN` (403) - Insufficient permissions
- `NOT_FOUND` (404) - Resource not found
- `CONFLICT` (409) - Resource conflict (e.g., email already exists)
- `RATE_LIMIT_EXCEEDED` (429) - Too many requests
- `INTERNAL_ERROR` (500) - Server error

## Rate Limiting

Default rate limits:
- 100 requests per 15 minutes per IP

Configure in `.env`:
```env
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Security Features

- Helmet.js for security headers
- CORS protection
- Rate limiting
- Password hashing with bcrypt (10 rounds)
- JWT with expiration
- Input validation with Zod
- Wallet signature verification
- SQL injection protection via Prisma

## Database Management

### Prisma Studio

Visual database editor:

```bash
npm run db:studio
```

Opens at `http://localhost:5555`

### Migrations

Create a new migration:

```bash
npm run db:migrate
```

### Schema Updates

After updating `packages/database/prisma/schema.prisma`:

1. Generate client: `npm run db:generate`
2. Push changes: `npm run db:push` (development)
3. Or create migration: `npm run db:migrate` (production)

## Development Workflow

1. **Start database**: Ensure PostgreSQL is running
2. **Start dev server**: `npm run dev`
3. **Make changes**: Edit files in `src/`
4. **Hot reload**: Server automatically restarts
5. **Test endpoints**: Use Postman, curl, or your frontend

### Using with Frontend

The API is configured to work with the Next.js frontend:

```env
CORS_ORIGIN="http://localhost:3000"
```

Multiple origins:
```env
CORS_ORIGIN="http://localhost:3000,http://localhost:3001"
```

## Testing

Test credentials (after seeding):

**Email Auth:**
- Email: `test@astro.app`
- Password: `Test1234!`
- Tier: pro
- Credits: 100

**Wallet Auth:**
- Address: `7gxFq9YZVhXvuM5oKB3YvDxH1h2N8kL4pR6tS9uW2vX`
- Blockchain: solana
- Tier: basic
- Credits: 50

### Manual Testing with curl

**Register:**
```bash
curl -X POST http://localhost:3001/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "Test1234!",
    "username": "newuser"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3001/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@astro.app",
    "password": "Test1234!"
  }'
```

**Get User:**
```bash
curl -X GET http://localhost:3001/v1/auth/me \
  -H "Authorization: Bearer <your_token>"
```

## Production Deployment

### Build

```bash
npm run build
```

### Environment Variables

Ensure these are set in production:

```env
NODE_ENV="production"
DATABASE_URL="postgresql://..."
JWT_SECRET="strong-random-secret"
REDIS_URL="redis://..."
LOG_LEVEL="info"
```

### Start Production Server

```bash
npm start
```

### Recommended Production Setup

- Use a process manager (PM2, systemd)
- Enable database connection pooling
- Set up Redis for caching
- Configure log rotation
- Use environment-specific configs
- Enable HTTPS/TLS
- Set up monitoring (Sentry, Datadog)
- Configure database backups

## Logging

Winston logger with multiple levels:
- `error`: Error messages
- `warn`: Warning messages
- `info`: Info messages (default)
- `debug`: Debug messages

Set log level in `.env`:
```env
LOG_LEVEL="debug"
```

Logs are written to:
- Console (development)
- Files (production): `logs/error.log`, `logs/combined.log`

## Architecture Decisions

### Why Prisma?

- Type-safe database queries
- Automatic migrations
- Excellent TypeScript support
- Built-in connection pooling
- Easy to test

### Why Express?

- Mature and stable
- Large ecosystem
- Flexible middleware system
- Well-documented
- Easy to learn

### Why JWT?

- Stateless authentication
- Scalable across multiple servers
- Works well with mobile apps
- Easy to implement

## Next Steps

1. **Add more endpoints**: User management, predictions, assets
2. **Implement OAuth**: Google, Apple, Twitter authentication
3. **Add WebSocket**: Real-time prediction updates
4. **Implement caching**: Use Redis for frequently accessed data
5. **Add tests**: Unit and integration tests
6. **Set up CI/CD**: Automated testing and deployment
7. **API documentation**: Generate OpenAPI/Swagger docs
8. **Monitoring**: Add APM and error tracking

## Troubleshooting

### Database Connection Issues

```
Error: Can't reach database server
```

**Solution**: Ensure PostgreSQL is running and DATABASE_URL is correct.

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::3001
```

**Solution**: Kill the process using the port or change API_PORT in `.env`.

### Prisma Client Not Generated

```
Error: Cannot find module '@prisma/client'
```

**Solution**: Run `npm run db:generate`.

### JWT Token Invalid

```
Error: Invalid or expired token
```

**Solution**: Token may have expired. Request a new token via `/auth/refresh`.

## Support

For questions or issues:
- Check the API documentation: `/home/user/astro/docs/API.md`
- Review the database schema: `/home/user/astro/schema.sql`
- Check Web3 auth guide: `/home/user/astro/docs/WEB3_AUTH.md`

## License

Proprietary - Astro Prediction Platform

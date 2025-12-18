# Astro API - Quick Start Guide

Get the API running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- Git

## Installation Steps

### 1. Install Dependencies

```bash
# From project root
cd apps/api
npm install

# Install database package
cd ../../packages/database
npm install
cd ../../apps/api
```

### 2. Set Up Database

```bash
# Create PostgreSQL database
createdb astro_db

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
```

### 3. Configure Environment

The `.env` file is already created with default development settings.

**Important**: Update `DATABASE_URL` in `.env` if your PostgreSQL credentials differ:

```env
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/astro_db"
```

### 4. Seed Database (Optional)

```bash
npm run db:seed
```

This creates test accounts and sample data.

### 5. Start Development Server

```bash
npm run dev
```

The API will start on http://localhost:3001

## Test It!

### Health Check

```bash
curl http://localhost:3001/health
```

### Register a User

```bash
curl -X POST http://localhost:3001/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "Test1234!",
    "username": "demouser"
  }'
```

### Login

```bash
curl -X POST http://localhost:3001/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@astro.app",
    "password": "Test1234!"
  }'
```

Save the `accessToken` from the response!

### Get User Info

```bash
curl http://localhost:3001/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Test Accounts (After Seeding)

### Email User
- **Email**: test@astro.app
- **Password**: Test1234!
- **Tier**: pro
- **Credits**: 100

### Wallet User
- **Email**: wallet@astro.app
- **Wallet**: 7gxFq9YZVhXvuM5oKB3YvDxH1h2N8kL4pR6tS9uW2vX
- **Blockchain**: solana
- **Tier**: basic

## Available Endpoints

All endpoints are under `/v1`:

- `POST /v1/auth/register` - Register new user
- `POST /v1/auth/login` - Login with email/password
- `GET /v1/auth/me` - Get current user
- `POST /v1/auth/logout` - Logout
- `POST /v1/auth/refresh` - Refresh access token
- `POST /v1/auth/wallet/nonce` - Request wallet nonce
- `POST /v1/auth/wallet/verify` - Verify wallet signature

## Useful Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Open Prisma Studio (database GUI)
npm run db:studio

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed database
npm run db:seed
```

## Troubleshooting

### Database connection failed

1. Ensure PostgreSQL is running: `pg_isready`
2. Check DATABASE_URL in `.env`
3. Verify database exists: `psql -l | grep astro_db`

### Port 3001 already in use

Change `API_PORT` in `.env` to a different port.

### Prisma client not found

Run: `npm run db:generate`

## Next Steps

- Read the full README.md for detailed documentation
- Check /home/user/astro/docs/API.md for API specifications
- Review /home/user/astro/docs/WEB3_AUTH.md for wallet authentication
- Explore the code in `src/` directory

## Need Help?

- Check the main README: [README.md](./README.md)
- Review error logs in console
- Open Prisma Studio to inspect database: `npm run db:studio`

Happy coding!

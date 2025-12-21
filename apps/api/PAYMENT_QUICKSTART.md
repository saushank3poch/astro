# Payment System Quick Start Guide

## File Locations

### Core Services
- **Main Service**: `/home/user/astro/apps/api/src/services/payment.service.ts`
- **Solana Handler**: `/home/user/astro/apps/api/src/services/payments/solana-payment.service.ts`
- **Ethereum Handler**: `/home/user/astro/apps/api/src/services/payments/ethereum-payment.service.ts`

### Configuration
- **Pricing & Config**: `/home/user/astro/apps/api/src/config/pricing.ts`
- **Environment**: `/home/user/astro/apps/api/.env.example`

### Background Jobs
- **Transaction Monitor**: `/home/user/astro/apps/api/src/jobs/transaction-monitor.job.ts`

### API
- **Routes**: `/home/user/astro/apps/api/src/routes/payment.routes.ts`
- **Main App**: `/home/user/astro/apps/api/src/index.ts`

### Database
- **Schema**: `/home/user/astro/packages/database/prisma/schema.prisma`

### Testing
- **Test Suite**: `/home/user/astro/apps/api/src/scripts/test-payments.ts`

### Documentation
- **Full Docs**: `/home/user/astro/apps/api/PAYMENT_SYSTEM.md`
- **Implementation Summary**: `/home/user/astro/apps/api/PHASE_8_SUMMARY.md`

## Quick Setup

1. **Configure Environment**
   ```bash
   cd /home/user/astro/apps/api
   cp .env.example .env
   # Edit .env with your wallet addresses and RPC URLs
   ```

2. **Update Database**
   ```bash
   npm run db:push
   ```

3. **Test Payment System**
   ```bash
   npm run test:payments
   ```

4. **Start Server**
   ```bash
   npm run dev
   ```

## Key Endpoints

- `POST /v1/payments/create` - Create payment
- `GET /v1/payments/:id/status` - Check status
- `GET /v1/payments/history` - User history

## Supported Chains

- **Solana**: SOL, USDC
- **Ethereum**: ETH, USDC, USDT
- **Base**: ETH, USDC

## Architecture Flow

```
User → Frontend → API Routes → Payment Service
                                      ↓
                            Solana/Ethereum Service
                                      ↓
                              Blockchain (Payment)
                                      ↓
                            Transaction Monitor (Background Job)
                                      ↓
                              Credits Service (Auto-allocate)
```

## Important Notes

- Transaction monitor runs every 5 seconds
- Payments timeout after 10 minutes
- Solana: 1 confirmation (finalized)
- Ethereum: 12 confirmations
- Base: 1 confirmation
- Prices cached for 5 minutes

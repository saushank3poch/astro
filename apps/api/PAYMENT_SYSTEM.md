# Payment System Documentation

## Overview

The Astro Platform Payment System supports cryptocurrency payments across multiple blockchains:

- **Solana**: Native SOL and USDC (SPL token)
- **Ethereum**: Native ETH, USDC, and USDT (ERC20 tokens)
- **Base**: Native ETH and USDC (ERC20 tokens)

## Architecture

### Services

1. **PaymentService** (`/services/payment.service.ts`)
   - Main orchestration service
   - Handles payment intent creation
   - Processes completed payments
   - Manages transaction history

2. **SolanaPaymentService** (`/services/payments/solana-payment.service.ts`)
   - Solana Pay integration
   - QR code generation
   - Transaction monitoring for Solana
   - SOL/USDC price fetching

3. **EthereumPaymentService** (`/services/payments/ethereum-payment.service.ts`)
   - Ethereum/Base payment handling
   - ERC20 token support
   - Transaction verification
   - ETH/USDC/USDT price fetching

4. **TransactionMonitor** (`/jobs/transaction-monitor.job.ts`)
   - Background job running every 5 seconds
   - Monitors pending transactions
   - Processes confirmations
   - Handles timeouts

### Database Schema

The `Transaction` model includes:

```typescript
{
  id: string;                    // Unique transaction ID
  userId: string;                // User who made payment
  amount: number;                // Amount in USD
  currency: string;              // Token type (SOL, ETH, USDC, etc.)
  paymentMethod: string;         // crypto_solana, crypto_ethereum, crypto_base
  transactionHash: string;       // Blockchain transaction hash
  fromWallet: string;            // Sender wallet address
  toWallet: string;              // Merchant wallet address
  blockchain: string;            // solana, ethereum, base
  tokenType: string;             // native, usdc, usdt
  confirmationCount: number;     // Current confirmations
  creditsGranted: number;        // Credits to grant
  subscriptionDaysGranted: number; // Days for subscription
  status: string;                // pending, confirmed, completed, failed, expired
  createdAt: Date;
  confirmedAt: Date;
  completedAt: Date;
}
```

## Pricing Tiers

Configured in `/config/pricing.ts`:

```typescript
credits_10: {
  credits: 10,
  priceUSD: 4.99,
  description: 'Starter Pack',
}

credits_50: {
  credits: 50,
  priceUSD: 19.99,
  description: 'Value Pack',
  discount: '20%',
}

credits_100: {
  credits: 100,
  priceUSD: 34.99,
  description: 'Power Pack',
  discount: '30%',
}

unlimited_month: {
  credits: -1,
  priceUSD: 49.99,
  description: 'Unlimited Monthly',
  duration: 30 days,
}
```

## API Endpoints

### Public Endpoints

#### GET /v1/payments/packages
Get available packages and pricing.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "credits_10",
      "credits": 10,
      "priceUSD": 4.99,
      "description": "Starter Pack"
    }
  ]
}
```

### Authenticated Endpoints

#### POST /v1/payments/create
Create a payment intent.

**Request:**
```json
{
  "packageType": "credits_10",
  "blockchain": "solana",
  "token": "native"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "amount": 4.99,
    "amountCrypto": 0.05,
    "currency": "SOL",
    "blockchain": "solana",
    "recipientAddress": "merchant_wallet_address",
    "expiresAt": "2024-01-01T00:00:00Z",
    "qrCode": "data:image/png;base64,...",
    "paymentUrl": "solana:...",
    "reference": "unique_reference",
    "packageType": "credits_10"
  }
}
```

#### GET /v1/payments/:paymentId/status
Get payment status.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "pending",
    "amount": 4.99,
    "blockchain": "solana",
    "transactionHash": null,
    "confirmationCount": 0,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### POST /v1/payments/:paymentId/verify
Manually verify payment with transaction hash (for Ethereum/Base).

**Request:**
```json
{
  "transactionHash": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verification initiated"
}
```

#### GET /v1/payments/history
Get user's transaction history.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "amount": 4.99,
      "status": "completed",
      "blockchain": "solana",
      "transactionHash": "...",
      "creditsGranted": 10,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Admin Endpoints

#### GET /v1/payments/admin/all
Get all transactions with filters.

**Query Parameters:**
- `status`: Filter by status (pending, completed, failed)
- `userId`: Filter by user ID
- `blockchain`: Filter by blockchain
- `startDate`: Filter by start date
- `endDate`: Filter by end date
- `limit`: Results per page (default: 100)
- `offset`: Pagination offset

#### GET /v1/payments/admin/stats
Get payment statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 12345.67,
    "successfulPayments": 100,
    "pendingPayments": 5,
    "failedPayments": 2,
    "revenueByBlockchain": [
      {
        "blockchain": "solana",
        "_sum": { "usdValue": 5000 },
        "_count": 50
      }
    ]
  }
}
```

## Payment Flow

### Solana Payment Flow

1. **Create Payment Intent**
   - User selects package and blockchain
   - System generates unique reference key
   - Creates Solana Pay URL and QR code
   - Stores pending transaction in database

2. **User Makes Payment**
   - User scans QR code or uses payment URL
   - Wallet (Phantom, etc.) prompts for approval
   - User confirms transaction

3. **Transaction Monitoring**
   - Background job polls for transaction using reference
   - Detects transaction when it appears on-chain
   - Waits for finalization (1 confirmation)

4. **Payment Processing**
   - Verifies transaction amount and recipient
   - Marks transaction as confirmed
   - Grants credits to user
   - Marks transaction as completed

### Ethereum/Base Payment Flow

1. **Create Payment Intent**
   - User selects package and blockchain
   - System provides merchant address and amount
   - Stores pending transaction in database

2. **User Makes Payment**
   - User sends ETH/USDC/USDT to merchant address
   - Copies transaction hash after sending

3. **Manual Verification**
   - User submits transaction hash via verify endpoint
   - System stores hash on transaction record

4. **Transaction Monitoring**
   - Background job checks transaction on blockchain
   - Waits for required confirmations (12 for Ethereum, 1 for Base)

5. **Payment Processing**
   - Verifies transaction amount and recipient
   - For ERC20: Verifies Transfer event in receipt
   - Marks transaction as confirmed
   - Grants credits to user
   - Marks transaction as completed

## Environment Variables

Required environment variables (see `.env.example`):

```bash
# Blockchain RPC URLs
SOLANA_RPC_URL="https://api.mainnet-beta.solana.com"
ETHEREUM_RPC_URL="https://eth-mainnet.g.alchemy.com/v2/your-key"
BASE_RPC_URL="https://base-mainnet.g.alchemy.com/v2/your-key"

# Merchant Wallets (where payments are received)
SOLANA_MERCHANT_WALLET="YOUR_SOLANA_WALLET_ADDRESS"
ETHEREUM_MERCHANT_WALLET="YOUR_ETH_WALLET_ADDRESS"
BASE_MERCHANT_WALLET="YOUR_BASE_WALLET_ADDRESS"

# Optional: API Keys for better reliability
HELIUS_API_KEY=""          # For Solana (optional)
COINGECKO_API_KEY=""       # For price feeds (optional)
```

## Testing

Run the payment test suite:

```bash
npm run test:payments
```

This will test:
- Price fetching for all tokens
- Payment intent creation for all chains
- Credits allocation
- Transaction history
- Payment statistics

## Security Features

1. **Amount Verification**
   - Backend verifies all amounts
   - Checks transaction recipient matches merchant wallet
   - Validates token type and blockchain

2. **Double-Spend Prevention**
   - Checks if transaction hash already processed
   - Uses unique references for tracking

3. **Timeout Handling**
   - Payments expire after 10 minutes
   - Expired payments marked automatically

4. **Confirmation Requirements**
   - Solana: 1 confirmation (finalized)
   - Ethereum: 12 confirmations
   - Base: 1 confirmation

## Error Handling

1. **Network Failures**
   - Background job retries automatically
   - Failed price fetches use fallback values

2. **Insufficient Payment**
   - Transaction marked as failed
   - User notified to retry

3. **Overpayment**
   - Can be configured to grant bonus credits
   - Currently grants exact package amount

4. **Timeout**
   - Marked as expired after 10 minutes
   - User can create new payment intent

## Performance Optimizations

1. **Price Caching**
   - Token prices cached for 5 minutes
   - Reduces API calls to CoinGecko

2. **Database Indexes**
   - Indexed on userId, status, blockchain
   - Fast queries for pending transactions

3. **Batch Processing**
   - Transaction monitor processes all pending transactions
   - Runs every 5 seconds

## Monitoring

The transaction monitor logs:
- All payment attempts
- Transaction confirmations
- Credit allocations
- Failed payments

Check logs for debugging:
```bash
# View API logs
tail -f logs/api.log

# Monitor transaction processing
grep "transaction" logs/api.log
```

## Future Enhancements

- [ ] Webhook support for real-time updates
- [ ] Support for more tokens (BONK, PEPE, etc.)
- [ ] Automatic refunds for failed payments
- [ ] Payment analytics dashboard
- [ ] Multi-signature wallet support
- [ ] Hardware wallet integration

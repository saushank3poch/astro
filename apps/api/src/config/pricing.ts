/**
 * Pricing Configuration for Payment System
 */

export interface PricingTier {
  credits: number;
  priceUSD: number;
  description: string;
  discount?: string;
  duration?: number; // for subscription tiers, in milliseconds
}

export const PRICING_TIERS: Record<string, PricingTier> = {
  credits_10: {
    credits: 10,
    priceUSD: 4.99,
    description: 'Starter Pack',
  },
  credits_50: {
    credits: 50,
    priceUSD: 19.99,
    description: 'Value Pack',
    discount: '20%',
  },
  credits_100: {
    credits: 100,
    priceUSD: 34.99,
    description: 'Power Pack',
    discount: '30%',
  },
  unlimited_month: {
    credits: -1, // unlimited
    priceUSD: 49.99,
    description: 'Unlimited Monthly',
    duration: 30 * 24 * 60 * 60 * 1000, // 30 days in ms
  },
};

export const MERCHANT_WALLETS = {
  solana: process.env.SOLANA_MERCHANT_WALLET || '',
  ethereum: process.env.ETHEREUM_MERCHANT_WALLET || '',
  base: process.env.BASE_MERCHANT_WALLET || '',
};

export const TOKEN_ADDRESSES = {
  ethereum: {
    usdc: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    usdt: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  },
  base: {
    usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  },
  solana: {
    usdc: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  },
};

export const RPC_URLS = {
  solana: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
  ethereum: process.env.ETHEREUM_RPC_URL || '',
  base: process.env.BASE_RPC_URL || '',
};

export const CONFIRMATION_REQUIREMENTS = {
  solana: 1, // finalized
  ethereum: 12,
  base: 1, // Base has faster finality
};

export const PAYMENT_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
export const TRANSACTION_POLL_INTERVAL_MS = 5000; // 5 seconds
export const PRICE_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

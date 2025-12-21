import { Blockchain } from './index';

export interface PaymentIntent {
  id: string;
  amount: number;
  amountCrypto: number;
  currency: string;
  blockchain: Blockchain;
  recipientAddress: string;
  qrCode?: string;
  deepLink?: string;
  expiresAt: string;
  memo?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  blockchain?: Blockchain;
  paymentMethod: string;
  transactionHash?: string;
  status: 'pending' | 'confirming' | 'completed' | 'failed' | 'expired';
  creditsGranted: number;
  packageType?: string;
  createdAt: string;
  confirmedAt?: string;
  completedAt?: string;
}

export type PaymentStatus = 'idle' | 'creating' | 'waiting' | 'processing' | 'success' | 'failed' | 'expired';

export interface CreditPackage {
  id: string;
  credits: number; // -1 for unlimited
  priceUSD: number;
  description: string;
  discount?: string; // e.g., "20%"
  bestValue?: boolean;
}

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'credits_10',
    credits: 10,
    priceUSD: 4.99,
    description: 'Perfect for trying out predictions',
  },
  {
    id: 'credits_50',
    credits: 50,
    priceUSD: 19.99,
    description: 'Most popular for regular users',
    discount: '20%',
  },
  {
    id: 'credits_100',
    credits: 100,
    priceUSD: 34.99,
    description: 'Best for serious traders',
    discount: '30%',
  },
  {
    id: 'unlimited_monthly',
    credits: -1,
    priceUSD: 49.99,
    description: 'Unlimited predictions for 30 days',
    bestValue: true,
  },
];

export interface BlockchainToken {
  symbol: string;
  name: string;
  decimals: number;
  isNative: boolean;
  contractAddress?: string;
}

export const BLOCKCHAIN_TOKENS: Record<Blockchain, BlockchainToken[]> = {
  solana: [
    { symbol: 'SOL', name: 'Solana', decimals: 9, isNative: true },
    { symbol: 'USDC', name: 'USD Coin', decimals: 6, isNative: false, contractAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' },
  ],
  ethereum: [
    { symbol: 'ETH', name: 'Ethereum', decimals: 18, isNative: true },
    { symbol: 'USDC', name: 'USD Coin', decimals: 6, isNative: false, contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
    { symbol: 'USDT', name: 'Tether', decimals: 6, isNative: false, contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7' },
  ],
  base: [
    { symbol: 'ETH', name: 'Ethereum', decimals: 18, isNative: true },
    { symbol: 'USDC', name: 'USD Coin', decimals: 6, isNative: false, contractAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' },
    { symbol: 'USDT', name: 'Tether', decimals: 6, isNative: false, contractAddress: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2' },
  ],
};

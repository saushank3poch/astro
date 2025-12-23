// User & Auth Types
export interface User {
  id: string;
  email: string;
  name: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  timezone: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  timezone: string;
}

// Subscription Types
export type SubscriptionTier = 'free' | 'basic' | 'pro';

export interface SubscriptionStatus {
  tier: SubscriptionTier;
  credits: number;
  monthlyCredits: number;
  expiresAt: string | null;
  isActive: boolean;
  autoRenew: boolean;
}

export interface SubscriptionPlan {
  id: string;
  tier: SubscriptionTier;
  name: string;
  price: number;
  currency: string;
  monthlyCredits: number;
  features: string[];
  popular?: boolean;
}

// Prediction Types
export type PredictionType = 'macro' | 'timing' | 'divination';

export interface Prediction {
  id: string;
  type: PredictionType;
  userId: string;
  input: any;
  result: any;
  creditsUsed: number;
  createdAt: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface MacroPredictionInput {
  year: number;
  assetClasses: string[];
}

export interface MacroPredictionResult {
  year: number;
  predictions: Array<{
    asset: string;
    score: number;
    reasoning: string;
  }>;
}

export interface TimingPredictionInput {
  assetSymbol: string;
  startDate: string;
  endDate: string;
}

export interface TimingPredictionResult {
  assetSymbol: string;
  periods: Array<{
    date: string;
    score: number;
    type: 'favorable' | 'unfavorable' | 'neutral';
  }>;
}

export interface DivinationInput {
  question: string;
  method: 'tarot' | 'iching';
  spread?: 'single' | 'three' | 'celtic';
}

export interface DivinationResult {
  method: string;
  cards?: Array<{
    name: string;
    position: string;
    meaning: string;
    reversed: boolean;
  }>;
  hexagram?: {
    number: number;
    name: string;
    interpretation: string;
  };
  interpretation: string;
}

// Compatibility Types
export interface CompatibleAsset {
  symbol: string;
  name: string;
  type: 'crypto' | 'stock' | 'commodity';
  compatibilityScore: number;
  element: string;
  reasoning: string;
}

// Birth Chart Types
export interface BirthChart {
  userId: string;
  sunSign: string;
  moonSign: string;
  ascendant: string;
  planets: Array<{
    name: string;
    sign: string;
    house: number;
    degree: number;
  }>;
  houses: Array<{
    number: number;
    sign: string;
    degree: number;
  }>;
}

// Notification Types
export interface NotificationSettings {
  dailyInsights: boolean;
  favorablePeriods: boolean;
  lowCredits: boolean;
  subscriptionExpiry: boolean;
}

// IAP Types
export interface IAPReceipt {
  productId: string;
  transactionId: string;
  receipt: string;
  platform: 'ios' | 'android';
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

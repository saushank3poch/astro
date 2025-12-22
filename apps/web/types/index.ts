// User types
export interface User {
  id: string;
  email: string | null;
  username: string | null;
  birthDate?: string;
  birthTime?: string;
  birthLocation?: BirthLocation;
  timezone?: string;
  subscriptionTier: SubscriptionTier;
  subscriptionExpiresAt?: string;
  creditsBalance: number;
  astrologySystem?: AstrologySystem;
  primaryAuthMethod: AuthMethod;
  emailVerified: boolean;
  twitterHandle?: string;
  twitterUserId?: string;
  wallets?: WalletInfo[];
  isAdmin?: boolean;
  createdAt: string;
}

export interface BirthLocation {
  lat: number;
  lng: number;
  city: string;
  country: string;
}

export type SubscriptionTier = 'free' | 'basic' | 'pro';
export type AstrologySystem = 'chinese' | 'western' | 'both';
export type AuthMethod = 'wallet' | 'email' | 'twitter' | 'google' | 'apple';

export interface WalletInfo {
  id?: string;
  address: string;
  blockchain: Blockchain;
  isPrimary: boolean;
  label?: string;
  domainName?: string;
  linkedAt?: string;
  lastUsedAt?: string;
}

export type Blockchain = 'solana' | 'ethereum' | 'base';

// Auth types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  birthDate: string;
  birthTime: string;
  birthLocation: BirthLocation;
  timezone: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RegisterResponse {
  user: User;
  tokens: AuthTokens;
}

// Wallet auth types
export interface WalletNonceRequest {
  walletAddress: string;
  blockchain: Blockchain;
}

export interface WalletNonceResponse {
  nonce: string;
  message: string;
  expiresAt: string;
}

export interface WalletVerifyRequest {
  walletAddress: string;
  blockchain: Blockchain;
  signature: string;
  nonce: string;
}

export interface WalletVerifyResponse {
  user: User;
  tokens: AuthTokens;
  isNewUser: boolean;
}

// Account linking types
export interface EmailLinkingRequest {
  email: string;
}

export interface EmailLinkingResponse {
  linkingRequestId: string;
  email: string;
  status: string;
  message: string;
  expiresAt: string;
}

export interface EmailVerifyRequest {
  linkingRequestId: string;
  verificationCode: string;
}

export interface LinkedAccountsResponse {
  userId: string;
  primaryAuthMethod: AuthMethod;
  linkedMethods: {
    email?: {
      verified: boolean;
      value: string;
      linkedAt: string;
    };
    twitter?: {
      verified: boolean;
      handle: string;
      userId: string;
      linkedAt: string;
    };
    wallets: WalletInfo[];
    google?: {
      verified: boolean;
      email: string;
      linkedAt: string;
    };
    apple?: {
      verified: boolean;
      email: string;
      linkedAt: string;
    };
  };
}

// Asset types
export interface Asset {
  id: string;
  symbol: string;
  name: string;
  assetType: AssetType;
  category: string;
  exchange?: string;
  birthDate?: string;
  birthTime?: string;
  birthLocation?: BirthLocation;
  birthDateSource?: string;
  birthDateConfidence?: 'high' | 'medium' | 'low';
  primaryElement?: ChineseElement;
  secondaryElement?: ChineseElement;
  chineseZodiac?: ChineseZodiac;
  sunSign?: ZodiacSign;
  dominantPlanet?: string;
  marketCap?: number;
  currentPrice?: number;
  isActive: boolean;
  isResearched: boolean;
  createdAt: string;
}

export type AssetType = 'crypto' | 'stock' | 'commodity';
export type ChineseElement = 'metal' | 'wood' | 'water' | 'fire' | 'earth';
export type ChineseZodiac = 'rat' | 'ox' | 'tiger' | 'rabbit' | 'dragon' | 'snake' | 'horse' | 'goat' | 'monkey' | 'rooster' | 'dog' | 'pig';
export type ZodiacSign = 'aries' | 'taurus' | 'gemini' | 'cancer' | 'leo' | 'virgo' | 'libra' | 'scorpio' | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces';

// Prediction types
export interface Prediction {
  id: string;
  userId: string;
  type: PredictionType;
  method: PredictionMethod;
  question?: string;
  targetAssetId?: string;
  targetAssetClass?: string;
  timeframe?: Timeframe;
  predictionResult?: any;
  confidenceScore?: number;
  favorableScore?: number;
  agentUsed?: string;
  reasoning?: string;
  recommendations?: any;
  divinationResult?: any;
  status: PredictionStatus;
  createdAt: string;
  completedAt?: string;
}

export type PredictionType = 'macro' | 'birth_date' | 'divination' | 'polymarket';
export type PredictionMethod = 'chinese' | 'western' | 'combined' | 'tarot' | 'iching';
export type Timeframe = 'short_term' | 'medium_term' | 'long_term';
export type PredictionStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface CreatePredictionRequest {
  type: PredictionType;
  method: PredictionMethod;
  targetAssetId?: string;
  targetAssetClass?: string;
  timeframe?: Timeframe;
  year?: number;
  specificDate?: string;
  question?: string;
  context?: any;
}

export interface CreatePredictionResponse {
  id: string;
  status: PredictionStatus;
  type: PredictionType;
  method: PredictionMethod;
  createdAt: string;
  estimatedCompletionTime: string;
}

// Compatibility types
export interface CompatibilityResult {
  userId: string;
  assetId: string;
  asset: {
    symbol: string;
    name: string;
    primaryElement: ChineseElement;
  };
  compatibilityScore: number;
  elementCompatibilityScore: number;
  planetaryCompatibilityScore: number;
  timingCompatibilityScore: number;
  elementHarmony: any;
  recommendationLevel: RecommendationLevel;
  reasoning: string;
  whyGoodForUser: string;
  tips: string;
  bestEntryPeriods: EntryPeriod[];
  calculatedAt: string;
  expiresAt: string;
}

export type RecommendationLevel = 'highly_favorable' | 'favorable' | 'neutral' | 'unfavorable' | 'avoid';

export interface EntryPeriod {
  start: string;
  end: string;
  score: number;
  reason: string;
}

// Payment types
export interface CryptoPaymentRequest {
  amount: number;
  currency: string;
  blockchain: Blockchain;
  productType: 'credits' | 'subscription';
  creditsAmount?: number;
}

export interface CryptoPaymentResponse {
  transactionId: string;
  paymentRequest: {
    amount: number;
    currency: string;
    blockchain: Blockchain;
    recipientAddress: string;
    memo: string;
    qrCode: string;
    deepLink?: string;
  };
  expiresAt: string;
  status: PaymentStatus;
}

export type PaymentStatus = 'pending' | 'confirming' | 'completed' | 'failed' | 'expired';

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  blockchain?: Blockchain;
  transactionHash?: string;
  status: PaymentStatus;
  confirmations?: number;
  creditsGranted?: number;
  createdAt: string;
  confirmedAt?: string;
  completedAt?: string;
}

// API Error types
export interface APIError {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

// Pagination types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// Polymarket types
export interface PolymarketEvent {
  id: string;
  polymarketId: string;
  title: string;
  description?: string;
  category: string;
  startDate?: string;
  endDate: string;
  outcomes: EventOutcome[];
  currentOdds: Record<string, number>;
  volume: number;
  liquidity?: number;
  astrologicalPrediction?: AstrologicalPrediction;
  relatedAssets?: string[];
  lastAnalyzedAt?: string;
  createdAt: string;
}

export interface EventOutcome {
  id: string;
  name: string;
  description?: string;
}

export interface AstrologicalPrediction {
  favorableOutcome: string;
  favorableOutcomeName: string;
  confidenceScore: number;
  reasoning: string;
  detailedAnalysis?: any;
  recommendation?: string;
  agentUsed?: string;
}

// Birth Chart types
export interface BirthChart {
  userId: string;
  chinese?: ChineseBirthChart;
  western?: WesternBirthChart;
  calculatedAt: string;
}

export interface ChineseBirthChart {
  zodiacAnimal: ChineseZodiac;
  zodiacYear: number;
  element: ChineseElement;
  yinYang: 'yin' | 'yang';
  bazi: BaziPillars;
  favorableElements: ChineseElement[];
  unfavorableElements: ChineseElement[];
  luckyNumbers: number[];
  luckyColors: string[];
  luckyDirections: string[];
  personality: string;
  strengths: string[];
  weaknesses: string[];
}

export interface BaziPillars {
  year: BaziPillar;
  month: BaziPillar;
  day: BaziPillar;
  hour: BaziPillar;
}

export interface BaziPillar {
  heavenlyStem: string;
  earthlyBranch: string;
  element: ChineseElement;
}

export interface WesternBirthChart {
  sunSign: ZodiacSign;
  moonSign: ZodiacSign;
  risingSign: ZodiacSign;
  planets: PlanetaryPosition[];
  houses: HousePosition[];
  aspects: Aspect[];
  dominantElements: ElementDistribution;
  dominantModality: 'cardinal' | 'fixed' | 'mutable';
  dominantPolarity: 'positive' | 'negative';
  chartPattern?: string;
}

export interface PlanetaryPosition {
  planet: Planet;
  sign: ZodiacSign;
  house: number;
  degree: number;
  isRetrograde: boolean;
}

export type Planet = 'sun' | 'moon' | 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'neptune' | 'pluto';

export interface HousePosition {
  house: number;
  sign: ZodiacSign;
  degree: number;
}

export interface Aspect {
  planet1: Planet;
  planet2: Planet;
  type: AspectType;
  angle: number;
  orb: number;
}

export type AspectType = 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile' | 'quincunx';

export interface ElementDistribution {
  fire: number;
  earth: number;
  air: number;
  water: number;
}

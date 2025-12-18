import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email?: string;
    role: string;
    subscriptionTier: string;
  };
}

export interface JWTPayload {
  userId: string;
  email?: string;
  role: string;
  subscriptionTier: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface WalletSignatureVerification {
  isValid: boolean;
  walletAddress?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface PaginationParams {
  limit: number;
  offset: number;
}

export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

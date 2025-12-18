import { z } from 'zod';

// Auth validation schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
  birthDate: z.string().optional(),
  birthTime: z.string().optional(),
  birthLocation: z
    .object({
      lat: z.number(),
      lng: z.number(),
      city: z.string(),
      country: z.string(),
    })
    .optional(),
  timezone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const walletNonceSchema = z.object({
  walletAddress: z.string().min(32, 'Invalid wallet address'),
  blockchain: z.enum(['solana', 'ethereum', 'base', 'polygon']),
});

export const walletVerifySchema = z.object({
  walletAddress: z.string().min(32, 'Invalid wallet address'),
  blockchain: z.enum(['solana', 'ethereum', 'base', 'polygon']),
  signature: z.string().min(1, 'Signature is required'),
  nonce: z.string().min(1, 'Nonce is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Pagination validation
export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

// Helper to validate request body
export function validateBody<T extends z.ZodType>(
  schema: T,
  data: unknown
): z.infer<T> {
  return schema.parse(data);
}

// Helper to validate query params
export function validateQuery<T extends z.ZodType>(
  schema: T,
  data: unknown
): z.infer<T> {
  return schema.parse(data);
}

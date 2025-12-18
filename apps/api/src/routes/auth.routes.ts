import { Router, Response } from 'express';
import { authService } from '../services/auth.service';
import { authenticate } from '../middleware/auth.middleware';
import { AuthRequest } from '../types';
import {
  validateBody,
  registerSchema,
  loginSchema,
  walletNonceSchema,
  walletVerifySchema,
  refreshTokenSchema,
} from '../utils/validation';
import logger from '../utils/logger';

const router = Router();

/**
 * POST /auth/register
 * Register a new user with email/password
 */
router.post('/register', async (req, res: Response, next) => {
  try {
    const data = validateBody(registerSchema, req.body);
    const result = await authService.register(data);

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /auth/login
 * Login with email/password
 */
router.post('/login', async (req, res: Response, next) => {
  try {
    const { email, password } = validateBody(loginSchema, req.body);
    const result = await authService.login(email, password);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /auth/logout
 * Logout (client-side token removal, optional server-side token blacklisting)
 */
router.post('/logout', authenticate, async (req: AuthRequest, res: Response) => {
  // In a production app, you might want to blacklist the token here
  // For now, we rely on client-side token removal

  logger.info('User logged out', { userId: req.user?.userId });

  res.status(204).send();
});

/**
 * POST /auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', async (req, res: Response, next) => {
  try {
    const { refreshToken } = validateBody(refreshTokenSchema, req.body);
    const tokens = await authService.refreshAccessToken(refreshToken);

    res.status(200).json(tokens);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /auth/wallet/nonce
 * Request a nonce for wallet signature verification
 */
router.post('/wallet/nonce', async (req, res: Response, next) => {
  try {
    const { walletAddress, blockchain } = validateBody(
      walletNonceSchema,
      req.body
    );

    const result = await authService.requestWalletNonce(
      walletAddress,
      blockchain
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /auth/wallet/verify
 * Verify wallet signature and authenticate user
 */
router.post('/wallet/verify', async (req, res: Response, next) => {
  try {
    const { walletAddress, blockchain, signature, nonce } = validateBody(
      walletVerifySchema,
      req.body
    );

    const result = await authService.verifyWalletAndAuthenticate(
      walletAddress,
      blockchain,
      signature,
      nonce
    );

    const statusCode = result.isNewUser ? 201 : 200;
    res.status(statusCode).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /auth/me
 * Get current authenticated user
 */
router.get('/me', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        },
      });
    }

    const user = await authService.getUserById(req.user.userId);

    res.status(200).json({
      id: user.id,
      email: user.email,
      username: user.username,
      birthDate: user.birthDate,
      subscriptionTier: user.subscriptionTier,
      subscriptionExpiresAt: user.subscriptionExpiresAt,
      creditsBalance: user.credits?.creditsBalance || 0,
      astrologySystem: user.astrologySystem,
      language: user.language,
      notificationsEnabled: user.notificationsEnabled,
      primaryAuthMethod: user.primaryAuthMethod,
      createdAt: user.createdAt,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

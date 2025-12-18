import { PrismaClient } from '@prisma/client';
import { hashPassword, verifyPassword } from '../utils/password';
import { generateTokenPair } from '../utils/jwt';
import {
  generateNonce,
  createAuthMessage,
  verifyWalletSignature,
} from '../utils/wallet';
import { JWTPayload, TokenPair } from '../types';
import logger from '../utils/logger';

const prisma = new PrismaClient();

interface RegisterData {
  email: string;
  password: string;
  username?: string;
  birthDate?: string;
  birthTime?: string;
  birthLocation?: {
    lat: number;
    lng: number;
    city: string;
    country: string;
  };
  timezone?: string;
}

interface WalletNonceResponse {
  nonce: string;
  message: string;
  expiresAt: Date;
}

interface AuthResponse {
  user: {
    id: string;
    email?: string | null;
    username?: string | null;
    subscriptionTier: string;
    primaryAuthMethod: string;
    wallets?: any[];
  };
  tokens: TokenPair;
  isNewUser?: boolean;
}

export class AuthService {
  /**
   * Register a new user with email/password
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        passwordHash,
        primaryAuthMethod: 'email',
        emailVerified: false,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        birthTime: data.birthTime ? new Date(`1970-01-01T${data.birthTime}`) : null,
        birthLocation: data.birthLocation,
        birthTimezone: data.timezone,
      },
    });

    // Create user credits record
    await prisma.userCredits.create({
      data: {
        userId: user.id,
        creditsBalance: 3, // Free tier gets 3 credits
      },
    });

    // Generate tokens
    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email || undefined,
      role: 'user',
      subscriptionTier: user.subscriptionTier,
    });

    logger.info('User registered successfully', { userId: user.id, email: user.email });

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        subscriptionTier: user.subscriptionTier,
        primaryAuthMethod: user.primaryAuthMethod,
      },
      tokens,
      isNewUser: true,
    };
  }

  /**
   * Login with email/password
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        walletConnections: true,
      },
    });

    if (!user || !user.passwordHash) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);

    if (!isValidPassword) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email || undefined,
      role: 'user',
      subscriptionTier: user.subscriptionTier,
    });

    logger.info('User logged in successfully', { userId: user.id, email: user.email });

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        subscriptionTier: user.subscriptionTier,
        primaryAuthMethod: user.primaryAuthMethod,
        wallets: user.walletConnections.map((w) => ({
          address: w.walletAddress,
          blockchain: w.blockchain,
          isPrimary: w.isPrimary,
        })),
      },
      tokens,
    };
  }

  /**
   * Request nonce for wallet authentication
   */
  async requestWalletNonce(
    walletAddress: string,
    blockchain: string
  ): Promise<WalletNonceResponse> {
    // Generate nonce
    const nonce = generateNonce();
    const message = createAuthMessage(nonce, 'sign_in');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Check if there's an existing unused nonce for this wallet
    const existingNonce = await prisma.walletNonce.findFirst({
      where: {
        walletAddress,
        blockchain,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (existingNonce) {
      // Return existing nonce
      return {
        nonce: existingNonce.nonce,
        message: existingNonce.message,
        expiresAt: existingNonce.expiresAt,
      };
    }

    // Create new nonce
    await prisma.walletNonce.create({
      data: {
        walletAddress,
        blockchain,
        nonce,
        message,
        expiresAt,
      },
    });

    logger.info('Wallet nonce generated', { walletAddress, blockchain });

    return {
      nonce,
      message,
      expiresAt,
    };
  }

  /**
   * Verify wallet signature and authenticate
   */
  async verifyWalletAndAuthenticate(
    walletAddress: string,
    blockchain: string,
    signature: string,
    nonce: string
  ): Promise<AuthResponse> {
    // Find nonce
    const nonceRecord = await prisma.walletNonce.findFirst({
      where: {
        walletAddress,
        blockchain,
        nonce,
        used: false,
      },
    });

    if (!nonceRecord) {
      throw new Error('NONCE_NOT_FOUND');
    }

    // Check if expired
    if (nonceRecord.expiresAt < new Date()) {
      throw new Error('NONCE_EXPIRED');
    }

    // Verify signature
    const verification = verifyWalletSignature(
      blockchain,
      nonceRecord.message,
      signature,
      walletAddress
    );

    if (!verification.isValid) {
      throw new Error('INVALID_SIGNATURE');
    }

    // Mark nonce as used
    await prisma.walletNonce.update({
      where: { id: nonceRecord.id },
      data: { used: true },
    });

    // Find existing wallet connection
    const walletConnection = await prisma.walletConnection.findUnique({
      where: {
        walletAddress_blockchain: {
          walletAddress,
          blockchain,
        },
      },
      include: {
        user: {
          include: {
            walletConnections: true,
          },
        },
      },
    });

    let user;
    let isNewUser = false;

    if (walletConnection) {
      // Existing user - update last used
      await prisma.walletConnection.update({
        where: { id: walletConnection.id },
        data: { lastUsedAt: new Date() },
      });

      user = walletConnection.user;

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
    } else {
      // New user - create account
      isNewUser = true;

      user = await prisma.user.create({
        data: {
          primaryAuthMethod: 'wallet',
          subscriptionTier: 'free',
        },
      });

      // Create wallet connection
      await prisma.walletConnection.create({
        data: {
          userId: user.id,
          walletAddress,
          blockchain,
          isPrimary: true,
          verifiedAt: new Date(),
          lastUsedAt: new Date(),
        },
      });

      // Create user credits
      await prisma.userCredits.create({
        data: {
          userId: user.id,
          creditsBalance: 3, // Free tier gets 3 credits
        },
      });

      logger.info('New user created via wallet', { userId: user.id, walletAddress, blockchain });
    }

    // Fetch wallet connections
    const wallets = await prisma.walletConnection.findMany({
      where: { userId: user.id },
    });

    // Generate tokens
    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email || undefined,
      role: 'user',
      subscriptionTier: user.subscriptionTier,
    });

    logger.info('User authenticated via wallet', { userId: user.id, walletAddress, blockchain });

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        subscriptionTier: user.subscriptionTier,
        primaryAuthMethod: user.primaryAuthMethod,
        wallets: wallets.map((w) => ({
          address: w.walletAddress,
          blockchain: w.blockchain,
          isPrimary: w.isPrimary,
          label: w.label,
        })),
      },
      tokens,
      isNewUser,
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        walletConnections: true,
        credits: true,
      },
    });

    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    return user;
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<TokenPair> {
    // Note: In production, you should validate the refresh token against a database
    // and implement token rotation for better security
    const { verifyRefreshToken } = await import('../utils/jwt');
    const payload = verifyRefreshToken(refreshToken);

    // Generate new token pair
    return generateTokenPair(payload);
  }
}

export const authService = new AuthService();

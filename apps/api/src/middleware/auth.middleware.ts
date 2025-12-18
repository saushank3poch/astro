import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { AuthRequest } from '../types';
import logger from '../utils/logger';

export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing or invalid authorization header',
        },
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const payload = verifyAccessToken(token);

    // Attach user info to request
    req.user = payload;

    next();
  } catch (error) {
    logger.error('Authentication failed', { error });
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired token',
      },
    });
  }
}

export function optionalAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = verifyAccessToken(token);
      req.user = payload;
    }

    next();
  } catch (error) {
    // If token is invalid, just continue without user
    next();
  }
}

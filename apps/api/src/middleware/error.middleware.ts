import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import logger from '../utils/logger';

export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 400,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  error: Error | AppError | ZodError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error
  logger.error('Error occurred', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  });

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: error.errors,
      },
    });
  }

  // Handle custom app errors
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    });
  }

  // Handle specific error messages from services
  if (error.message === 'EMAIL_ALREADY_EXISTS') {
    return res.status(409).json({
      error: {
        code: 'EMAIL_ALREADY_EXISTS',
        message: 'An account with this email already exists',
      },
    });
  }

  if (error.message === 'INVALID_CREDENTIALS') {
    return res.status(401).json({
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      },
    });
  }

  if (error.message === 'USER_NOT_FOUND') {
    return res.status(404).json({
      error: {
        code: 'USER_NOT_FOUND',
        message: 'User not found',
      },
    });
  }

  if (error.message === 'NONCE_NOT_FOUND' || error.message === 'NONCE_EXPIRED') {
    return res.status(400).json({
      error: {
        code: error.message,
        message: 'Invalid or expired nonce',
      },
    });
  }

  if (error.message === 'INVALID_SIGNATURE') {
    return res.status(401).json({
      error: {
        code: 'INVALID_SIGNATURE',
        message: 'Wallet signature verification failed',
      },
    });
  }

  // Handle Prisma errors
  if (error.message.includes('Unique constraint')) {
    return res.status(409).json({
      error: {
        code: 'CONFLICT',
        message: 'Resource already exists',
      },
    });
  }

  // Default internal server error
  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  });
}

export function notFound(req: Request, res: Response) {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
}

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import birthChartRoutes from './routes/birth-chart.routes';
import predictionsRoutes from './routes/predictions.routes';
import compatibilityRoutes from './routes/compatibility.routes';
import paymentRoutes from './routes/payment.routes';
import { requestLogger } from './middleware/request-logger.middleware';
import { errorHandler, notFound } from './middleware/error.middleware';
import logger from './utils/logger';
import TransactionMonitor from './jobs/transaction-monitor.job';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 3001;

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Security headers
app.use(helmet());

// Enable CORS
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
app.use(
  cors({
    origin: corsOrigin.split(','),
    credentials: true,
  })
);

// Compression
app.use(compression());

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/v1', limiter);

// ============================================================================
// ROUTES
// ============================================================================

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API routes
app.use('/v1/auth', authRoutes);
app.use('/v1', birthChartRoutes);
app.use('/v1/predictions', predictionsRoutes);
app.use('/v1/compatibility', compatibilityRoutes);
app.use('/v1/payments', paymentRoutes);

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

// ============================================================================
// SERVER
// ============================================================================

app.listen(PORT, () => {
  logger.info(`Astro API server started`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
  });

  // Start transaction monitor
  const transactionMonitor = new TransactionMonitor();
  transactionMonitor.startMonitoringWithInterval();
  logger.info('Transaction monitor started');

  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🌟 Astro Prediction Platform API                   ║
║                                                       ║
║   Server running on: http://localhost:${PORT}        ║
║   Environment: ${process.env.NODE_ENV || 'development'}                        ║
║   Health check: http://localhost:${PORT}/health      ║
║   Transaction Monitor: Active                        ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection', { reason, promise });
  process.exit(1);
});

export default app;

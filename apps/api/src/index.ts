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
import adminRoutes from './routes/admin.routes';
import { requestLogger } from './middleware/request-logger.middleware';
import { errorHandler, notFound } from './middleware/error.middleware';
import {
  initializeMonitoring,
  performanceMonitoringMiddleware,
  errorTrackingMiddleware,
  healthCheckMiddleware,
  startCleanupJob,
} from './middleware/monitoring.middleware';
import logger from './utils/logger';
import TransactionMonitor from './jobs/transaction-monitor.job';

// Load environment variables
dotenv.config();

// Initialize monitoring services
const { performanceMonitor, errorTracker } = initializeMonitoring();

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

// Performance monitoring (track all requests)
app.use(performanceMonitoringMiddleware);

// Health check middleware
app.use(healthCheckMiddleware);

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
app.use('/v1/admin', adminRoutes);

// 404 handler
app.use(notFound);

// Error tracking middleware (before error handler)
app.use(errorTrackingMiddleware);

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

  // Start monitoring cleanup job (runs every hour)
  startCleanupJob(60);
  logger.info('Monitoring cleanup job started');

  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🌟 Astro Prediction Platform API                   ║
║                                                       ║
║   Server: http://localhost:${PORT}                   ║
║   Environment: ${process.env.NODE_ENV || 'development'}                        ║
║   Health: http://localhost:${PORT}/health            ║
║   Admin: http://localhost:${PORT}/v1/admin/overview  ║
║                                                       ║
║   ✅ Transaction Monitor: Active                     ║
║   ✅ Performance Monitoring: Active                  ║
║   ✅ Error Tracking: Active                          ║
║   ✅ Cache: Active                                   ║
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

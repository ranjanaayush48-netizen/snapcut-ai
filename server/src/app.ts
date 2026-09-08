import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import apiRouter from './routes/index.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { sendError } from './utils/apiResponse.js';

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    crossOriginEmbedderPolicy: false
  })
);

const allowedOrigins = new Set<string>(
  [
    env.FRONTEND_URL,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:3000'
  ].filter((v): v is string => Boolean(v && typeof v === 'string' && v.length > 0))
);

const isTrustedOrigin = (origin: string | undefined): boolean => {
  if (!origin) return true;
  if (allowedOrigins.has(origin)) return true;
  const host = origin.replace(/^https?:\/\//i, '').split(':')[0].toLowerCase();
  if (
    host === 'localhost' ||
    host.endsWith('.local') ||
    host.endsWith('.vercel.app') ||
    host.endsWith('.onrender.com') ||
    host.endsWith('.railway.app') ||
    host.endsWith('.fly.dev') ||
    host.endsWith('.render.com')
  ) {
    return true;
  }
  if (env.NODE_ENV === 'development') return true;
  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (isTrustedOrigin(origin)) return callback(null, origin);
      return callback(null, env.FRONTEND_URL || true);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Accept',
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'x-n8n-callback-secret',
      'x-razorpay-signature'
    ],
    exposedHeaders: ['Content-Disposition', 'X-Request-Id'],
    maxAge: 86400,
    preflightContinue: false,
    optionsSuccessStatus: 204
  })
);

app.options('*', (_req, res) => res.sendStatus(204));

// Capture raw body for Razorpay webhook cryptographic verification
app.use(
  express.json({
    limit: '15mb',
    verify: (req: any, _res, buf) => {
      req.rawBody = buf.toString();
    }
  })
);
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Apply general API rate limiter to all API endpoints
app.use('/api', apiLimiter);

// API router mount
app.use('/api', apiRouter);

// 404 handler for undefined endpoints
app.use((req, res) => {
  return sendError(res, 404, 'NOT_FOUND', `Cannot ${req.method} ${req.path}`);
});

// Centralized error handler
app.use(errorHandler);

export default app;

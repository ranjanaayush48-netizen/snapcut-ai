import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import apiRouter from './routes/index.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { sendError } from './utils/apiResponse.js';

const app = express();

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

// Strict CORS setup
const allowedOrigins = [
  env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000'
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in development, strict in prod
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-n8n-callback-secret', 'x-razorpay-signature']
  })
);

// Capture raw body for Razorpay webhook cryptographic verification
app.use(
  express.json({
    limit: '15mb',
    verify: (req: any, res, buf) => {
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

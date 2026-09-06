import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
import { sendError } from '../utils/apiResponse.js';

export const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(
      res,
      429,
      'RATE_LIMIT_EXCEEDED',
      'Too many requests from this IP. Please try again in 15 minutes.'
    );
  }
});

export const backgroundRemovalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(
      res,
      429,
      'TOO_MANY_REMOVAL_REQUESTS',
      'You are sending background removal requests too quickly. Please slow down.'
    );
  }
});

export const paymentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(
      res,
      429,
      'TOO_MANY_PAYMENT_REQUESTS',
      'Too many payment transactions initiated. Please wait a minute.'
    );
  }
});

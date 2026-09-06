import { Router } from 'express';
import { PaymentController } from '../controllers/paymentController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { paymentLimiter } from '../middleware/rateLimiter.js';
import { validateBody, createOrderSchema, verifyPaymentSchema } from '../validation/index.js';

const router = Router();

// POST /api/payments/create-order
router.post(
  '/create-order',
  paymentLimiter,
  requireAuth,
  validateBody(createOrderSchema),
  PaymentController.createOrder
);

// POST /api/payments/verify
router.post(
  '/verify',
  paymentLimiter,
  requireAuth,
  validateBody(verifyPaymentSchema),
  PaymentController.verifyPayment
);

// POST /api/payments/webhook
router.post('/webhook', PaymentController.handleWebhook);

// GET /api/payments/history
router.get('/history', requireAuth, PaymentController.getPaymentHistory);

export default router;

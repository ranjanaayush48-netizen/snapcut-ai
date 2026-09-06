import { Request, Response, NextFunction } from 'express';
import { subscriptionService } from '../services/subscriptionService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export class PaymentController {
  /**
   * POST /api/payments/create-order
   */
  static async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 401, 'UNAUTHORIZED', 'Authentication required.');
      }

      const { itemType, itemId } = req.body;
      const order = await subscriptionService.createPaymentOrder(req.user.id, itemType, itemId);

      return sendSuccess(res, order);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/payments/verify
   */
  static async verifyPayment(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 401, 'UNAUTHORIZED', 'Authentication required.');
      }

      const { razorpayOrderId, razorpayPaymentId, razorpaySignature, itemType, itemId } = req.body;

      const result = await subscriptionService.verifyAndFulfillPayment({
        userId: req.user.id,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        itemType,
        itemId
      });

      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/payments/webhook
   */
  static async handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = req.headers['x-razorpay-signature'] as string;
      const rawBody = (req as any).rawBody || JSON.stringify(req.body);

      await subscriptionService.handleWebhook(rawBody, signature, req.body);
      return sendSuccess(res, { status: 'ok' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/payments/history
   */
  static async getPaymentHistory(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 401, 'UNAUTHORIZED', 'Authentication required.');
      }

      const payments = await subscriptionService.getPaymentHistory(req.user.id);
      return sendSuccess(res, { payments });
    } catch (error) {
      next(error);
    }
  }
}

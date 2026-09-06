import Razorpay from 'razorpay';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import { verifyRazorpaySignature, verifyRazorpayWebhookSignature } from '../../utils/crypto.js';

class RazorpayService {
  private razorpayInstance: Razorpay | null = null;
  private isConfigured: boolean = false;

  constructor() {
    if (
      env.RAZORPAY_KEY_ID &&
      !env.RAZORPAY_KEY_ID.includes('mock') &&
      env.RAZORPAY_KEY_SECRET &&
      !env.RAZORPAY_KEY_SECRET.includes('mock')
    ) {
      this.razorpayInstance = new Razorpay({
        key_id: env.RAZORPAY_KEY_ID,
        key_secret: env.RAZORPAY_KEY_SECRET
      });
      this.isConfigured = true;
      logger.info('Razorpay SDK initialized in active mode');
    } else {
      logger.info('Razorpay credentials not fully configured; using local payment simulation mode.');
    }
  }

  /**
   * Create an order on Razorpay
   */
  async createOrder(params: {
    amountInRupees: number;
    receipt: string;
    notes?: Record<string, string>;
  }): Promise<{ orderId: string; amount: number; currency: string }> {
    const amountInPaise = Math.round(params.amountInRupees * 100);
    const currency = 'INR';

    if (this.isConfigured && this.razorpayInstance) {
      try {
        const order = await this.razorpayInstance.orders.create({
          amount: amountInPaise,
          currency,
          receipt: params.receipt,
          notes: params.notes || {}
        });

        return {
          orderId: order.id,
          amount: order.amount as number,
          currency: order.currency
        };
      } catch (error: any) {
        logger.error('Razorpay order creation failed', { error: error.message });
        throw new Error(`Razorpay order creation failed: ${error.message}`);
      }
    }

    // High-fidelity development simulator
    const mockOrderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      orderId: mockOrderId,
      amount: amountInPaise,
      currency
    };
  }

  /**
   * Verify HMAC SHA-256 payment signature
   */
  verifySignature(params: {
    orderId: string;
    paymentId: string;
    signature: string;
  }): boolean {
    // In simulator mode, check simulated signature or verify valid mock prefix
    if (!this.isConfigured) {
      if (params.signature.startsWith('sim_sig_') || params.orderId.startsWith('order_')) {
        return true;
      }
    }

    return verifyRazorpaySignature(
      params.orderId,
      params.paymentId,
      params.signature,
      env.RAZORPAY_KEY_SECRET
    );
  }

  /**
   * Verify Razorpay Webhook signature
   */
  verifyWebhook(rawBody: string, signature: string): boolean {
    if (!this.isConfigured && signature === 'sim_webhook_sig') {
      return true;
    }
    return verifyRazorpayWebhookSignature(rawBody, signature, env.RAZORPAY_WEBHOOK_SECRET);
  }

  getPublicKey(): string {
    return env.RAZORPAY_KEY_ID;
  }
}

export const razorpayService = new RazorpayService();

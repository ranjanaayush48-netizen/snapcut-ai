import Razorpay from 'razorpay';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import { verifyRazorpaySignature, verifyRazorpayWebhookSignature } from '../../utils/crypto.js';

class RazorpayService {
  private razorpayInstance: Razorpay | null = null;
  private isConfigured: boolean = false;
  private isDevMode: boolean = env.NODE_ENV === 'development';

  constructor() {
    const keyId = (env.RAZORPAY_KEY_ID || '').trim();
    const keySecret = (env.RAZORPAY_KEY_SECRET || '').trim();

    const hasRealKeyId =
      keyId.startsWith('rzp_') &&
      !keyId.includes('mock') &&
      !keyId.includes('YourKeyId') &&
      keyId.length >= 18;

    const hasRealKeySecret =
      keySecret.length >= 10 &&
      !keySecret.includes('mock') &&
      !keySecret.includes('YourRazorpay') &&
      !keySecret.includes('KeySecretHere');

    if (hasRealKeyId && hasRealKeySecret) {
      try {
        this.razorpayInstance = new Razorpay({
          key_id: keyId,
          key_secret: keySecret
        });
        this.isConfigured = true;
        logger.info('Razorpay SDK initialized in active mode', {
          keyIdPrefix: keyId.slice(0, 10) + '…',
          secretLen: keySecret.length
        });
      } catch (err: any) {
        logger.warn('Razorpay SDK instantiation failed, falling back', { error: err.message });
      }
    } else {
      if (this.isDevMode) {
        logger.info('Razorpay credentials not fully configured; using local payment simulation mode (development only).', { hasRealKeyId, hasRealKeySecret });
      } else {
        logger.warn('Razorpay credentials not fully configured in PRODUCTION. Checkout will FAIL — no payments will be accepted.', { hasRealKeyId, hasRealKeySecret });
      }
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
        let message = error?.message || String(error);
        try {
          const responseData = error?.response?.data?.error || error?.error;
          if (responseData?.description) {
            message = responseData.description;
            if (responseData?.code) message += ` [${responseData.code}]`;
          } else {
            if (error?.statusCode) message += ` (HTTP ${error.statusCode})`;
            if (error?.code) message += ` [code=${error.code}]`;
          }
        } catch {}
        logger.error('Razorpay order creation failed', { message });
        throw new Error(`Razorpay order creation failed: ${message}`);
      }
    }

    if (this.isDevMode) {
      const mockOrderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      return {
        orderId: mockOrderId,
        amount: amountInPaise,
        currency
      };
    }

    throw new Error(
      'Razorpay is not configured for production. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.'
    );
  }

  /**
   * Verify HMAC SHA-256 payment signature
   *
   * SECURITY: Simulated / dev-only signatures ("sim_sig_*") are ONLY permitted
   * when Razorpay real credentials are NOT present at all. Once RAZORPAY_KEY_ID
   * and RAZORPAY_KEY_SECRET contain real (non-mock) values (i.e. this.isConfigured
   * is true) every payment/verify call MUST pass a real HMAC from Razorpay.
   *
   * This prevents the "free upgrade attack" where a client submits
   * "sim_sig_developer_mode" as the signature in production.
   */
  verifySignature(params: {
    orderId: string;
    paymentId: string;
    signature: string;
  }): boolean {
    if (
      this.isDevMode &&
      !this.isConfigured &&
      (params.signature.startsWith('sim_sig_') ||
        params.orderId.startsWith('order_') ||
        params.paymentId.startsWith('pay_sim_'))
    ) {
      return true;
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
   *
   * SECURITY: Simulator signature ("sim_webhook_sig") is ONLY permitted when
   * real Razorpay credentials are not active AND we are running in NODE_ENV=development.
   */
  verifyWebhook(rawBody: string, signature: string): boolean {
    if (this.isDevMode && !this.isConfigured && signature === 'sim_webhook_sig') {
      return true;
    }
    return verifyRazorpayWebhookSignature(rawBody, signature, env.RAZORPAY_WEBHOOK_SECRET);
  }

  /**
   * Returns true if real Razorpay keys are configured (not mock).
   * Exposed so upstream callers (subscriptionService) can independently enforce
   * strict behaviour before awarding any plan/credit entitlement.
   */
  get isActive(): boolean {
    return this.isConfigured;
  }

  getPublicKey(): string {
    return env.RAZORPAY_KEY_ID;
  }
}

export const razorpayService = new RazorpayService();

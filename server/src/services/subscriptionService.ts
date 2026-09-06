import { db } from '../database/supabaseClient.js';
import { razorpayService } from '../integrations/razorpay/razorpayService.js';
import { PLANS, CREDIT_PACKAGES } from '../config/plans.js';
import { PlanTier, PaymentRecord } from '../types/index.js';
import { AppError } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

export class SubscriptionService {
  /**
   * Generates a new Razorpay checkout order for a plan or credit pack
   */
  async createPaymentOrder(userId: string, itemType: 'plan' | 'credits', itemId: string) {
    let amountInRupees = 0;
    let description = '';

    if (itemType === 'plan') {
      const plan = PLANS[itemId as PlanTier];
      if (!plan || plan.priceINR <= 0) {
        throw new AppError(400, 'INVALID_PLAN', 'Invalid plan selected for checkout.');
      }
      amountInRupees = plan.priceINR;
      description = `SnapCut AI ${plan.name} Plan`;
    } else {
      const pack = CREDIT_PACKAGES.find(p => p.id === itemId);
      if (!pack) {
        throw new AppError(400, 'INVALID_PACKAGE', 'Invalid credit package selected.');
      }
      amountInRupees = pack.priceINR;
      description = `SnapCut AI ${pack.name} (${pack.credits} Credits)`;
    }

    const order = await razorpayService.createOrder({
      amountInRupees,
      receipt: `rcpt_${userId.slice(0, 8)}_${Date.now()}`,
      notes: {
        userId,
        itemType,
        itemId
      }
    });

    return {
      orderId: order.orderId,
      amount: order.amount,
      currency: order.currency,
      keyId: razorpayService.getPublicKey(),
      description
    };
  }

  /**
   * Verifies Razorpay signature and unlocks plan or adds credits
   */
  async verifyAndFulfillPayment(params: {
    userId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    itemType: 'plan' | 'credits';
    itemId: string;
  }): Promise<{ success: boolean; message: string }> {
    const { userId, razorpayOrderId, razorpayPaymentId, razorpaySignature, itemType, itemId } = params;

    // 1. Verify cryptographic HMAC signature
    const isValid = razorpayService.verifySignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature
    });

    if (!isValid) {
      logger.warn('Razorpay signature verification failed', { razorpayOrderId, razorpayPaymentId });
      throw new AppError(400, 'PAYMENT_VERIFICATION_FAILED', 'Invalid payment signature. Verification rejected.');
    }

    // 2. Fulfill entitlement based on purchased item
    if (itemType === 'plan') {
      const plan = itemId as PlanTier;
      const planConfig = PLANS[plan];
      if (!planConfig) {
        throw new AppError(400, 'INVALID_PLAN', 'Unknown plan.');
      }

      // Upgrade profile plan
      await db.upsertProfile(userId, { plan });

      // Add monthly credits allotment
      const currentBalance = await db.getCredits(userId);
      await db.setCredits(userId, currentBalance + planConfig.monthlyCredits);

      // Record payment
      await db.createPayment({
        userId,
        razorpayOrderId,
        razorpayPaymentId,
        amount: planConfig.priceINR,
        currency: 'INR',
        status: 'captured',
        plan,
        creditsAdded: planConfig.monthlyCredits
      });

      logger.info('User upgraded plan successfully', { userId, plan });
      return { success: true, message: `Successfully upgraded to ${planConfig.name} plan!` };
    } else {
      const pack = CREDIT_PACKAGES.find(p => p.id === itemId);
      if (!pack) {
        throw new AppError(400, 'INVALID_PACKAGE', 'Unknown credit package.');
      }

      // Add credits
      const currentBalance = await db.getCredits(userId);
      const newBalance = currentBalance + pack.credits;
      await db.setCredits(userId, newBalance);

      // Record payment
      await db.createPayment({
        userId,
        razorpayOrderId,
        razorpayPaymentId,
        amount: pack.priceINR,
        currency: 'INR',
        status: 'captured',
        creditsAdded: pack.credits
      });

      logger.info('Added credits to user account', { userId, added: pack.credits, newBalance });
      return { success: true, message: `Successfully added ${pack.credits} credits to your account!` };
    }
  }

  /**
   * Idempotent webhook event handler for asynchronous Razorpay events
   */
  async handleWebhook(rawBody: string, signature: string, payload: any): Promise<void> {
    // 1. Verify webhook signature
    const isValid = razorpayService.verifyWebhook(rawBody, signature);
    if (!isValid) {
      logger.warn('Razorpay webhook signature verification failed');
      throw new AppError(400, 'INVALID_WEBHOOK_SIGNATURE', 'Invalid webhook signature');
    }

    const eventId = payload.event_id || payload.payload?.payment?.entity?.id || `${Date.now()}`;
    const isProcessed = await db.isWebhookProcessed(eventId);
    if (isProcessed) {
      logger.info('Duplicate webhook event skipped', { eventId });
      return;
    }

    const event = payload.event;
    logger.info('Processing Razorpay webhook event', { event, eventId });

    switch (event) {
      case 'payment.captured': {
        const paymentEntity = payload.payload?.payment?.entity;
        const notes = paymentEntity?.notes || {};
        if (notes.userId && notes.itemType && notes.itemId) {
          await this.verifyAndFulfillPayment({
            userId: notes.userId,
            razorpayOrderId: paymentEntity.order_id,
            razorpayPaymentId: paymentEntity.id,
            razorpaySignature: 'webhook_verified',
            itemType: notes.itemType,
            itemId: notes.itemId
          });
        }
        break;
      }
      case 'subscription.cancelled': {
        const subEntity = payload.payload?.subscription?.entity;
        const notes = subEntity?.notes || {};
        if (notes.userId) {
          await db.upsertProfile(notes.userId, { plan: 'free' });
          logger.info('User plan reverted to free upon subscription cancellation', { userId: notes.userId });
        }
        break;
      }
      default:
        logger.info('Unhandled Razorpay webhook event received', { event });
    }

    await db.recordWebhookEvent(eventId, 'razorpay', payload);
  }

  async getPaymentHistory(userId: string): Promise<PaymentRecord[]> {
    return db.getPayments(userId);
  }
}

export const subscriptionService = new SubscriptionService();

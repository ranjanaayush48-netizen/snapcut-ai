import { db } from '../database/supabaseClient.js';
import { PLANS } from '../config/plans.js';
import { PlanTier } from '../types/index.js';
import { logger } from '../utils/logger.js';

export interface UsageCheckResult {
  allowed: boolean;
  reason?: string;
  useCredit: boolean;
  remainingDaily: number;
  creditBalance: number;
}

export class UsageService {
  /**
   * Evaluates whether a user can process another image right now
   */
  async checkEligibility(userId: string, plan: PlanTier = 'free'): Promise<UsageCheckResult> {
    const today = new Date().toISOString().split('T')[0];
    const planConfig = PLANS[plan] || PLANS.free;

    const [dailyUsage, creditBalance] = await Promise.all([
      db.getDailyUsage(userId, today),
      db.getCredits(userId)
    ]);

    const remainingDaily = Math.max(0, planConfig.dailyFreeLimit - dailyUsage.dailyCount);

    // 1. If user has remaining daily free/plan allowance
    if (remainingDaily > 0) {
      return {
        allowed: true,
        useCredit: false,
        remainingDaily,
        creditBalance
      };
    }

    // 2. If daily allowance is exhausted, check if user has purchased credits
    if (creditBalance > 0) {
      return {
        allowed: true,
        useCredit: true,
        remainingDaily: 0,
        creditBalance
      };
    }

    // 3. Reject
    return {
      allowed: false,
      reason:
        plan === 'free'
          ? "You've reached your daily free limit of 5 removals. Upgrade to Pro for 100 monthly credits or purchase a credit pack."
          : "You've exhausted your plan allowance and credits. Please renew your subscription or purchase credits.",
      useCredit: false,
      remainingDaily: 0,
      creditBalance: 0
    };
  }

  /**
   * Reserves usage before kicking off the AI pipeline
   */
  async reserveUsage(userId: string, useCredit: boolean): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    await db.incrementDailyUsage(userId, today, useCredit);

    if (useCredit) {
      const currentCredits = await db.getCredits(userId);
      const newCredits = Math.max(0, currentCredits - 1);
      await db.setCredits(userId, newCredits);
      logger.info('Deducted 1 credit for processing', { userId, remaining: newCredits });
    }
  }

  /**
   * Reconciles / refunds usage in case the processing job failed
   */
  async refundUsage(userId: string, wasCredit: boolean): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    await db.refundDailyUsage(userId, today, wasCredit);

    if (wasCredit) {
      const currentCredits = await db.getCredits(userId);
      await db.setCredits(userId, currentCredits + 1);
      logger.info('Refunded 1 credit due to processing failure', { userId, newBalance: currentCredits + 1 });
    }
  }

  /**
   * Returns a complete overview of the user's current limits and usage
   */
  async getUsageSummary(userId: string, plan: PlanTier = 'free') {
    const today = new Date().toISOString().split('T')[0];
    const planConfig = PLANS[plan] || PLANS.free;

    const [dailyUsage, creditBalance] = await Promise.all([
      db.getDailyUsage(userId, today),
      db.getCredits(userId)
    ]);

    const remainingDaily = Math.max(0, planConfig.dailyFreeLimit - dailyUsage.dailyCount);

    return {
      plan,
      planName: planConfig.name,
      dailyUsed: dailyUsage.dailyCount,
      dailyLimit: planConfig.dailyFreeLimit,
      remainingDaily,
      creditBalance,
      maxFileSizeMB: planConfig.maxFileSizeMB
    };
  }
}

export const usageService = new UsageService();

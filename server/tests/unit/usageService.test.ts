import { usageService } from '../../src/services/usageService.js';
import { db } from '../../src/database/supabaseClient.js';

describe('Usage and Credit Quota Enforcement', () => {
  const testUserId = `test-user-${Date.now()}`;

  beforeAll(async () => {
    // Initialize profile and 2 starter credits
    await db.upsertProfile(testUserId, { displayName: 'Test User', plan: 'free' });
    await db.setCredits(testUserId, 2);
  });

  it('should allow processing within daily limit', async () => {
    const eligibility = await usageService.checkEligibility(testUserId, 'free');
    expect(eligibility.allowed).toBe(true);
    expect(eligibility.useCredit).toBe(false);
    expect(eligibility.remainingDaily).toBeGreaterThan(0);
  });

  it('should correctly reserve daily usage and deplete limit', async () => {
    // Consume 5 daily allowances
    for (let i = 0; i < 5; i++) {
      await usageService.reserveUsage(testUserId, false);
    }

    const summary = await usageService.getUsageSummary(testUserId, 'free');
    expect(summary.remainingDaily).toBe(0);
    expect(summary.dailyUsed).toBe(5);
  });

  it('should switch to consuming purchased credits when daily limit is exhausted', async () => {
    const eligibility = await usageService.checkEligibility(testUserId, 'free');
    expect(eligibility.allowed).toBe(true);
    expect(eligibility.useCredit).toBe(true);
    expect(eligibility.creditBalance).toBe(2);

    // Consume 1 credit
    await usageService.reserveUsage(testUserId, true);
    const balanceAfter = await db.getCredits(testUserId);
    expect(balanceAfter).toBe(1);
  });

  it('should accurately refund credit when a job fails', async () => {
    const initialBalance = await db.getCredits(testUserId);
    await usageService.refundUsage(testUserId, true);
    const refundedBalance = await db.getCredits(testUserId);
    expect(refundedBalance).toBe(initialBalance + 1);
  });
});

import { PlanConfig, PlanTier } from '../types/index.js';

export const PLANS: Record<PlanTier, PlanConfig> = {
  free: {
    id: 'free',
    name: 'Free',
    priceINR: 0,
    priceFormatted: '₹0',
    dailyFreeLimit: 5,
    monthlyCredits: 5,
    maxFileSizeMB: 10,
    features: [
      '5 free background removals per day',
      'Standard AI processing queue',
      'Standard resolution transparent PNG downloads',
      '24-hour temporary cloud asset retention',
      'Community support'
    ]
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    priceINR: 499,
    priceFormatted: '₹499/month',
    dailyFreeLimit: 25,
    monthlyCredits: 100,
    maxFileSizeMB: 15,
    popular: true,
    features: [
      '100 monthly high-speed AI credits',
      'Priority AI processing pipeline',
      'Full resolution transparent PNG downloads',
      'No watermarks or compression',
      'Unlimited history log for 30 days',
      'Priority email & webhook support'
    ]
  },
  business: {
    id: 'business',
    name: 'Business',
    priceINR: 1499,
    priceFormatted: '₹1,499/month',
    dailyFreeLimit: 100,
    monthlyCredits: 500,
    maxFileSizeMB: 25,
    features: [
      '500 monthly high-volume AI credits',
      'Ultra-fast dedicated processing queue',
      'Batch n8n automation webhook access',
      'Commercial usage license',
      'Extended temporary asset storage',
      'Dedicated 24/7 technical support'
    ]
  }
};

export const CREDIT_PACKAGES = [
  { id: 'credits_50', name: 'Starter Pack', credits: 50, priceINR: 249, priceFormatted: '₹249' },
  { id: 'credits_150', name: 'Creator Pack', credits: 150, priceINR: 599, priceFormatted: '₹599', popular: true },
  { id: 'credits_500', name: 'Studio Pack', credits: 500, priceINR: 1499, priceFormatted: '₹1,499' }
];

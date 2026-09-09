import React, { useState } from 'react';
import { PlanCard } from '../components/pricing/PlanCard.js';
import { RazorpayCheckoutModal } from '../components/pricing/RazorpayCheckoutModal.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { useAuth } from '../contexts/AuthContext.js';
import { useToast } from '../contexts/ToastContext.js';
import { PlanConfig, PlanTier, CreditPackage } from '../types/index.js';
import { Sparkles, Coins, Check, Zap } from 'lucide-react';

const PLANS_DATA: PlanConfig[] = [
  {
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
  {
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
  {
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
];

const CREDIT_PACKS: CreditPackage[] = [
  { id: 'credits_50', name: 'Starter Pack', credits: 50, priceINR: 249, priceFormatted: '₹249' },
  { id: 'credits_150', name: 'Creator Pack', credits: 150, priceINR: 599, priceFormatted: '₹599', popular: true },
  { id: 'credits_500', name: 'Studio Pack', credits: 500, priceINR: 1499, priceFormatted: '₹1,499' }
];

export const PricingPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [checkoutItem, setCheckoutItem] = useState<{
    open: boolean;
    type: 'plan' | 'credits';
    id: string;
    title: string;
    priceFormatted: string;
  }>({
    open: false,
    type: 'plan',
    id: 'pro',
    title: 'Pro Plan',
    priceFormatted: '₹499'
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-black text-white">
          Simple, Transparent <span className="text-gradient-brand">Pricing</span>
        </h1>
        <p className="text-sm text-[#AAB3D0]">
          Choose the monthly subscription plan or pay-as-you-go credit package that fits your volume. Checkout opens the official Razorpay payment popup.
        </p>
        <p className="text-[11px] text-[#707B9E]">
          Policy pages for Razorpay review:{' '}
          <a className="text-[#00D9FF] underline" href="/privacy">
            Privacy
          </a>
          {' · '}
          <a className="text-[#00D9FF] underline" href="/terms">
            Terms
          </a>
          {' · '}
          <a className="text-[#00D9FF] underline" href="/refunds">
            Refunds
          </a>
          {' · '}
          <a className="text-[#00D9FF] underline" href="/shipping">
            Shipping
          </a>
          {' · '}
          <a className="text-[#00D9FF] underline" href="/contact">
            Contact
          </a>
          {' · '}
          <a className="text-[#00D9FF] underline" href="/about">
            About
          </a>
        </p>
      </div>

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PLANS_DATA.map(plan => (
          <PlanCard
            key={plan.id}
            plan={plan}
            currentPlan={user?.plan || 'free'}
            onSelectPlan={planId => {
              if (planId === 'free') {
                showToast('You are already on the Free tier.', 'info');
              } else {
                setCheckoutItem({
                  open: true,
                  type: 'plan',
                  id: plan.id,
                  title: `${plan.name} Plan`,
                  priceFormatted: plan.priceFormatted
                });
              }
            }}
          />
        ))}
      </div>

      {/* Credit Top-up Packages */}
      <div className="space-y-8 pt-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F02BFF]/10 text-[#F02BFF] text-xs font-semibold">
            <Coins className="w-3.5 h-3.5" />
            No Recurring Subscription
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Pay-As-You-Go Credit Packs
          </h2>
          <p className="text-xs text-[#AAB3D0]">
            Credits never expire and activate automatically on top of your daily free allowance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {CREDIT_PACKS.map(pack => (
            <Card
              key={pack.id}
              className={`p-6 flex flex-col justify-between ${
                pack.popular ? 'border-[#F02BFF]/60 bg-[#0B1026]' : 'bg-[#080B1A]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-white">{pack.name}</h3>
                  {pack.popular && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#F02BFF]/20 text-[#F02BFF]">
                      Best Value
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-2xl font-black text-white">{pack.priceFormatted}</span>
                  <span className="text-xs text-[#707B9E]">one-time</span>
                </div>
                <p className="text-xs text-[#AAB3D0] mb-6">
                  Unlocks <strong className="text-white">{pack.credits} high-res</strong> AI background removals with priority queue.
                </p>
              </div>

              <Button
                variant={pack.popular ? 'primary' : 'secondary'}
                size="sm"
                className="w-full"
                onClick={() =>
                  setCheckoutItem({
                    open: true,
                    type: 'credits',
                    id: pack.id,
                    title: `${pack.name} (${pack.credits} Credits)`,
                    priceFormatted: pack.priceFormatted
                  })
                }
              >
                Buy {pack.credits} Credits
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* Checkout Modal */}
      <RazorpayCheckoutModal
        isOpen={checkoutItem.open}
        onClose={() => setCheckoutItem(prev => ({ ...prev, open: false }))}
        itemType={checkoutItem.type}
        itemId={checkoutItem.id}
        itemTitle={checkoutItem.title}
        priceFormatted={checkoutItem.priceFormatted}
      />
    </div>
  );
};

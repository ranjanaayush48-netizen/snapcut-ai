import React from 'react';
import { Check, Zap, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button.js';
import { PlanConfig, PlanTier } from '../../types/index.js';

export interface PlanCardProps {
  plan: PlanConfig;
  currentPlan?: PlanTier;
  onSelectPlan: (planId: PlanTier) => void;
  isLoading?: boolean;
}

export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  currentPlan = 'free',
  onSelectPlan,
  isLoading = false
}) => {
  const isCurrent = currentPlan === plan.id;
  const isPopular = plan.popular;

  return (
    <div
      className={`relative rounded-2xl p-7 flex flex-col justify-between transition-all duration-300 ${
        isPopular
          ? 'bg-[#0B1026] border-2 border-[#6C3BFF] shadow-glow-brand'
          : 'bg-[#080B1A] border border-[#1C2450] hover:border-[#2A3777]'
      }`}
    >
      {isPopular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-brand text-white text-[11px] font-bold tracking-wider uppercase shadow-md flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Most Popular
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-bold text-white font-['Plus_Jakarta_Sans']">
            {plan.name}
          </h3>
          {isCurrent && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#00D9FF]/10 text-[#00D9FF] border border-[#00D9FF]/30">
              Current Plan
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-1 mb-6">
          <span className="text-3xl sm:text-4xl font-black text-white">
            {plan.priceFormatted}
          </span>
          {plan.priceINR > 0 && (
            <span className="text-xs text-[#707B9E]">billed monthly</span>
          )}
        </div>

        <div className="space-y-3 pt-4 border-t border-[#1C2450]/80">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#AAB3D0]">
            Included Features
          </p>
          <ul className="space-y-2.5 text-xs text-[#AAB3D0]">
            {plan.features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#00D9FF] shrink-0 mt-0.5" />
                <span className="leading-relaxed">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="pt-8">
        <Button
          type="button"
          variant={isPopular ? 'primary' : 'secondary'}
          size="md"
          className="w-full"
          disabled={isCurrent || isLoading}
          onClick={() => onSelectPlan(plan.id)}
        >
          {isCurrent ? (
            'Active Plan'
          ) : plan.priceINR === 0 ? (
            'Get Started Free'
          ) : (
            `Upgrade to ${plan.name}`
          )}
        </Button>
      </div>
    </div>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/Card.js';
import { Button } from '../ui/Button.js';
import { Badge } from '../ui/Badge.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { Zap, Coins, ArrowUpRight } from 'lucide-react';

export const UsageCard: React.FC = () => {
  const { user, usage } = useAuth();

  const dailyUsed = usage?.dailyUsed ?? 0;
  const dailyLimit = usage?.dailyLimit ?? 5;
  const remainingDaily = usage?.remainingDaily ?? 5;
  const creditBalance = usage?.creditBalance ?? 5;
  const plan = user?.plan || 'free';

  const percentDailyUsed = Math.min(100, Math.round((dailyUsed / dailyLimit) * 100));

  return (
    <Card className="relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1C2450]/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-white font-['Plus_Jakarta_Sans']">
              Plan & Quota Usage
            </h3>
            <Badge variant={plan === 'business' ? 'purple' : plan === 'pro' ? 'cyan' : 'neutral'}>
              {plan.toUpperCase()}
            </Badge>
          </div>
          <p className="text-xs text-[#AAB3D0]">
            Your current background removal processing quota and active credits
          </p>
        </div>

        <Link to="/billing">
          <Button variant="outline" size="sm" className="whitespace-nowrap">
            Manage Billing <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
        {/* Daily Quota */}
        <div className="space-y-3 p-4 rounded-xl bg-[#080B1A] border border-[#1C2450]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <Zap className="w-4 h-4 text-[#00D9FF]" />
              <span>Daily Allowance</span>
            </div>
            <span className="text-xs font-bold text-white">
              {dailyUsed} / {dailyLimit} used
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-[#10173A] overflow-hidden">
            <div
              className="h-full bg-gradient-brand transition-all duration-500 rounded-full"
              style={{ width: `${percentDailyUsed}%` }}
            />
          </div>

          <p className="text-[11px] text-[#707B9E]">
            {remainingDaily > 0
              ? `${remainingDaily} free removals remaining today`
              : 'Daily limit reached. Additional jobs use your credits balance.'}
          </p>
        </div>

        {/* Credit Balance */}
        <div className="space-y-3 p-4 rounded-xl bg-[#080B1A] border border-[#1C2450]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <Coins className="w-4 h-4 text-[#F02BFF]" />
              <span>Available Credit Balance</span>
            </div>
            <span className="text-lg font-black text-white">
              {creditBalance}
            </span>
          </div>

          <p className="text-[11px] text-[#AAB3D0] leading-relaxed">
            Credits never expire and are consumed after your daily allowance is exhausted.
          </p>

          <Link to="/billing" className="inline-block pt-1">
            <span className="text-xs text-[#00D9FF] hover:underline font-semibold flex items-center gap-1">
              Top up credits →
            </span>
          </Link>
        </div>
      </div>
    </Card>
  );
};

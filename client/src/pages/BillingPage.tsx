import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card.js';
import { Badge } from '../components/ui/Badge.js';
import { Button } from '../components/ui/Button.js';
import { RazorpayCheckoutModal } from '../components/pricing/RazorpayCheckoutModal.js';
import { useAuth } from '../contexts/AuthContext.js';
import { useToast } from '../contexts/ToastContext.js';
import { apiClient } from '../api/client.js';
import { PaymentItem } from '../types/index.js';
import { CreditCard, Sparkles, Coins, CheckCircle2, ArrowUpRight, Clock, ShieldCheck } from 'lucide-react';

export const BillingPage: React.FC = () => {
  const { user, usage, updateUserPlan } = useAuth();
  const { showToast } = useToast();
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);

  const [checkoutModal, setCheckoutModal] = useState<{
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
    priceFormatted: '₹499/mo'
  });

  const fetchPayments = async () => {
    try {
      setLoadingPayments(true);
      const res = await apiClient.get('/payments/history');
      if (res.data?.payments) {
        setPayments(res.data.payments);
      }
    } catch (err) {
      console.error('Failed to load payment history', err);
    } finally {
      setLoadingPayments(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleCancelSubscription = () => {
    if (window.confirm('Are you sure you want to cancel your recurring subscription? You will be reverted to the Free plan at the end of the period.')) {
      updateUserPlan('free');
      showToast('Subscription set to cancel at the end of current cycle.', 'info');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          Billing & Subscription
        </h1>
        <p className="text-xs sm:text-sm text-[#AAB3D0] mt-1">
          Manage your SnapCut AI plan, credit top-ups, and verified payment invoices
        </p>
      </div>

      {/* Current Plan Overview Card */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1C2450]/80">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-white capitalize">
                {user?.plan || 'Free'} Plan
              </h3>
              <Badge variant={user?.plan === 'business' ? 'purple' : user?.plan === 'pro' ? 'cyan' : 'neutral'}>
                ACTIVE
              </Badge>
            </div>
            <p className="text-xs text-[#AAB3D0]">
              {user?.plan === 'free'
                ? '5 free removals every 24 hours'
                : user?.plan === 'pro'
                ? '100 monthly high-speed credits with priority queue'
                : '500 monthly high-volume credits with webhook automation'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {user?.plan !== 'business' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  setCheckoutModal({
                    open: true,
                    type: 'plan',
                    id: user?.plan === 'free' ? 'pro' : 'business',
                    title: user?.plan === 'free' ? 'Pro Plan' : 'Business Plan',
                    priceFormatted: user?.plan === 'free' ? '₹499/mo' : '₹1,499/mo'
                  })
                }
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                {user?.plan === 'free' ? 'Upgrade to Pro' : 'Upgrade to Business'}
              </Button>
            )}

            {user?.plan !== 'free' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelSubscription}
                className="text-rose-400 hover:border-rose-500/50"
              >
                Cancel Subscription
              </Button>
            )}
          </div>
        </div>

        {/* Usage & Credit Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
          <div className="p-4 rounded-xl bg-[#080B1A] border border-[#1C2450]">
            <span className="text-[11px] uppercase font-bold text-[#707B9E] tracking-wider">
              Available Credits
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-white">
                {usage?.creditBalance ?? 5}
              </span>
              <span className="text-xs text-[#AAB3D0]">credits</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#080B1A] border border-[#1C2450]">
            <span className="text-[11px] uppercase font-bold text-[#707B9E] tracking-wider">
              Today's Removals
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-white">
                {usage?.dailyUsed ?? 0} / {usage?.dailyLimit ?? 5}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#080B1A] border border-[#1C2450]">
            <span className="text-[11px] uppercase font-bold text-[#707B9E] tracking-wider">
              Renewal Cycle
            </span>
            <p className="text-sm font-semibold text-white mt-1.5">
              {user?.plan === 'free' ? 'Daily UTC Reset' : 'Monthly Auto-Renew'}
            </p>
          </div>
        </div>
      </Card>

      {/* Credit Top-up Options */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#AAB3D0]">
          Instant Credit Top-Ups (No Subscription)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 bg-[#080B1A] flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-white">50 Credits</p>
              <p className="text-xs text-[#707B9E]">₹249 one-time</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                setCheckoutModal({
                  open: true,
                  type: 'credits',
                  id: 'credits_50',
                  title: '50 Credits Pack',
                  priceFormatted: '₹249'
                })
              }
            >
              Buy
            </Button>
          </Card>

          <Card className="p-5 bg-[#0B1026] border-[#6C3BFF]/50 flex items-center justify-between shadow-glow-sm">
            <div>
              <p className="text-sm font-bold text-white">150 Credits</p>
              <p className="text-xs text-[#00D9FF]">₹599 • Popular</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                setCheckoutModal({
                  open: true,
                  type: 'credits',
                  id: 'credits_150',
                  title: '150 Credits Pack',
                  priceFormatted: '₹599'
                })
              }
            >
              Buy
            </Button>
          </Card>

          <Card className="p-5 bg-[#080B1A] flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-white">500 Credits</p>
              <p className="text-xs text-[#707B9E]">₹1,499 one-time</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                setCheckoutModal({
                  open: true,
                  type: 'credits',
                  id: 'credits_500',
                  title: '500 Credits Pack',
                  priceFormatted: '₹1,499'
                })
              }
            >
              Buy
            </Button>
          </Card>
        </div>
      </div>

      {/* Payment Invoices & Transaction History */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#AAB3D0]">
          Verified Payment History
        </h2>

        <Card className="p-0 overflow-hidden">
          {loadingPayments ? (
            <div className="p-6 space-y-3">
              <div className="h-8 rounded bg-[#080B1A] animate-pulse" />
              <div className="h-8 rounded bg-[#080B1A] animate-pulse" />
            </div>
          ) : payments.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#707B9E]">
              No transactions recorded yet. Paid subscriptions or credit packs will appear here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#1C2450] bg-[#080B1A]/80 text-[11px] font-bold uppercase tracking-wider text-[#AAB3D0]">
                    <th className="py-3.5 px-6">Order ID</th>
                    <th className="py-3.5 px-6">Item</th>
                    <th className="py-3.5 px-6">Amount</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C2450]/60">
                  {payments.map(p => (
                    <tr key={p.id} className="hover:bg-white/[0.02]">
                      <td className="py-3.5 px-6 font-mono text-white">
                        {p.razorpayOrderId}
                      </td>
                      <td className="py-3.5 px-6 text-[#AAB3D0] capitalize">
                        {p.plan || `${p.creditsAdded} Credits`}
                      </td>
                      <td className="py-3.5 px-6 font-semibold text-white">
                        ₹{p.amount}
                      </td>
                      <td className="py-3.5 px-6">
                        <Badge variant="success">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          {p.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-6 text-[#707B9E]">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Checkout Modal */}
      <RazorpayCheckoutModal
        isOpen={checkoutModal.open}
        onClose={() => {
          setCheckoutModal(prev => ({ ...prev, open: false }));
          fetchPayments();
        }}
        itemType={checkoutModal.type}
        itemId={checkoutModal.id}
        itemTitle={checkoutModal.title}
        priceFormatted={checkoutModal.priceFormatted}
      />
    </div>
  );
};

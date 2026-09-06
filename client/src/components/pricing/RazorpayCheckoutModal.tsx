import React, { useState } from 'react';
import { Modal } from '../ui/Modal.js';
import { Button } from '../ui/Button.js';
import { apiClient } from '../../api/client.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { useToast } from '../../contexts/ToastContext.js';
import { Shield, CheckCircle2, CreditCard, Sparkles } from 'lucide-react';
import { PlanTier } from '../../types/index.js';

export interface RazorpayCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemType: 'plan' | 'credits';
  itemId: string;
  itemTitle: string;
  priceFormatted: string;
}

export const RazorpayCheckoutModal: React.FC<RazorpayCheckoutModalProps> = ({
  isOpen,
  onClose,
  itemType,
  itemId,
  itemTitle,
  priceFormatted
}) => {
  const [loading, setLoading] = useState(false);
  const { user, updateUserPlan } = useAuth();
  const { showToast } = useToast();

  const handleCheckout = async () => {
    try {
      setLoading(true);

      // 1. Create order on backend
      const orderRes = await apiClient.post('/payments/create-order', {
        itemType,
        itemId
      });

      const orderData = orderRes.data;
      const keyId = orderData.keyId;

      // 2. Check if Razorpay JS is loaded and has a valid live/test key
      const isRazorpayLoaded = typeof (window as any).Razorpay !== 'undefined';
      const hasRealKey = keyId && !keyId.includes('mock') && !keyId.includes('YourKeyId');

      if (isRazorpayLoaded && hasRealKey) {
        const options = {
          key: keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'SnapCut AI',
          description: orderData.description,
          image: '/logo.png',
          order_id: orderData.orderId,
          prefill: {
            name: user?.displayName,
            email: user?.email
          },
          theme: {
            color: '#6C3BFF'
          },
          handler: async (response: any) => {
            await verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });
          },
          modal: {
            ondismiss: () => {
              setLoading(false);
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // High-fidelity development simulator checkout for immediate local testing
        setTimeout(async () => {
          await verifyPayment({
            razorpayOrderId: orderData.orderId,
            razorpayPaymentId: `pay_sim_${Date.now()}`,
            razorpaySignature: 'sim_sig_developer_mode'
          });
        }, 800);
      }
    } catch (err: any) {
      showToast(err.message || 'Payment initiation failed. Please try again.', 'error');
      setLoading(false);
    }
  };

  const verifyPayment = async (payload: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) => {
    try {
      const verifyRes = await apiClient.post('/payments/verify', {
        ...payload,
        itemType,
        itemId
      });

      const message = verifyRes.data?.message || 'Payment successful!';
      showToast(message, 'success');

      if (itemType === 'plan') {
        const credits = itemId === 'pro' ? 100 : itemId === 'business' ? 500 : 0;
        updateUserPlan(itemId as PlanTier, credits);
      } else {
        const credits = itemId === 'credits_50' ? 50 : itemId === 'credits_150' ? 150 : 500;
        updateUserPlan(user?.plan || 'free', credits);
      }

      onClose();
    } catch (err: any) {
      showToast(err.message || 'Payment verification failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Complete Your Purchase"
      description="Secure payments powered by Razorpay 256-bit encryption"
    >
      <div className="space-y-5">
        <div className="p-4 rounded-xl bg-[#080B1A] border border-[#1C2450] flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-white">{itemTitle}</p>
            <p className="text-xs text-[#707B9E] capitalize">{itemType} Purchase</p>
          </div>
          <span className="text-xl font-extrabold text-white">
            {priceFormatted}
          </span>
        </div>

        <div className="space-y-2 text-xs text-[#AAB3D0]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#00D9FF]" />
            <span>Instant entitlement activation upon successful checkout</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#00D9FF]" />
            <span>Encrypted UPI, Cards, Netbanking & Wallets supported</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#6C3BFF]" />
            <span>Cancel anytime from your billing dashboard</span>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#1C2450]/60">
          <Button variant="ghost" size="md" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleCheckout}
            isLoading={loading}
            className="shadow-glow-brand"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Proceed to Pay {priceFormatted}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

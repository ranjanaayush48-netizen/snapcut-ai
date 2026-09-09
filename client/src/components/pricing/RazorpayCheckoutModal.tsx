import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Modal } from '../ui/Modal.js';
import { Button } from '../ui/Button.js';
import { apiClient } from '../../api/client.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { useToast } from '../../contexts/ToastContext.js';
import { COMPANY } from '../../config/company.js';
import { Shield, CheckCircle2, CreditCard } from 'lucide-react';
import { PlanTier } from '../../types/index.js';

export interface RazorpayCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemType: 'plan' | 'credits';
  itemId: string;
  itemTitle: string;
  priceFormatted: string;
}

const unwrapOrder = (response: any) => {
  if (!response) return response;
  if (typeof response === 'object' && 'data' in response) return response.data;
  return response;
};

const isUsableRazorpayKey = (keyId?: string) =>
  Boolean(keyId && keyId.startsWith('rzp_') && !keyId.includes('mock') && !keyId.includes('YourKeyId'));

export const RazorpayCheckoutModal: React.FC<RazorpayCheckoutModalProps> = ({
  isOpen,
  onClose,
  itemType,
  itemId,
  itemTitle,
  priceFormatted
}) => {
  const [loading, setLoading] = useState(false);
  const launchedRef = useRef(false);
  const { user, updateUserPlan } = useAuth();
  const { showToast } = useToast();

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
      const body = unwrapOrder(verifyRes);
      const message = body?.message || 'Payment successful!';
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

  const handleCheckout = async () => {
    try {
      setLoading(true);

      const orderRes = await apiClient.post('/payments/create-order', {
        itemType,
        itemId
      });

      const orderData = unwrapOrder(orderRes);
      const keyId = orderData.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID;
      const isRazorpayLoaded = typeof (window as any).Razorpay !== 'undefined';
      const hasRealKey = isUsableRazorpayKey(keyId);

      if (isRazorpayLoaded && hasRealKey) {
        const options: Record<string, any> = {
          key: keyId,
          amount: orderData.amount,
          currency: orderData.currency || 'INR',
          name: COMPANY.tradeName,
          description: orderData.description || itemTitle,
          image: '/logo.png',
          order_id: orderData.orderId,
          upi_intent: true,
          prefill: {
            name: user?.displayName,
            email: user?.email,
            contact: COMPANY.phone.replace(/\s/g, ''),
            method: 'upi'
          },
          notes: {
            merchant: COMPANY.legalName,
            itemType,
            itemId
          },
          theme: {
            color: '#6C3BFF',
            hide_topbar: false
          },
          retry: {
            enabled: true,
            max_count: 2
          },
          send_sms_hash: true,
          allow_rotation: true,
          remember_customer: true,
          timeout: 900,
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
              launchedRef.current = false;
            },
            animation: true,
            confirm_close: false,
            escape: true,
            handleback: true
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', (response: any) => {
          showToast(response?.error?.description || 'Payment was not completed.', 'error');
          setLoading(false);
          launchedRef.current = false;
        });
        rzp.open();
        return;
      }

      if (import.meta.env.DEV) {
        showToast(
          hasRealKey
            ? 'Razorpay checkout script did not load. Refresh and try again.'
            : 'Add your Razorpay Key ID and Secret in server/.env and VITE_RAZORPAY_KEY_ID in client/.env, then restart. Opening a local test checkout for now.',
          'info'
        );
        setTimeout(async () => {
          await verifyPayment({
            razorpayOrderId: orderData.orderId,
            razorpayPaymentId: `pay_sim_${Date.now()}`,
            razorpaySignature: 'sim_sig_developer_mode'
          });
        }, 600);
      } else {
        showToast(
          hasRealKey
            ? 'Razorpay checkout script did not load. Please refresh the page and try again.'
            : 'Payment system is not configured. Please contact support or try again later.',
          'error'
        );
        setLoading(false);
        launchedRef.current = false;
      }
    } catch (err: any) {
      showToast(err.message || 'Payment initiation failed. Please try again.', 'error');
      setLoading(false);
      launchedRef.current = false;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Secure Razorpay checkout"
      description="The Razorpay payment window should open on top of this page."
    >
      <div className="space-y-5">
        <div className="p-4 rounded-xl bg-[#080B1A] border border-[#1C2450] flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-white">{itemTitle}</p>
            <p className="text-xs text-[#707B9E]">{COMPANY.tradeName} · digital AI credits</p>
          </div>
          <span className="text-xl font-extrabold text-white">{priceFormatted}</span>
        </div>

        <div className="space-y-2 text-xs text-[#AAB3D0]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#00D9FF]" />
            <span>UPI, QR scan, cards, EMI, netbanking, wallets, and Pay Later via Razorpay</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#6C3BFF]" />
            <span>Card data is entered only on Razorpay. SnapCut AI never stores PAN/CVV.</span>
          </div>
        </div>

        <p className="text-[11px] text-[#707B9E] leading-relaxed">
          By paying you agree to our{' '}
          <Link to="/terms" className="text-[#00D9FF] underline" onClick={onClose}>
            Terms
          </Link>
          ,{' '}
          <Link to="/privacy" className="text-[#00D9FF] underline" onClick={onClose}>
            Privacy Policy
          </Link>
          ,{' '}
          <Link to="/refunds" className="text-[#00D9FF] underline" onClick={onClose}>
            Cancellation &amp; Refunds
          </Link>
          , and{' '}
          <Link to="/shipping" className="text-[#00D9FF] underline" onClick={onClose}>
            Shipping &amp; Delivery
          </Link>
          .
        </p>

        <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#1C2450]/60">
          <Button variant="ghost" size="md" onClick={onClose} disabled={loading}>
            Close
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => void handleCheckout()}
            isLoading={loading}
            className="shadow-glow-brand"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            {loading ? 'Opening Razorpay…' : `Pay ${priceFormatted}`}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

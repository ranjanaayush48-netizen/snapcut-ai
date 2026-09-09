import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UploadDropzone } from '../components/upload/UploadDropzone.js';
import { ProcessingStatus } from '../components/processing/ProcessingStatus.js';
import { BeforeAfterViewer } from '../components/result/BeforeAfterViewer.js';
import { DownloadAction } from '../components/result/DownloadAction.js';
import { PlanCard } from '../components/pricing/PlanCard.js';
import { RazorpayCheckoutModal } from '../components/pricing/RazorpayCheckoutModal.js';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { useAuth } from '../contexts/AuthContext.js';
import { useToast } from '../contexts/ToastContext.js';
import { apiClient } from '../api/client.js';
import { PlanConfig, PlanTier } from '../types/index.js';
import {
  Sparkles,
  Zap,
  Shield,
  Layers,
  ArrowRight,
  ShoppingBag,
  Palette,
  Share2,
  Users,
  CheckCircle2,
  HelpCircle,
  Clock
} from 'lucide-react';

const SAMPLE_ORIGINAL = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80';
const SAMPLE_PROCESSED = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80';

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
    priceFormatted: '₹499/mo',
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
    priceFormatted: '₹1,499/mo',
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

export const LandingPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [result, setResult] = useState<{ originalUrl: string; outputUrl: string; filename: string } | null>(null);
  const [checkoutModal, setCheckoutModal] = useState<{ open: boolean; plan: PlanConfig | null }>({
    open: false,
    plan: null
  });

  const { user, refreshUsage } = useAuth();
  const { showToast } = useToast();

  const handleProcessImage = async () => {
    if (!selectedFile) return;

    try {
      setIsProcessing(true);
      setProcessingError(null);

      const formData = new FormData();
      formData.append('image', selectedFile);

      const res = await apiClient.post('/remove-background', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const data = res.data;
      setResult({
        originalUrl: data.inputUrl,
        outputUrl: data.outputUrl,
        filename: data.originalFilename
      });

      await refreshUsage();
      showToast('Background removed successfully!', 'success');
    } catch (err: any) {
      setProcessingError(err.message || "We couldn't process this image right now. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    setProcessingError(null);
  };

  return (
    <div className="space-y-24 sm:space-y-32 pb-24">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 pb-16 overflow-hidden">
        {/* Neon background light spots */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-brand opacity-20 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B1026] border border-[#1C2450] text-[#00D9FF] text-xs font-semibold mb-6 shadow-glow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Generation AI Background Removal</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.1] mb-6">
            Remove Backgrounds in{' '}
            <span className="text-gradient-brand">One Click</span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg text-[#AAB3D0] max-w-2xl mx-auto leading-relaxed mb-10">
            Upload an image and let SnapCut AI automatically remove its background in seconds. Clean transparent PNGs without complicated editing software.
          </p>

          {/* Core Interactive Tool Container */}
          <div className="max-w-3xl mx-auto">
            {result ? (
              <div className="border border-[#1C2450] bg-[#0B1026] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
                <BeforeAfterViewer
                  originalUrl={result.originalUrl}
                  processedUrl={result.outputUrl}
                  originalFilename={result.filename}
                />
                <DownloadAction
                  processedUrl={result.outputUrl}
                  originalFilename={result.filename}
                  onReset={handleReset}
                />
              </div>
            ) : isProcessing || processingError ? (
              <ProcessingStatus
                originalImagePreview={selectedFile ? URL.createObjectURL(selectedFile) : undefined}
                errorMessage={processingError}
                onRetry={handleProcessImage}
              />
            ) : (
              <div className="border border-[#1C2450] bg-[#0B1026] rounded-3xl p-6 sm:p-8 shadow-2xl">
                <UploadDropzone
                  onFileSelected={file => setSelectedFile(file)}
                  selectedFile={selectedFile}
                  onClearFile={handleReset}
                  onSubmit={handleProcessImage}
                  isLoading={isProcessing}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#00D9FF]">
            Effortless Workflow
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white">
            Upload. Remove. Download.
          </h3>
          <p className="text-sm text-[#AAB3D0] max-w-xl mx-auto">
            Three simple steps to transform your product photos, portraits, and graphics into studio-grade transparent assets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card hoverEffect className="space-y-4 text-center p-8">
            <div className="w-14 h-14 rounded-2xl bg-[#080B1A] border border-[#1C2450] flex items-center justify-center text-[#00D9FF] mx-auto text-xl font-black">
              1
            </div>
            <h4 className="text-lg font-bold text-white">Upload Your Photo</h4>
            <p className="text-xs text-[#AAB3D0] leading-relaxed">
              Drag and drop any JPG, PNG, or WEBP image up to 10 MB. No sign-up required to test.
            </p>
          </Card>

          <Card hoverEffect className="space-y-4 text-center p-8">
            <div className="w-14 h-14 rounded-2xl bg-[#080B1A] border border-[#1C2450] flex items-center justify-center text-[#6C3BFF] mx-auto text-xl font-black">
              2
            </div>
            <h4 className="text-lg font-bold text-white">AI Removes Background</h4>
            <p className="text-xs text-[#AAB3D0] leading-relaxed">
              Our neural vision model instantly segments foreground subjects and generates a pixel-perfect transparent mask.
            </p>
          </Card>

          <Card hoverEffect className="space-y-4 text-center p-8">
            <div className="w-14 h-14 rounded-2xl bg-[#080B1A] border border-[#1C2450] flex items-center justify-center text-[#F02BFF] mx-auto text-xl font-black">
              3
            </div>
            <h4 className="text-lg font-bold text-white">Download Transparent PNG</h4>
            <p className="text-xs text-[#AAB3D0] leading-relaxed">
              Download your transparent cut-out in full resolution with one click. Ready for any website or design tool.
            </p>
          </Card>
        </div>
      </section>

      {/* 3. TARGET AUDIENCES / USE CASES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#00D9FF]">
            Built For Creators & Teams
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white">
            Who Uses SnapCut AI?
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card hoverEffect className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#00D9FF]/10 text-[#00D9FF] flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">E-commerce Sellers</h4>
            <p className="text-xs text-[#AAB3D0] leading-relaxed">
              Create clean white or transparent product listings for Amazon, Shopify, Flipkart, and Etsy in seconds.
            </p>
          </Card>

          <Card hoverEffect className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#246BFF]/15 text-[#246BFF] flex items-center justify-center">
              <Palette className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">Graphic Designers</h4>
            <p className="text-xs text-[#AAB3D0] leading-relaxed">
              Skip hours of manual pen-tool clipping in Photoshop. Get instant cutouts directly for Figma, Canva, or Illustrator.
            </p>
          </Card>

          <Card hoverEffect className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#6C3BFF]/20 text-[#D1B8FF] flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">Social Media Creators</h4>
            <p className="text-xs text-[#AAB3D0] leading-relaxed">
              Create eye-catching YouTube thumbnails, Instagram reels covers, stickers, and profile avatars with ease.
            </p>
          </Card>

          <Card hoverEffect className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#F02BFF]/15 text-[#F02BFF] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">Marketers & Small Businesses</h4>
            <p className="text-xs text-[#AAB3D0] leading-relaxed">
              Produce high-converting ad creatives and banners without hiring specialized design agencies.
            </p>
          </Card>
        </div>
      </section>

      {/* 4. CORE VALUE PROPOSITION & FEATURES */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border border-[#1C2450] bg-gradient-to-b from-[#0B1026] to-[#080B1A] rounded-3xl p-8 sm:p-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00D9FF]/10 text-[#00D9FF] text-xs font-semibold">
                <Zap className="w-3.5 h-3.5" /> High-Performance AI
              </div>
              <h3 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                Designed for speed, clarity, and uncompromising privacy.
              </h3>
              <p className="text-sm text-[#AAB3D0] leading-relaxed">
                SnapCut AI focuses exclusively on doing one thing exceptionally well: removing backgrounds cleanly without unnecessary clutter or sluggish bloatware.
              </p>

              <div className="space-y-3.5 pt-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#00D9FF] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-white">Precise Edge Detection</p>
                    <p className="text-xs text-[#707B9E]">Handles fine hair, soft apparel textures, and complex transparent glassware with ease.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#6C3BFF] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-white">Automatic Asset Cleanup</p>
                    <p className="text-xs text-[#707B9E]">Temporary storage expires after 24 hours. Your assets are never used for model training.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#F02BFF] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-white">Affordable Razorpay Plans</p>
                    <p className="text-xs text-[#707B9E]">Flexible pay-as-you-go credits or high-volume monthly subscriptions via UPI and cards.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual representation */}
            <div className="relative rounded-2xl overflow-hidden border border-[#1C2450] bg-[#050816] p-4 checkerboard-pattern flex items-center justify-center">
              <img
                src="/logo.png"
                alt="SnapCut AI Ribbon"
                className="max-h-80 object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 5. PRICING PREVIEW */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#00D9FF]">
            Transparent Pricing
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white">
            Simple, Predictable Plans
          </h3>
          <p className="text-sm text-[#AAB3D0] max-w-lg mx-auto">
            Start free with 5 daily removals. Upgrade anytime for priority processing and bulk volume. Payments are collected in INR by Razorpay.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS_DATA.map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              currentPlan={user?.plan || 'free'}
              onSelectPlan={planId => {
                if (planId === 'free') {
                  showToast('You are already on the Free plan!', 'info');
                } else {
                  setCheckoutModal({ open: true, plan });
                }
              }}
            />
          ))}
        </div>
      </section>

      {/* 6. FAQ */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-14">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#00D9FF]">
            Common Inquiries
          </h2>
          <h3 className="text-3xl font-extrabold text-white">
            Frequently Asked Questions
          </h3>
        </div>

        <div className="space-y-4">
          <Card className="space-y-2 p-6">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#00D9FF]" />
              How long does it take to remove a background?
            </h4>
            <p className="text-xs text-[#AAB3D0] leading-relaxed pl-6">
              AI processing usually completes in 1 to 3 seconds depending on the resolution of the image.
            </p>
          </Card>

          <Card className="space-y-2 p-6">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#00D9FF]" />
              What image formats are supported?
            </h4>
            <p className="text-xs text-[#AAB3D0] leading-relaxed pl-6">
              SnapCut AI supports JPG, JPEG, PNG, and WEBP image files up to 10 MB each.
            </p>
          </Card>

          <Card className="space-y-2 p-6">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#00D9FF]" />
              What happens to my uploaded images?
            </h4>
            <p className="text-xs text-[#AAB3D0] leading-relaxed pl-6">
              Your images are stored temporarily in encrypted cloud buckets only to deliver the processed result to your browser. Temporary assets are automatically removed after 24 hours.
            </p>
          </Card>

          <Card className="space-y-2 p-6">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#00D9FF]" />
              What payment methods does Razorpay support?
            </h4>
            <p className="text-xs text-[#AAB3D0] leading-relaxed pl-6">
              Razorpay supports UPI (Google Pay, PhonePe, Paytm), all major credit and debit cards, Net Banking, and popular Indian digital wallets.
            </p>
          </Card>
        </div>
      </section>

      {/* 7. FINAL CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden p-8 sm:p-14 text-center border border-[#1C2450] bg-gradient-to-r from-[#0B1026] via-[#080B1A] to-[#0B1026] shadow-2xl">
          <div className="space-y-6 max-w-2xl mx-auto relative z-10">
            <h3 className="text-3xl sm:text-4xl font-black text-white">
              Ready to create clean transparent photos?
            </h3>
            <p className="text-sm text-[#AAB3D0]">
              Join thousands of sellers, creators, and designers saving hours every week with SnapCut AI.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link to="/remove-background">
                <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-glow-brand">
                  Remove Background Now <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  View Pricing Plans
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Checkout Modal */}
      {checkoutModal.plan && (
        <RazorpayCheckoutModal
          isOpen={checkoutModal.open}
          onClose={() => setCheckoutModal({ open: false, plan: null })}
          itemType="plan"
          itemId={checkoutModal.plan.id}
          itemTitle={`${checkoutModal.plan.name} Plan`}
          priceFormatted={checkoutModal.plan.priceFormatted}
        />
      )}
    </div>
  );
};

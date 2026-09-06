import React from 'react';
import { Card } from '../components/ui/Card.js';
import { ShieldCheck, Lock, Clock, Database } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-white">Privacy Policy & Image Retention</h1>
        <p className="text-sm text-[#AAB3D0]">Last updated: September 2026</p>
      </div>

      <Card className="p-8 space-y-8 bg-[#080B1A]">
        {/* Core Principles */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#00D9FF]" />
            1. Image Handling & Privacy Principles
          </h2>
          <p className="text-xs text-[#AAB3D0] leading-relaxed">
            SnapCut AI treats all user uploads with strict confidentiality. When you upload a photo to SnapCut AI:
          </p>
          <ul className="list-disc pl-5 text-xs text-[#AAB3D0] space-y-1.5 leading-relaxed">
            <li>Images are processed exclusively for the purpose of identifying foreground subjects and extracting transparent backgrounds.</li>
            <li>Images are temporarily stored in secure Cloudinary storage buckets solely to allow rendering and browser download of the finished transparent PNG.</li>
            <li>Images are never permanently stored or archived by default.</li>
            <li>Your uploaded media and cutout results are <strong>never</strong> used, sold, or shared to train machine learning models.</li>
          </ul>
        </section>

        {/* Retention Policy */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#6C3BFF]" />
            2. 24-Hour Temporary Retention Policy
          </h2>
          <p className="text-xs text-[#AAB3D0] leading-relaxed">
            In accordance with our infrastructure configuration, both original uploads and processed transparent PNGs are tagged with automated retention headers and lifecycle policies:
          </p>
          <ul className="list-disc pl-5 text-xs text-[#AAB3D0] space-y-1.5 leading-relaxed">
            <li>Temporary original and transparent assets automatically expire and are purged within <strong>24 hours</strong> of upload.</li>
            <li>Users may also manually request asset deletion at any time via their History view or account settings.</li>
            <li>After the retention period expires, previously generated download URLs become unavailable.</li>
          </ul>
        </section>

        {/* Security & Payments */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#F02BFF]" />
            3. Payment Data Security
          </h2>
          <p className="text-xs text-[#AAB3D0] leading-relaxed">
            All financial transactions are conducted directly through Razorpay, a PCI-DSS Level 1 compliant payment gateway. SnapCut AI does not collect, view, or store credit card numbers, CVVs, or UPI PINs on its servers.
          </p>
        </section>

        {/* Data Ownership */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-[#00D9FF]" />
            4. User Rights & Account Deletion
          </h2>
          <p className="text-xs text-[#AAB3D0] leading-relaxed">
            You retain 100% intellectual property ownership of your original imagery and all generated transparent assets. You can delete your account and associated history anytime in your profile settings.
          </p>
        </section>
      </Card>
    </div>
  );
};

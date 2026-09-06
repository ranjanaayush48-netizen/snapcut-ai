import React from 'react';
import { Card } from '../components/ui/Card.js';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-white">Terms of Service</h1>
        <p className="text-sm text-[#AAB3D0]">Effective Date: September 2026</p>
      </div>

      <Card className="p-8 space-y-6 bg-[#080B1A] text-xs text-[#AAB3D0] leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">1. Acceptance of Terms</h2>
          <p>
            By accessing or using SnapCut AI, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the service.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">2. Permitted Use</h2>
          <p>
            You agree not to upload content that violates third-party copyright, contains illegal or abusive materials, or attempts to circumvent server usage quotas and rate limits.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">3. Subscriptions, Credits & Refunds</h2>
          <p>
            Subscriptions renew automatically unless cancelled before the end of the billing period. Unused credits purchased through credit top-up packs remain active indefinitely. In the event of a processing failure, processing quotas and credits are automatically credited back to your account.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">4. Service Availability & Disclaimers</h2>
          <p>
            SnapCut AI strives for 99.9% uptime, but does not warrant that AI processing will be uninterrupted or error-free for all photographic conditions.
          </p>
        </section>
      </Card>
    </div>
  );
};

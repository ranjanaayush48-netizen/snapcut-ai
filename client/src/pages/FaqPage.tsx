import React from 'react';
import { Card } from '../components/ui/Card.js';
import { HelpCircle } from 'lucide-react';

export const FaqPage: React.FC = () => {
  const faqs = [
    {
      q: 'How does SnapCut AI work?',
      a: 'SnapCut AI uses advanced computer vision artificial intelligence to analyze your uploaded image, identify the prominent foreground subjects (such as products, people, animals, or objects), and extract them onto a transparent alpha channel PNG.'
    },
    {
      q: 'Are my images stored permanently?',
      a: 'No. SnapCut AI maintains a strict 24-hour retention policy. Temporary input and output assets stored in Cloudinary are automatically purged after 24 hours. Your images are never used to train machine learning models.'
    },
    {
      q: 'What are the file size and resolution limits?',
      a: 'Free accounts support images up to 10 MB in JPG, JPEG, PNG, and WEBP formats. Pro and Business subscriptions support higher image resolutions and larger file allowances (up to 25 MB).'
    },
    {
      q: 'How does the free allowance work?',
      a: 'Free accounts receive 5 background removals every calendar day. The limit resets at midnight UTC. If you require more removals in a single day, you can purchase credit top-ups or subscribe to Pro.'
    },
    {
      q: 'What is n8n Cloud automation integration?',
      a: 'SnapCut AI supports direct webhook integration through n8n Cloud. Business users can trigger background removal pipelines from Shopify, Google Drive, or Slack automatically without manual interaction.'
    },
    {
      q: 'Can I cancel my subscription anytime?',
      a: 'Yes. You can cancel your subscription at any time with a single click from the Billing settings. You will retain access to your plan until the end of your billing cycle.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-white">Frequently Asked Questions</h1>
        <p className="text-sm text-[#AAB3D0] max-w-xl mx-auto">
          Everything you need to know about SnapCut AI background removal, processing, limits, and privacy.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <Card key={index} className="p-6 space-y-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#00D9FF] shrink-0" />
              {faq.q}
            </h3>
            <p className="text-xs text-[#AAB3D0] leading-relaxed pl-6">
              {faq.a}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
};

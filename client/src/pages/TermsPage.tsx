import React from 'react';
import { Link } from 'react-router-dom';
import { LegalPage, LegalSection } from '../components/legal/LegalPage.js';
import { COMPANY } from '../config/company.js';

export const TermsPage: React.FC = () => {
  return (
    <LegalPage
      title="Terms and Conditions"
      subtitle={`These terms govern your use of ${COMPANY.tradeName}, including free daily removals, paid Pro/Business plans, and one-time credit packs billed in INR via Razorpay.`}
    >
      <LegalSection title="1. Agreement">
        <p>
          By creating an account or paying for {COMPANY.tradeName}, you enter a contract with {COMPANY.legalName}{' '}
          for a digital background-removal service. If you disagree, do not use the website. Related policies:{' '}
          <Link className="text-[#00D9FF] underline" to="/privacy">
            Privacy Policy
          </Link>
          ,{' '}
          <Link className="text-[#00D9FF] underline" to="/refunds">
            Cancellation &amp; Refunds
          </Link>
          , and{' '}
          <Link className="text-[#00D9FF] underline" to="/shipping">
            Shipping &amp; Delivery
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="2. The service">
        <p>
          {COMPANY.tradeName} lets you upload JPG, PNG, or WEBP files (subject to size limits on your plan) and
          receive a transparent PNG with the background removed by automated AI. Output quality depends on lighting,
          contrast, hair, and transparency in the source photo. We do not guarantee a perfect cutout for every image.
        </p>
      </LegalSection>

      <LegalSection title="3. Accounts and acceptable use">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>You must be 18+ and legally able to contract in India.</li>
          <li>Do not upload unlawful, infringing, or abusive content, or images of people without rights to process them.</li>
          <li>Do not reverse-engineer, overload, or resell the API without a Business licence.</li>
          <li>We may suspend accounts that abuse quotas, chargeback without cause, or violate these terms.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Plans, credits, and pricing">
        <p>
          Current prices are published on the{' '}
          <Link className="text-[#00D9FF] underline" to="/pricing">
            Pricing
          </Link>{' '}
          page in Indian Rupees. Free users receive a daily allowance of background removals. Pro and Business are
          prepaid monthly access plans that grant a pool of AI credits. Credit packs are one-time digital purchases
          and do not auto-renew. Unused purchased credits do not expire unless the account is closed for breach.
        </p>
        <p>
          Payments are collected by Razorpay on our behalf using UPI, cards, netbanking, and wallets. GST, if
          applicable, is included or shown at checkout according to our tax registration.
        </p>
      </LegalSection>

      <LegalSection title="5. Intellectual property">
        <p>
          You keep all rights in photos you upload and in the transparent PNG we generate for you. {COMPANY.tradeName}{' '}
          retains rights in the website, models orchestration, brand, and software. You grant us a limited licence to
          process the file solely to deliver the cutout.
        </p>
      </LegalSection>

      <LegalSection title="6. Availability">
        <p>
          We target high uptime but AI providers, n8n automation, or cloud storage may fail. If a job fails, credits
          or daily quota for that attempt are restored as described in the refund policy.
        </p>
      </LegalSection>

      <LegalSection title="7. Liability">
        <p>
          To the maximum extent permitted by Indian law, {COMPANY.legalName} is not liable for indirect or
          consequential loss, lost profits, or data after the 24-hour retention window. Our aggregate liability for a
          paid order is limited to the amount you paid for that order.
        </p>
      </LegalSection>

      <LegalSection title="8. Governing law">
        <p>
          These terms are governed by the laws of India. Courts at the location of our registered office have
          exclusive jurisdiction, subject to mandatory consumer-protection venues.
        </p>
      </LegalSection>

      <LegalSection title="9. Contact">
        <p>
          {COMPANY.tradeName} | {COMPANY.supportEmail} | {COMPANY.phone}
          <br />
          {COMPANY.registeredAddress}
        </p>
      </LegalSection>
    </LegalPage>
  );
};

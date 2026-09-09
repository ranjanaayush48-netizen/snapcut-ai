import React from 'react';
import { Link } from 'react-router-dom';
import { LegalPage, LegalSection } from '../components/legal/LegalPage.js';
import { COMPANY } from '../config/company.js';

export const ShippingPage: React.FC = () => {
  return (
    <LegalPage
      title="Shipping and Delivery Policy"
      subtitle={`${COMPANY.tradeName} is a digital SaaS product. We do not ship parcels, SKUs, or physical prints. This page exists so Razorpay and customers can see how digital delivery works.`}
    >
      <LegalSection title="1. No physical shipping">
        <p>
          {COMPANY.legalName} (trade name {COMPANY.tradeName}) sells online AI background removal. We do not
          manufacture, warehouse, or courier any goods. There is no shipping charge, no courier partner, and no
          delivery of hardware or printed photographs.
        </p>
      </LegalSection>

      <LegalSection title="2. How the digital product is delivered">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Upload a photo in the Studio after you sign in.</li>
          <li>We send the image in binary form to our processing workflow and return a transparent PNG.</li>
          <li>
            The result appears on-screen immediately (typically a few seconds) with a download button. That on-screen
            file is the delivered product.
          </li>
          <li>
            Paid plans and credit packs are activated on the same account as soon as Razorpay payment is verified —
            usually within seconds, not by post.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Delivery window">
        <p>
          Standard delivery for a successful job is under 3 minutes. Processed files remain downloadable for up to{' '}
          <strong className="text-white">24 hours</strong>, then temporary storage is deleted. Re-run the job if you
          still have credits after expiry.
        </p>
      </LegalSection>

      <LegalSection title="4. Failed delivery">
        <p>
          If the PNG never appears or download fails, retry once, then contact {COMPANY.supportEmail} / {COMPANY.phone}{' '}
          with the job time. We restore the credit and, if a paid pack never activated, follow the{' '}
          <Link className="text-[#00D9FF] underline" to="/refunds">
            Cancellation and Refund Policy
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="5. Service area">
        <p>
          The website is available worldwide, but prices and Razorpay checkout are in INR for customers paying from
          India. Digital delivery does not depend on a shipping address.
        </p>
      </LegalSection>

      <LegalSection title="6. Business address (not a dispatch warehouse)">
        <p>
          {COMPANY.registeredAddress}
          <br />
          {COMPANY.supportEmail} · {COMPANY.phone}
        </p>
      </LegalSection>
    </LegalPage>
  );
};

import React from 'react';
import { LegalPage, LegalSection } from '../components/legal/LegalPage.js';
import { COMPANY } from '../config/company.js';

export const PrivacyPage: React.FC = () => {
  return (
    <LegalPage
      title="Privacy Policy"
      subtitle={`${COMPANY.tradeName} explains how we collect, use, store, and delete information when you use our AI background-removal service.`}
    >
      <LegalSection title="1. Who we are">
        <p>
          This policy is issued by <strong className="text-white">{COMPANY.legalName}</strong> (trade name{' '}
          <strong className="text-white">{COMPANY.tradeName}</strong>), an Indian digital software service that
          removes image backgrounds and delivers transparent PNG files online. Website:{' '}
          <a className="text-[#00D9FF] underline" href={COMPANY.websiteUrl}>
            {COMPANY.websiteUrl}
          </a>
          .
        </p>
        <p>
          Questions: {COMPANY.supportEmail} | {COMPANY.phone}
          <br />
          Registered office: {COMPANY.registeredAddress}
        </p>
      </LegalSection>

      <LegalSection title="2. Information we collect and why">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <strong className="text-white">Account data:</strong> name, email, and hashed password so we can create
            your studio login, show usage, and send receipts.
          </li>
          <li>
            <strong className="text-white">Uploaded photographs:</strong> processed only to detect the subject,
            remove the background, and let you preview/download a transparent PNG.
          </li>
          <li>
            <strong className="text-white">Usage records:</strong> job timestamps, file size, plan, and remaining
            daily/credit quota so we can enforce fair-use limits.
          </li>
          <li>
            <strong className="text-white">Payment metadata:</strong> order id, payment id, amount, and plan or
            credit pack purchased. Card, UPI PIN, and CVV are collected by Razorpay, not by SnapCut AI.
          </li>
          <li>
            <strong className="text-white">Device logs:</strong> IP address, browser type, and error traces for
            security, fraud prevention, and debugging.
          </li>
        </ul>
        <p>We do not sell personal data. We do not use your photos to train public machine-learning models.</p>
      </LegalSection>

      <LegalSection title="3. Image handling and 24-hour retention">
        <p>
          Uploads and cutouts are stored only long enough to finish processing and let you download the result.
          Temporary cloud assets are tagged for automatic deletion within <strong className="text-white">24 hours</strong>.
          After expiry, download links stop working. You may request earlier deletion from History or by emailing{' '}
          {COMPANY.supportEmail}.
        </p>
      </LegalSection>

      <LegalSection title="4. Processors we use">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Cloud storage and CDN partners for temporary image hosting.</li>
          <li>Automation and AI providers that receive the binary image solely to remove the background.</li>
          <li>
            Razorpay Software Private Limited for checkout, UPI, cards, netbanking, wallets, refunds, and GST
            invoices. Razorpay is PCI-DSS certified. SnapCut AI never stores full card numbers.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Legal bases and sharing">
        <p>
          We process data to perform the service you request (contract), to prevent abuse (legitimate interest /
          legal obligation), and to comply with Indian law including the Digital Personal Data Protection Act, 2023
          and applicable IT Rules. We share data only with processors listed above, with law-enforcement when
          legally required, or if you instruct us to.
        </p>
      </LegalSection>

      <LegalSection title="6. Cookies">
        <p>
          We use essential cookies/local storage for login session, plan status, and checkout. We do not run third-party
          advertising pixels on studio pages.
        </p>
      </LegalSection>

      <LegalSection title="7. Your rights">
        <p>
          You may access, correct, or delete your account, export job history where available, and withdraw consent
          by closing the account. Contact the Grievance Officer {COMPANY.grievanceOfficer} at {COMPANY.grievanceEmail}.
          We respond within 15 days where required by law.
        </p>
      </LegalSection>

      <LegalSection title="8. Children">
        <p>
          SnapCut AI is intended for users 18 years and older. We do not knowingly collect data from children.
        </p>
      </LegalSection>

      <LegalSection title="9. Changes">
        <p>
          Material updates will be posted on this page with a new “Last updated” date. Continued use after the update
          means you accept the revised policy.
        </p>
      </LegalSection>
    </LegalPage>
  );
};

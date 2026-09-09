import React from 'react';
import { Link } from 'react-router-dom';
import { LegalPage, LegalSection } from '../components/legal/LegalPage.js';
import { COMPANY } from '../config/company.js';

export const RefundPage: React.FC = () => {
  return (
    <LegalPage
      title="Cancellation and Refund Policy"
      subtitle={`${COMPANY.tradeName} sells digital AI processing (plans and credits), not physical goods. This policy states when we cancel, restore quota, or refund money through Razorpay.`}
    >
      <LegalSection title="1. Nature of the product">
        <p>
          Every paid item on {COMPANY.tradeName} is a digital service: monthly Pro/Business access and/or a pack of
          background-removal credits. Delivery is instant in your browser after Razorpay confirms payment. There is
          no cooling-off shipment and no return of a physical parcel.
        </p>
      </LegalSection>

      <LegalSection title="2. How to cancel a subscription">
        <p>
          You may cancel auto-renewal any time from Billing or by emailing {COMPANY.billingEmail} with the account
          email and Razorpay payment id. Cancellation stops the next cycle. You keep already-paid credits until they
          are used or the current period ends, whichever the plan describes. Cancelling does not by itself create a
          cash refund for time already used.
        </p>
      </LegalSection>

      <LegalSection title="3. When we issue a refund">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <strong className="text-white">Duplicate or failed charge:</strong> if Razorpay captured money but credits
            were not added, we refund the full amount or complete fulfilment within 5–7 business days of verification.
          </li>
          <li>
            <strong className="text-white">Unused credit pack:</strong> if you bought a credit pack and have not
            consumed any credit from that pack, you may request a full refund within <strong className="text-white">7 days</strong> of
            payment.
          </li>
          <li>
            <strong className="text-white">Unused plan upgrade:</strong> if you upgraded to Pro or Business and have
            not run any paid/credit job after payment, you may request a full refund within 7 days.
          </li>
          <li>
            <strong className="text-white">Processing failure:</strong> if AI removal fails, we automatically restore
            the daily quota or credit. That is not a cash refund unless the failure is persistent and you ask us to
            unwind an unused purchase.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. When refunds are not available">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Credits or plan days that have already been used to process images.</li>
          <li>Dissatisfaction with artistic quality of a completed cutout where the pipeline ran successfully.</li>
          <li>Requests made after 7 days when the purchase was already activated.</li>
          <li>Accounts suspended for acceptable-use or fraud violations.</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Refund timeline and method">
        <p>
          Approved refunds are initiated on Razorpay to the original payment instrument (UPI, card, netbanking, or
          wallet). Indian issuing banks typically complete credit within <strong className="text-white">5–7 business days</strong>{' '}
          after we trigger the refund (sometimes up to 10 business days depending on the bank). You will receive a
          Razorpay refund email/SMS. We do not refund in cash or to a different account.
        </p>
      </LegalSection>

      <LegalSection title="6. How to request">
        <p>
          Email {COMPANY.billingEmail} or {COMPANY.supportEmail} with: registered email, order/payment id, item
          purchased, and reason. Phone: {COMPANY.phone} during {COMPANY.hours}. We acknowledge within 24 hours on
          business days and decide within 5 business days.
        </p>
      </LegalSection>

      <LegalSection title="7. Chargebacks">
        <p>
          Please contact us before raising a bank chargeback so we can refund eligible orders faster. Unjustified
          chargebacks may lead to account suspension.
        </p>
      </LegalSection>

      <p className="text-xs text-[#707B9E]">
        Related:{' '}
        <Link className="text-[#00D9FF] underline" to="/terms">
          Terms
        </Link>{' '}
        ·{' '}
        <Link className="text-[#00D9FF] underline" to="/contact">
          Contact
        </Link>
      </p>
    </LegalPage>
  );
};

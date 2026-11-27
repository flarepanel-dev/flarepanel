import type { Metadata } from 'next';
import Link from 'next/link';
import { ContactLink, LegalPage, MERCHANT } from '@/components/legal';
import { LEGAL_DRAFT } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Refund policy: FlarePanel',
  description:
    'A full refund of your first payment within 14 days, how to ask for one, and how cancelling and renewals work.',
  alternates: { canonical: '/refunds' },
  // Drafts stay out of search results.
  robots: LEGAL_DRAFT ? { index: false } : undefined,
};

export default function RefundsPage() {
  return (
    <LegalPage
      intro={
        <p>
          Try FlarePanel for free first. If you then pay and it is not for you,
          you can have your first payment back within 14 days, no questions
          asked.
        </p>
      }
      path="/refunds"
      title="Refund policy"
    >
      <h2>First payment: 14 days</h2>
      <p>
        If you ask within 14 days of the first payment for a paid plan, monthly
        or yearly, we refund that payment in full. The plan then ends; your data
        stays in your workspace, and you can export it.
      </p>

      <h2>Renewals</h2>
      <p>
        Renewals are not refunded. You can cancel at any time from Billing in
        your workspace: your plan keeps running until the end of the period you
        paid for and is not charged again.
      </p>

      <h2>Going over your plan</h2>
      <p>
        You are never charged for events above your plan, so there is nothing to
        refund there: we keep collecting your events and pause the charts until
        you upgrade or your next period starts.
      </p>

      <h2>How to ask</h2>
      <p>
        Write to <ContactLink /> from the email address on your account, or
        reply to your receipt from Polar. Tell us the workspace. The refund is
        made by Polar, our merchant of record, to the payment method you used;
        how quickly it shows up depends on your bank.
      </p>

      <h2>Your rights</h2>
      <p>
        This policy adds to your rights under consumer law and does not limit
        them, including any right of withdrawal you have as a consumer in the EU
        or UK. Purchases are made from {MERCHANT.name}, whose{' '}
        <a href={MERCHANT.buyerTerms} rel="noopener noreferrer" target="_blank">
          buyer terms
        </a>{' '}
        also apply. See our <Link href="/terms">terms of service</Link> for
        everything else.
      </p>
    </LegalPage>
  );
}

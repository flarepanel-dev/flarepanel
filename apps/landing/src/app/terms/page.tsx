import type { Metadata } from 'next';
import Link from 'next/link';
import { COMPANY, LEGAL_DRAFT, LegalPage } from '@/components/legal';
import { formatEvents, TRIAL_DAYS, TRIAL_EVENTS } from '@/lib/pricing';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Terms of service: FlarePanel',
  description:
    'The terms for using FlarePanel Cloud: accounts, acceptable use, plans and billing, your data, and our responsibilities.',
  alternates: { canonical: '/terms' },
  // Unreviewed drafts stay out of search results.
  robots: LEGAL_DRAFT ? { index: false } : undefined,
};

export default function TermsPage() {
  return (
    <LegalPage
      intro={
        <p>
          These terms apply when you use FlarePanel Cloud, the hosted service at
          flarepanel.dev. They are written to be read. If something is unclear,
          ask us before you rely on it.
        </p>
      }
      path="/terms"
      title="Terms of service"
    >
      <h2>1. Who you agree with</h2>
      <p>
        FlarePanel Cloud is provided by {COMPANY.name}, {COMPANY.address}{' '}
        ("we"). By creating an account you agree to these terms on behalf of
        yourself or the organisation you sign up for ("you"), and confirm you
        may do so.
      </p>
      <p>
        The FlarePanel source code is open source (AGPL-3.0 for the platform,
        MIT for the SDKs). Those licences, not these terms, govern your use of
        the code when you run it yourself.
      </p>

      <h2>2. Your account</h2>
      <ul>
        <li>Give accurate details and keep your sign-in safe.</li>
        <li>
          You are responsible for what happens in your workspaces, including the
          team members you invite and the API keys you create.
        </li>
        <li>
          Tell us at once at security@flarepanel.dev if you think your account
          or a key has been misused.
        </li>
      </ul>

      <h2>3. Using FlarePanel properly</h2>
      <p>You may not use FlarePanel to:</p>
      <ul>
        <li>
          collect data you have no right to collect, or track people where the
          law requires consent you have not obtained
        </li>
        <li>
          send special categories of personal data (health, biometric data and
          similar) or payment card numbers in events
        </li>
        <li>
          break the law, infringe others' rights, or harm, probe or overload the
          service or other customers (security research under our{' '}
          <a href={`${site.docs}/security`}>security policy</a> is welcome)
        </li>
        <li>resell the service without a separate agreement with us</li>
      </ul>
      <p>
        You are responsible for telling your own visitors that you use
        FlarePanel (for example in your privacy notice) and for any consent your
        situation needs. For the personal data you send us, our{' '}
        <Link href="/dpa">data processing agreement</Link> applies and forms
        part of these terms.
      </p>

      <h2>4. Plans, trial and billing</h2>
      <ul>
        <li>
          A new workspace starts with a {TRIAL_DAYS}-day free trial of up to{' '}
          {formatEvents(TRIAL_EVENTS)} events, with no card needed.
        </li>
        <li>
          After that you choose a plan by monthly event volume, as listed on the{' '}
          <Link href="/pricing">pricing page</Link>. Prices exclude taxes unless
          shown otherwise.
        </li>
        <li>
          Plans renew automatically each month or year until you cancel.
          Upgrades apply at once; when you cancel, your plan runs to the end of
          the paid period. Payments already made are not refunded, except where
          the law requires it.
        </li>
        <li>
          We email you at 80% and 100% of your plan. If you go over, we keep
          collecting your events and never charge for the extra, but the charts
          pause until you upgrade or your next period starts.
        </li>
        <li>
          Payments are processed by our payment provider, which may act as the
          merchant of record and show on your statement.
        </li>
        <li>
          We may change prices with at least 30 days' notice by email; the new
          price applies from your next renewal after that.
        </li>
      </ul>

      <h2>5. Your data</h2>
      <p>
        The data you send to FlarePanel is yours. We use it only to provide the
        service to you, as described in our{' '}
        <Link href="/privacy">privacy policy</Link> and the DPA. You can export
        it at any time through the API. When you delete a project, workspace or
        account, its data is deleted after a 24-hour grace period (backups roll
        over within 30 days).
      </p>
      <p>
        You give us the permission we need to store, process and display your
        data in order to run FlarePanel for you, and nothing more.
      </p>

      <h2>6. AI features and third-party connections</h2>
      <p>
        The AI assistant runs on your own OpenAI or Anthropic key. Requests go
        to that provider under your account and its terms, and the provider
        bills you directly. The same goes for other services you connect, such
        as Google Search Console, Slack or Discord. AI answers can be wrong;
        check them before acting on them.
      </p>

      <h2>7. Availability and changes</h2>
      <p>
        We work to keep FlarePanel fast and available and publish its status at{' '}
        <a href="https://status.flarepanel.dev">status.flarepanel.dev</a>.
        Unless we agree otherwise in writing, the service comes without an
        uptime guarantee. We improve the product continually; if we remove a
        feature you rely on, we tell you in advance where we reasonably can.
      </p>

      <h2>8. Suspension and ending</h2>
      <ul>
        <li>You can stop at any time by deleting your workspace or account.</li>
        <li>
          We may suspend or close an account that breaks these terms, puts the
          service or others at risk, or is not paid. Where we reasonably can, we
          warn you first and give you time to fix it and export your data.
        </li>
        <li>
          We may stop offering FlarePanel Cloud with at least 60 days' notice,
          so you can export your data or move to a self-hosted install.
        </li>
      </ul>

      <h2>9. Liability</h2>
      <p>
        FlarePanel is provided "as is". To the extent the law allows, we are not
        liable for indirect or consequential losses (such as lost profits or
        lost data you could have exported), and our total liability over any 12
        months is limited to the amount you paid us in that period. Nothing here
        limits liability that cannot be limited by law, such as for fraud or for
        death or personal injury caused by negligence. [Review the cap and
        wording with a lawyer.]
      </p>

      <h2>10. Changes to these terms</h2>
      <p>
        We may update these terms. For material changes we email account holders
        at least 30 days before they take effect. Continuing to use FlarePanel
        after that means you accept them; if you do not, you can close your
        account.
      </p>

      <h2>11. Law and contact</h2>
      <p>
        These terms are governed by {COMPANY.governingLaw}, and the courts of{' '}
        {COMPANY.country} have jurisdiction, without taking away any protection
        the law of your country gives you as a consumer. Questions:{' '}
        {COMPANY.contact}.
      </p>
    </LegalPage>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { COMPANY, ContactLink, LegalPage, MERCHANT } from '@/components/legal';
import { LEGAL_DRAFT } from '@/lib/legal';
import { formatEvents, TRIAL_DAYS, TRIAL_EVENTS } from '@/lib/pricing';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Terms of service: FlarePanel',
  description:
    'The terms for using FlarePanel Cloud: accounts, acceptable use, plans, payment through Polar, refunds, your data, and our responsibilities.',
  alternates: { canonical: '/terms' },
  // Drafts stay out of search results.
  robots: LEGAL_DRAFT ? { index: false } : undefined,
};

export default function TermsPage() {
  return (
    <LegalPage
      intro={
        <p>
          These terms apply when you use FlarePanel Cloud, the hosted analytics
          service at flarepanel.dev and dashboard.flarepanel.dev. They are
          written to be read. If something is unclear, ask us at <ContactLink />{' '}
          before you rely on it.
        </p>
      }
      path="/terms"
      title="Terms of service"
    >
      <h2>1. Who you agree with</h2>
      <p>
        FlarePanel Cloud is provided by {COMPANY.name}, {COMPANY.description}{' '}
        ("we", "us"). You can reach us at <ContactLink />. By creating an
        account you agree to these terms on behalf of yourself or the
        organisation you sign up for ("you"), and confirm you may do so.
      </p>
      <p>
        Paid plans are sold by our reseller, {MERCHANT.name} ("Polar"), as
        merchant of record: see section 4. Polar's{' '}
        <a href={MERCHANT.buyerTerms} rel="noopener noreferrer" target="_blank">
          buyer terms
        </a>{' '}
        cover the purchase; these terms cover your use of FlarePanel.
      </p>
      <p>
        The FlarePanel source code is open source (AGPL-3.0 for the platform,
        MIT for the SDKs). Those licences, not these terms, govern your use of
        the code when you run it yourself.
      </p>

      <h2>2. What FlarePanel is</h2>
      <p>
        FlarePanel is web and product analytics software as a service. You add
        our script or SDK to your website or app, and the dashboard shows
        visitors, events, sessions, funnels, retention and reports. Features,
        limits and prices are described on the website, in the{' '}
        <a href={site.docs}>documentation</a> and on the{' '}
        <Link href="/pricing">pricing page</Link>.
      </p>

      <h2>3. Your account</h2>
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

      <h2>4. Plans, payment and refunds</h2>
      <ul>
        <li>
          <strong>Trial.</strong> Your first workspace starts with a{' '}
          {TRIAL_DAYS}-day free trial of up to {formatEvents(TRIAL_EVENTS)}{' '}
          events, with no card needed. There is one trial per person and email
          address: further workspaces start on a plan, and sign-ups with
          temporary inboxes are not accepted. A trial stops recording new events
          once it reaches its limit, and 7 days after it ends without a plan.
        </li>
        <li>
          <strong>Plans.</strong> After that you choose a plan by monthly event
          volume, as listed on the <Link href="/pricing">pricing page</Link>, in
          US dollars. VAT or sales tax is added at checkout where it applies.
        </li>
        <li>
          <strong>Who you pay.</strong> Orders are processed by our online
          reseller Polar ({MERCHANT.name}, {MERCHANT.address}), the merchant of
          record for all orders. Polar takes the payment, issues the invoice,
          handles sales tax and VAT, and appears on your statement. We never see
          or store your card details.
        </li>
        <li>
          <strong>Renewal and cancelling.</strong> Plans renew automatically
          each month or year until you cancel, which you can do at any time from
          Billing in your workspace. Upgrades apply at once; when you cancel,
          your plan runs to the end of the period you paid for. New events stop
          being recorded 7 days after a plan ends.
        </li>
        <li>
          <strong>Refunds.</strong> You can get a full refund of your first
          payment within 14 days, as set out in our{' '}
          <Link href="/refunds">refund policy</Link>. Your rights under consumer
          law are not affected.
        </li>
        <li>
          <strong>Going over your plan.</strong> We email you at 80% and 100% of
          your plan. If a paid plan goes over, we keep collecting your events
          and never charge for the extra, but the charts pause until you upgrade
          or your next period starts.
        </li>
        <li>
          <strong>Price changes.</strong> We may change prices with at least 30
          days' notice by email; the new price applies from your next renewal
          after that, and you can cancel before it does.
        </li>
      </ul>

      <h2>5. Using FlarePanel properly</h2>
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

      <h2>6. Your data</h2>
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

      <h2>7. AI features and third-party connections</h2>
      <p>
        The AI assistant and AI answer tracking run on your own OpenAI or
        Anthropic key. Requests go to that provider under your account and its
        terms, and the provider bills you directly. The same goes for other
        services you connect, such as Google Search Console, Cloudflare, Slack
        or Discord. AI output can be wrong; check it before acting on it.
      </p>

      <h2>8. Availability and changes</h2>
      <p>
        We work to keep FlarePanel fast and available and publish its status at{' '}
        <a href="https://status.flarepanel.dev">status.flarepanel.dev</a>.
        Unless we agree otherwise in writing, the service comes without an
        uptime guarantee. We improve the product continually; if we remove a
        feature you rely on, we tell you in advance where we reasonably can.
      </p>

      <h2>9. Suspension and ending</h2>
      <ul>
        <li>You can stop at any time by deleting your workspace or account.</li>
        <li>
          We may suspend or close an account that breaks these terms, puts the
          service or others at risk, or is not paid. Where we reasonably can, we
          warn you first and give you time to fix it and export your data.
        </li>
        <li>
          We may stop offering FlarePanel Cloud with at least 60 days' notice,
          so you can export your data or move to a self-hosted install. Prepaid
          time you can no longer use is refunded.
        </li>
      </ul>

      <h2>10. Liability</h2>
      <p>
        We are liable without limitation for damage caused intentionally or by
        gross negligence, for injury to life, body or health, under the German
        Product Liability Act, and where we have given a guarantee. For slight
        negligence we are liable only if we breach an obligation that is
        essential to the contract and that you may rely on, and then only for
        the damage that is typical and foreseeable for this kind of contract.
        Otherwise we are not liable for slight negligence. This also applies to
        the people we work with.
      </p>
      <p>
        Keep your own copies of data that matters to you; FlarePanel lets you
        export it at any time.
      </p>

      <h2>11. Changes to these terms</h2>
      <p>
        We may update these terms. For material changes we email account holders
        at least 30 days before they take effect. If you do not agree, you can
        close your account before then, and we refund prepaid time you have not
        used.
      </p>

      <h2>12. Law, disputes and contact</h2>
      <p>
        These terms are governed by {COMPANY.governingLaw}, excluding the UN
        Convention on Contracts for the International Sale of Goods. If you are
        a consumer, this does not take away the protection of the mandatory law
        of the country where you live. If you are a business, the courts of{' '}
        {COMPANY.country} have jurisdiction.
      </p>
      <p>
        We are not obliged to take part, and do not take part, in dispute
        resolution proceedings before a consumer arbitration board. If something
        goes wrong, write to us at <ContactLink /> and we will work it out with
        you.
      </p>
    </LegalPage>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { COMPANY, ContactLink, LegalPage } from '@/components/legal';
import { LEGAL_DRAFT } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Data processing agreement: FlarePanel',
  description:
    'How FlarePanel processes personal data for customers under GDPR Article 28: scope, security measures, subprocessors, breaches and deletion.',
  alternates: { canonical: '/dpa' },
  // Drafts stay out of search results.
  robots: LEGAL_DRAFT ? { index: false } : undefined,
};

export default function DpaPage() {
  return (
    <LegalPage
      intro={
        <p>
          This data processing agreement ("DPA") is part of the{' '}
          <Link href="/terms">terms of service</Link> between you (the customer,
          "controller") and {COMPANY.name} ("processor"). It applies to personal
          data we process for you in FlarePanel Cloud and meets Article 28 of
          the EU General Data Protection Regulation (GDPR) and the UK GDPR. You
          accept it by accepting the terms; no signature is needed.
        </p>
      }
      path="/dpa"
      title="Data processing agreement"
    >
      <h2>1. Scope of processing</h2>
      <table>
        <tbody>
          <tr>
            <th>Subject matter</th>
            <td>Providing FlarePanel Cloud web and product analytics</td>
          </tr>
          <tr>
            <th>Duration</th>
            <td>
              For as long as you use the service, plus the deletion periods in
              section 9
            </td>
          </tr>
          <tr>
            <th>Nature and purpose</th>
            <td>
              Collecting, storing, aggregating and displaying analytics events
              and the reports, replays and exports you configure
            </td>
          </tr>
          <tr>
            <th>Data subjects</th>
            <td>
              Visitors and users of your websites and apps; your team members
            </td>
          </tr>
          <tr>
            <th>Personal data</th>
            <td>
              Pseudonymous visitor ids, page and event data, referrers and
              campaign tags, device and browser type, approximate location (from
              the IP address, which is not stored), and any identifiers,
              properties, session replays or AI call contents you choose to send
            </td>
          </tr>
          <tr>
            <th>Special categories</th>
            <td>
              None. The terms forbid sending them, and you must not configure
              FlarePanel to collect them
            </td>
          </tr>
        </tbody>
      </table>

      <h2>2. Your instructions</h2>
      <p>
        We process the personal data only on your documented instructions: these
        terms, this DPA and your settings in FlarePanel. If we believe an
        instruction breaks data protection law, we tell you. If the law requires
        us to process data differently, we tell you first unless the law forbids
        it.
      </p>

      <h2>3. Confidentiality</h2>
      <p>
        Everyone at {COMPANY.name} who can access the personal data is bound to
        confidentiality and accesses it only as needed to run, secure and
        support the service.
      </p>

      <h2>4. Security</h2>
      <p>
        We maintain appropriate technical and organisational measures,
        including:
      </p>
      <ul>
        <li>encryption in transit (HTTPS only, with HSTS) and at rest</li>
        <li>
          strict separation of workspaces, checked by an automated
          cross-workspace isolation test
        </li>
        <li>
          no stored IP addresses and no tracking cookies; a daily-rotating salt
          for visitor ids
        </li>
        <li>
          session replays mask text and form inputs by default; prompt and
          replay contents are deleted after 30 days
        </li>
        <li>
          hashed passwords (Argon2) and API secrets; encrypted third-party keys;
          rate limits on sign-in and API access
        </li>
        <li>point-in-time recovery for 30 days and monitoring with alerts</li>
        <li>least-privilege access for our staff [describe your practice]</li>
      </ul>

      <h2>5. Subprocessors</h2>
      <p>
        You authorise the subprocessors listed on our{' '}
        <Link href="/subprocessors">subprocessors page</Link>. We give at least
        30 days' notice by email before adding or replacing one, and you may
        object on reasonable data protection grounds; if we cannot resolve the
        objection, you may end the affected service and receive a refund of
        prepaid fees for the remaining period. We impose data protection terms
        on each subprocessor that are at least as protective as this DPA, and
        remain responsible for them.
      </p>

      <h2>6. International transfers</h2>
      <p>
        Where personal data leaves the EEA, UK or Switzerland, transfers rely on
        an adequacy decision (such as the EU-U.S. Data Privacy Framework) or on
        the Standard Contractual Clauses, which are incorporated by reference
        with this DPA. Cloudflare, which hosts the service, is certified under
        the EU-U.S. Data Privacy Framework.
      </p>

      <h2>7. Helping you</h2>
      <p>
        Taking the nature of the processing into account, we help you answer
        requests from data subjects (access, deletion, export), carry out data
        protection impact assessments and consult supervisory authorities.
        FlarePanel's dashboard and API let you find and export a person's data
        yourself. To delete one person's data, write to <ContactLink /> with
        their id and we delete it within 30 days.
      </p>

      <h2>8. Personal data breaches</h2>
      <p>
        We notify you without undue delay, and within 48 hours of becoming
        aware, of a personal data breach affecting your data, with the
        information you need to meet your own obligations, and we keep you
        updated as we learn more.
      </p>

      <h2>9. Deletion and return</h2>
      <p>
        You can export your data through the API at any time. When you delete a
        project or workspace, or your account ends, we delete the personal data
        after a 24-hour grace period; copies in rolling backups are overwritten
        within 30 days, unless the law requires us to keep them.
      </p>

      <h2>10. Audits</h2>
      <p>
        On request we provide the information needed to show compliance with
        this DPA, including our security documentation and the certifications of
        our subprocessors. If that is not enough, you may audit us, at your
        expense, with 30 days' notice, during business hours and under
        confidentiality, no more than once a year unless a breach or an
        authority requires it.
      </p>

      <h2>11. Liability and precedence</h2>
      <p>
        The liability terms of the terms of service apply to this DPA. If this
        DPA and the terms conflict on data protection, this DPA prevails; the
        Standard Contractual Clauses prevail over both where they apply.
      </p>
    </LegalPage>
  );
}

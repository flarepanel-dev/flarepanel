import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '@/components/legal';
import { LEGAL_DRAFT } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Subprocessors: FlarePanel',
  description:
    'The companies that process personal data for FlarePanel Cloud, what each one does and where.',
  alternates: { canonical: '/subprocessors' },
  // Drafts stay out of search results.
  robots: LEGAL_DRAFT ? { index: false } : undefined,
};

const SUBPROCESSORS = [
  {
    name: 'Cloudflare, Inc.',
    purpose:
      'Runs the whole service: Workers, Durable Objects, D1 databases and R2 storage for all analytics and account data; the network and DDoS protection; sending account emails',
    data: 'All data described in the privacy policy',
    location: 'United States (company); global network',
    link: 'https://www.cloudflare.com/cloudflare-customer-dpa/',
  },
  {
    name: 'Polar Software, Inc.',
    purpose:
      'Sells paid plans as merchant of record: checkout, payments, invoices, tax and subscriptions',
    data: 'Account holders who buy a plan: name, email, billing details, plan',
    location: 'United States',
    link: 'https://polar.sh/legal/privacy',
  },
];

export default function SubprocessorsPage() {
  return (
    <LegalPage
      intro={
        <p>
          FlarePanel Cloud is deliberately built on very few providers. These
          companies process personal data on our behalf. We give customers at
          least 30 days' notice by email before adding or replacing one, as set
          out in the <Link href="/dpa">data processing agreement</Link>.
        </p>
      }
      path="/subprocessors"
      title="Subprocessors"
    >
      <table>
        <thead>
          <tr>
            <th>Company</th>
            <th>What it does</th>
            <th>Data</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          {SUBPROCESSORS.map((s) => (
            <tr key={s.name}>
              <td>
                <a href={s.link} rel="noopener noreferrer" target="_blank">
                  {s.name}
                </a>
              </td>
              <td>{s.purpose}</td>
              <td>{s.data}</td>
              <td>{s.location}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Services you connect yourself</h2>
      <p>
        These are not our subprocessors: when you connect them, data goes to
        them under your own account and agreement with them.
      </p>
      <ul>
        <li>
          <strong>OpenAI or Anthropic</strong>, when you add your own key for
          the AI assistant: your questions and the analytics needed to answer
          them.
        </li>
        <li>
          <strong>Google Search Console</strong>, when you connect it: we read
          your site's search data from Google.
        </li>
        <li>
          <strong>Slack, Discord, webhooks, S3 or Google Cloud Storage</strong>,
          when you set up a notification or an export: the messages or data you
          choose to send there.
        </li>
      </ul>

      <h2>Not shared</h2>
      <p>
        Visitor locations are looked up in a geolocation database we host
        ourselves (DB-IP Lite); no IP address is sent to a third party for this.
        We use no advertising, analytics or tracking providers on our own sites.
      </p>
    </LegalPage>
  );
}

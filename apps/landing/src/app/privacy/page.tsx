import type { Metadata } from 'next';
import Link from 'next/link';
import { COMPANY, ContactLink, LegalPage, MERCHANT } from '@/components/legal';
import { LEGAL_DRAFT } from '@/lib/legal';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Privacy policy: FlarePanel',
  description:
    'What FlarePanel collects, why, where it is stored and for how long, for account holders and for the visitors our customers measure.',
  alternates: { canonical: '/privacy' },
  // Drafts stay out of search results.
  robots: LEGAL_DRAFT ? { index: false } : undefined,
};

export default function PrivacyPage() {
  return (
    <LegalPage
      intro={
        <p>
          FlarePanel is analytics that does not follow people around. This
          policy explains what we collect when you use FlarePanel Cloud, why,
          where it lives and how long we keep it. It covers two roles: the data
          of our own customers (where we decide how it is used), and the
          analytics our customers collect about their visitors (where the
          customer decides, and we process it for them).
        </p>
      }
      path="/privacy"
      title="Privacy policy"
    >
      <h2>Who we are</h2>
      <p>
        FlarePanel Cloud (flarepanel.dev, dashboard.flarepanel.dev,
        api.flarepanel.dev and status.flarepanel.dev) is run by {COMPANY.name},{' '}
        {COMPANY.description} ("we"). We are the controller for the data in
        section 1. For anything in this policy, write to <ContactLink />.
      </p>
      <p>
        If you run FlarePanel yourself from the open-source code, the data stays
        in your own Cloudflare account and this policy does not apply: you are
        responsible for it.
      </p>

      <h2>1. Our customers: account and billing data</h2>
      <p>When you sign up for FlarePanel Cloud we keep:</p>
      <ul>
        <li>
          <strong>Account details:</strong> your name, email address and a
          password hash (we never store the password itself). If you sign in
          with Google or GitHub, we receive your name, email and the fact that
          the provider verified it.
        </li>
        <li>
          <strong>Workspace data:</strong> workspace and project names, website
          domains, team members and invitations, dashboards, reports,
          notification rules and settings.
        </li>
        <li>
          <strong>Keys you add:</strong> API clients, MCP tokens (stored as
          hashes) and, if you connect your own AI provider or a Cloudflare zone,
          its key or read-only token, encrypted at rest.
        </li>
        <li>
          <strong>Billing:</strong> your plan and its status. Paid plans are
          sold by {MERCHANT.name} as merchant of record. Polar collects your
          payment and billing details, issues invoices and handles tax, as an
          independent controller under its own{' '}
          <a href={MERCHANT.privacy} rel="noopener noreferrer" target="_blank">
            privacy policy
          </a>
          . We receive your plan and its status from Polar, and never see or
          store card numbers.
        </li>
        <li>
          <strong>Security and operations:</strong> sign-in sessions (with the
          IP address and browser they came from, so you can recognise them),
          rate-limit counters and service logs, which we keep only for a short
          time to run and secure the service.
        </li>
        <li>
          <strong>Emails:</strong> the account emails we send you (verification,
          invitations, password resets, usage warnings, product updates you can
          unsubscribe from).
        </li>
        <li>
          <strong>Feedback:</strong> when you use Give feedback in the
          dashboard, your message, any screenshots, the page, your browser and
          workspace id, and your email if you choose to share it, are emailed to
          us so we can follow up.
        </li>
      </ul>
      <p>
        We use this data to provide the service you signed up for, to bill you,
        to keep the service secure and to tell you about changes that affect
        you. Our legal bases are the contract with you, our legitimate interest
        in a secure and working service, and your consent for optional emails.
      </p>

      <h2>2. Our customers' visitors: analytics data</h2>
      <p>
        When a website or app uses FlarePanel, it sends us events about its
        visitors. For this data our customer is the controller and we are their
        processor, under our <Link href="/dpa">data processing agreement</Link>.
        We only use it to provide FlarePanel to that customer.
      </p>
      <p>An event can contain:</p>
      <ul>
        <li>the page or screen, the referring site and campaign tags</li>
        <li>
          browser, operating system and device type, read from the user agent
        </li>
        <li>
          approximate location (country, region, city), looked up from the IP
          address
        </li>
        <li>
          anything the customer chooses to send: event names and properties,
          and, if they identify signed-in users, an id, name or email
        </li>
        <li>
          if the customer turns it on: session replays (text and inputs are
          masked by default) and the prompts and responses of their AI features
        </li>
      </ul>
      <p>
        Customers can also report crawler and bot requests to their site, or
        import them from their Cloudflare account. Only requests from known bots
        (such as GPTBot or Googlebot) are kept, with the bot's name, the page,
        the time and the response status; requests from people are dropped. If a
        customer tracks how AI assistants answer questions about their brand, we
        store the questions they choose and a short excerpt of each answer.
      </p>
      <h3>No cookies, and no stored IP addresses</h3>
      <p>
        The FlarePanel script sets no cookies and keeps ids only in memory. To
        count a visitor without a cookie, the server combines the IP address and
        user agent with a random value that changes every day and keeps only the
        resulting hash, so the same visitor cannot be recognised from one day to
        the next. The IP address is used for that and for the location lookup,
        then dropped: it is not stored with events.
      </p>

      <h2>3. Cookies and tracking on our own sites</h2>
      <p>
        flarepanel.dev, docs.flarepanel.dev and status.flarepanel.dev set no
        cookies. We measure them with FlarePanel itself, in the same cookieless
        way described in section 2: page views, clicks on outgoing links and on
        buttons we mark, the referrer, and the browser, device and country
        derived from the request. The status page also remembers a light or dark
        choice in your browser's local storage, which never leaves your device.
      </p>
      <p>
        The website shows public widgets with the aggregate numbers of its own
        project (visitors now, top countries, referrers and pages). They never
        show an individual visitor.
      </p>
      <p>
        The dashboard sets a session cookie that keeps you signed in, one that
        remembers which sign-in method you used last, and a few that remember
        your display choices (theme, chart type, date range, and whether you
        have seen a prompt). They are needed for the service or remember what
        you chose; none is used for advertising.
      </p>
      <p>
        We measure how the dashboard is used with FlarePanel itself, without
        cookies: page views, and product events such as finishing a sign-up step
        or creating a project. They are linked to your account id, never to your
        name or email address.
      </p>

      <h3>Status emails</h3>
      <p>
        If you subscribe to status emails, we keep your address and the services
        you chose until you unsubscribe (an address that is never confirmed is
        deleted after a week). To stop the form being abused we keep, for up to
        a day, a keyed hash of the network you subscribed from; it cannot be
        turned back into an address without our secret key.
      </p>

      <h3>Free tools</h3>
      <p>
        The URL checker and IP lookup on flarepanel.dev/tools do not keep what
        you enter. Requests can appear for a few days in our service logs, which
        we use only to run and secure the service.
      </p>

      <h2>4. Where data is stored</h2>
      <p>
        FlarePanel runs entirely on Cloudflare: Workers, Durable Objects, D1
        databases and R2 storage. Cloudflare operates a global network, so data
        can be processed in the United States and other countries where it has
        data centres. Transfers out of the EU and UK rely on Cloudflare's
        certification under the EU-U.S. Data Privacy Framework, with the
        Standard Contractual Clauses in its data processing addendum as a
        fallback.
      </p>

      <h2>5. How long we keep it</h2>
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Kept for</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Account and workspace data</td>
            <td>
              While the account exists; deleted 24 hours after you delete a
              workspace or account
            </td>
          </tr>
          <tr>
            <td>Events in the dashboard's fast storage</td>
            <td>90 days</td>
          </tr>
          <tr>
            <td>Raw event archive (for reports over longer ranges)</td>
            <td>Until the project or workspace is deleted</td>
          </tr>
          <tr>
            <td>Session replays and AI prompt/response text</td>
            <td>30 days</td>
          </tr>
          <tr>
            <td>
              A one-way hash of the email address that started a free trial
            </td>
            <td>Two years, so the same address cannot start a second trial</td>
          </tr>
          <tr>
            <td>Crawler and bot hits</td>
            <td>30 days</td>
          </tr>
          <tr>
            <td>AI answer checks</td>
            <td>90 days</td>
          </tr>
          <tr>
            <td>Status email subscriptions</td>
            <td>Until you unsubscribe; unconfirmed ones a week</td>
          </tr>
          <tr>
            <td>Service logs</td>
            <td>A few days</td>
          </tr>
          <tr>
            <td>Point-in-time backups</td>
            <td>30 days, then overwritten</td>
          </tr>
          <tr>
            <td>Invoices and payment records</td>
            <td>
              Kept by Polar as merchant of record; our own records of plans and
              payments as long as German tax law requires (up to 10 years)
            </td>
          </tr>
        </tbody>
      </table>

      <h2>6. Who else sees it</h2>
      <p>
        We do not sell personal data or share it for advertising. A small number
        of service providers process it for us; they are listed, with what each
        one does, on the <Link href="/subprocessors">subprocessors</Link> page.
        If you connect your own AI provider or Google Search Console, that data
        goes to the provider under your own account with them.
      </p>

      <h2>7. Your rights</h2>
      <p>
        You can see, correct, export and delete your account data at any time:
        most of it from the dashboard (Settings, and Delete account), the rest
        by writing to <ContactLink />. You may also object to processing,
        restrict it, take your data to another provider, withdraw consent you
        gave, and complain to a data protection authority, for example the one
        where you live or work.
      </p>
      <p>
        If you are a visitor of a site that uses FlarePanel, please contact that
        site: they control the data, and we help them answer your request.
      </p>

      <h2>8. Security</h2>
      <p>
        All traffic is encrypted (HTTPS only), workspaces are isolated from each
        other, passwords are hashed with Argon2, and keys you store are
        encrypted. Our <a href={`${site.docs}/security`}>security policy</a>{' '}
        explains how to report a vulnerability.
      </p>

      <h2>9. Changes</h2>
      <p>
        When we change this policy we update the date at the top. For changes
        that matter, we email account holders before they take effect.
      </p>
    </LegalPage>
  );
}

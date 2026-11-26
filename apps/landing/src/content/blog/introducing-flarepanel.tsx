import { A, Callout, Code, Pre } from '@/components/blog/prose';
import type { PostMeta } from '@/lib/blog';

export const meta: PostMeta = {
  slug: 'introducing-flarepanel',
  title:
    'Introducing FlarePanel, open-source analytics that runs on Cloudflare',
  description:
    'FlarePanel is open-source web and product analytics built entirely on Cloudflare Workers, Durable Objects, D1, R2 and Queues. Here is what it is, what works today and how to start.',
  date: '2026-11-26',
  author: 'FlarePanel team',
  tags: ['Announcement'],
};

export default function Post() {
  return (
    <>
      <p>
        FlarePanel is open-source web and product analytics that runs entirely
        on Cloudflare. Workers receive your events, each project’s events live
        in their own Durable Object, raw events are archived to R2, accounts
        live in D1, and background jobs run on Queues. There are no servers or
        databases for you to run.
      </p>
      <p>
        Today we are opening it up: the hosted service is in early access at{' '}
        <A href="https://dashboard.flarepanel.dev/onboarding">
          dashboard.flarepanel.dev
        </A>
        , and the same code can be deployed to your own Cloudflare account.
      </p>

      <h2>Where it comes from</h2>
      <p>
        FlarePanel is an independent fork of{' '}
        <A href="https://github.com/Openpanel-dev/openpanel">OpenPanel</A>,
        taken from OpenPanel’s <Code>main</Code> branch on 22 November 2026.
        OpenPanel runs on Postgres, ClickHouse, Redis and Kafka. We rebuilt the
        backend on Cloudflare’s own services and kept the parts that make
        OpenPanel useful: web analytics, product analytics, funnels, retention,
        profiles, sessions and live visitors.
      </p>
      <p>
        We also kept OpenPanel’s tracking protocol. If you already use an
        OpenPanel SDK, it works with FlarePanel once you point its{' '}
        <Code>apiUrl</Code> at FlarePanel.
      </p>
      <Callout>
        FlarePanel is not affiliated with, sponsored or endorsed by OpenPanel or
        Cloudflare. We use the OpenPanel name only to say where the code comes
        from and what it is compatible with.
      </Callout>

      <h2>Why Cloudflare</h2>
      <p>
        We wanted analytics you can deploy to a Cloudflare account and then stop
        thinking about. Building on Workers, Durable Objects, D1, R2 and Queues
        gives us that: there is no database cluster to size, no queue broker to
        keep alive and no machine to patch.
      </p>
      <p>A few things follow from that design:</p>
      <ul>
        <li>
          <strong>One place per project.</strong> Each project has one Durable
          Object that stores its events, sessions and daily rollups. Reports,
          the REST API, the MCP server and the chat assistant all read from it,
          so every page answers from the same data.
        </li>
        <li>
          <strong>Nothing runs when nothing happens.</strong> Once a project’s
          sessions have ended, its Durable Object schedules no more alarms, and
          open dashboards hold their live connections with WebSocket
          hibernation.
        </li>
        <li>
          <strong>History stays in R2.</strong> Raw events are copied to R2 as
          compressed newline-delimited JSON, one file per project and hour. The
          Durable Object keeps the last 90 days by default; reports that reach
          further back read the archive.
        </li>
      </ul>
      <p>
        The details are in{' '}
        <A href="/blog/how-flarepanel-runs-on-cloudflare">
          How FlarePanel runs on Cloudflare
        </A>
        .
      </p>

      <h2>What works today</h2>
      <p>
        FlarePanel is in early access, and we keep an honest list in{' '}
        <A href="https://docs.flarepanel.dev/getting-started/status">
          What works today
        </A>
        . In short, these work on the hosted service now:
      </p>
      <ul>
        <li>
          Tracking with <Code>track</Code>, <Code>identify</Code>,{' '}
          <Code>increment</Code>, <Code>decrement</Code> and revenue, through
          the <Code>op1.js</Code> script tag and the web, Next.js and server
          SDKs.
        </li>
        <li>
          The overview: visitors, sessions, bounce rate, duration, page views
          and revenue, in your project’s timezone, with top pages, entry and
          exit pages, sources, UTM, countries, devices, browsers and a map.
        </li>
        <li>
          The event list, live events and visitors, profiles, groups and
          cohorts.
        </li>
        <li>
          The report builder, funnels, retention, conversion, user flow and
          distribution charts, over all history.
        </li>
        <li>
          Session replay, AI analytics (cost, tokens, latency and traces),
          notifications to email, Slack and webhooks, and daily insights.
        </li>
        <li>
          A REST API, an{' '}
          <A href="https://docs.flarepanel.dev/features/mcp">MCP server</A> for
          AI tools, and a chat assistant that runs on{' '}
          <A href="https://docs.flarepanel.dev/features/ai-keys">
            your own OpenAI or Anthropic key
          </A>
          .
        </li>
        <li>
          Imports from Umami, Mixpanel and Amplitude, and exports to S3,
          S3-compatible storage and Google Cloud Storage.
        </li>
      </ul>

      <h3>What to expect from early access</h3>
      <ul>
        <li>
          Existing OpenPanel data is not imported. You start a FlarePanel
          project fresh.
        </li>
        <li>
          Reports older than 90 days read the R2 archive, up to 3,000 archive
          files per report, so very long ranges on very busy projects show what
          was read.
        </li>
        <li>
          Session replay is capped by a monthly number of recorded sessions per
          organization.
        </li>
        <li>
          Self-hosting is a manual deploy guide today. A one-command setup is
          planned, and the guide itself warns of rough edges.
        </li>
      </ul>

      <h2>Hosted or self-hosted</h2>
      <p>
        The hosted service and a self-hosted install run the same code. One
        setting, <Code>SELF_HOSTED</Code>, decides which one an install is.
      </p>
      <p>
        <strong>Hosted</strong> at flarepanel.dev is priced by monthly events,
        with every feature in every plan and a 30-day trial. You get an email at
        80% of your plan’s events and never an overage charge. Billing is still
        being set up, so early access is free for now. The plans are on the{' '}
        <A href="/pricing">pricing page</A>.
      </p>
      <p>
        <strong>Self-hosted</strong> puts everything in your own Cloudflare
        account, so your events never leave it and you pay Cloudflare directly
        for what you use. It has no event limits and no billing pages. You need
        a Cloudflare account on the Workers Paid plan, because the API bundle is
        about 4.6 MB compressed, above the free plan’s 3 MB limit, plus a domain
        on Cloudflare DNS. Follow{' '}
        <A href="https://docs.flarepanel.dev/self-hosting/deploy">
          Deploy to Cloudflare
        </A>
        .
      </p>

      <h2>How to start</h2>
      <p>
        Create an account and a project, then paste the snippet the dashboard
        gives you before <Code>&lt;/head&gt;</Code>:
      </p>
      <Pre lang="html">{`<script>
  window.op=window.op||function(){var n=[];return new Proxy(function(){arguments.length&&n.push([].slice.call(arguments))},{get:function(t,r){return"q"===r?n:"call"===r||"apply"===r||"bind"===r?t[r]:function(){n.push([r].concat([].slice.call(arguments)))}} ,has:function(t,r){return"q"===r}}) }();
  window.op('init', {
    clientId: 'YOUR_CLIENT_ID',
    trackScreenViews: true,
    trackOutgoingLinks: true,
    trackAttributes: true,
  });
</script>
<script src="https://flarepanel.dev/op1.js" defer async></script>`}</Pre>
      <p>
        Keep the onboarding page open and load your site. The dashboard confirms
        the first event within a couple of seconds. Prefer npm? Use{' '}
        <Code>@flarepanel/web</Code>, <Code>@flarepanel/nextjs</Code> or{' '}
        <Code>@flarepanel/sdk</Code> for servers.
      </p>
      <p>
        Already on OpenPanel? Keep your SDK and change the URL, as described in{' '}
        <A href="/blog/moving-from-openpanel">Moving from OpenPanel</A>.
      </p>

      <h2>Open source</h2>
      <p>
        The platform is licensed under AGPL-3.0, like OpenPanel, and the client
        SDKs are MIT. The code and the docs are on{' '}
        <A href="https://github.com/flarepanel-dev/flarepanel">GitHub</A>.
        Issues and pull requests are welcome.
      </p>

      <h2>Try it</h2>
      <p>
        <A href="https://dashboard.flarepanel.dev/onboarding">
          Create a free early-access account
        </A>{' '}
        and send your first event, or start with the{' '}
        <A href="https://docs.flarepanel.dev/getting-started/quickstart">
          Quickstart
        </A>
        . If something you need is missing from the status page, tell us on
        GitHub.
      </p>
    </>
  );
}

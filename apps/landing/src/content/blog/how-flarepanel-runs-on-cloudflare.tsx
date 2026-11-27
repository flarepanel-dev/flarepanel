import { A, Callout, Code, Pre } from '@/components/blog/prose';
import type { PostMeta } from '@/lib/blog';

export const meta: PostMeta = {
  slug: 'how-flarepanel-runs-on-cloudflare',
  title: 'How FlarePanel runs on Cloudflare',
  description:
    'Follow one analytics event from the SDK through a Worker, a per-project Durable Object, the R2 archive, D1 and Queues, and see what that design means for running it.',
  date: '2026-11-26',
  author: 'FlarePanel team',
  tags: ['Engineering'],
};

export default function Post() {
  return (
    <>
      <p>
        FlarePanel replaces OpenPanel’s Postgres, ClickHouse, Redis and Kafka
        with Cloudflare Workers, Durable Objects, D1, R2 and Queues. This post
        follows one event from your site to the dashboard and explains what each
        piece does.
      </p>
      <Callout>
        FlarePanel is an independent project. It runs on Cloudflare’s developer
        platform but is not affiliated with or endorsed by Cloudflare, and it is
        a fork of OpenPanel that is not affiliated with or endorsed by
        OpenPanel.
      </Callout>

      <h2>The short version</h2>
      <Pre lang="text">{`SDK -> POST /track (Worker)
         client auth, schema, bot check, geo from request.cf,
         1 s duplicate check in the Cache API, per-IP rate limit
       -> ProjectEventsDurableObject (one per project, SQLite)
         device and session ids, the event pipeline,
         group commit (200 events or 500 ms), then answers
       <- { deviceId, sessionId }

alarm: close idle sessions (session_end), checkpoint,
       archive to R2 every 10 minutes, move quiet AI traces'
       text to R2, apply retention`}</Pre>

      <h2>1. The Worker at the edge</h2>
      <p>
        Every SDK, and the <Code>op1.js</Code> script tag, sends to one
        endpoint: <Code>POST /track</Code>. The request lands on the API Worker,
        which does the cheap checks before anything stateful runs:
      </p>
      <ul>
        <li>
          <strong>Rate limit.</strong> A per-IP cap on <Code>/track</Code> is
          checked before the app boots. The documented limit is 600 tracking
          requests per minute per IP address.
        </li>
        <li>
          <strong>Client auth.</strong> Every request carries a client ID.
          Server requests add a client secret; browser requests are accepted
          without one when their <Code>Origin</Code> matches one of the
          project’s domains.
        </li>
        <li>
          <strong>Schema and bots.</strong> The body is validated, and likely
          bot traffic is kept out of analytics. Recent bot hits are listed
          separately, up to 5,000 a project a day, for 30 days.
        </li>
        <li>
          <strong>Location.</strong> For browser traffic, country, region and
          city come from Cloudflare’s own <Code>request.cf</Code>, so there is
          no lookup to make. Server events that pass the visitor’s address are
          located from an optional DB-IP table in D1.
        </li>
        <li>
          <strong>Duplicates.</strong> A repeat of the same request within one
          second is dropped, using a short-lived key in the Cache API.
        </li>
      </ul>

      <h2>2. One Durable Object per project</h2>
      <p>
        The Worker then makes one call to the project’s Durable Object,
        addressed by the project ID. That object is where the event becomes
        data. It resolves the visitor’s device and session ids, runs the event
        pipeline, and writes events in groups: a group commits at 200 events or
        after 500 ms, whichever comes first. Only then does it answer, so a{' '}
        <Code>200</Code> with a <Code>deviceId</Code> and <Code>sessionId</Code>{' '}
        means the event is stored.
      </p>
      <p>Each object has its own SQLite database. The main tables are:</p>
      <ul>
        <li>
          <strong>chunks</strong>: events as gzip-compressed JSON, one row per
          group commit. These are the source of truth.
        </li>
        <li>
          <strong>daily</strong> and <strong>dims</strong>: per-day totals
          (visitors as a HyperLogLog sketch, sessions, bounces, duration, page
          views, revenue) and per-day counts by page, source, place and device.
          The overview reads these.
        </li>
        <li>
          <strong>sessions</strong> and profiles: live sessions, checkpointed so
          a restart does not lose them, and the project’s profiles.
        </li>
        <li>
          Smaller tables for groups, cohort members, AI calls, Search Console
          numbers, running imports, replay markers and recent bot hits.
        </li>
      </ul>
      <p>
        Rollups are kept in memory and written at checkpoints. After a restart,
        everything newer than the last checkpoint is rebuilt from the chunks, so
        nothing is counted twice or lost. Reports, the REST API, the MCP server
        and the chat assistant all read this same object.
      </p>

      <h2>3. Alarms do the background work</h2>
      <p>
        A Durable Object alarm handles the work that should not slow down a
        request. It closes sessions that have been idle for 30 minutes and
        writes their <Code>session_end</Code>, checkpoints state, copies new
        chunks to R2 every 10 minutes, moves an AI trace’s prompt and response
        text to R2 once the trace has been quiet for 5 minutes, and applies
        retention once a day.
      </p>

      <h2>4. R2 keeps the full history</h2>
      <p>
        Raw events are copied to R2 as newline-delimited JSON, one object per
        project and hour:
      </p>
      <Pre lang="text">
        {
          'v1/events/project_id=<id>/date=YYYY-MM-DD/hour=HH/<firstChunk>-<lastChunk>.ndjson.gz'
        }
      </Pre>
      <p>
        The Durable Object keeps 90 days of raw events by default (
        <Code>FLAREPANEL_EVENT_RETENTION_DAYS</Code> on a self-hosted install).
        R2 keeps everything. Old chunks are only removed from the object after
        they have reached the archive and every running S3 or GCS export has
        uploaded them. Reports that reach further back than the object’s window
        read the older hours from R2.
      </p>
      <p>
        The same bucket holds AI prompt and response text and session replay
        chunks (both removed after 30 days by lifecycle rules), failed jobs, and
        the copies an import reads while it runs. R2 is optional when you
        self-host, but without it events are kept 30 days and imports are
        unavailable.
      </p>

      <h2>5. D1 for accounts and settings</h2>
      <p>
        Accounts, organizations, members, projects, clients and settings live in
        D1 through Prisma’s D1 adapter. D1 has no interactive transactions, so
        writes that must happen together are sent as one batch. D1 also holds
        the daily salts behind{' '}
        <A href="/blog/cookieless-visitor-counting">
          cookieless visitor counting
        </A>
        . A second, optional D1 database, <Code>flarepanel-geo</Code>, holds
        DB-IP’s City Lite ranges for locating server-side events.
      </p>

      <h2>6. Queues for scheduled jobs</h2>
      <p>
        A Cron Trigger fires every minute and enqueues the jobs that are due on
        Cloudflare Queues: daily salt rotation, Search Console sync, cohort
        refresh every 30 minutes, daily insights, S3 and GCS exports every
        minute, and account emails. Imports run as a chain of short queue steps,
        each well inside a Worker’s CPU limit. Failed jobs end up in a
        dead-letter queue and in R2 under <Code>dead-letters/</Code>.
      </p>

      <h2>7. The live dashboard</h2>
      <p>
        The live event and visitor views are WebSockets. The Worker checks the
        session and project access, then hands the socket to the project’s
        Durable Object, which holds it with hibernation. An open dashboard costs
        nothing while nothing happens.
      </p>

      <h2>What this means for running it</h2>
      <ul>
        <li>
          <strong>No servers.</strong> A self-hosted install is two Workers (API
          and dashboard), a D1 database, Durable Objects, an R2 bucket and two
          queues in your own account.
        </li>
        <li>
          <strong>Idle costs nothing in compute.</strong> Once a project’s
          sessions have ended and its state is checkpointed, its Durable Object
          schedules no more alarms. Stored data is still billed by Cloudflare as
          storage.
        </li>
        <li>
          <strong>Predictable work per event.</strong> Each tracking request is
          one Worker request and one Durable Object request. Because events are
          written in groups, storage writes stay well below one row per event at
          steady traffic.
        </li>
        <li>
          <strong>Workers Paid is required.</strong> The API bundle is about 4.6
          MB compressed, above the free plan’s 3 MB limit.
        </li>
      </ul>
      <p>The design has trade-offs we would rather state plainly:</p>
      <ul>
        <li>
          Reports that reach past the 90-day window read hourly files from R2,
          at most 3,000 per report. Very long ranges on very busy projects show
          what was read. Self-hosters can opt in to{' '}
          <A href="https://docs.flarepanel.dev/self-hosting/advanced-analytics">
            advanced analytics
          </A>{' '}
          for faster long-history reports; it is off by default and billed by
          Cloudflare separately.
        </li>
        <li>
          On Cloudflare every request and every stored replay chunk is metered.
          That is why session replay has a monthly limit per organization, and
          why we recommend a budget alert and per-Worker CPU limits in your
          Cloudflare account.
        </li>
        <li>Setup is manual today. A one-command setup is planned.</li>
      </ul>

      <h2>Read next</h2>
      <p>
        The full reference is in{' '}
        <A href="https://docs.flarepanel.dev/self-hosting/architecture">
          Architecture
        </A>
        , and the resource list and steps are in{' '}
        <A href="https://docs.flarepanel.dev/self-hosting/deploy">
          Deploy to Cloudflare
        </A>
        . To see it run without deploying anything,{' '}
        <A href="https://dashboard.flarepanel.dev/onboarding">
          create a project on the hosted service
        </A>
        , which is free for the first 30 days.
      </p>
    </>
  );
}

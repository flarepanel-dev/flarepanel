import { A, Callout, Code, Pre } from '@/components/blog/prose';
import type { PostMeta } from '@/lib/blog';

export const meta: PostMeta = {
  slug: 'cookieless-visitor-counting',
  title: 'How FlarePanel counts visitors without cookies',
  description:
    'FlarePanel counts visitors from a daily salted hash of IP address, user agent and project, with no tracking cookies. Here is exactly what the code does, what it stores and where it falls short.',
  date: '2026-11-25',
  author: 'FlarePanel team',
  tags: ['Privacy', 'Engineering'],
};

export default function Post() {
  return (
    <>
      <p>
        FlarePanel sets no tracking cookies and writes nothing to local storage
        to recognise a visitor. It still reports unique visitors, sessions and
        bounce rate. This post explains how, based on what the code does today,
        including the places where the method is less exact than a cookie would
        be.
      </p>

      <h2>What the browser keeps</h2>
      <p>
        The web SDK keeps the device and session ids it gets back from the API
        in memory only. Reload the page and they are gone; the server works them
        out again. The one thing the SDK writes to the browser is{' '}
        <Code>sessionStorage</Code>, and only to hold revenue you queue with{' '}
        <Code>pendingRevenue</Code> until you call <Code>flushRevenue</Code>.
        The dashboard uses a session cookie for people signed in to it, which
        has nothing to do with your visitors.
      </p>

      <h2>The device id is a daily salted hash</h2>
      <p>
        When an event arrives, the server derives a device id from four inputs:
        the visitor’s user agent, their IP address, the project ID and the
        current salt. It hashes them with SHAKE256 and keeps the first 16 bytes
        as hex:
      </p>
      <Pre lang="ts">{`// packages/core/src/shared/profileId.ts
export function generateDeviceId({ salt, ua, ip, origin }) {
  return createHash(\`\${ua}:\${ip}:\${origin}:\${salt}\`, 16);
}
// origin is the project ID; createHash is SHAKE256, 16 bytes, hex`}</Pre>
      <p>Each input matters:</p>
      <ul>
        <li>
          <strong>IP and user agent</strong> tell one browser from another
          within a day.
        </li>
        <li>
          <strong>The project ID</strong> means the same person gets a different
          id on every project, so ids cannot be joined across sites.
        </li>
        <li>
          <strong>The salt</strong> is 16 random bytes, replaced every day. The
          same browser on the same network gets a new, unrelated id the next
          day.
        </li>
      </ul>

      <h2>How the salt rotates</h2>
      <p>
        Salts live in a small <Code>salts</Code> table in D1. A scheduled job
        runs at 00:00 UTC every day: it creates a new random salt and, in the
        same batch, deletes every salt except the new one and the one before it.
        So at any moment there are exactly two salts, current and previous.
      </p>
      <p>
        The previous salt exists for one reason: so a visit that crosses
        midnight is not cut in two. For each event, the server computes the
        device id with both salts and looks for a live session under either. If
        it finds one that has been active within the idle window (30 minutes by
        default), the event joins it. Otherwise the current salt’s id wins and a
        new session begins.
      </p>
      <Callout>
        Deleted salts are removed from the table, but D1 keeps 30 days of
        changes for point-in-time recovery. We mention it so “deleted” is not
        read as “unrecoverable”.
      </Callout>

      <h2>From device ids to a visitor count</h2>
      <p>
        Each browser event is stored with a <Code>profile_id</Code>. For an
        anonymous visitor that is the device id. Once you call{' '}
        <Code>identify</Code> with your own <Code>profileId</Code>, it is your
        user id.
      </p>
      <p>
        Each project keeps one HyperLogLog sketch per day of the profile ids
        that started a session. The sketch is a fixed 4 KB: 4,096 registers,
        about 1.6% standard error, the same precision as ClickHouse’s{' '}
        <Code>uniqHLL12</Code>. Visitors for any date range are the daily
        sketches merged. Because visitors are counted from session starts,
        server-side and back-dated events add no visitors.
      </p>

      <h2>What is stored, and what is not</h2>
      <p>
        The IP address is read, used and dropped. During a request it is used
        to:
      </p>
      <ul>
        <li>compute the device id as above</li>
        <li>apply the per-IP rate limit and any IP filters on the project</li>
        <li>
          build the one-second duplicate check, whose key is a SHA-256 hash of
          the project, IP, origin and request body, kept in the Cache API for
          one second
        </li>
        <li>
          locate server-side events that pass the visitor’s address as{' '}
          <Code>__ip</Code>.
        </li>
      </ul>
      <p>
        The stored event has no IP field, and <Code>__ip</Code> is removed from
        the event’s properties before it is saved. The raw user agent is not
        stored either; the event keeps the parsed browser, OS, device, brand and
        model.
      </p>
      <p>What an event does keep:</p>
      <ul>
        <li>the hashed device id, a session id and the profile id</li>
        <li>the page path, origin and referrer</li>
        <li>
          country, region, city and coordinates as Cloudflare’s{' '}
          <Code>request.cf</Code> reports them for the request, or from DB-IP
          for server events that pass <Code>__ip</Code>
        </li>
        <li>the parsed browser, OS and device</li>
        <li>the event name and any properties you send.</li>
      </ul>

      <h2>How long it is kept</h2>
      <ul>
        <li>
          Raw events stay in the project’s Durable Object for 90 days by
          default, then live on in the R2 archive, which keeps everything.
        </li>
        <li>
          AI prompt and response text and session replays are kept 30 days.
          Replay is off unless you turn it on in the web SDK, and inputs and
          text are masked by default.
        </li>
        <li>Recent bot hits are kept 30 days.</li>
      </ul>
      <p>
        If you self-host, all of this sits in your own Cloudflare account and
        the event retention is yours to set.
      </p>

      <h2>Where the method falls short</h2>
      <p>A salted hash is not a cookie, and the numbers behave differently:</p>
      <ul>
        <li>
          <strong>Shared networks.</strong> Two people behind the same IP
          address with an identical user agent get the same device id and count
          as one visitor.
        </li>
        <li>
          <strong>Changing networks.</strong> A phone moving from Wi-Fi to
          mobile data gets a new IP, so a new device id, and is counted again.
        </li>
        <li>
          <strong>Multi-day ranges.</strong> An anonymous visitor who comes back
          on another day has a different device id, so a weekly or monthly
          visitor count includes them once per day they visited. Identified
          users keep their profile id and are counted once.
        </li>
        <li>
          <strong>Estimates.</strong> Unique counts come from HyperLogLog, so
          they carry about 1.6% standard error.
        </li>
      </ul>
      <p>
        For signed-in users, call <Code>identify</Code>. A server SDK can also
        pass its own device id, sent as <Code>__deviceId</Code>. That id is used
        as is and does not rotate with the salt, so only send one if you are
        comfortable keeping a stable identifier.
      </p>

      <h2>Consent is still your call</h2>
      <p>
        We are not going to tell you that no-cookie analytics means you never
        need a consent banner; that depends on where you operate and what you
        track. If you want to wait for consent, set <Code>disabled: true</Code>{' '}
        and FlarePanel queues events until you call <Code>op.ready()</Code>.
      </p>

      <h2>Read next</h2>
      <p>
        See <A href="https://docs.flarepanel.dev/faq">the FAQ</A> for the short
        version,{' '}
        <A href="/blog/how-flarepanel-runs-on-cloudflare">
          How FlarePanel runs on Cloudflare
        </A>{' '}
        for where each piece lives, and{' '}
        <A href="https://docs.flarepanel.dev/tracking/identify">
          Identify users
        </A>{' '}
        for tying events to accounts. To see the counts on your own site,{' '}
        <A href="https://dashboard.flarepanel.dev/onboarding">
          create a project
        </A>
        . Early access is free.
      </p>
    </>
  );
}

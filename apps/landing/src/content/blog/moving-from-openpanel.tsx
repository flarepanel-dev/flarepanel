import { A, Callout, Code, Pre } from '@/components/blog/prose';
import type { PostMeta } from '@/lib/blog';

export const meta: PostMeta = {
  slug: 'moving-from-openpanel',
  title: 'Moving from OpenPanel to FlarePanel',
  description:
    'FlarePanel speaks the OpenPanel tracking protocol, so switching is mostly a new client ID and API URL. Here is how to switch the SDK, the script tag and server tracking, and what to check afterwards.',
  date: '2026-11-24',
  author: 'FlarePanel team',
  tags: ['Guides'],
};

export default function Post() {
  return (
    <>
      <p>
        FlarePanel started as a fork of OpenPanel and keeps its tracking
        protocol. The OpenPanel SDKs you already ship work with FlarePanel
        unchanged: you give them a FlarePanel client ID and point them at
        FlarePanel’s API. This guide walks through each kind of install and the
        few things worth checking afterwards.
      </p>
      <Callout>
        FlarePanel is an independent project. It is not affiliated with,
        sponsored or endorsed by OpenPanel. We use the name only to describe
        where FlarePanel comes from and what it is compatible with.
      </Callout>

      <h2>1. Create a project</h2>
      <p>
        Sign up at{' '}
        <A href="https://dashboard.flarepanel.dev/onboarding">
          dashboard.flarepanel.dev
        </A>
        , name your project and pick its type: website, app or backend. The
        dashboard shows your <strong>client ID</strong> and, once, a{' '}
        <strong>client secret</strong>. Save the secret now if you track from a
        server; browsers only need the client ID.
      </p>

      <h2>2. Change the client ID and API URL</h2>
      <p>
        That is the whole change for most installs. With the{' '}
        <Code>@openpanel/web</Code> SDK:
      </p>
      <Pre lang="ts">{`import { OpenPanel } from '@openpanel/web';

export const op = new OpenPanel({
  clientId: 'YOUR_FLAREPANEL_CLIENT_ID',
  apiUrl: 'https://api.flarepanel.dev',
  trackScreenViews: true,
});`}</Pre>
      <p>
        With <Code>@openpanel/nextjs</Code>, also point <Code>scriptUrl</Code>{' '}
        at FlarePanel’s copy of the script:
      </p>
      <Pre lang="tsx">{`import { OpenPanelComponent } from '@openpanel/nextjs';

<OpenPanelComponent
  clientId="YOUR_FLAREPANEL_CLIENT_ID"
  apiUrl="https://api.flarepanel.dev"
  scriptUrl="https://flarepanel.dev/op1.js"
  trackScreenViews={true}
/>`}</Pre>

      <h3>The script tag</h3>
      <p>
        Keep the <Code>window.op</Code> stub as it is, change the client ID, and
        load <Code>op1.js</Code> from flarepanel.dev. FlarePanel’s{' '}
        <Code>op1.js</Code> sends to <Code>https://api.flarepanel.dev</Code> by
        default, so the script tag needs no <Code>apiUrl</Code>.
      </p>
      <Pre lang="html">{`<script>
  /* ...the same window.op stub... */
  window.op('init', { clientId: 'YOUR_FLAREPANEL_CLIENT_ID' });
</script>
<script src="https://flarepanel.dev/op1.js" defer async></script>`}</Pre>

      <h3>Server-side tracking</h3>
      <p>
        Server SDKs send the same headers as before,{' '}
        <Code>openpanel-client-id</Code> and{' '}
        <Code>openpanel-client-secret</Code>. Swap in your FlarePanel client ID
        and secret and set the API URL. If you call the HTTP API directly, the
        endpoint is <Code>POST https://api.flarepanel.dev/track</Code> with the
        same body shape.
      </p>

      <h3>Self-hosting</h3>
      <p>
        If you run FlarePanel on your own Cloudflare account, use your own API
        domain as <Code>apiUrl</Code> everywhere above instead of{' '}
        <Code>api.flarepanel.dev</Code>.
      </p>

      <h2>3. Optional: switch to the FlarePanel packages</h2>
      <p>
        You do not have to change packages, but FlarePanel publishes its own on
        npm: <Code>@flarepanel/web</Code>, <Code>@flarepanel/nextjs</Code>,{' '}
        <Code>@flarepanel/sdk</Code> and the rest. They have the same API,
        export both the <Code>OpenPanel</Code> and <Code>FlarePanel</Code>{' '}
        names, and send to <Code>https://api.flarepanel.dev</Code> without an{' '}
        <Code>apiUrl</Code>. The SDKs are MIT licensed.
      </p>
      <Pre lang="ts">{`// before
import { OpenPanel } from '@openpanel/web';

// after: same class, a FlarePanel name is also exported
import { FlarePanel } from '@flarepanel/web';

export const op = new FlarePanel({
  clientId: 'YOUR_FLAREPANEL_CLIENT_ID',
  trackScreenViews: true,
});`}</Pre>
      <p>
        In Next.js, <Code>@flarepanel/nextjs</Code> exports{' '}
        <Code>FlarePanelComponent</Code> and <Code>useFlarePanel</Code>{' '}
        alongside the OpenPanel names, and loads{' '}
        <Code>https://flarepanel.dev/op1.js</Code> by default.
      </p>

      <h2>What carries over</h2>
      <ul>
        <li>
          <Code>track</Code>, <Code>identify</Code>, <Code>increment</Code>,{' '}
          <Code>decrement</Code> and <Code>revenue</Code>: same calls and
          payloads.
        </li>
        <li>
          Screen views, outgoing links and <Code>data-track</Code> attributes:
          same options.
        </li>
        <li>Server SDKs with a client secret: same headers.</li>
      </ul>

      <h2>What does not carry over</h2>
      <p>
        Your existing OpenPanel data is not imported. FlarePanel starts counting
        from the first event it receives, and your OpenPanel history stays where
        it is. If you have history in Umami, Mixpanel or Amplitude, FlarePanel
        can import it under a project’s <strong>Settings → Imports</strong>.
      </p>

      <h2>What to check after switching</h2>
      <ol>
        <li>
          <strong>The first event.</strong> Keep the onboarding page open and
          load your site. The dashboard confirms the first event within a couple
          of seconds, then the event list, live visitors and the overview fill
          in.
        </li>
        <li>
          <strong>Your domains.</strong> Browser requests are accepted without a
          client secret only when their <Code>Origin</Code> matches one of the
          project’s domains. If events from your site are refused, check that
          its domain is listed on the project.
        </li>
        <li>
          <strong>Revenue.</strong> Revenue sent from the browser without a
          client secret is refused unless the project allows it. We recommend
          sending revenue from your server once the payment succeeds.
        </li>
        <li>
          <strong>Server secrets.</strong> Replace the OpenPanel client secret
          in every server environment. Keep it out of browser and app code.
        </li>
        <li>
          <strong>Batch senders.</strong> Tracking is limited to 600 requests
          per minute per IP address, and identical request bodies within one
          second count once. A backend that sends a lot from one address should
          stay under that.
        </li>
        <li>
          <strong>Feature coverage.</strong> FlarePanel is in early access.
          Check{' '}
          <A href="https://docs.flarepanel.dev/getting-started/status">
            What works today
          </A>{' '}
          for the reports and integrations you rely on.
        </li>
      </ol>

      <h2>Why switch</h2>
      <p>
        FlarePanel runs entirely on Cloudflare: Workers, Durable Objects, D1, R2
        and Queues, with no servers or databases to run. You can use the hosted
        service, which is free while billing is set up, or deploy the same
        AGPL-3.0 code to your own Cloudflare account. The{' '}
        <A href="/blog/how-flarepanel-runs-on-cloudflare">architecture post</A>{' '}
        has the details.
      </p>

      <h2>Try it</h2>
      <p>
        <A href="https://dashboard.flarepanel.dev/onboarding">
          Create a project
        </A>
        , change the client ID and URL in a staging build first, and watch the
        first event arrive. The reference for every option is in{' '}
        <A href="https://docs.flarepanel.dev/getting-started/openpanel">
          Coming from OpenPanel
        </A>{' '}
        and{' '}
        <A href="https://docs.flarepanel.dev/tracking/options">SDK options</A>.
      </p>
    </>
  );
}

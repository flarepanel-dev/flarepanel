import { defineConfig } from 'vocs/config';

const GITHUB = 'https://github.com/flarepanel-dev/flarepanel';
/**
 * The docs report to the website's FlarePanel project (public client ID).
 * Vocs prints head scripts twice and puts external scripts before inline
 * ones, so one inline script queues, inits once and then loads op1.js.
 */
const ANALYTICS_CLIENT_ID = 'e0a1d852-11f9-4851-9e16-f2d3783da6fe';
const ANALYTICS_SNIPPET = `window.op=window.op||function(){var n=[];return new Proxy(function(){arguments.length&&n.push([].slice.call(arguments))},{get:function(t,r){return"q"===r?n:"call"===r||"apply"===r||"bind"===r?t[r]:function(){n.push([r].concat([].slice.call(arguments)))}},has:function(t,r){return"q"===r}})}();
if(!window.__fpInit){window.__fpInit=1;window.op('init',{clientId:'${ANALYTICS_CLIENT_ID}',trackScreenViews:true,trackOutgoingLinks:true,trackAttributes:true});var s=document.createElement('script');s.src='https://flarepanel.dev/op1.js';s.async=true;document.head.appendChild(s);}`;

export default defineConfig({
  title: 'FlarePanel',
  titleTemplate: '%s · FlarePanel docs',
  description:
    'Open-source web and product analytics that runs entirely on Cloudflare. Install the SDK, track events and run it on your own Cloudflare account.',
  baseUrl: 'https://docs.flarepanel.dev',
  // Plain HTML, JS and CSS: served by a static-assets Worker, no server.
  renderStrategy: 'full-static',
  ogImageUrl: 'https://docs.flarepanel.dev/og.png',
  colorScheme: 'dark',
  accentColor: '#FF6A4D',
  logoUrl: '/wordmark-dark.svg',
  iconUrl: '/icon.svg',
  editLink: {
    link: `${GITHUB}/edit/main/apps/docs/src/pages/:path`,
    text: 'Edit this page on GitHub',
  },
  head: {
    script: [{ innerHTML: ANALYTICS_SNIPPET }],
  },
  socials: [
    { icon: 'github', link: GITHUB },
    { icon: 'x', link: 'https://x.com/FlarePanel' },
  ],
  topNav: [
    { text: 'Docs', link: '/getting-started/quickstart', match: '/' },
    { text: 'Website', link: 'https://flarepanel.dev', external: true },
    {
      text: 'Dashboard',
      link: 'https://dashboard.flarepanel.dev',
      external: true,
    },
  ],
  sidebar: [
    { text: 'Introduction', link: '/' },
    {
      text: 'Getting started',
      items: [
        { text: 'Quickstart', link: '/getting-started/quickstart' },
        {
          text: 'Coming from OpenPanel',
          link: '/getting-started/openpanel',
        },
        { text: 'What works today', link: '/getting-started/status' },
      ],
    },
    {
      text: 'Install',
      items: [
        { text: 'Script tag', link: '/sdks/script-tag' },
        { text: 'JavaScript and React', link: '/sdks/web' },
        { text: 'Next.js', link: '/sdks/nextjs' },
        { text: 'Astro', link: '/sdks/astro' },
        { text: 'Nuxt', link: '/sdks/nuxt' },
        { text: 'SvelteKit', link: '/sdks/sveltekit' },
        { text: 'React Router and Remix', link: '/sdks/react-router' },
        { text: 'Server and backend', link: '/sdks/server' },
        { text: 'HTTP API', link: '/sdks/http-api' },
      ],
    },
    {
      text: 'Tracking',
      items: [
        { text: 'Events and properties', link: '/tracking/events' },
        { text: 'Identify users', link: '/tracking/identify' },
        { text: 'Revenue', link: '/tracking/revenue' },
        { text: 'AI crawlers and bots', link: '/tracking/ai-crawlers' },
        { text: 'AI answers', link: '/tracking/ai-answers' },
        { text: 'SDK options', link: '/tracking/options' },
      ],
    },
    {
      text: 'Features',
      items: [
        { text: 'AI and your own key', link: '/features/ai-keys' },
        { text: 'MCP server', link: '/features/mcp' },
        { text: 'Public widgets', link: '/features/widgets' },
      ],
    },
    {
      text: 'Self-hosting',
      items: [
        { text: 'Overview', link: '/self-hosting' },
        { text: 'Deploy to Cloudflare', link: '/self-hosting/deploy' },
        { text: 'Deploy to your own server', link: '/self-hosting/server' },
        { text: 'Architecture', link: '/self-hosting/architecture' },
        { text: 'Operations and recovery', link: '/self-hosting/operations' },
        {
          text: 'Advanced analytics',
          link: '/self-hosting/advanced-analytics',
        },
      ],
    },
    { text: 'FAQ', link: '/faq' },
    { text: 'Security', link: '/security' },
    { text: 'Status page', link: '/status' },
  ],
});

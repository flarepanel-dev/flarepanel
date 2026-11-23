import { defineConfig } from 'vocs/config';

const GITHUB = 'https://github.com/flarepanel-dev/flarepanel';

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
  accentColor: '#FF496B',
  logoUrl: '/wordmark-dark.svg',
  iconUrl: '/icon.svg',
  editLink: {
    link: `${GITHUB}/edit/main/apps/docs/src/pages/:path`,
    text: 'Edit this page on GitHub',
  },
  socials: [{ icon: 'github', link: GITHUB }],
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
        { text: 'SDK options', link: '/tracking/options' },
      ],
    },
    {
      text: 'Self-hosting',
      items: [
        { text: 'Overview', link: '/self-hosting' },
        { text: 'Deploy to Cloudflare', link: '/self-hosting/deploy' },
        { text: 'Architecture', link: '/self-hosting/architecture' },
        { text: 'Operations and recovery', link: '/self-hosting/operations' },
        {
          text: 'Advanced analytics',
          link: '/self-hosting/advanced-analytics',
        },
      ],
    },
    { text: 'FAQ', link: '/faq' },
  ],
});

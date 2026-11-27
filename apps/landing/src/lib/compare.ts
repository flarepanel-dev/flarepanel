// Comparison facts. Competitor facts come from each company's own pages,
// checked on the date in `checked`, with the page in `source`. A fact we could
// not confirm on an official page is left out (shown as "Not confirmed").
// Re-check before relying on prices: they change.

import { site } from './site';

export interface Fact {
  value: string | boolean;
  note?: string;
  source?: string;
}

export const COMPARE_ROWS = [
  { key: 'price', label: 'Cheapest paid plan' },
  { key: 'free', label: 'Free plan' },
  { key: 'cookies', label: 'Cookies' },
  { key: 'license', label: 'Open source' },
  { key: 'selfHost', label: 'Self-hosting' },
  { key: 'hosting', label: 'Where cloud data lives' },
  { key: 'funnels', label: 'Funnels' },
  { key: 'retention', label: 'Retention and cohorts' },
  { key: 'replay', label: 'Session replay' },
  { key: 'revenue', label: 'Revenue tracking' },
  { key: 'ai', label: 'AI assistant' },
  { key: 'mcp', label: 'MCP server' },
  { key: 'gsc', label: 'Google Search Console' },
] as const;

export type RowKey = (typeof COMPARE_ROWS)[number]['key'];

export interface Comparison {
  slug: string;
  name: string;
  summary: string;
  checked: string;
  facts: Partial<Record<RowKey, Fact>>;
  chooseUs: string[];
  chooseThem: string[];
}

/** FlarePanel's own facts, from our pricing page and docs. */
export const FLAREPANEL: Record<RowKey, Fact> = {
  price: {
    value: '$1 a month',
    note: '5,000 events; every feature on every plan',
  },
  free: {
    value: false,
    note: '30-day trial with 100K events, no card',
  },
  cookies: { value: 'None', note: 'No cookies or persistent visitor ids' },
  license: { value: 'AGPL-3.0', note: 'SDKs MIT' },
  selfHost: {
    value: 'Yes, every feature',
    note: 'On your own Cloudflare account, no servers to run',
  },
  hosting: {
    value: "Cloudflare's global network",
    note: 'No EU-only option yet',
  },
  funnels: { value: true },
  retention: { value: true },
  replay: { value: true, note: 'On every plan, with a monthly cap' },
  revenue: { value: true },
  ai: { value: true, note: 'Runs on your own OpenAI or Anthropic key' },
  mcp: { value: true },
  gsc: { value: 'Yes', note: 'Self-hosted today; Cloud coming soon' },
};

const CHECKED = '26 November 2026';

export const COMPARISONS: Comparison[] = [
  {
    slug: 'posthog',
    name: 'PostHog',
    summary:
      'PostHog is a broad product platform with a large free tier and US or EU hosting. FlarePanel is focused analytics that sets no cookies, costs from $1 a month, and self-hosts with every feature on Cloudflare.',
    checked: CHECKED,
    facts: {
      price: {
        value: '$0 base, pay per event',
        note: 'From $0.00005 per event after the first 1M',
        source: 'https://posthog.com/pricing.md',
      },
      free: {
        value: true,
        note: '1M events and 5K recordings a month, 1 project, 1 year retention',
        source: 'https://posthog.com/pricing',
      },
      cookies: {
        value: 'Yes, by default',
        note: 'A 365-day cookie; cookieless mode is opt-in',
        source: 'https://posthog.com/docs/libraries/js/persistence',
      },
      license: {
        value: 'MIT',
        note: 'Except the ee/ directory',
        source:
          'https://raw.githubusercontent.com/PostHog/posthog/master/LICENSE',
      },
      selfHost: {
        value: 'Yes, limited',
        note: 'Paid-plan features are Cloud-only; self-hosting is unsupported',
        source: 'https://posthog.com/docs/self-host',
      },
      hosting: {
        value: 'US (Virginia) or EU (Frankfurt)',
        source: 'https://posthog.com/pricing',
      },
      funnels: { value: true, source: 'https://posthog.com/pricing.md' },
      retention: {
        value: true,
        source: 'https://posthog.com/docs/data/cohorts',
      },
      replay: {
        value: true,
        source: 'https://posthog.com/docs/session-replay',
      },
      revenue: {
        value: true,
        source: 'https://posthog.com/docs/revenue-analytics/start-here',
      },
      ai: {
        value: true,
        note: 'PostHog AI, with free credits',
        source: 'https://posthog.com/docs/posthog-ai',
      },
      mcp: {
        value: true,
        source: 'https://posthog.com/docs/model-context-protocol',
      },
      gsc: {
        value: true,
        note: 'As a data warehouse source',
        source:
          'https://posthog.com/docs/data-pipelines/sources/google-search-console',
      },
    },
    chooseUs: [
      'You want analytics without cookies, without configuring a special mode.',
      'You want to self-host with every feature, on Cloudflare instead of a Docker server you maintain.',
      'You prefer a fixed monthly price for an event volume over per-event billing.',
    ],
    chooseThem: [
      'You need an EU (Frankfurt) data region today.',
      'You want a large free tier: 1M events a month.',
      'You want a built-in AI analyst without bringing your own AI key.',
    ],
  },
  {
    slug: 'plausible',
    name: 'Plausible',
    summary:
      'Plausible is simple, cookieless website analytics hosted only in the EU. FlarePanel is also cookieless, adds product analytics on every plan, and starts at $1 a month.',
    checked: CHECKED,
    facts: {
      price: {
        value: '$9 a month',
        note: 'Starter, 10k pageviews; shown in € in some regions',
        source: 'https://plausible.io/#pricing',
      },
      free: {
        value: false,
        note: '30-day trial, no card',
        source: 'https://plausible.io/#pricing',
      },
      cookies: {
        value: 'None',
        note: 'No cookies or persistent identifiers',
        source: 'https://plausible.io/data-policy',
      },
      license: {
        value: 'AGPL-3.0',
        note: 'Community Edition',
        source:
          'https://raw.githubusercontent.com/plausible/analytics/master/LICENSE.md',
      },
      selfHost: {
        value: 'Yes, limited',
        note: 'Community Edition has no funnels, revenue goals or SSO',
        source: 'https://plausible.io/self-hosted-web-analytics',
      },
      hosting: {
        value: 'EU only',
        note: 'On European-owned infrastructure',
        source: 'https://plausible.io/data-policy',
      },
      funnels: {
        value: true,
        note: 'Business plan',
        source: 'https://plausible.io/#pricing',
      },
      revenue: {
        value: true,
        note: 'Business plan',
        source: 'https://plausible.io/docs/ecommerce-revenue-tracking',
      },
      mcp: {
        value: true,
        note: 'All plans',
        source: 'https://plausible.io/docs/mcp',
      },
      gsc: {
        value: true,
        source: 'https://plausible.io/docs/google-search-console-integration',
      },
    },
    chooseUs: [
      'You want funnels, revenue and session replay on every plan, not only the top one.',
      'You want product analytics too: profiles, retention and cohorts.',
      'You self-host and need funnels and revenue (the Community Edition leaves them out).',
    ],
    chooseThem: [
      'Your data must be stored only in the EU, on European-owned infrastructure.',
      'You want a provider incorporated in the EU.',
    ],
  },
  {
    slug: 'google-analytics',
    name: 'Google Analytics',
    summary:
      'Google Analytics 4 is free and deeply tied to Google’s ecosystem, but it sets cookies and keeps detailed data for up to 14 months on the free version. FlarePanel sets no cookies and keeps your raw data for as long as your project exists.',
    checked: CHECKED,
    facts: {
      price: {
        value: 'Free',
        note: 'Analytics 360 is a separate contract',
        source: 'https://marketingplatform.google.com/about/analytics/',
      },
      free: {
        value: true,
        note: 'Data retention up to 14 months',
        source: 'https://support.google.com/analytics/answer/11202874?hl=en',
      },
      cookies: {
        value: 'Yes',
        note: '_ga cookies, 2 years; Google requires consent where the law does',
        source: 'https://support.google.com/analytics/answer/11397207?hl=en',
      },
      license: {
        value: 'No public source code found',
      },
      selfHost: {
        value: 'No self-hosted edition found',
      },
      funnels: {
        value: true,
        source: 'https://support.google.com/analytics/answer/9327974?hl=en',
      },
      retention: {
        value: true,
        source: 'https://support.google.com/analytics/answer/9670133?hl=en',
      },
      revenue: {
        value: true,
        note: 'Ecommerce events',
        source:
          'https://developers.google.com/analytics/devguides/collection/ga4/ecommerce',
      },
      ai: {
        value: true,
        note: 'Ask Advisor (beta, English only)',
        source: 'https://support.google.com/analytics/answer/16675569?hl=en',
      },
      mcp: {
        value: true,
        note: 'Official server you run yourself',
        source: 'https://developers.google.com/analytics/devguides/MCP',
      },
      gsc: {
        value: true,
        source: 'https://support.google.com/analytics/answer/10737381?hl=en',
      },
    },
    chooseUs: [
      'You want analytics without cookies.',
      'You want the code open and the option to run it in your own Cloudflare account.',
      'You want reports further back than the 14 months the free version keeps.',
    ],
    chooseThem: [
      'You need it free at any volume.',
      'You already work in Google’s tools, such as Search Console and BigQuery export.',
    ],
  },
  {
    slug: 'umami',
    name: 'Umami',
    summary:
      'Umami is open-source, cookieless analytics with a free hobby plan and US or EU hosting. FlarePanel adds session replay and an AI assistant on every plan and self-hosts on Cloudflare with no servers to run.',
    checked: CHECKED,
    facts: {
      price: {
        value: '$20 a month',
        note: 'Pro: 1M events, then $0.00003 per event',
        source: 'https://umami.is/pricing',
      },
      free: {
        value: true,
        note: '100K events a month, 1 website, 6 months retention',
        source: 'https://umami.is/pricing',
      },
      cookies: {
        value: 'None',
        source: 'https://umami.is/pricing',
      },
      license: {
        value: 'MIT',
        source:
          'https://raw.githubusercontent.com/umami-software/umami/master/LICENSE',
      },
      selfHost: {
        value: 'Yes',
        note: 'Search Console and email reports are Cloud-only',
        source: 'https://umami.is/integrations',
      },
      hosting: {
        value: 'US or EU, you choose',
        source: 'https://umami.is/docs/cloud/sign-up',
      },
      funnels: { value: true, source: 'https://umami.is/pricing' },
      retention: { value: true, source: 'https://umami.is/docs/cloud' },
      replay: {
        value: true,
        note: 'Business plan and up',
        source: 'https://umami.is/pricing',
      },
      revenue: { value: true, source: 'https://umami.is/pricing' },
      mcp: {
        value: true,
        note: 'Pro and up',
        source: 'https://umami.is/mcp',
      },
      gsc: {
        value: true,
        note: 'Pro or Business',
        source: 'https://umami.is/docs/cloud/google-search-console',
      },
    },
    chooseUs: [
      'You want session replay on every plan, not only Business.',
      'You want an AI assistant that answers questions about your data, on your own key.',
      'You self-host and would rather not run a server and database: FlarePanel runs on Cloudflare Workers.',
    ],
    chooseThem: [
      'You want a free plan for a small site (100K events a month).',
      'You need to choose a US or EU data region.',
    ],
  },
  {
    slug: 'mixpanel',
    name: 'Mixpanel',
    summary:
      'Mixpanel is a mature product analytics platform with a big free plan and US, EU or India data residency. FlarePanel is open source, sets no cookies by default, and tracks revenue without a data warehouse.',
    checked: CHECKED,
    facts: {
      price: {
        value: '$0 base, pay per event',
        note: 'e.g. $140 a month at 1.5M events ($100 billed yearly)',
        source: 'https://mixpanel.com/pricing/',
      },
      free: {
        value: true,
        note: '1M events and 10K replays a month',
        source: 'https://mixpanel.com/pricing/',
      },
      cookies: {
        value: 'Yes, by default',
        note: 'A 365-day cookie; can be turned off',
        source:
          'https://raw.githubusercontent.com/mixpanel/mixpanel-js/master/src/mixpanel-core.js',
      },
      license: {
        value: 'SDK only (Apache 2.0)',
        note: 'No public platform source found',
        source:
          'https://raw.githubusercontent.com/mixpanel/mixpanel-js/master/LICENSE',
      },
      hosting: {
        value: 'US, EU or India',
        note: 'Chosen when the project is created',
        source: 'https://mixpanel.com/pricing/',
      },
      funnels: { value: true, source: 'https://mixpanel.com/pricing/' },
      retention: {
        value: true,
        note: 'Saved cohorts from the Growth plan',
        source: 'https://mixpanel.com/pricing/',
      },
      replay: { value: true, source: 'https://mixpanel.com/pricing/' },
      revenue: {
        value: true,
        note: 'Needs warehouse connectors, not on Free',
        source: 'https://docs.mixpanel.com/docs/features/revenue-analytics',
      },
      ai: {
        value: true,
        note: 'Mixpanel Agent',
        source: 'https://docs.mixpanel.com/docs/mixpanel-agent',
      },
      mcp: { value: true, source: 'https://docs.mixpanel.com/docs/mcp' },
    },
    chooseUs: [
      'You want the platform open source, with the option to self-host it.',
      'You want analytics without cookies by default.',
      'You want revenue tracking without setting up a data warehouse.',
    ],
    chooseThem: [
      'You want a large free plan: 1M events and 10K replays a month.',
      'You need data residency in the US, EU or India.',
      'You want a built-in AI analyst without bringing your own AI key.',
    ],
  },
];

export const compareUrl = (slug: string) => `${site.url}/compare/${slug}`;

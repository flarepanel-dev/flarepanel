export const site = {
  name: 'FlarePanel',
  url: 'https://flarepanel.dev',
  github: 'https://github.com/flarepanel-dev/flarepanel',
  docs: 'https://docs.flarepanel.dev',
  issues: 'https://github.com/flarepanel-dev/flarepanel/issues',
  license: 'https://github.com/flarepanel-dev/flarepanel/blob/main/LICENSE.md',
  signUp: 'https://dashboard.flarepanel.dev/onboarding',
  signIn: 'https://dashboard.flarepanel.dev/login',
  api: 'https://api.flarepanel.dev',
  openpanel: 'https://github.com/Openpanel-dev/openpanel',
  x: 'https://x.com/FlarePanel',
  /** This site's own FlarePanel project (public client ID; see the privacy draft). */
  analyticsClientId: 'e0a1d852-11f9-4851-9e16-f2d3783da6fe',
  /** Public widget links of that project (dashboard → Settings → Widgets). */
  widgets: {
    realtime:
      'https://dashboard.flarepanel.dev/widget/realtime?shareId=eAJS2A&theme=dark',
    traffic:
      'https://dashboard.flarepanel.dev/widget/traffic?shareId=8wIAWF&theme=dark',
    counter:
      'https://dashboard.flarepanel.dev/widget/counter?shareId=2rD9XN&theme=dark',
  },
  description:
    'Open-source web and product analytics that runs entirely on Cloudflare. Realtime dashboards, session replay, funnels and an AI analyst, with no servers to run.',
} as const;

export const nav = [
  { label: 'Product', href: '/#product' },
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Docs', href: site.docs },
  { label: 'FAQ', href: '/#faq' },
] as const;

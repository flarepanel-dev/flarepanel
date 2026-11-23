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
  description:
    'Open-source web and product analytics that runs entirely on Cloudflare. No servers to run, and the OpenPanel SDKs you already ship keep working.',
} as const;

export const nav = [
  { label: 'Product', href: '#product' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Docs', href: site.docs },
  { label: 'FAQ', href: '#faq' },
] as const;

import { Container, EarlyAccessButton, GitHubButton, Logo } from './ui';
import { site } from '@/lib/site';

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#product' },
      { label: 'How it works', href: '#how-it-works' },
      { label: 'Hosted or self-hosted', href: '#run' },
      { label: 'FAQ', href: '#faq' },
    ],
  },
  {
    title: 'Developers',
    links: [
      { label: 'Docs', href: site.docs },
      { label: 'Install the SDK', href: '#get-started' },
      { label: 'Source code', href: site.github },
      { label: 'Report an issue', href: site.issues },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Sign in', href: site.signIn },
      { label: 'Get early access', href: site.signUp },
    ],
  },
] as const;

export function ClosingCta() {
  return (
    <section aria-labelledby="cta-title" className="border-rule border-t">
      <Container className="grid gap-8 py-24 sm:py-28 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <h2
            className="display max-w-[18ch] text-[40px] sm:text-[56px] lg:text-[68px]"
            id="cta-title"
          >
            Analytics that lives where your app already does.
          </h2>
          <p className="mt-5 max-w-[56ch] text-[16px] text-muted leading-[1.6]">
            FlarePanel is built in the open. Star the repository to follow
            along, or join early access and try the hosted dashboard.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <GitHubButton />
          <EarlyAccessButton />
        </div>
      </Container>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-rule border-t">
      <Container className="grid gap-12 py-14 md:grid-cols-[minmax(0,1fr)_repeat(3,170px)]">
        <div>
          <Logo />
          <p className="mt-4 max-w-[38ch] text-[14px] text-faint leading-[1.6]">
            Open-source web and product analytics on Cloudflare. An independent
            fork of OpenPanel, not affiliated with OpenPanel or Cloudflare.
          </p>
        </div>
        {COLUMNS.map((column) => (
          <nav aria-label={column.title} key={column.title}>
            <h2 className="font-medium text-[13px] text-soft">
              {column.title}
            </h2>
            <ul className="mt-4 grid gap-2.5 text-[14px]">
              {column.links.map((link) => (
                <li key={link.label}>
                  <a
                    className="text-muted transition-colors hover:text-paper"
                    href={link.href}
                    rel={link.href.startsWith('http') ? 'noopener' : undefined}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>
      <Container className="flex flex-wrap justify-between gap-3 border-rule border-t py-6 text-[13px] text-faint">
        <span>© 2026 FlarePanel contributors · AGPL-3.0</span>
        <span>Served from Cloudflare Workers</span>
        <p className="w-full text-[12px] text-faint/80">
          Cloudflare, the Cloudflare logo, Cloudflare Workers, Durable Objects,
          R2, D1 and Queues, and their product icons are trademarks and/or
          registered trademarks of Cloudflare, Inc. in the United States and
          other jurisdictions. FlarePanel is not affiliated with or endorsed by
          Cloudflare.
        </p>
      </Container>
    </footer>
  );
}

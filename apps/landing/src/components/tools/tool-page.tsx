// Shared frame for the free tools on flarepanel.dev/tools.

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Footer } from '@/components/footer';
import { Nav } from '@/components/nav';
import { Container } from '@/components/ui';
import { site } from '@/lib/site';

/** The public API the tools call; a local build can point elsewhere. */
export const TOOLS_API =
  process.env.NEXT_PUBLIC_FLAREPANEL_API ?? 'https://api.flarepanel.dev';

export const TOOLS = [
  {
    href: '/tools/url-checker',
    name: 'URL checker',
    body: 'Status, speed, redirects, SEO tags, social previews and security headers of any public page.',
  },
  {
    href: '/tools/ip-lookup',
    name: 'IP lookup',
    body: 'Country, region and city of an IP address, or of your own connection.',
  },
] as const;

export function ToolPage({
  title,
  lede,
  path,
  children,
}: {
  title: string;
  lede: string;
  path: string;
  children: ReactNode;
}) {
  const others = TOOLS.filter((tool) => tool.href !== path);
  return (
    <>
      <Nav />
      <main className="border-rule border-t" id="main">
        <Container className="py-16 sm:py-20">
          <Link
            className="text-[14px] text-muted transition-colors hover:text-paper"
            href="/tools"
          >
            Free tools
          </Link>
          <h1 className="display mt-3 max-w-[18ch] text-[40px] sm:text-[56px]">
            {title}
          </h1>
          <p className="mt-4 max-w-[60ch] text-[16px] text-muted leading-[1.6] sm:text-[17px]">
            {lede}
          </p>
          <div className="mt-10">{children}</div>
          <div className="mt-20 grid gap-4 border-rule border-t pt-12 md:grid-cols-2">
            {others.map((tool) => (
              <Link
                className="group rounded-2xl border border-rule p-6 transition-colors hover:border-rule-strong hover:bg-panel"
                href={tool.href}
                key={tool.href}
              >
                <div className="font-semibold text-[18px] text-paper">
                  {tool.name}
                </div>
                <p className="mt-1.5 text-[15px] text-muted">{tool.body}</p>
              </Link>
            ))}
            <a
              className="group rounded-2xl border border-chart-indigo/40 bg-panel p-6 transition-colors hover:border-chart-indigo"
              href={site.signUp}
            >
              <div className="flex items-center gap-2 font-semibold text-[18px] text-paper">
                Analytics without cookies
                <ArrowRight
                  aria-hidden
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                />
              </div>
              <p className="mt-1.5 text-[15px] text-muted">
                FlarePanel shows who visits, from where and what they do, with
                one script and no cookie banner. 30 days free.
              </p>
            </a>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}

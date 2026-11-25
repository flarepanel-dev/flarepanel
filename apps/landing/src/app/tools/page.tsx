import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/footer';
import { Nav } from '@/components/nav';
import { TOOLS } from '@/components/tools/tool-page';
import { Container } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Free website tools: FlarePanel',
  description:
    'Free tools from FlarePanel: check any page for status, speed, SEO tags and security headers, or look up where an IP address is.',
  alternates: { canonical: '/tools' },
};

export default function ToolsPage() {
  return (
    <>
      <Nav />
      <main className="border-rule border-t" id="main">
        <Container className="py-16 sm:py-20">
          <h1 className="display max-w-[16ch] text-[44px] sm:text-[60px]">
            Free website tools
          </h1>
          <p className="mt-4 max-w-[56ch] text-[16px] text-muted leading-[1.6] sm:text-[17px]">
            Quick checks we use ourselves. Free, no sign-up, nothing stored.
          </p>
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {TOOLS.map((tool) => (
              <Link
                className="group flex flex-col rounded-2xl border border-rule bg-panel p-7 transition-colors hover:border-rule-strong"
                href={tool.href}
                key={tool.href}
              >
                <h2 className="flex items-center gap-2 font-semibold text-[24px] tracking-[-0.02em]">
                  {tool.name}
                  <ArrowRight
                    aria-hidden
                    className="size-5 text-muted transition-transform group-hover:translate-x-0.5"
                  />
                </h2>
                <p className="mt-2 text-[15.5px] text-muted leading-[1.6]">
                  {tool.body}
                </p>
              </Link>
            ))}
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}

import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/footer';
import { Nav } from '@/components/nav';
import { Container } from '@/components/ui';
import { COMPARISONS } from '@/lib/compare';

export const metadata: Metadata = {
  title: 'Compare FlarePanel with other analytics tools',
  description:
    'Honest, sourced comparisons of FlarePanel with PostHog, Plausible, Google Analytics, Umami and Mixpanel: price, cookies, open source, hosting and features.',
  alternates: { canonical: '/compare' },
};

export default function CompareIndex() {
  return (
    <>
      <Nav />
      <main className="border-rule border-t" id="main">
        <Container className="py-16 sm:py-20">
          <h1 className="display max-w-[18ch] text-[44px] sm:text-[60px]">
            FlarePanel compared
          </h1>
          <p className="mt-4 max-w-[60ch] text-[16px] text-muted leading-[1.6] sm:text-[17px]">
            Side by side with the tools people usually weigh us against. Every
            fact about them links to their own pages, and each comparison says
            when the other tool is the better fit.
          </p>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {COMPARISONS.map((comparison) => (
              <Link
                className="group flex flex-col rounded-2xl border border-rule bg-panel p-7 transition-colors hover:border-rule-strong"
                href={`/compare/${comparison.slug}`}
                key={comparison.slug}
              >
                <h2 className="flex items-center gap-2 font-semibold text-[22px] tracking-[-0.02em]">
                  vs {comparison.name}
                  <ArrowRight
                    aria-hidden
                    className="size-5 text-muted transition-transform group-hover:translate-x-0.5"
                  />
                </h2>
                <p className="mt-2 text-[15px] text-muted leading-[1.6]">
                  {comparison.summary}
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

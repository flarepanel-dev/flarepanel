// One "FlarePanel vs X" page. Every competitor fact carries the official page
// it was read from and the date (lib/compare.ts); a fact we could not confirm
// is shown as "Not confirmed" rather than guessed.

import { ArrowRight, Check, Minus } from 'lucide-react';
import Link from 'next/link';
import { Footer } from '@/components/footer';
import { Nav } from '@/components/nav';
import { Container } from '@/components/ui';
import {
  COMPARE_ROWS,
  COMPARISONS,
  type Comparison,
  type Fact,
  FLAREPANEL,
} from '@/lib/compare';
import { site } from '@/lib/site';

function Cell({ fact }: { fact: Fact | undefined }) {
  if (!fact) {
    return <span className="text-faint">Not confirmed</span>;
  }
  if (fact.value === true || fact.value === false) {
    return (
      <span className="inline-flex items-center gap-2">
        {fact.value ? (
          <Check aria-hidden className="size-4 text-up" strokeWidth={2.5} />
        ) : (
          <Minus aria-hidden className="size-4 text-faint" strokeWidth={2.5} />
        )}
        <span className={fact.value ? 'text-paper' : 'text-faint'}>
          {fact.value ? 'Yes' : 'No'}
        </span>
        {fact.note ? (
          <span className="text-[13px] text-faint">{fact.note}</span>
        ) : null}
      </span>
    );
  }
  return (
    <span className="text-paper">
      {fact.value}
      {fact.note ? (
        <span className="block text-[13px] text-faint">{fact.note}</span>
      ) : null}
    </span>
  );
}

export function ComparePage({ comparison }: { comparison: Comparison }) {
  const sources = [
    ...new Set(
      Object.values(comparison.facts)
        .map((fact) => fact?.source)
        .filter((source): source is string => Boolean(source))
    ),
  ];
  const others = COMPARISONS.filter((c) => c.slug !== comparison.slug);
  return (
    <>
      <Nav />
      <main className="border-rule border-t" id="main">
        <Container className="py-16 sm:py-20">
          <Link
            className="text-[14px] text-muted transition-colors hover:text-paper"
            href="/compare"
          >
            Compare
          </Link>
          <h1 className="display mt-3 max-w-[20ch] text-[40px] sm:text-[56px]">
            FlarePanel vs {comparison.name}
          </h1>
          <p className="mt-4 max-w-[62ch] text-[16px] text-muted leading-[1.6] sm:text-[17px]">
            {comparison.summary}
          </p>

          <div className="mt-12 overflow-x-auto rounded-2xl border border-rule">
            <table className="w-full min-w-[640px] text-left text-[15px]">
              <thead>
                <tr className="border-rule border-b bg-panel">
                  <th className="w-[30%] px-5 py-4 font-medium text-[13px] text-faint uppercase tracking-[0.05em]">
                    <span className="sr-only">Feature</span>
                  </th>
                  <th className="px-5 py-4 font-semibold text-paper">
                    FlarePanel
                  </th>
                  <th className="px-5 py-4 font-semibold text-paper">
                    {comparison.name}
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((row) => (
                  <tr className="border-rule border-t align-top" key={row.key}>
                    <th
                      className="px-5 py-4 font-normal text-muted"
                      scope="row"
                    >
                      {row.label}
                    </th>
                    <td className="px-5 py-4">
                      <Cell fact={FLAREPANEL[row.key]} />
                    </td>
                    <td className="px-5 py-4">
                      <Cell fact={comparison.facts[row.key]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-14 grid gap-10 lg:grid-cols-2">
            <section>
              <h2 className="font-semibold text-[24px] tracking-[-0.02em]">
                Choose FlarePanel if
              </h2>
              <ul className="mt-4 grid gap-3 text-[16px] text-soft leading-[1.6]">
                {comparison.chooseUs.map((point) => (
                  <li className="flex gap-2.5" key={point}>
                    <Check
                      aria-hidden
                      className="mt-1 size-4 shrink-0 text-up"
                      strokeWidth={2.5}
                    />
                    {point}
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h2 className="font-semibold text-[24px] tracking-[-0.02em]">
                Choose {comparison.name} if
              </h2>
              <ul className="mt-4 grid gap-3 text-[16px] text-soft leading-[1.6]">
                {comparison.chooseThem.map((point) => (
                  <li className="flex gap-2.5" key={point}>
                    <ArrowRight
                      aria-hidden
                      className="mt-1 size-4 shrink-0 text-faint"
                    />
                    {point}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="mt-14 flex flex-wrap items-center gap-4 rounded-2xl border border-chart-ember/40 bg-panel p-7">
            <p className="flex-1 text-[16px] text-soft">
              Try FlarePanel free for 30 days, no card needed, and keep{' '}
              {comparison.name} running side by side while you compare.
            </p>
            <a
              className="inline-flex h-11 items-center gap-2 rounded-[9px] bg-paper px-[18px] font-medium text-[15px] text-ink transition-colors hover:bg-paper-hover"
              href={site.signUp}
            >
              Start free
              <ArrowRight aria-hidden className="size-4" />
            </a>
          </div>

          <section className="mt-14 text-[13.5px] text-faint leading-[1.6]">
            <h2 className="font-medium text-[14px] text-muted">Sources</h2>
            <p className="mt-2">
              {comparison.name} facts are from its official pages, checked on{' '}
              {comparison.checked}. Prices and plans change; follow the links
              for the current terms.
            </p>
            <ul className="mt-2 grid gap-1">
              {sources.map((source) => (
                <li key={source}>
                  <a
                    className="break-all underline decoration-rule-strong underline-offset-2 hover:text-muted"
                    href={source}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {source}
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <nav
            aria-label="Other comparisons"
            className="mt-14 flex flex-wrap gap-2 border-rule border-t pt-10"
          >
            {others.map((other) => (
              <Link
                className="rounded-full border border-rule px-4 py-2 text-[14px] text-muted transition-colors hover:border-rule-strong hover:text-paper"
                href={`/compare/${other.slug}`}
                key={other.slug}
              >
                FlarePanel vs {other.name}
              </Link>
            ))}
          </nav>
        </Container>
      </main>
      <Footer />
    </>
  );
}

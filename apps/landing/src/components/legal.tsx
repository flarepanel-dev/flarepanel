// Shared layout for the legal pages (privacy, terms, DPA, subprocessors).
//
// LEGAL_DRAFT stays true until the owner has filled every [bracketed]
// placeholder and had the texts reviewed. While it is true each page shows a
// visible draft notice, so an unreviewed text can never pass for final.

import Link from 'next/link';
import type { ReactNode } from 'react';
import { Footer } from './footer';
import { Nav } from './nav';
import { Container } from './ui';
import { LEGAL_DRAFT, LEGAL_UPDATED } from '@/lib/legal';

/** Company details the owner fills in before publishing. */
export const COMPANY = {
  name: '[Company legal name]',
  address: '[Registered address]',
  registration: '[Company registration number]',
  country: '[Country of incorporation]',
  governingLaw: '[Governing law, e.g. the laws of …]',
  contact: '[Privacy contact email, e.g. privacy@flarepanel.dev]',
} as const;

export const LEGAL_PAGES = [
  { href: '/privacy', label: 'Privacy policy' },
  { href: '/terms', label: 'Terms of service' },
  { href: '/dpa', label: 'Data processing agreement' },
  { href: '/subprocessors', label: 'Subprocessors' },
] as const;

export function LegalPage({
  title,
  intro,
  path,
  children,
}: {
  title: string;
  intro: ReactNode;
  path: string;
  children: ReactNode;
}) {
  return (
    <>
      <Nav />
      <main className="border-rule border-t">
        <Container className="grid gap-12 py-16 sm:py-20 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
          <nav aria-label="Legal" className="lg:sticky lg:top-24 lg:self-start">
            <p className="mb-3 text-[13px] text-faint uppercase tracking-[0.06em]">
              Legal
            </p>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 lg:flex-col">
              {LEGAL_PAGES.map((page) => (
                <li key={page.href}>
                  <Link
                    aria-current={page.href === path ? 'page' : undefined}
                    className={`text-[15px] transition-colors ${
                      page.href === path
                        ? 'text-paper'
                        : 'text-muted hover:text-paper'
                    }`}
                    href={page.href}
                  >
                    {page.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <article className="legal max-w-[72ch]">
            {LEGAL_DRAFT ? (
              <p
                className="mb-8 rounded-xl border border-[#ffb547]/40 bg-[#ffb547]/10 px-4 py-3 text-[14.5px] text-soft"
                role="note"
              >
                <strong className="text-paper">Draft.</strong> This text has not
                been reviewed and its bracketed details are not filled in yet.
                It is not in force.
              </p>
            ) : null}
            <h1 className="display text-[40px] sm:text-[52px]">{title}</h1>
            <p className="mt-3 text-[14px] text-faint">
              Last updated {LEGAL_UPDATED}
            </p>
            <div className="mt-6 text-[17px] text-soft leading-[1.6]">
              {intro}
            </div>
            <div className="legal-body mt-10">{children}</div>
          </article>
        </Container>
      </main>
      <Footer />
    </>
  );
}

// Shared layout for the legal pages (privacy, terms, DPA, subprocessors).
//
// While LEGAL_DRAFT is true each page shows a visible draft notice, so a text
// that is being rewritten can never pass for final.

import Link from 'next/link';
import type { ReactNode } from 'react';
import { Footer } from './footer';
import { Nav } from './nav';
import { Container } from './ui';
import { LEGAL_DRAFT, LEGAL_UPDATED } from '@/lib/legal';

/**
 * Who runs FlarePanel Cloud. There is no company yet: the service is run as
 * an independent project from Germany, and Polar sells the paid plans as
 * merchant of record.
 */
export const COMPANY = {
  name: 'FlarePanel',
  description: 'an independent software project operated from Germany',
  governingLaw: 'the laws of the Federal Republic of Germany',
  country: 'Germany',
  contact: 'hello@flarepanel.dev',
} as const;

/** Polar, the merchant of record for paid plans. */
export const MERCHANT = {
  name: 'Polar Software, Inc.',
  address: '3500 South DuPont Highway, Dover, DE 19901, United States',
  site: 'https://polar.sh',
  buyerTerms: 'https://polar.sh/legal/checkout-buyer-terms',
  privacy: 'https://polar.sh/legal/privacy',
} as const;

/** The contact address as a mail link. */
export function ContactLink() {
  return <a href={`mailto:${COMPANY.contact}`}>{COMPANY.contact}</a>;
}

export const LEGAL_PAGES = [
  { href: '/privacy', label: 'Privacy policy' },
  { href: '/terms', label: 'Terms of service' },
  { href: '/refunds', label: 'Refund policy' },
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

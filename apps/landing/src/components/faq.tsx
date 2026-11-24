import { Plus } from 'lucide-react';
import type { ReactNode } from 'react';
import { Container, TextLink } from './ui';
import { site } from '@/lib/site';

const QUESTIONS: Array<{ q: string; a: ReactNode }> = [
  {
    q: 'Can I use FlarePanel today?',
    a: (
      <>
        It is in early access. Sign-up, projects and client IDs work on the
        hosted dashboard; event tracking is rolling out now, and one-command
        self-hosting on your own Cloudflare account is next. Follow progress on{' '}
        <TextLink href={site.github}>GitHub</TextLink>.
      </>
    ),
  },
  {
    q: 'How is FlarePanel related to OpenPanel?',
    a: (
      <>
        FlarePanel is an independent, open-source fork of{' '}
        <TextLink href={site.openpanel}>OpenPanel</TextLink>, rebuilt to run on
        Cloudflare. We keep its tracking protocol so its SDKs work, and we are
        grateful for the work it is built on. FlarePanel is not affiliated with
        or endorsed by OpenPanel.
      </>
    ),
  },
  {
    q: 'Do my existing OpenPanel SDKs work?',
    a: (
      <>
        Yes. Set <code className="text-soft">apiUrl</code> to{' '}
        <code className="text-soft">{site.api}</code> and use your FlarePanel
        client ID. FlarePanel’s own SDK packages will be published to npm under
        the same API.
      </>
    ),
  },
  {
    q: 'Where is my data stored?',
    a: 'On Cloudflare: accounts and settings in D1, events in a Durable Object per project, and the raw archive in R2. You choose the data region, EU, US or unrestricted, for hosted and self-hosted installs.',
  },
  {
    q: 'What will it cost?',
    a: 'Hosted plans are priced by events a month, from $1 for 5,000 events, with a 30-day free trial and every feature in every plan. See the pricing page. Self-hosting is free and open source; you pay Cloudflare directly for what you use, on a Workers Paid plan.',
  },
  {
    q: 'Is FlarePanel made by Cloudflare?',
    a: 'No. FlarePanel is an independent open-source project that runs on Cloudflare’s developer platform. It is not affiliated with or endorsed by Cloudflare.',
  },
  {
    q: 'What is the license?',
    a: (
      <>
        The platform is <TextLink href={site.license}>AGPL-3.0</TextLink> and
        the SDKs are MIT.
      </>
    ),
  },
];

export function Faq() {
  return (
    <section
      aria-labelledby="faq-title"
      className="border-rule border-t py-24 sm:py-32"
      id="faq"
    >
      <Container className="grid gap-12 lg:grid-cols-[420px_minmax(0,1fr)] lg:gap-20">
        <div>
          <h2
            className="display text-[36px] sm:text-[48px] lg:text-[56px]"
            id="faq-title"
          >
            Questions
          </h2>
          <p className="mt-5 max-w-[40ch] text-[16px] text-muted leading-[1.6]">
            Something missing?{' '}
            <TextLink href={site.issues}>Open an issue</TextLink> and we will
            answer it there.
          </p>
        </div>
        <div className="border-rule border-t">
          {QUESTIONS.map(({ q, a }) => (
            <details className="group border-rule border-b" key={q}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 font-medium text-[18px] tracking-[-0.01em] transition-colors hover:text-paper [&::-webkit-details-marker]:hidden">
                {q}
                <Plus
                  aria-hidden
                  className="size-[18px] shrink-0 text-faint transition-transform duration-300 ease-out-expo group-open:rotate-45 group-open:text-paper"
                />
              </summary>
              <div className="max-w-[64ch] pb-7 text-[15.5px] text-muted leading-[1.65]">
                {a}
              </div>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}

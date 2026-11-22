import { ArrowRight } from 'lucide-react';
import { Container, SectionHeading } from './ui';
import { site } from '@/lib/site';

const OPTIONS = [
  {
    name: 'FlarePanel Cloud',
    status: 'Early access',
    live: true,
    body: 'We run it for you. Create an account, add a project, paste the SDK snippet.',
    points: [
      'Sign-up and projects work today',
      'Choose where your data lives: EU, US or unrestricted',
      'Priced per event once pricing is final',
    ],
    cta: { label: 'Get early access', href: site.signUp },
  },
  {
    name: 'Your own Cloudflare account',
    status: 'Coming soon',
    live: false,
    body: 'Deploy the same code to your own Workers, D1, Durable Objects and R2.',
    points: [
      'Your data never leaves your account',
      'You pay Cloudflare directly, per use',
      'Same open-source code as the hosted version',
    ],
    cta: { label: 'Watch the repository', href: site.github },
  },
] as const;

export function RunOptions() {
  return (
    <section
      aria-labelledby="run-title"
      className="border-rule border-t py-24 sm:py-32"
      id="run"
    >
      <Container>
        <SectionHeading
          id="run-title"
          title="Run it on our Cloudflare, or on yours."
        >
          <p>
            One codebase, two ways to use it. Start hosted, move to your own
            account later, and keep your SDK setup either way.
          </p>
        </SectionHeading>
        <div className="mt-14 grid gap-4 md:grid-cols-2">
          {OPTIONS.map((option) => (
            <article
              className={`flex flex-col rounded-2xl border p-7 sm:p-9 ${
                option.live ? 'border-rule-strong bg-panel' : 'border-rule'
              }`}
              key={option.name}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-semibold text-[26px] tracking-[-0.02em]">
                  {option.name}
                </h3>
                <span
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[13px] ${
                    option.live
                      ? 'border-rule-strong text-soft'
                      : 'border-rule text-muted'
                  }`}
                >
                  <span
                    aria-hidden
                    className={`size-1.5 rounded-full ${option.live ? 'bg-soft' : 'border border-faint'}`}
                  />
                  {option.status}
                </span>
              </div>
              <p className="mt-4 max-w-[46ch] text-[16px] text-muted leading-[1.6]">
                {option.body}
              </p>
              <ul className="mt-7 grid gap-3 border-rule border-t pt-6 text-[15px] text-soft">
                {option.points.map((point) => (
                  <li className="flex gap-3" key={point}>
                    <span
                      aria-hidden
                      className="mt-[11px] h-px w-3 shrink-0 bg-rule-strong"
                    />
                    {point}
                  </li>
                ))}
              </ul>
              <a
                className="group mt-9 inline-flex items-center gap-2 self-start font-medium text-[15px] text-paper"
                href={option.cta.href}
                rel={
                  option.cta.href.startsWith(site.github)
                    ? 'noopener'
                    : undefined
                }
              >
                <span className="underline decoration-rule-strong underline-offset-[0.3em] transition-colors group-hover:decoration-coral">
                  {option.cta.label}
                </span>
                <ArrowRight
                  aria-hidden
                  className="size-4 transition-transform duration-200 ease-out-expo group-hover:translate-x-0.5"
                />
              </a>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

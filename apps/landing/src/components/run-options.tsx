import { ArrowRight, Check } from 'lucide-react';
import { Container, SectionHeading } from './ui';
import { site } from '@/lib/site';

const OPTIONS = [
  {
    name: 'FlarePanel Cloud',
    status: 'Early access',
    live: true,
    body: 'We run it for you. Create an account, add a project, paste the SDK snippet.',
    points: [
      'Tracking, dashboards and replay work today',
      'Nothing to install or keep running',
      'Priced per event, from $1 a month',
    ],
    cta: { label: 'Get early access', href: site.signUp },
  },
  {
    name: 'Your own Cloudflare account',
    status: 'Manual deploy',
    live: true,
    body: 'Deploy the same code to your own Workers, D1, Durable Objects and R2.',
    points: [
      'Your data never leaves your account',
      'You pay Cloudflare directly, per use',
      'Same open-source code as the hosted version',
    ],
    cta: {
      label: 'Read the deploy guide',
      href: `${site.docs}/self-hosting/deploy`,
    },
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
        <div className="mt-14 overflow-hidden rounded-2xl border border-rule">
          <div className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1fr)]">
            <div className="border-rule border-b p-5 sm:p-7" />
            {OPTIONS.map((option, i) => (
              <div
                className={`border-rule border-b border-l p-5 sm:p-7 ${i === 0 ? 'bg-[color-mix(in_oklab,#ff6a4d_6%,#111115)]' : ''}`}
                key={option.name}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-[19px] tracking-[-0.015em] sm:text-[22px]">
                    {option.name}
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[12px] ${
                      option.live
                        ? 'border-up/30 bg-up/10 text-paper'
                        : 'border-chart-spark/30 bg-chart-spark/10 text-soft'
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`size-1.5 rounded-full ${option.live ? 'bg-up' : 'border border-chart-spark'}`}
                    />
                    {option.status}
                  </span>
                </div>
                <p className="mt-2 text-[14px] text-muted leading-[1.55]">
                  {option.body}
                </p>
              </div>
            ))}
            {[
              ['Who runs it', 'We do', 'You do, on your Cloudflare account'],
              [
                'Where data lives',
                'Our Cloudflare account',
                'Never leaves your account',
              ],
              [
                'How you pay',
                'Per event, from $1 a month',
                'Cloudflare directly, per use',
              ],
              ['The code', 'Open source', 'The same open-source code'],
            ].map(([label, cloud, own]) => [
              <div
                className="border-rule border-b p-5 font-mono text-[12px] text-faint uppercase tracking-[0.06em] sm:px-7"
                key={`${label}-l`}
              >
                {label}
              </div>,
              <div
                className="flex items-start gap-2.5 border-rule border-b border-l bg-[color-mix(in_oklab,#ff6a4d_6%,#111115)] p-5 text-[14.5px] text-paper sm:px-7"
                key={`${label}-c`}
              >
                <Check
                  aria-hidden
                  className="mt-0.5 size-4 shrink-0 text-[#ff8a6e]"
                  strokeWidth={2.25}
                />
                {cloud}
              </div>,
              <div
                className="flex items-start gap-2.5 border-rule border-b border-l p-5 text-[14.5px] text-soft sm:px-7"
                key={`${label}-o`}
              >
                <Check
                  aria-hidden
                  className="mt-0.5 size-4 shrink-0 text-chart-teal"
                  strokeWidth={2.25}
                />
                {own}
              </div>,
            ])}
            <div className="p-5 sm:p-7" />
            <div className="border-rule border-l bg-[color-mix(in_oklab,#ff6a4d_6%,#111115)] p-5 sm:p-7">
              <a
                className="inline-flex h-11 items-center gap-2 rounded-[9px] bg-paper px-[18px] font-medium text-[15px] text-ink transition-colors hover:bg-paper-hover"
                href={OPTIONS[0].cta.href}
              >
                {OPTIONS[0].cta.label}
                <ArrowRight aria-hidden className="size-4" />
              </a>
            </div>
            <div className="border-rule border-l p-5 sm:p-7">
              <a
                className="inline-flex h-11 items-center gap-2 rounded-[9px] border border-rule-strong px-[18px] font-medium text-[15px] text-paper transition-colors hover:bg-raised"
                href={OPTIONS[1].cta.href}
                rel="noopener"
              >
                {OPTIONS[1].cta.label}
                <ArrowRight aria-hidden className="size-4" />
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

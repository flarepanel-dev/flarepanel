import { ArrowRight, Check, Plus } from 'lucide-react';
import type { Metadata } from 'next';
import { CloudflareIcon } from '@/components/cloudflare-icons';
import { ClosingCta, Footer } from '@/components/footer';
import { Nav } from '@/components/nav';
import { PlanPicker } from '@/components/pricing/plan-picker';
import { Container, TextLink } from '@/components/ui';
import {
  formatEvents,
  formatPrice,
  PLANS,
  TRIAL_DAYS,
  TRIAL_EVENTS,
  yearly,
} from '@/lib/pricing';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Pricing: FlarePanel',
  description:
    'Pay for events, nothing else. From $1 a month for 5,000 events, every feature in every plan, and a 30-day free trial.',
  alternates: { canonical: '/pricing' },
};

const PROMISES = [
  {
    title: 'No seats',
    body: 'Invite the whole company. Team members are free on every plan.',
  },
  {
    title: 'No feature tiers',
    body: 'Funnels, retention, session replay, AI and the API are in every plan.',
  },
  {
    title: 'No overage bills',
    body: 'We email you at 80% and at 100% of your plan. Go over and we keep collecting every event; charts wait for an upgrade or your next period. We never charge extra.',
  },
  {
    title: 'No lock-in',
    body: 'Export everything through the API, or move to your own Cloudflare account with the same code.',
  },
];

const QUESTIONS = [
  {
    q: 'What counts as an event?',
    a: 'Every page view and every event you track: sign-ups, clicks, purchases, anything you send. Session start and end markers are not counted.',
  },
  {
    q: 'Is there a free plan?',
    a: `No, there is a ${TRIAL_DAYS}-day free trial instead, with every feature and up to ${formatEvents(TRIAL_EVENTS)} events. No credit card needed. After that, plans start at $1 a month.`,
  },
  {
    q: 'What happens if I go over my plan?',
    a: 'Nothing is lost and nothing extra is charged. We keep collecting every event, and pause the charts until you move to a bigger plan or your next billing period starts. Then everything, including the events from those days, shows up again.',
  },
  {
    q: 'Can I change or cancel my plan?',
    a: 'Any time, from Billing in your workspace. Upgrades apply straight away; cancelling keeps your plan until the end of the period you paid for.',
  },
  {
    q: 'Do you offer yearly billing?',
    a: 'Yes. A yearly plan costs ten months, so two months are free.',
  },
  {
    q: 'Is session replay included?',
    a: 'Yes, in every plan: one recorded session per 100 events of your plan, at least 1,000 and up to 100,000 a month. Trials record 500 sessions.',
  },
  {
    q: 'How does the AI assistant work?',
    a: 'It runs on your own OpenAI or Anthropic key, which you add in workspace settings. Your provider bills you directly; FlarePanel adds no AI charges.',
  },
  {
    q: 'Is self-hosting limited?',
    a: 'No. The open-source code runs on your own Cloudflare account with no event limits. You pay Cloudflare directly for what you use.',
  },
  {
    q: 'We track more than 50M events. Can you help?',
    a: 'Yes. Email hello@flarepanel.dev and we will set up a plan for your volume.',
  },
];

export default function PricingPage() {
  return (
    <>
      <Nav />
      <main id="main">
        <section
          aria-labelledby="pricing-title"
          className="pt-14 pb-24 sm:pt-20 sm:pb-32"
        >
          <Container>
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end lg:gap-14">
              <h1
                className="display max-w-[14ch] text-[44px] sm:text-[60px] lg:text-[74px] lg:leading-[0.97]"
                id="pricing-title"
              >
                Pay for events. Nothing else.
              </h1>
              <p className="max-w-[52ch] text-[16px] text-muted leading-[1.6] sm:text-[17px] lg:pb-2">
                Pick how many events you track each month. Websites, team
                members, dashboards and features are unlimited on every plan,
                from {formatPrice(PLANS[0].monthly)} a month.
              </p>
            </div>
            <div className="mt-12 sm:mt-16">
              <PlanPicker />
            </div>
            <p className="mt-5 text-[13.5px] text-faint leading-[1.6]">
              Early access: billing is not switched on yet, so accounts are free
              for now. These are the prices that will apply.
            </p>
          </Container>
        </section>

        <section
          aria-labelledby="ways-title"
          className="border-rule border-t py-24 sm:py-32"
        >
          <Container>
            <h2
              className="display max-w-[16ch] text-[36px] sm:text-[48px] lg:text-[56px]"
              id="ways-title"
            >
              Two ways to run it.
            </h2>
            <p className="mt-5 max-w-[56ch] text-[16px] text-muted leading-[1.6]">
              The same product either way. Pick who runs the Cloudflare account.
            </p>
            <div className="mt-12 grid gap-4 md:grid-cols-2">
              <article className="flex flex-col rounded-2xl border border-chart-ember/40 bg-panel p-7 sm:p-9">
                <div className="font-mono text-[#ff9e8a] text-[11.5px] uppercase tracking-[0.08em]">
                  Cloud
                </div>
                <h3 className="mt-3 font-semibold text-[26px] tracking-[-0.02em]">
                  We run it for you
                </h3>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-semibold text-[40px] tracking-[-0.03em]">
                    From {formatPrice(PLANS[0].monthly)}
                  </span>
                  <span className="text-muted">a month</span>
                </div>
                <ul className="mt-6 grid gap-3 border-rule border-t pt-6 text-[15px] text-soft">
                  {[
                    'Everything unlimited except events',
                    'New features as soon as they ship',
                    'Backed up and monitored for you',
                  ].map((point) => (
                    <li className="flex items-start gap-2.5" key={point}>
                      <Check
                        aria-hidden
                        className="mt-0.5 size-4 shrink-0 text-chart-ember"
                        strokeWidth={2.25}
                      />
                      {point}
                    </li>
                  ))}
                </ul>
                <a
                  className="mt-9 inline-flex h-11 items-center gap-2 self-start rounded-[9px] bg-paper px-[18px] font-medium text-[15px] text-ink transition-colors hover:bg-paper-hover"
                  href={site.signUp}
                >
                  Start your free trial
                  <ArrowRight aria-hidden className="size-4" />
                </a>
              </article>
              <article className="flex flex-col rounded-2xl border border-rule p-7 sm:p-9">
                <div className="font-mono text-[11.5px] text-faint uppercase tracking-[0.08em]">
                  Self-hosted
                </div>
                <h3 className="mt-3 font-semibold text-[26px] tracking-[-0.02em]">
                  Run it on your Cloudflare
                </h3>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-semibold text-[40px] tracking-[-0.03em]">
                    Free
                  </span>
                  <span className="text-muted">open source</span>
                </div>
                <div className="mt-4 flex gap-2">
                  {(
                    [
                      ['workers', '#ff6a4d'],
                      ['durable-objects', '#08b6af'],
                      ['r2', '#ffb547'],
                      ['d1', '#a064db'],
                      ['queues', '#4cb0e5'],
                    ] as const
                  ).map(([product, hue]) => (
                    <span
                      className="flex size-9 items-center justify-center rounded-lg border"
                      key={product}
                      style={{
                        borderColor: `${hue}80`,
                        backgroundColor: `${hue}22`,
                        color: hue,
                      }}
                    >
                      <CloudflareIcon
                        className="size-[18px]"
                        product={product}
                      />
                    </span>
                  ))}
                </div>
                <ul className="mt-6 grid gap-3 border-rule border-t pt-6 text-[15px] text-soft">
                  {[
                    'The same open-source code, no event limits',
                    'Your data never leaves your account',
                    'You pay Cloudflare directly, per use',
                  ].map((point) => (
                    <li className="flex items-start gap-2.5" key={point}>
                      <Check
                        aria-hidden
                        className="mt-0.5 size-4 shrink-0 text-chart-teal"
                        strokeWidth={2.25}
                      />
                      {point}
                    </li>
                  ))}
                </ul>
                <a
                  className="group mt-9 inline-flex h-11 items-center gap-2 self-start rounded-[9px] border border-rule-strong px-[18px] font-medium text-[15px] text-paper transition-colors hover:border-faint hover:bg-raised"
                  href={`${site.docs}/self-hosting`}
                >
                  Read the self-hosting guide
                  <ArrowRight
                    aria-hidden
                    className="size-4 transition-transform duration-200 ease-out-expo group-hover:translate-x-0.5"
                  />
                </a>
              </article>
            </div>
          </Container>
        </section>

        <section
          aria-labelledby="promises-title"
          className="border-rule border-t py-24 sm:py-32"
        >
          <Container>
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end lg:gap-14">
              <h2
                className="display max-w-[16ch] text-[36px] sm:text-[48px] lg:text-[56px]"
                id="promises-title"
              >
                One number on the bill. You choose it.
              </h2>
              <p className="max-w-[46ch] text-[16px] text-muted leading-[1.6] lg:pb-1.5">
                Most analytics tools charge per seat, per feature and per
                add-on. FlarePanel charges for events, and that is it.
              </p>
            </div>
            <div className="mt-12 grid overflow-hidden rounded-2xl border border-rule sm:grid-cols-2 lg:grid-cols-4">
              {PROMISES.map((item, i) => (
                <div
                  className={`border-rule p-6 sm:p-7 ${i < 3 ? 'lg:border-r' : ''} ${i % 2 === 0 ? 'sm:border-r' : ''} ${i < 2 ? 'border-b lg:border-b-0' : i === 2 ? 'max-sm:border-b' : ''}`}
                  key={item.title}
                >
                  <div className="font-semibold text-[18px] tracking-[-0.01em]">
                    {item.title}
                  </div>
                  <p className="mt-2 text-[14.5px] text-muted leading-[1.6]">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section
          aria-labelledby="plans-title"
          className="border-rule border-t py-24 sm:py-32"
        >
          <Container>
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end lg:gap-14">
              <h2
                className="display max-w-[16ch] text-[36px] sm:text-[48px] lg:text-[56px]"
                id="plans-title"
              >
                Every plan, side by side.
              </h2>
              <p className="max-w-[46ch] text-[16px] text-muted leading-[1.6] lg:pb-1.5">
                Every plan has every feature. The only difference is how many
                events you send each month. Over 50M?{' '}
                <TextLink href="mailto:hello@flarepanel.dev">
                  Ask for a custom plan
                </TextLink>
                .
              </p>
            </div>
            <div className="mt-12 overflow-hidden rounded-2xl border border-rule">
              <table className="w-full border-collapse text-left">
                <caption className="sr-only">
                  FlarePanel Cloud plans by events per month
                </caption>
                <thead>
                  <tr className="border-rule border-b bg-panel font-mono text-[11px] text-faint uppercase tracking-[0.08em]">
                    <th className="px-5 py-3.5 font-normal sm:px-7" scope="col">
                      Events per month
                    </th>
                    <th
                      className="px-5 py-3.5 text-right font-normal sm:px-7"
                      scope="col"
                    >
                      Monthly
                    </th>
                    <th
                      className="px-5 py-3.5 text-right font-normal sm:px-7"
                      scope="col"
                    >
                      Yearly{' '}
                      <span className="normal-case tracking-normal">
                        (2 months free)
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {PLANS.map((plan) => (
                    <tr
                      className="border-rule border-b transition-colors last:border-b-0 hover:bg-panel"
                      key={plan.events}
                    >
                      <th
                        className="px-5 py-3.5 font-normal sm:px-7"
                        scope="row"
                      >
                        <span className="tabular font-mono text-[15px] text-paper">
                          {formatEvents(plan.events)}
                        </span>
                        {plan.popular ? (
                          <span className="ml-3 rounded-full border border-chart-ember/40 bg-chart-ember/10 px-2 py-0.5 text-[#ff9e8a] text-[11.5px]">
                            Popular
                          </span>
                        ) : null}
                      </th>
                      <td className="tabular px-5 py-3.5 text-right font-mono text-[15px] text-soft sm:px-7">
                        {formatPrice(plan.monthly)}
                      </td>
                      <td className="tabular px-5 py-3.5 text-right font-mono text-[15px] text-muted sm:px-7">
                        {formatPrice(yearly(plan))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Container>
        </section>

        <section
          aria-labelledby="pricing-faq-title"
          className="border-rule border-t py-24 sm:py-32"
        >
          <Container className="grid gap-12 lg:grid-cols-[420px_minmax(0,1fr)] lg:gap-20">
            <div>
              <h2
                className="display text-[36px] sm:text-[48px] lg:text-[56px]"
                id="pricing-faq-title"
              >
                Pricing questions
              </h2>
              <p className="mt-5 max-w-[40ch] text-[16px] text-muted leading-[1.6]">
                Anything else? Email{' '}
                <TextLink href="mailto:hello@flarepanel.dev">
                  hello@flarepanel.dev
                </TextLink>
                .
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

        <ClosingCta />
      </main>
      <Footer />
    </>
  );
}

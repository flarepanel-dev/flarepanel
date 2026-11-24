'use client';

import { ArrowRight, Check } from 'lucide-react';
import { useState } from 'react';
import {
  formatEvents,
  formatPrice,
  PLANS,
  TRIAL_DAYS,
  yearly,
} from '@/lib/pricing';
import { site } from '@/lib/site';

const INCLUDED = [
  'Unlimited websites and apps',
  'Unlimited team members',
  'Unlimited dashboards and reports',
  'Unlimited tracked profiles',
  'Every feature, no add-ons',
  'Data in the EU, the US or anywhere, your choice',
];

/** Pick a monthly event volume and a billing period; the price follows. */
export function PlanPicker() {
  const [index, setIndex] = useState(
    Math.max(
      0,
      PLANS.findIndex((plan) => plan.popular)
    )
  );
  const [period, setPeriod] = useState<'month' | 'year'>('month');
  const plan = PLANS[index];
  const price = period === 'month' ? plan.monthly : yearly(plan);

  return (
    <div className="grid overflow-hidden rounded-[18px] border border-rule bg-panel lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
      <div className="p-6 sm:p-9">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-semibold text-[20px] tracking-[-0.015em]">
            How many events do you track a month?
          </h2>
          {plan.popular ? (
            <span className="hidden rounded-full border border-chart-indigo/40 bg-chart-indigo/10 px-2.5 py-0.5 text-[#aab3f5] text-[12px] sm:inline">
              Most popular
            </span>
          ) : null}
        </div>
        <div className="tabular mt-8 font-mono font-semibold text-[44px] tracking-[-0.03em] sm:text-[56px]">
          {formatEvents(plan.events)}
          <span className="ml-2 font-normal font-sans text-[17px] text-muted tracking-normal">
            events / month
          </span>
        </div>
        <label className="sr-only" htmlFor="events-range">
          Events per month
        </label>
        <input
          aria-valuetext={`${formatEvents(plan.events)} events a month`}
          className="plan-range mt-8 w-full"
          id="events-range"
          max={PLANS.length - 1}
          min={0}
          onChange={(event) => setIndex(Number(event.target.value))}
          step={1}
          style={{
            ['--fill' as string]: `${(index / (PLANS.length - 1)) * 100}%`,
          }}
          type="range"
          value={index}
        />
        <div className="relative mt-3 h-4 font-mono text-[11.5px] text-faint">
          {PLANS.map((p, i) =>
            [5000, 100_000, 1_000_000, 10_000_000, 50_000_000].includes(
              p.events
            ) ? (
              <button
                className="absolute -translate-x-1/2 transition-colors first:translate-x-0 last:-translate-x-full hover:text-paper"
                key={p.events}
                onClick={() => setIndex(i)}
                style={{ left: `${(i / (PLANS.length - 1)) * 100}%` }}
                tabIndex={-1}
                type="button"
              >
                {formatEvents(p.events)}
              </button>
            ) : null
          )}
        </div>
        <ul className="mt-9 grid gap-3 border-rule border-t pt-7 text-[15px] text-soft sm:grid-cols-2">
          {INCLUDED.map((item) => (
            <li className="flex items-start gap-2.5" key={item}>
              <Check
                aria-hidden
                className="mt-0.5 size-4 shrink-0 text-chart-indigo"
                strokeWidth={2.25}
              />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col border-rule border-t bg-ink p-6 sm:p-9 lg:border-t-0 lg:border-l">
        <div
          aria-label="Billing period"
          className="flex w-fit gap-1 rounded-[10px] border border-rule p-1"
          role="radiogroup"
        >
          {(
            [
              ['month', 'Monthly'],
              ['year', 'Yearly'],
            ] as const
          ).map(([value, label]) => (
            <button
              aria-checked={period === value}
              className={`flex h-9 items-center gap-2 rounded-[7px] px-3.5 text-[14px] transition-colors ${
                period === value
                  ? 'bg-raised text-paper'
                  : 'text-muted hover:text-paper'
              }`}
              key={value}
              onClick={() => setPeriod(value)}
              role="radio"
              type="button"
            >
              {label}
              {value === 'year' ? (
                <span className="rounded-full bg-up/15 px-1.5 py-px text-[11px] text-up">
                  2 months free
                </span>
              ) : null}
            </button>
          ))}
        </div>
        <div className="mt-10 flex items-baseline gap-2">
          <span className="tabular font-semibold text-[64px] leading-none tracking-[-0.04em]">
            {formatPrice(price)}
          </span>
          <span className="text-[16px] text-muted">
            / {period === 'month' ? 'month' : 'year'}
          </span>
        </div>
        <p className="mt-3 text-[14px] text-faint">
          {period === 'month'
            ? `Billed monthly. Or ${formatPrice(yearly(plan))} a year.`
            : `${formatPrice(yearly(plan) / 12)} a month, billed yearly.`}{' '}
          Plus VAT where it applies.
        </p>
        <div className="mt-auto pt-10">
          <a
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-paper font-medium text-[15px] text-ink transition-colors hover:bg-paper-hover"
            href={site.signUp}
          >
            Start your free trial
            <ArrowRight aria-hidden className="size-4" />
          </a>
          <p className="mt-3 text-center text-[13.5px] text-muted">
            {TRIAL_DAYS} days free. No credit card needed.
          </p>
        </div>
      </div>
    </div>
  );
}

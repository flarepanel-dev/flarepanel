'use client';

import {
  ArrowDown,
  Calendar,
  ChevronDown,
  Funnel,
  Plus,
  Repeat,
  Save,
} from 'lucide-react';
import { motion } from 'motion/react';
import { type ReactNode, useRef } from 'react';
import { EVENT_COLORS, nf } from './sample-data';
import { useLiveTick } from './use-live';

/** The report builder of apps/start: a name, chart type, range and the steps on the left. */
function ReportShell({
  name,
  type,
  icon,
  steps,
  footer,
  children,
}: {
  name: string;
  type: string;
  icon: ReactNode;
  steps: { event: string; note?: string }[];
  footer: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-app-line border-b px-4 py-3 pr-28">
        <span className="font-semibold text-[15px] tracking-[-0.01em]">
          {name}
        </span>
        <span className="ml-3 flex h-8 items-center gap-1.5 rounded-md border border-app-line bg-app-card px-2.5 text-[12.5px]">
          {icon}
          {type}
          <ChevronDown className="size-3 text-app-muted" />
        </span>
        <span className="flex h-8 items-center gap-1.5 rounded-md border border-app-line bg-app-card px-2.5 text-[12.5px] max-sm:hidden">
          <Calendar className="size-3.5" strokeWidth={1.75} />
          Last 30 days
        </span>
        <span className="ml-auto flex h-8 items-center gap-1.5 rounded-md bg-paper px-2.5 font-medium text-[12.5px] text-ink max-sm:hidden">
          <Save className="size-3.5" strokeWidth={1.75} />
          Save
        </span>
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="hidden w-[230px] shrink-0 flex-col gap-2 border-app-line border-r p-4 sm:flex">
          <div className="font-medium text-[10px] text-app-muted uppercase tracking-[0.5px]">
            Events
          </div>
          {steps.map((step, i) => {
            const color = EVENT_COLORS[step.event] ?? '#a6a6a6';
            return (
              <div
                className="rounded-md border border-app-line bg-app-card p-2.5"
                key={`${step.event}-${i}`}
              >
                <div className="flex items-center gap-2 text-[12px]">
                  <span
                    className="flex size-[18px] items-center justify-center rounded-[4px] font-mono font-semibold text-[10px]"
                    style={{ backgroundColor: `${color}29`, color }}
                  >
                    {i + 1}
                  </span>
                  <span className="font-mono text-[11.5px]">{step.event}</span>
                </div>
                {step.note ? (
                  <div className="mt-1.5 pl-[26px] font-mono text-[10.5px] text-app-muted">
                    {step.note}
                  </div>
                ) : null}
              </div>
            );
          })}
          <div className="flex items-center gap-1.5 rounded-md border border-app-line border-dashed px-2.5 py-2 text-[12px] text-app-muted">
            <Plus className="size-3.5" />
            Add event
          </div>
          <div className="mt-auto">{footer}</div>
        </div>
        <div className="min-w-0 flex-1 overflow-hidden p-4">{children}</div>
      </div>
    </div>
  );
}

const FUNNEL = [
  { event: 'screen_view', note: 'path is /pricing', users: 4206 },
  { event: 'sign_up', users: 1607 },
  { event: 'project_created', users: 1138 },
  { event: 'checkout_started', users: 412 },
];

/** A four-step signup funnel: bars grow in once, then each step's drop-off reads underneath. */
export function FunnelView({ active = true }: { active?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { reduce } = useLiveTick(ref, 60_000, active);
  const first = FUNNEL[0].users;
  return (
    <div className="h-full" ref={ref}>
      <ReportShell
        footer={
          <div className="space-y-1.5 text-[11.5px] text-app-muted">
            <div className="flex justify-between">
              Window <span className="font-mono text-app-text">14 days</span>
            </div>
            <div className="flex justify-between">
              Group by <span className="font-mono text-app-text">session</span>
            </div>
          </div>
        }
        icon={<Funnel className="size-3.5" strokeWidth={1.75} />}
        name="Signup funnel"
        steps={FUNNEL}
        type="Funnel"
      >
        <div className="flex items-end justify-between gap-4 border-app-line border-b pb-4">
          <div>
            <div className="font-medium text-[10px] text-app-muted uppercase tracking-[0.5px]">
              Conversion
            </div>
            <div className="tabular mt-1 font-mono font-semibold text-[26px] tracking-[-0.5px]">
              9.8%
            </div>
          </div>
          <div className="flex gap-6 text-right">
            <div>
              <div className="font-medium text-[10px] text-app-muted uppercase tracking-[0.5px]">
                Completed
              </div>
              <div className="tabular mt-1 font-mono font-semibold text-[15px]">
                {nf.format(412)}
              </div>
            </div>
            <div>
              <div className="font-medium text-[10px] text-app-muted uppercase tracking-[0.5px]">
                Median time
              </div>
              <div className="tabular mt-1 font-mono font-semibold text-[15px]">
                2d 4h
              </div>
            </div>
          </div>
        </div>
        <div className="mt-5 grid h-[calc(100%-110px)] grid-cols-4 gap-3">
          {FUNNEL.map((step, i) => {
            const share = step.users / first;
            const fromPrev = i === 0 ? 1 : step.users / FUNNEL[i - 1].users;
            return (
              <div className="flex min-w-0 flex-col" key={step.event}>
                <div className="truncate font-mono text-[11px]">
                  <span className="text-app-muted">{i + 1}.</span> {step.event}
                </div>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="tabular font-mono font-semibold text-[16px]">
                    {(share * 100).toFixed(1)}%
                  </span>
                  <span className="tabular font-mono text-[11px] text-app-muted">
                    {nf.format(step.users)}
                  </span>
                </div>
                <div className="relative mt-3 flex-1 overflow-hidden rounded-[4px] bg-[repeating-linear-gradient(135deg,#1c1c1c_0_6px,#202020_6px_12px)]">
                  <motion.div
                    className="absolute inset-x-0 bottom-0 rounded-[4px] bg-chart-indigo"
                    initial={reduce ? false : { height: 0 }}
                    style={{ height: `${share * 100}%` }}
                    transition={{
                      duration: 0.9,
                      delay: i * 0.12,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    whileInView={{ height: `${share * 100}%` }}
                  />
                </div>
                <div className="mt-2 text-[11px] text-app-muted">
                  {i === 0 ? (
                    'Entered the funnel'
                  ) : (
                    <>
                      <span className="inline-flex items-center gap-0.5 text-crimson">
                        <ArrowDown className="size-3" strokeWidth={2.25} />
                        {((1 - fromPrev) * 100).toFixed(0)}%
                      </span>{' '}
                      dropped
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ReportShell>
    </div>
  );
}

const COHORTS = [
  { week: 'Oct 12', users: 1046, values: [100, 44.8, 37.2, 31.9, 29.1, 27.6] },
  { week: 'Oct 19', users: 1121, values: [100, 45.1, 37.6, 32.4, 29.8, 28.1] },
  { week: 'Oct 26', users: 1204, values: [100, 46.2, 38.9, 33.1, 30.4, 28.8] },
  { week: 'Nov 2', users: 1318, values: [100, 48.7, 40.2, 35.6, 32.0] },
  { week: 'Nov 9', users: 1452, values: [100, 51.3, 42.8, 37.4] },
  { week: 'Nov 16', users: 1601, values: [100, 53.9, 44.1] },
  { week: 'Nov 23', users: 1688, values: [100, 55.2] },
];

/** Weekly retention: the average curve above the cohort table, in the data colour (indigo). */
export function RetentionView() {
  const avg = [100, 51.1, 41.5, 35.4, 31.2, 28.8];
  const W = 600;
  const H = 120;
  const points = avg.map(
    (v, i) => [(i / (avg.length - 1)) * W, H - (v / 100) * H] as const
  );
  // Monotone-looking curve through the weekly averages.
  const line = points
    .map(([x, y], i) => {
      if (i === 0) {
        return `M${x},${y}`;
      }
      const [px, py] = points[i - 1];
      const mx = (px + x) / 2;
      return `C${mx},${py} ${mx},${y} ${x},${y}`;
    })
    .join(' ');
  return (
    <ReportShell
      footer={
        <div className="space-y-1.5 text-[11.5px] text-app-muted">
          <div className="flex justify-between">
            Interval <span className="font-mono text-app-text">week</span>
          </div>
          <div className="flex justify-between">
            Criteria{' '}
            <span className="font-mono text-app-text">on or after</span>
          </div>
        </div>
      }
      icon={<Repeat className="size-3.5" strokeWidth={1.75} />}
      name="Weekly retention"
      steps={[
        { event: 'sign_up', note: 'first event' },
        { event: 'screen_view', note: 'came back' },
      ]}
      type="Retention"
    >
      <div className="rounded-md border border-app-line bg-app-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-medium text-[10px] text-app-muted uppercase tracking-[0.5px]">
            Retained users, average
          </span>
          <span className="font-mono text-[11px] text-app-muted">
            week 4: <span className="font-semibold text-app-text">31.2%</span>
          </span>
        </div>
        <svg
          className="h-[150px] w-full overflow-visible"
          preserveAspectRatio="none"
          viewBox={`0 0 ${W} ${H}`}
        >
          <defs>
            <linearGradient id="ret-area" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#6b79ea" stopOpacity="0.3" />
              <stop offset="1" stopColor="#6b79ea" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 0.5, 1].map((f) => (
            <line
              key={f}
              stroke="#2b2b2b"
              strokeDasharray="2 5"
              vectorEffect="non-scaling-stroke"
              x1="0"
              x2={W}
              y1={H * f}
              y2={H * f}
            />
          ))}
          <path d={`${line} L${W},${H} L0,${H} Z`} fill="url(#ret-area)" />
          <path
            d={line}
            fill="none"
            stroke="#6b79ea"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
      <div className="mt-3 overflow-hidden rounded-md border border-app-line">
        <div className="grid h-8 grid-cols-[90px_70px_repeat(6,minmax(0,1fr))] items-center gap-px bg-app-card px-3 font-medium text-[10px] uppercase tracking-[0.5px]">
          <span>Cohort</span>
          <span className="text-right">Users</span>
          {[0, 1, 2, 3, 4, 5].map((w) => (
            <span className="text-center" key={w}>
              Week {w}
            </span>
          ))}
        </div>
        {COHORTS.map((c) => (
          <div
            className="grid h-[34px] grid-cols-[90px_70px_repeat(6,minmax(0,1fr))] items-center gap-px border-app-line border-t px-3 text-[12px]"
            key={c.week}
          >
            <span className="font-mono text-[11px]">{c.week}</span>
            <span className="tabular text-right font-mono text-[11px] text-app-muted">
              {nf.format(c.users)}
            </span>
            {[0, 1, 2, 3, 4, 5].map((w) => {
              const v = c.values[w];
              return v === undefined ? (
                <span key={w} />
              ) : (
                <span
                  className="tabular mx-0.5 rounded-[3px] py-1 text-center font-mono text-[11px]"
                  key={w}
                  style={{
                    backgroundColor: `rgba(107,121,234,${(v / 100) * 0.6})`,
                    color: v > 60 ? '#fff' : '#e5e5e5',
                  }}
                >
                  {v.toFixed(v === 100 ? 0 : 1)}%
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </ReportShell>
  );
}

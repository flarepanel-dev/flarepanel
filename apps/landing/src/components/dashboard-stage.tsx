'use client';

import {
  ArrowDownRight,
  ArrowUpRight,
  ChartColumn,
  ChevronDown,
  Filter,
  Funnel,
  LayoutDashboard,
  ListTree,
  Repeat,
  Sparkles,
  UsersRound,
} from 'lucide-react';
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from 'motion/react';
import { useEffect, useRef, useState } from 'react';

// Illustrative sample data only. Nothing here is a real customer or metric.
const DAYS = [
  ['Nov 10', 52],
  ['Nov 11', 61],
  ['Nov 12', 57],
  ['Nov 13', 66],
  ['Nov 14', 63],
  ['Nov 15', 44],
  ['Nov 16', 41],
  ['Nov 17', 70],
  ['Nov 18', 74],
  ['Nov 19', 69],
  ['Nov 20', 81],
  ['Nov 21', 78],
  ['Nov 22', 86],
  ['Today', 58],
] as const;

const PAGES = [
  ['/', 2841],
  ['/pricing', 1206],
  ['/docs/quickstart', 938],
  ['/blog/edge-analytics', 611],
  ['/changelog', 402],
] as const;

const FEED = [
  ['screen_view', '/pricing', 'Lisbon'],
  ['sign_up', '/onboarding', 'Frankfurt'],
  ['screen_view', '/', 'São Paulo'],
  ['checkout_started', '/checkout', 'Tokyo'],
  ['screen_view', '/docs/quickstart', 'Istanbul'],
  ['project_created', '/app', 'Toronto'],
  ['screen_view', '/changelog', 'Singapore'],
  ['invite_sent', '/settings/team', 'Amsterdam'],
  ['screen_view', '/blog/edge-analytics', 'Sydney'],
  ['screen_view', '/pricing', 'Austin'],
] as const;

const NAV = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Events', icon: ListTree },
  { label: 'Profiles', icon: UsersRound },
  { label: 'Funnels', icon: Funnel },
  { label: 'Retention', icon: Repeat },
  { label: 'Reports', icon: ChartColumn },
  { label: 'Ask AI', icon: Sparkles },
] as const;

const number = new Intl.NumberFormat('en-US');

type FeedItem = { id: number; name: string; path: string; city: string };

const initialFeed: FeedItem[] = FEED.slice(0, 5).map(
  ([name, path, city], i) => ({
    id: i,
    name,
    path,
    city,
  })
);

export function DashboardStage() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.2 });
  const reduce = useReducedMotion();
  const [today, setToday] = useState(58);
  const [visitors, setVisitors] = useState(8634);
  const [live, setLive] = useState(14);
  const [feed, setFeed] = useState<FeedItem[]>(initialFeed);

  useEffect(() => {
    if (reduce || !inView) {
      return;
    }
    let tick = 0;
    const timer = window.setInterval(() => {
      tick += 1;
      const next = FEED[(tick + 4) % FEED.length];
      if (!next) {
        return;
      }
      setFeed((items) =>
        [
          { id: Date.now(), name: next[0], path: next[1], city: next[2] },
          ...items,
        ].slice(0, 6)
      );
      setToday((value) => (value >= 90 ? 58 : value + 2));
      setVisitors((value) => value + 1 + (tick % 3));
      setLive((value) =>
        Math.max(9, Math.min(21, value + ((tick * 7) % 5) - 2))
      );
    }, 1900);
    return () => window.clearInterval(timer);
  }, [reduce, inView]);

  const max = 100;

  return (
    <div
      aria-label="FlarePanel dashboard with sample data"
      className="relative overflow-hidden rounded-[18px] border border-rule bg-panel shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]"
      ref={ref}
      role="img"
    >
      <div className="grid md:grid-cols-[208px_minmax(0,1fr)]">
        <aside className="hidden border-rule border-r p-4 md:block">
          <div className="flex items-center justify-between rounded-lg border border-rule px-2.5 py-2">
            <span className="flex items-center gap-2 font-medium text-[13px]">
              <span className="grid size-5 place-items-center rounded-[5px] bg-raised font-mono text-[10px] text-muted">
                A
              </span>
              Acme Website
            </span>
            <ChevronDown aria-hidden className="size-3.5 text-faint" />
          </div>
          <ul className="mt-5 grid gap-0.5 text-[13px] text-muted">
            {NAV.map(({ label, icon: Icon }) => (
              <li
                className={`flex items-center gap-2.5 rounded-[7px] px-2.5 py-[7px] ${
                  label === 'Overview' ? 'bg-hover text-paper' : ''
                }`}
                key={label}
              >
                <Icon aria-hidden className="size-[15px]" strokeWidth={1.75} />
                {label}
              </li>
            ))}
          </ul>
        </aside>

        <div className="min-w-0 p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11.5px] text-muted">
            <span className="rounded-[7px] border border-rule px-2.5 py-1.5">
              Last 14 days
            </span>
            <span className="hidden rounded-[7px] border border-rule px-2.5 py-1.5 sm:inline">
              Day
            </span>
            <span className="flex items-center gap-1.5 rounded-[7px] border border-rule px-2.5 py-1.5">
              <Filter aria-hidden className="size-3" />
              Filters
            </span>
            <span className="ml-auto rounded-[6px] bg-raised px-2 py-1 text-[10px] text-faint tracking-[0.08em]">
              SAMPLE DATA
            </span>
          </div>

          <div className="mt-3.5 grid grid-cols-2 overflow-hidden rounded-xl border border-rule lg:grid-cols-4">
            <Kpi
              delta="12%"
              label="Unique visitors"
              value={number.format(visitors)}
            />
            <Kpi delta="9%" label="Sessions" value="9,021" />
            <Kpi delta="3%" down label="Bounce rate" value="41%" />
            <div className="border-rule border-t p-3.5 sm:p-4 lg:border-t-0 lg:border-l">
              <div className="font-mono text-[10.5px] text-faint uppercase tracking-[0.08em]">
                Live now
              </div>
              <div className="mt-1.5 flex items-center gap-2 font-mono font-semibold text-[22px] text-coral tabular sm:text-[26px]">
                <span className="relative flex size-2">
                  {reduce ? null : (
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-coral opacity-60" />
                  )}
                  <span className="relative inline-flex size-2 rounded-full bg-coral" />
                </span>
                {live}
              </div>
            </div>
          </div>

          <div className="mt-3.5 grid gap-3.5 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="min-w-0 rounded-xl border border-rule p-4">
              <div className="flex items-baseline justify-between">
                <span className="font-medium text-[13px]">
                  Visitors per day
                </span>
                <span className="flex items-center gap-1.5 font-mono text-[11px] text-faint">
                  <span aria-hidden className="size-2 rounded-[2px] bg-coral" />
                  Today, updating
                </span>
              </div>
              <div className="mt-4 flex h-[150px] items-end gap-[6px] sm:h-[188px] sm:gap-2">
                {DAYS.map(([day, height], index) => {
                  const isToday = index === DAYS.length - 1;
                  const value = isToday ? today : height;
                  return (
                    <div
                      className="flex h-full min-w-0 flex-1 flex-col justify-end"
                      key={day}
                    >
                      <motion.div
                        animate={{ height: `${(value / max) * 100}%` }}
                        className={`rounded-t-[4px] ${isToday ? 'bg-coral' : 'bg-coral-past'}`}
                        initial={false}
                        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 flex justify-between font-mono text-[10px] text-faint">
                <span>Nov 10</span>
                <span className="hidden sm:inline">Nov 17</span>
                <span>Today</span>
              </div>

              <div className="mt-5 hidden border-rule border-t pt-3 sm:block">
                <div className="flex justify-between font-mono text-[10.5px] text-faint uppercase tracking-[0.08em]">
                  <span>Top pages</span>
                  <span>Views</span>
                </div>
                <ul className="mt-2 grid gap-1">
                  {PAGES.map(([path, views]) => (
                    <li
                      className="relative flex justify-between rounded-[5px] px-2 py-[5px] font-mono text-[12px]"
                      key={path}
                    >
                      <span
                        aria-hidden
                        className="absolute inset-y-0 left-0 rounded-[5px] bg-raised"
                        style={{ width: `${(views / 2841) * 100}%` }}
                      />
                      <span className="relative text-soft">{path}</span>
                      <span className="relative text-muted tabular">
                        {number.format(views)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="min-w-0 rounded-xl border border-rule p-4">
              <div className="flex items-baseline justify-between">
                <span className="font-medium text-[13px]">Live events</span>
                <span className="font-mono text-[11px] text-faint">
                  nearest edge
                </span>
              </div>
              <ul className="mt-3 grid gap-1.5 overflow-hidden">
                <AnimatePresence initial={false}>
                  {feed.map((item, index) => (
                    <motion.li
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      className={`rounded-lg border px-3 py-2.5 ${
                        index > 2 ? 'hidden lg:block ' : ''
                      }${
                        index === 0
                          ? 'border-coral/30 bg-coral/[0.06]'
                          : 'border-rule'
                      }`}
                      initial={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
                      key={item.id}
                      layout
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="flex justify-between gap-2 font-mono text-[12px]">
                        <span
                          className={
                            index === 0 ? 'text-coral-soft' : 'text-soft'
                          }
                        >
                          {item.name}
                        </span>
                        <span className="truncate text-faint">{item.city}</span>
                      </div>
                      <div className="mt-0.5 truncate font-mono text-[11px] text-faint">
                        {item.path}
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  delta,
  down = false,
}: {
  label: string;
  value: string;
  delta: string;
  down?: boolean;
}) {
  return (
    <div className="border-rule p-3.5 sm:p-4 [&:nth-child(2)]:border-l [&:nth-child(3)]:border-t lg:[&:nth-child(3)]:border-t-0 lg:[&:nth-child(3)]:border-l lg:[&:not(:first-child)]:border-l">
      <div className="font-mono text-[10.5px] text-faint uppercase tracking-[0.08em]">
        {label}
      </div>
      <div className="mt-1.5 flex items-baseline gap-1.5">
        <span className="font-mono font-semibold text-[22px] tabular sm:text-[26px]">
          {value}
        </span>
        <span
          className={`flex items-center font-mono text-[11px] ${down ? 'text-crimson' : 'text-up'}`}
        >
          {down ? (
            <ArrowDownRight aria-hidden className="size-3" strokeWidth={2.25} />
          ) : (
            <ArrowUpRight aria-hidden className="size-3" strokeWidth={2.25} />
          )}
          {delta}
        </span>
      </div>
    </div>
  );
}

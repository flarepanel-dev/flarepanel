'use client';

import {
  ArrowDown,
  ArrowUp,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  Globe,
  ScanEye,
  Search,
  Sparkles,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { SourceIcon } from './glyphs';
import {
  KPIS,
  kpiBars,
  nf,
  PAGES,
  REFERRERS,
  SPIKE_INDEX,
  VISITORS,
  VISITORS_PREVIOUS,
} from './sample-data';
import { useLiveTick } from './use-live';

const control =
  'flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-app-line bg-app-card px-2.5 text-[12.5px] text-app-text';

export function Toolbar({ live }: { live: number }) {
  return (
    <div className="flex items-center gap-2 border-app-line border-b px-4 py-3 pr-28">
      <div className={control}>
        <Calendar className="size-3.5" strokeWidth={1.75} />
        Last 30 days
      </div>
      <div className="flex shrink-0 overflow-hidden rounded-md border border-app-line bg-app-card">
        <span className="flex size-8 items-center justify-center border-app-line border-r">
          <ChevronLeft className="size-3.5" />
        </span>
        <span className="flex size-8 items-center justify-center text-app-muted">
          <ChevronRight className="size-3.5" />
        </span>
      </div>
      <div className={`${control} max-sm:hidden`}>
        <Clock className="size-3.5" strokeWidth={1.75} />
        Day
      </div>
      <div className={control}>
        <Filter className="size-3.5" strokeWidth={1.75} />
        Filters
      </div>
      <div
        className={`${control} hidden min-w-0 flex-1 bg-app-field text-app-muted xl:flex xl:max-w-[260px]`}
      >
        <Sparkles className="size-3.5 shrink-0" strokeWidth={1.75} />
        <span className="truncate">Try: "last 7 days, mobile only"</span>
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-2 max-sm:hidden">
        <div className={`${control} tabular gap-2 font-mono`}>
          <span className="relative flex size-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-coral opacity-60 motion-reduce:hidden" />
            <span className="relative size-2 rounded-full bg-coral" />
          </span>
          {live}
        </div>
        <div
          className={`${control} border-transparent bg-paper font-medium text-ink`}
        >
          <Globe className="size-3.5" strokeWidth={1.75} />
          Public
        </div>
      </div>
    </div>
  );
}

function Delta({ value, good }: { value: number; good: boolean }) {
  const up = value >= 0;
  const Arrow = up ? ArrowUp : ArrowDown;
  return (
    <span
      className={`tabular flex items-center gap-0.5 font-medium text-[11px] ${good ? 'text-up' : 'text-crimson'}`}
    >
      <Arrow className="size-3" strokeWidth={2.25} />
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

function MiniBars({ values, live }: { values: number[]; live: boolean }) {
  const max = Math.max(...values);
  return (
    <div className="flex h-[34px] items-end gap-[2px]">
      {values.map((v, i) => (
        <span
          className={`flex-1 rounded-t-[1px] bg-coral transition-[height] duration-700 ease-out-expo ${
            i === values.length - 1 && live ? 'opacity-100' : 'opacity-85'
          }`}
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length series
          key={i}
          style={{ height: `${Math.max(4, (v / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}

export function KpiGrid({
  visitorsBump,
  live,
}: {
  visitorsBump: number;
  live: number;
}) {
  const bars = useMemo(() => KPIS.map((_, i) => kpiBars(i)), []);
  return (
    <div className="grid grid-cols-2 overflow-hidden rounded-md border border-app-line lg:grid-cols-4">
      {KPIS.map((kpi, i) => {
        const value = i === 0 ? nf.format(8639 + visitorsBump) : kpi.value;
        const series = bars[i].slice();
        if (i === 0) {
          series[series.length - 1] += visitorsBump * 6;
        }
        return (
          <div
            className={`relative flex flex-col gap-0.5 border-app-line bg-app-bg px-3 pt-2.5 pb-0 ${
              i % 2 === 0 ? 'border-r' : 'lg:border-r'
            } ${i < 6 ? 'border-b lg:[&:nth-child(n+5)]:border-b-0' : ''} ${
              i === 0 ? 'shadow-[inset_2px_0_0_#ff496b]' : ''
            } ${i >= 4 ? 'max-sm:hidden' : ''} ${i === 2 || i === 3 ? 'max-sm:border-b-0' : ''}`}
            key={kpi.label}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="truncate font-medium text-[10px] text-app-muted uppercase tracking-[0.5px]">
                {kpi.label}
              </span>
              <Delta good={kpi.good} value={kpi.delta} />
            </div>
            <span className="tabular font-mono font-semibold text-[19px] tracking-[-0.5px]">
              {value}
              {'unit' in kpi ? (
                <span className="ml-0.5 text-[12px] text-app-muted">
                  {kpi.unit}
                </span>
              ) : null}
            </span>
            <span className="text-[11px] text-app-muted">Last 30 days</span>
            <div className="mt-2">
              <MiniBars live={i === 0} values={series} />
            </div>
          </div>
        );
      })}
      <div className="relative flex flex-col gap-0.5 bg-app-bg px-3 pt-2.5 pb-3 max-sm:hidden">
        <div className="flex items-start justify-between">
          <span className="font-medium text-[10px] text-app-muted uppercase tracking-[0.5px]">
            Live · 30 min
          </span>
          <span className="size-2 rounded-full bg-coral" />
        </div>
        <span className="tabular font-mono font-semibold text-[19px] text-coral tracking-[-0.5px]">
          {live}
        </span>
        <span className="text-[11px] text-app-muted">Last 30 min</span>
      </div>
    </div>
  );
}

/** Catmull-Rom through the points, as cubic Béziers: the dashboard's monotone-ish curve. */
function smooth(points: [number, number][]) {
  let d = `M${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

const W = 1000;
const H = 230;

export function VisitorsChart({ todayBump }: { todayBump: number }) {
  const [hover, setHover] = useState<number | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const current = VISITORS.map((d, i) =>
    i === VISITORS.length - 1 ? d.value + todayBump : d.value
  );
  const previous = VISITORS_PREVIOUS.map((d) => d.value);
  const max = Math.ceil(Math.max(...current, ...previous) / 200) * 200;
  const x = (i: number) => (i / (current.length - 1)) * W;
  const y = (v: number) => H - (v / max) * H;
  const cur = current.map((v, i) => [x(i), y(v)] as [number, number]);
  const prev = previous.map((v, i) => [x(i), y(v)] as [number, number]);
  const solid = smooth(cur.slice(0, -1));
  const tail = smooth(cur.slice(-2));
  const area = `${smooth(cur)} L${W},${H} L0,${H} Z`;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(max * f));

  return (
    <div className="rounded-md border border-app-line bg-app-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-medium text-[10px] text-app-muted uppercase tracking-[0.5px]">
          Unique visitors
        </span>
        <span className="flex items-center gap-3 text-[11px] text-app-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-[2px] w-3 rounded bg-coral" />
            This period
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-[2px] w-3 rounded bg-[#5c5c5c]" />
            Previous
          </span>
        </span>
      </div>
      <div className="flex gap-2">
        <div className="tabular flex h-[180px] flex-col justify-between py-0 text-right font-mono text-[10px] text-app-muted sm:h-[210px]">
          {ticks
            .slice()
            .reverse()
            .map((t) => (
              <span className="-my-1.5 leading-3" key={t}>
                {t}
              </span>
            ))}
        </div>
        {/* biome-ignore lint/a11y/noStaticElementInteractions: hover readout on a decorative chart */}
        {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: hover readout on a decorative chart */}
        <div
          className="relative h-[180px] min-w-0 flex-1 sm:h-[210px]"
          onMouseLeave={() => setHover(null)}
          onMouseMove={(e) => {
            const rect = box.current?.getBoundingClientRect();
            if (!rect) {
              return;
            }
            const f = (e.clientX - rect.left) / rect.width;
            setHover(
              Math.max(
                0,
                Math.min(
                  current.length - 1,
                  Math.round(f * (current.length - 1))
                )
              )
            );
          }}
          ref={box}
        >
          <svg
            className="absolute inset-0 size-full overflow-visible"
            preserveAspectRatio="none"
            viewBox={`0 0 ${W} ${H}`}
          >
            <defs>
              <linearGradient id="ov-area" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#ff496b" stopOpacity="0.28" />
                <stop offset="1" stopColor="#ff496b" stopOpacity="0" />
              </linearGradient>
            </defs>
            {ticks.map((t) => (
              <line
                key={t}
                stroke="#2b2b2b"
                strokeDasharray="2 5"
                vectorEffect="non-scaling-stroke"
                x1="0"
                x2={W}
                y1={y(t)}
                y2={y(t)}
              />
            ))}
            <path d={area} fill="url(#ov-area)" />
            <path
              d={smooth(prev)}
              fill="none"
              stroke="#5c5c5c"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={solid}
              fill="none"
              stroke="#ff496b"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={tail}
              fill="none"
              stroke="#ff496b"
              strokeDasharray="4 4"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
            {hover !== null ? (
              <line
                stroke="#4a4a4a"
                vectorEffect="non-scaling-stroke"
                x1={x(hover)}
                x2={x(hover)}
                y1="0"
                y2={H}
              />
            ) : null}
          </svg>
          {/* The referrer that caused the spike, pinned like the dashboard does. */}
          <span
            className="absolute flex size-[22px] -translate-x-1/2 items-center justify-center rounded-full border border-app-line bg-app-card"
            style={{
              left: `${(SPIKE_INDEX / (current.length - 1)) * 100}%`,
              top: `${(y(current[SPIKE_INDEX]) / H) * 100 - 14}%`,
            }}
          >
            <SourceIcon source="hackernews" />
          </span>
          {hover !== null ? (
            <div
              className="pointer-events-none absolute top-2 z-10 w-[150px] rounded-md border border-app-line bg-app-card/95 p-2.5 text-[11px] shadow-[0_12px_30px_-12px_rgba(0,0,0,0.8)] backdrop-blur-sm"
              style={{
                left: `clamp(0px, calc(${(hover / (current.length - 1)) * 100}% + 10px), calc(100% - 150px))`,
              }}
            >
              <div className="mb-1.5 text-app-muted">
                {VISITORS[hover].label}
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-coral" />
                  Visitors
                </span>
                <span className="tabular font-mono font-semibold">
                  {nf.format(current[hover])}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between text-app-muted">
                <span className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-[#5c5c5c]" />
                  Previous
                </span>
                <span className="tabular font-mono">
                  {nf.format(previous[hover])}
                </span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <div className="mt-2 flex justify-between pl-9 font-mono text-[10px] text-app-muted">
        <span>{VISITORS[0].label}</span>
        <span>{VISITORS[10].label}</span>
        <span>{VISITORS[20].label}</span>
        <span>Today</span>
      </div>
    </div>
  );
}

function TableCard({
  tabs,
  search,
  columns,
  children,
}: {
  tabs: string[];
  search: string;
  columns: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-md border border-app-line bg-app-card">
      <div className="flex gap-4 overflow-hidden whitespace-nowrap px-4 pt-3 pb-2.5 font-medium text-[12px]">
        {tabs.map((tab, i) => (
          <span
            className={i === 0 ? 'text-app-text' : 'text-app-muted'}
            key={tab}
          >
            {tab}
          </span>
        ))}
      </div>
      <div className="flex h-8 items-center gap-2 bg-app-field px-4 text-[12px] text-app-muted">
        <Search className="size-3.5" strokeWidth={1.75} />
        {search}
      </div>
      <div
        className="grid items-center px-4 py-2.5 font-medium text-[10px] uppercase tracking-[0.5px]"
        style={{
          gridTemplateColumns: `minmax(0,1fr) repeat(${columns.length - 1}, 64px)`,
        }}
      >
        {columns.map((col, i) => (
          <span
            className={i === 0 ? '' : 'flex items-center justify-end gap-0.5'}
            key={col}
          >
            {col}
            {i > 0 ? <ChevronDown className="size-2.5 text-app-muted" /> : null}
          </span>
        ))}
      </div>
      {children}
    </div>
  );
}

function RevenueRing({ share }: { share: number }) {
  const c = 2 * Math.PI * 5;
  return (
    <svg aria-hidden className="size-3 -rotate-90" viewBox="0 0 12 12">
      <circle
        cx="6"
        cy="6"
        fill="none"
        r="5"
        stroke="#2c2c2c"
        strokeWidth="1.5"
      />
      <circle
        cx="6"
        cy="6"
        fill="none"
        r="5"
        stroke="#3ccb7f"
        strokeDasharray={`${c * share} ${c}`}
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function ReferrerTable({ rows = REFERRERS.length }: { rows?: number }) {
  const maxSessions = REFERRERS[0].sessions;
  const totalRevenue = REFERRERS.reduce((s, r) => s + (r.revenue ?? 0), 0);
  return (
    <TableCard
      columns={['Referrer name', 'Revenue', 'Views', 'Sess.']}
      search="Search refs"
      tabs={['Refs', 'Urls', 'Types', 'Source', 'Medium', 'Campaign']}
    >
      {REFERRERS.slice(0, rows).map((r) => (
        <div
          className="relative grid h-8 items-center border-app-line border-t px-4 text-[12px]"
          key={r.name}
          style={{ gridTemplateColumns: 'minmax(0,1fr) repeat(3, 64px)' }}
        >
          <span
            className="absolute inset-y-0 right-0 bg-white/[0.035]"
            style={{ width: `${(r.sessions / maxSessions) * 64 + 16}px` }}
          />
          <span className="relative flex min-w-0 items-center gap-2 font-medium">
            <SourceIcon source={r.icon} />
            <span className="truncate">{r.name}</span>
          </span>
          <span className="tabular relative flex items-center justify-end gap-1.5 font-medium text-up">
            {r.revenue ? (
              `$${nf.format(r.revenue)}`
            ) : (
              <span className="text-app-muted">-</span>
            )}
            <RevenueRing share={(r.revenue ?? 0) / totalRevenue} />
          </span>
          <span className="tabular relative text-right font-semibold">
            {nf.format(r.views)}
          </span>
          <span className="tabular relative text-right font-semibold">
            {nf.format(r.sessions)}
          </span>
        </div>
      ))}
    </TableCard>
  );
}

export function PagesTable({ rows = PAGES.length }: { rows?: number }) {
  const max = PAGES[0].views;
  return (
    <TableCard
      columns={['Path', 'Views', 'Sess.']}
      search="Search pages"
      tabs={['Pages', 'Entries', 'Exits']}
    >
      {PAGES.slice(0, rows).map((p) => (
        <div
          className="relative grid h-8 items-center border-app-line border-t px-4 text-[12px]"
          key={p.path}
          style={{ gridTemplateColumns: 'minmax(0,1fr) repeat(2, 64px)' }}
        >
          <span
            className="absolute inset-y-0 left-0 bg-white/[0.03]"
            style={{ width: `${(p.views / max) * 100}%` }}
          />
          <span className="relative truncate font-medium">{p.path}</span>
          <span className="tabular relative text-right font-semibold">
            {nf.format(p.views)}
          </span>
          <span className="tabular relative text-right font-semibold">
            {nf.format(p.sessions)}
          </span>
        </div>
      ))}
      <div className="flex items-center justify-between border-app-line border-t px-4 py-2.5 text-[12px] text-app-muted">
        <ScanEye className="size-3.5" strokeWidth={1.75} />
        <span className="flex items-center gap-1.5">
          <Globe className="size-3.5" strokeWidth={1.75} />
          Show domain
        </span>
      </div>
    </TableCard>
  );
}

/** The Overview page of apps/start, alive: the live count moves and today's numbers tick up. */
export function OverviewView({ active = true }: { active?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { tick } = useLiveTick(ref, 2400, active);
  const live = 16 + ((tick * 7) % 5) - 2;
  const visitorsBump = Math.floor(tick * 0.6);
  return (
    <div className="flex h-full flex-col" ref={ref}>
      <Toolbar live={live} />
      <div className="flex flex-col gap-3 overflow-hidden p-4 [&>*]:shrink-0">
        <KpiGrid live={live} visitorsBump={visitorsBump} />
        <VisitorsChart todayBump={visitorsBump * 4} />
        <div className="grid gap-3 lg:grid-cols-2">
          <ReferrerTable />
          <PagesTable rows={7} />
        </div>
      </div>
    </div>
  );
}

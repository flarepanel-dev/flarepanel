'use client';

// The rest of the project pages of apps/start, as they look with a few weeks
// of sample data: what a visitor sees when they click around the sidebar.
import {
  ArrowDown,
  ArrowUp,
  Bot,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  Copy,
  Filter,
  Mail,
  Plus,
  Radio,
  SlidersHorizontal,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Webhook,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { type ReactNode, useRef } from 'react';
import { Avatar, FlagIcon, OsIcon } from './glyphs';
import { EVENT_COLORS, flagOf, LIVE_EVENTS, nf, VISITORS } from './sample-data';
import { useLiveTick } from './use-live';

const btn =
  'flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-app-line bg-app-card px-2.5 text-[12.5px] text-app-text';
const label =
  'font-medium text-[10px] text-app-muted uppercase tracking-[0.5px]';

function Page({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden px-5 pt-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-semibold text-[17px] tracking-[-0.01em]">
            {title}
          </div>
          <div className="text-[12px] text-app-muted">{subtitle}</div>
        </div>
        {actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
      </div>
      <div className="mt-4 flex min-h-0 flex-1 flex-col gap-3 overflow-hidden pb-5">
        {children}
      </div>
    </div>
  );
}

function Tabs({ items }: { items: string[] }) {
  return (
    <div className="flex gap-1 overflow-hidden">
      {items.map((t, i) => (
        <span
          className={`h-8 shrink-0 rounded-md px-3 font-medium text-[12.5px] leading-8 ${
            i === 0 ? 'bg-app-field text-app-text' : 'text-app-muted'
          }`}
          key={t}
        >
          {t}
        </span>
      ))}
    </div>
  );
}

function Table({
  columns,
  template,
  rows,
}: {
  columns: string[];
  template: string;
  rows: ReactNode[][];
}) {
  return (
    <div className="overflow-hidden rounded-md border border-app-line">
      <div
        className={`grid h-9 items-center gap-3 border-app-line border-b bg-app-card px-4 ${label} text-app-text`}
        style={{ gridTemplateColumns: template }}
      >
        {columns.map((c) => (
          <span className="truncate" key={c}>
            {c}
          </span>
        ))}
      </div>
      {rows.map((cells, r) => (
        <div
          className="grid h-[38px] items-center gap-3 whitespace-nowrap border-app-line border-b px-4 text-[12px] last:border-b-0"
          // biome-ignore lint/suspicious/noArrayIndexKey: static rows
          key={r}
          style={{ gridTemplateColumns: template }}
        >
          {cells.map((cell, c) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed columns
            <span
              className="flex min-w-0 items-center gap-1.5 truncate"
              key={c}
            >
              {cell}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

function Spark({
  seed,
  up = true,
  color = '#6b79ea',
}: {
  seed: number;
  up?: boolean;
  color?: string;
}) {
  const pts = VISITORS.slice(seed % 6, (seed % 6) + 14).map(
    (d, i) => d.value * (up ? 0.6 + i * 0.03 : 1.1 - i * 0.025)
  );
  const max = Math.max(...pts);
  const min = Math.min(...pts);
  const d = pts
    .map(
      (v, i) =>
        `${i ? 'L' : 'M'}${(i / (pts.length - 1)) * 60},${18 - ((v - min) / (max - min || 1)) * 16}`
    )
    .join(' ');
  return (
    <svg className="h-5 w-[60px] shrink-0" viewBox="0 0 60 20">
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

/** A change with its direction; colour says good or bad (lower latency is good). */
function Change({
  value,
  good = value >= 0,
}: {
  value: number;
  good?: boolean;
}) {
  const Arrow = value >= 0 ? ArrowUp : ArrowDown;
  return (
    <span
      className={`flex items-center gap-0.5 font-medium text-[11px] ${good ? 'text-up' : 'text-crimson'}`}
    >
      <Arrow className="size-3" strokeWidth={2.25} />
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

function EventName({ name }: { name: string }) {
  const color = EVENT_COLORS[name] ?? '#a6a6a6';
  return (
    <span className="flex items-center gap-1.5 font-mono text-[11.5px]">
      <span
        className="size-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {name}
    </span>
  );
}

/* ---------------------------------------------------------------- Dashboards */

export function DashboardsView() {
  const boards = [
    { name: 'Marketing', reports: 6, updated: '2 hours ago', bars: 1 },
    { name: 'Product health', reports: 9, updated: 'yesterday', bars: 2 },
    { name: 'Revenue', reports: 4, updated: '3 days ago', bars: 3 },
    { name: 'Launch week', reports: 5, updated: 'Nov 15', bars: 4 },
    { name: 'Docs', reports: 3, updated: 'Nov 12', bars: 5 },
    { name: 'Onboarding', reports: 7, updated: 'Nov 9', bars: 6 },
  ];
  return (
    <Page
      actions={
        <span
          className={`${btn} border-transparent bg-paper font-medium text-ink`}
        >
          <Plus className="size-3.5" />
          Create dashboard
        </span>
      }
      subtitle="Access all your dashboards here"
      title="Dashboards"
    >
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-2">
        {boards.map((b) => (
          <div
            className="rounded-md border border-app-line bg-app-card p-4"
            key={b.name}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-[13px]">{b.name}</span>
              <span className="text-[11px] text-app-muted">
                {b.reports} reports
              </span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[0, 1, 2].map((t) => (
                <div
                  className="h-[74px] rounded-[5px] border border-app-line bg-app-bg p-2"
                  key={t}
                >
                  <div className="h-1.5 w-1/2 rounded bg-app-field" />
                  <div className="mt-2 flex h-[42px] items-end gap-[2px]">
                    {VISITORS.slice(t * 3 + b.bars, t * 3 + b.bars + 12).map(
                      (d, i) => (
                        <span
                          className="flex-1 rounded-t-[1px]"
                          // biome-ignore lint/suspicious/noArrayIndexKey: fixed series
                          key={i}
                          style={{
                            height: `${Math.min(100, (d.value / 620) * 100)}%`,
                            backgroundColor: ['#6b79ea', '#08b6af', '#e9ab2b'][
                              t
                            ],
                            opacity: 0.85,
                          }}
                        />
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-[11px] text-app-muted">
              Updated {b.updated}
            </div>
          </div>
        ))}
      </div>
    </Page>
  );
}

/* ------------------------------------------------------------------ Insights */

export function InsightsView() {
  const items = [
    {
      title: 'Hacker News sent 4.2× more visitors than usual',
      dim: 'referrer',
      window: 'yesterday',
      sev: 'High',
      up: true,
      summary:
        'A post reached the front page; 62% of these visitors read /blog/edge-analytics first.',
    },
    {
      title: 'Sign-ups from Germany up 38% this week',
      dim: 'country',
      window: 'rolling 7d',
      sev: 'Medium',
      up: true,
      summary: 'Most came from the docs; conversion on /signup held at 6.1%.',
    },
    {
      title: 'Mobile bounce rate rose to 58%',
      dim: 'device',
      window: 'rolling 7d',
      sev: 'Medium',
      up: false,
      summary:
        'Started after Tuesday’s release; /pricing on iOS loads 1.4s slower.',
    },
    {
      title: '/docs/self-hosting is a new top-5 page',
      dim: 'page',
      window: 'rolling 30d',
      sev: 'Low',
      up: true,
      summary: 'Visits grew 3× since it was linked from the README.',
    },
    {
      title: 'Checkout conversion up 1.8 points',
      dim: 'conversion',
      window: 'rolling 7d',
      sev: 'Medium',
      up: true,
      summary:
        'The shorter pricing form is live; drop-off at step 2 fell from 41% to 33%.',
    },
    {
      title: 'Returning visitors at a 30-day high',
      dim: 'retention',
      window: 'rolling 30d',
      sev: 'Low',
      up: true,
      summary: '41% of this week’s visitors had been here before, up from 34%.',
    },
    {
      title: 'Safari sessions are 30% shorter',
      dim: 'browser',
      window: 'rolling 7d',
      sev: 'Low',
      up: false,
      summary: 'The video embed on /changelog fails to load in Safari 19.',
    },
    {
      title: 'Newsletter traffic down 22%',
      dim: 'referrer',
      window: 'rolling 7d',
      sev: 'Low',
      up: false,
      summary:
        'Issue #13 went out a day later than usual; clicks recovered by Friday.',
    },
  ];
  return (
    <Page
      subtitle="Discover trends and changes in your analytics"
      title="Insights"
    >
      <div className="flex flex-wrap gap-2">
        {['All windows', 'All severities', 'All directions'].map((f) => (
          <span className={btn} key={f}>
            {f}
            <ChevronDown className="size-3 text-app-muted" />
          </span>
        ))}
        <span className={btn}>
          <Sparkles className="size-3.5" strokeWidth={1.75} />
          Relevance (AI)
        </span>
      </div>
      <div className="grid gap-3 xl:grid-cols-2">
        {items.map((it, i) => (
          <div
            className="rounded-md border border-app-line bg-app-card p-3.5"
            key={it.title}
          >
            <div className="flex items-center gap-2 text-[10.5px] text-app-muted">
              <span
                className={`rounded px-1.5 py-px font-medium ${
                  it.sev === 'High'
                    ? 'bg-chart-amber/15 text-chart-amber'
                    : 'bg-app-field text-app-nav'
                }`}
              >
                {it.sev}
              </span>
              <span className="font-mono">{it.dim}</span>·
              <span>{it.window}</span>
              {it.up ? (
                <TrendingUp
                  className="ml-auto size-4 text-up"
                  strokeWidth={1.75}
                />
              ) : (
                <TrendingDown
                  className="ml-auto size-4 text-crimson"
                  strokeWidth={1.75}
                />
              )}
            </div>
            <div className="mt-2 font-medium text-[13px] leading-snug">
              {it.title}
            </div>
            <div className="mt-1.5 flex items-end justify-between gap-3">
              <p className="text-[11.5px] text-app-muted leading-[1.5]">
                {it.summary}
              </p>
              <Spark
                color={it.up ? '#6b79ea' : '#f0605d'}
                seed={i + 2}
                up={it.up}
              />
            </div>
          </div>
        ))}
      </div>
    </Page>
  );
}

/* --------------------------------------------------------------- AI analytics */

export function AiView() {
  const kpis = [
    ['Cost', '$41.20', 12.1],
    ['Calls', '12,480', 8.4],
    ['Tokens', '18.4M', 10.2],
    ['p95 latency', '2.1s', -6.3],
    ['Errors', '0.4%', -1.2],
  ] as const;
  const models = [
    ['gpt-5.4-mini', 18.4, '#6b79ea'],
    ['claude-haiku-5-5', 11.9, '#08b6af'],
    ['gpt-6.1-sol', 7.6, '#e9ab2b'],
    ['claude-sonnet-5-5', 3.3, '#a064db'],
  ] as const;
  return (
    <Page
      subtitle="Cost, tokens, latency and traces of your app's AI calls"
      title="AI"
    >
      <div className="grid grid-cols-5 overflow-hidden rounded-md border border-app-line">
        {kpis.map(([k, v, d], i) => (
          <div
            className={`bg-app-bg px-3 py-2.5 ${i < 4 ? 'border-app-line border-r' : ''}`}
            key={k}
          >
            <div className="flex items-center justify-between">
              <span className={label}>{k}</span>
              <Change
                good={k === 'Errors' || k === 'p95 latency' ? d < 0 : d >= 0}
                value={d}
              />
            </div>
            <div className="tabular mt-0.5 font-mono font-semibold text-[18px]">
              {v}
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-md border border-app-line bg-app-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className={label}>Cost per day</span>
          <span className="font-mono text-[11px] text-app-muted">
            last 30 days
          </span>
        </div>
        <div className="flex h-[120px] items-end gap-[3px]">
          {VISITORS.map((d, i) => (
            <span
              className="flex-1 rounded-t-[2px]"
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed series
              key={i}
              style={{
                height: `${Math.min(100, (d.value / 600) * 100)}%`,
                backgroundColor: i % 7 === 3 ? '#08b6af' : '#6b79ea',
              }}
            />
          ))}
        </div>
      </div>
      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="overflow-hidden rounded-md border border-app-line">
          <div
            className={`flex h-9 items-center border-app-line border-b bg-app-card px-4 ${label} text-app-text`}
          >
            Recent traces
          </div>
          {[
            ['chat.answer', 'gpt-5.4-mini', '1.4s', '3,210', '$0.0041'],
            [
              'summarize.ticket',
              'claude-haiku-5-5',
              '0.8s',
              '1,804',
              '$0.0012',
            ],
            ['search.rerank', 'gpt-5.4-mini', '0.4s', '920', '$0.0007'],
            ['chat.answer', 'gpt-6.1-sol', '3.2s', '6,480', '$0.0352'],
            ['agent.plan', 'claude-sonnet-5-5', '2.6s', '4,112', '$0.0191'],
            [
              'summarize.ticket',
              'claude-haiku-5-5',
              '0.7s',
              '1,522',
              '$0.0010',
            ],
            ['search.rerank', 'gpt-5.4-mini', '0.5s', '1,040', '$0.0008'],
            ['chat.answer', 'gpt-5.4-mini', '1.1s', '2,870', '$0.0036'],
            ['agent.plan', 'claude-sonnet-5-5', '2.9s', '4,530', '$0.0210'],
            ['classify.feedback', 'gpt-5.4-nano', '0.3s', '610', '$0.0002'],
          ].map(([name, model, ms, tokens, cost], i) => (
            <div
              className="grid h-[38px] grid-cols-[minmax(0,1fr)_130px_56px_64px_70px] items-center gap-3 border-app-line border-b px-4 text-[12px] last:border-b-0"
              // biome-ignore lint/suspicious/noArrayIndexKey: static rows
              key={i}
            >
              <span className="flex items-center gap-2 truncate font-mono text-[11.5px]">
                <Bot
                  className="size-3.5 shrink-0 text-app-muted"
                  strokeWidth={1.75}
                />
                {name}
              </span>
              <span className="truncate font-mono text-[11px] text-app-muted">
                {model}
              </span>
              <span className="tabular text-right font-mono text-[11px]">
                {ms}
              </span>
              <span className="tabular text-right font-mono text-[11px]">
                {tokens}
              </span>
              <span className="tabular text-right font-mono text-[11px] text-up">
                {cost}
              </span>
            </div>
          ))}
        </div>
        <div className="hidden rounded-md border border-app-line bg-app-card p-3.5 lg:block">
          <div className={label}>Cost by model</div>
          {models.map(([m, cost, color]) => (
            <div className="mt-3" key={m}>
              <div className="flex justify-between text-[11.5px]">
                <span className="font-mono">{m}</span>
                <span className="tabular font-mono">${cost.toFixed(2)}</span>
              </div>
              <div className="mt-1.5 h-1.5 rounded-full bg-app-field">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(cost / 18.4) * 100}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Page>
  );
}

/* --------------------------------------------------------------------- Pages */

export function PagesView() {
  const rows = [
    ['Home', '/', 9812, 4120, 18.9, '11%', '2m 30s', '8,420', '5.0%', '421'],
    [
      'Pricing, plans and FAQ',
      '/pricing',
      4206,
      2310,
      21.2,
      '8%',
      '1m 53s',
      '—',
      '—',
      '—',
    ],
    [
      'Quickstart',
      '/docs/quickstart',
      3118,
      1402,
      15.0,
      '4%',
      '3m 05s',
      '5,610',
      '4.0%',
      '224',
    ],
    [
      'Edge analytics, explained',
      '/blog/edge-analytics',
      2240,
      1180,
      54.5,
      '23%',
      '2m 53s',
      '12,900',
      '3.1%',
      '399',
    ],
    [
      'Changelog',
      '/changelog',
      1402,
      690,
      -4.2,
      '31%',
      '1m 12s',
      '—',
      '—',
      '—',
    ],
    ['Sign up', '/signup', 1180, 1020, 12.3, '6%', '2m 31s', '—', '—', '—'],
    [
      'Self-hosting',
      '/docs/self-hosting',
      860,
      410,
      210.4,
      '9%',
      '4m 40s',
      '1,980',
      '6.2%',
      '123',
    ],
    [
      'Durable Objects, explained',
      '/blog/durable-objects',
      744,
      352,
      33.0,
      '19%',
      '3m 48s',
      '6,210',
      '2.7%',
      '168',
    ],
    [
      'Install the SDK',
      '/docs/install',
      702,
      388,
      8.7,
      '5%',
      '2m 02s',
      '2,140',
      '4.4%',
      '94',
    ],
    [
      'Team settings',
      '/settings/team',
      640,
      302,
      4.1,
      '2%',
      '1m 31s',
      '—',
      '—',
      '—',
    ],
    ['About', '/about', 512, 401, -9.6, '44%', '0m 48s', '890', '3.0%', '27'],
    [
      'Customers',
      '/customers',
      488,
      362,
      2.2,
      '28%',
      '1m 05s',
      '1,204',
      '2.1%',
      '25',
    ],
  ] as const;
  return (
    <Page
      actions={
        <>
          <span className={btn}>
            <Calendar className="size-3.5" strokeWidth={1.75} />
            Last 30 days
          </span>
          <span className={btn}>
            <SlidersHorizontal className="size-3.5" strokeWidth={1.75} />
            View
          </span>
        </>
      }
      subtitle="Access all your pages here"
      title="Pages"
    >
      <Table
        columns={[
          'Page',
          'Trend',
          'Views',
          'Sessions',
          'Bounce',
          'Duration',
          'Impr.',
          'CTR',
          'Clicks',
        ]}
        rows={rows.map(
          (
            [
              title,
              path,
              views,
              sessions,
              change,
              bounce,
              dur,
              impr,
              ctr,
              clicks,
            ],
            i
          ) => [
            <span className="flex min-w-0 flex-col leading-tight" key="p">
              <span className="truncate font-medium">{title}</span>
              <span className="truncate font-mono text-[10.5px] text-app-muted">
                {path}
              </span>
            </span>,
            <Spark
              color={change >= 0 ? '#6b79ea' : '#f0605d'}
              key="t"
              seed={i}
              up={change >= 0}
            />,
            <span className="tabular font-semibold" key="v">
              {nf.format(views)}
            </span>,
            <span
              className="tabular flex items-center gap-1.5 font-semibold"
              key="s"
            >
              {nf.format(sessions)} <Change value={change} />
            </span>,
            <span key="b">{bounce}</span>,
            <span key="d">{dur}</span>,
            <span className="tabular" key="i">
              {impr}
            </span>,
            <span key="c">{ctr}</span>,
            <span className="tabular" key="k">
              {clicks}
            </span>,
          ]
        )}
        template="minmax(0,1.6fr) 64px 60px 110px 52px 64px 56px 44px 48px"
      />
    </Page>
  );
}

/* ----------------------------------------------------------------------- SEO */

export function SeoView() {
  const kpis = [
    ['Clicks', '1,167', 51.9],
    ['Impressions', '29,410', 34.4],
    ['Avg CTR', '4.0%', 6.2],
    ['Avg position', '8.3', 8.8],
  ] as const;
  const W = 600;
  const H = 120;
  const clicks = VISITORS.map((d) => d.value * 0.16);
  const impr = VISITORS.map((d) => d.value * 0.3 + 30);
  const max = Math.max(...impr);
  const line = (vals: number[]) =>
    vals
      .map(
        (v, i) =>
          `${i ? 'L' : 'M'}${(i / (vals.length - 1)) * W},${H - (v / max) * H}`
      )
      .join(' ');
  return (
    <Page subtitle="Search performance for sc-domain:acme.dev" title="SEO">
      <div className="grid grid-cols-4 overflow-hidden rounded-md border border-app-line">
        {kpis.map(([k, v, d], i) => (
          <div
            className={`bg-app-bg px-3 py-2.5 ${i < 3 ? 'border-app-line border-r' : ''}`}
            key={k}
          >
            <div className="flex items-center justify-between">
              <span className={label}>{k}</span>
              <Change value={d} />
            </div>
            <div className="tabular mt-0.5 font-mono font-semibold text-[18px]">
              {v}
            </div>
            <div className="text-[11px] text-app-muted">Total</div>
          </div>
        ))}
      </div>
      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-md border border-app-line bg-app-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className={label}>Clicks &amp; impressions</span>
            <span className="flex gap-3 text-[11px] text-app-muted">
              <span className="flex items-center gap-1.5">
                <span className="h-[2px] w-3 rounded bg-chart-indigo" />
                Clicks
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-[2px] w-3 rounded bg-chart-teal" />
                Impressions
              </span>
            </span>
          </div>
          <svg
            className="h-[300px] w-full"
            preserveAspectRatio="none"
            viewBox={`0 0 ${W} ${H}`}
          >
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
            <path
              d={line(impr)}
              fill="none"
              stroke="#08b6af"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={line(clicks)}
              fill="none"
              stroke="#6b79ea"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
        <div className="hidden overflow-hidden rounded-md border border-app-line lg:block">
          <div
            className={`grid h-9 grid-cols-[minmax(0,1fr)_48px_44px] items-center gap-2 border-app-line border-b bg-app-card px-3 ${label} text-app-text`}
          >
            <span>Query</span>
            <span className="text-right">Clicks</span>
            <span className="text-right">Pos.</span>
          </div>
          {[
            ['cloudflare analytics', 212, 3.1],
            ['openpanel alternative', 164, 2.4],
            ['self hosted analytics', 121, 6.8],
            ['durable objects analytics', 88, 1.9],
            ['privacy analytics edge', 61, 9.2],
            ['posthog cloudflare', 44, 11.4],
            ['analytics on workers', 39, 4.2],
            ['gdpr analytics', 31, 12.8],
            ['open source product analytics', 28, 14.1],
          ].map(([q, c, p]) => (
            <div
              className="grid h-[36px] grid-cols-[minmax(0,1fr)_48px_44px] items-center gap-2 border-app-line border-b px-3 text-[12px] last:border-b-0"
              key={q as string}
            >
              <span className="truncate">{q}</span>
              <span className="tabular text-right font-semibold">{c}</span>
              <span className="tabular text-right font-mono text-[11px] text-app-muted">
                {p}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Page>
  );
}

/* -------------------------------------------------------------------- Events */

export function EventsView({ active = true }: { active?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { tick } = useLiveTick(ref, 2000, active);
  const rows = Array.from({ length: 16 }, (_, i) => {
    const n = tick - i + LIVE_EVENTS.length * 10;
    const e = LIVE_EVENTS[n % LIVE_EVENTS.length];
    return { ...e, id: tick - i, age: i };
  });
  const browsers = ['Chrome', 'Safari', 'Firefox', 'Arc', 'Edge'];
  const oses = ['macos', 'ios', 'windows', 'android'] as const;
  return (
    <div className="h-full" ref={ref}>
      <Page
        actions={
          <span className={`${btn} text-up`}>
            <Radio className="size-3.5" strokeWidth={1.75} />
            Listening
          </span>
        }
        subtitle="Paginate through your events, conversions and overall stats"
        title="Events"
      >
        <div className="flex items-center gap-2">
          <Tabs items={['Events', 'Conversions', 'Stats']} />
          <span className={`${btn} ml-auto`}>
            <Calendar className="size-3.5" strokeWidth={1.75} />
            Date range
          </span>
          <span className={btn}>
            <Filter className="size-3.5" strokeWidth={1.75} />
            Filters
          </span>
        </div>
        <div className="overflow-hidden rounded-md border border-app-line">
          <div
            className={`grid h-9 grid-cols-[96px_minmax(0,1fr)_minmax(0,0.8fr)_120px_100px_80px] items-center gap-3 border-app-line border-b bg-app-card px-4 ${label} text-app-text`}
          >
            <span>Created at</span>
            <span>Name</span>
            <span>Profile</span>
            <span>Country</span>
            <span>OS</span>
            <span>Browser</span>
          </div>
          <AnimatePresence initial={false}>
            {rows.map((r) => (
              <motion.div
                animate={{ opacity: 1, backgroundColor: 'rgba(107,121,234,0)' }}
                className="grid h-[36px] grid-cols-[96px_minmax(0,1fr)_minmax(0,0.8fr)_120px_100px_80px] items-center gap-3 whitespace-nowrap border-app-line border-b px-4 text-[12px]"
                initial={{
                  opacity: 0,
                  backgroundColor: 'rgba(107,121,234,0.12)',
                }}
                key={r.id}
                layout
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="text-app-muted">
                  {r.age === 0 ? 'just now' : `${r.age * 2}s ago`}
                </span>
                <span className="flex min-w-0 items-center gap-2">
                  <EventName name={r.name} />
                  <span className="truncate font-mono text-[10.5px] text-app-muted">
                    {r.path}
                  </span>
                </span>
                <span className="flex min-w-0 items-center gap-2">
                  <Avatar seed={Math.abs(r.id)} size={16} />
                  <span className="truncate">
                    {Math.abs(r.id) % 4 === 0 ? 'Maya Chen' : 'Anonymous'}
                  </span>
                </span>
                <span className="flex items-center gap-1.5 truncate">
                  <FlagIcon flag={flagOf(r.city)} />
                  {r.city}
                </span>
                <span className="flex items-center gap-1.5">
                  <OsIcon os={oses[Math.abs(r.id) % 4]} />
                  {['macOS', 'iOS', 'Windows', 'Android'][Math.abs(r.id) % 4]}
                </span>
                <span className="truncate">
                  {browsers[Math.abs(r.id) % browsers.length]}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </Page>
    </div>
  );
}

/* -------------------------------------------------------------------- Groups */

export function GroupsView() {
  const rows = [
    ['Acme Corp', 'acme', 'company', 24, '2 min ago', 'Oct 12'],
    ['Globex', 'globex', 'company', 11, '1 hour ago', 'Oct 19'],
    ['Initech', 'initech', 'company', 8, 'yesterday', 'Nov 2'],
    ['Engineering', 'eng', 'team', 6, '5 min ago', 'Oct 12'],
    ['Growth', 'growth', 'team', 4, '3 hours ago', 'Oct 26'],
    ['Umbrella', 'umbrella', 'company', 3, '2 days ago', 'Nov 9'],
    ['Design', 'design', 'team', 3, 'yesterday', 'Nov 16'],
    ['Hooli', 'hooli', 'company', 9, '20 min ago', 'Oct 14'],
    ['Stark Labs', 'stark', 'company', 7, '4 hours ago', 'Oct 30'],
    ['Support', 'support', 'team', 5, '1 hour ago', 'Nov 1'],
    ['Wayne & Co', 'wayne', 'company', 2, '3 days ago', 'Nov 18'],
    ['Data', 'data', 'team', 2, 'yesterday', 'Nov 20'],
  ] as const;
  return (
    <Page
      actions={
        <span
          className={`${btn} border-transparent bg-paper font-medium text-ink`}
        >
          <Plus className="size-3.5" />
          Add group
        </span>
      }
      subtitle="Groups represent companies, teams, or other entities that events belong to."
      title="Groups"
    >
      <Table
        columns={['Name', 'ID', 'Type', 'Members', 'Last active', 'Created']}
        rows={rows.map(([name, id, type, members, last, created], i) => [
          <span className="flex items-center gap-2 font-medium" key="n">
            <Avatar seed={i + 1} size={16} />
            {name}
          </span>,
          <span className="font-mono text-[11px] text-app-muted" key="i">
            {id}
          </span>,
          <span
            className="rounded bg-app-field px-1.5 py-px text-[11px]"
            key="t"
          >
            {type}
          </span>,
          <span className="tabular font-semibold" key="m">
            {members}
          </span>,
          <span className="text-app-muted" key="l">
            {last}
          </span>,
          <span className="text-app-muted" key="c">
            {created}
          </span>,
        ])}
        template="minmax(0,1.3fr) 90px 90px 70px 110px 80px"
      />
    </Page>
  );
}

/* ------------------------------------------------------------------- Cohorts */

export function CohortsView() {
  const cohorts = [
    {
      name: 'Buyers 7d',
      members: 84,
      rule: 'did purchase in the last 7 days',
      updated: 'Nov 24, 13:20',
    },
    {
      name: 'Power users',
      members: 312,
      rule: 'did screen_view ≥ 20 times in 30 days',
      updated: 'Nov 24, 12:05',
    },
    {
      name: 'Churn risk',
      members: 57,
      rule: 'was active 30–60 days ago, not since',
      updated: 'Nov 24, 09:40',
    },
    {
      name: 'Came from Hacker News',
      members: 1206,
      rule: 'first referrer is news.ycombinator.com',
      updated: 'Nov 23, 22:11',
    },
    {
      name: 'Team plan trials',
      members: 143,
      rule: 'plan is team and trial is true',
      updated: 'Nov 23, 18:02',
    },
    {
      name: 'Docs readers',
      members: 2410,
      rule: 'did screen_view where path starts with /docs',
      updated: 'Nov 23, 14:45',
    },
  ];
  return (
    <Page
      actions={
        <span
          className={`${btn} border-transparent bg-paper font-medium text-ink`}
        >
          <Plus className="size-3.5" />
          Create cohort
        </span>
      }
      subtitle="Create and manage user segments based on events and properties"
      title="Cohorts"
    >
      <div className="grid gap-3 xl:grid-cols-2">
        {cohorts.map((c, i) => (
          <div
            className="rounded-md border border-app-line bg-app-card p-3.5"
            key={c.name}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-[13px]">{c.name}</span>
              <span className="tabular font-mono font-semibold text-[13px]">
                {nf.format(c.members)}{' '}
                <span className="font-normal text-[11px] text-app-muted">
                  members
                </span>
              </span>
            </div>
            <div className="mt-1.5 font-mono text-[11px] text-app-muted">
              {c.rule}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="flex -space-x-1">
                {[0, 1, 2, 3, 4].map((a) => (
                  <span className="rounded-[4px] ring-2 ring-app-card" key={a}>
                    <Avatar seed={i + a} size={18} />
                  </span>
                ))}
              </span>
              <span className="text-[11px] text-app-muted">
                Updated {c.updated}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Page>
  );
}

/* ------------------------------------------------------------------ Settings */

function Toggle({ on }: { on: boolean }) {
  return (
    <span
      className={`flex h-[18px] w-8 shrink-0 items-center rounded-full p-0.5 ${on ? 'bg-app-text' : 'bg-app-field'}`}
    >
      <span
        className={`size-[14px] rounded-full transition-transform ${on ? 'translate-x-[14px] bg-app-bg' : 'bg-app-muted'}`}
      />
    </span>
  );
}

export function SettingsView() {
  const field =
    'flex h-8 items-center rounded-md border border-app-line bg-app-bg px-3 text-[12.5px]';
  return (
    <Page subtitle="Manage your project settings here" title="Project settings">
      <Tabs
        items={[
          'Details',
          'Events',
          'Clients / API keys',
          'Tracking script',
          'MCP',
          'Widgets',
          'Imports',
          'Google Search',
          'AI',
        ]}
      />
      <div className="max-w-[640px] rounded-md border border-app-line bg-app-card p-4">
        <div className="font-medium text-[13px]">Details</div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <div className="mb-1 text-[11.5px] text-app-muted">Name</div>
            <div className={field}>Acme Website</div>
          </div>
          <div>
            <div className="mb-1 text-[11.5px] text-app-muted">Domain</div>
            <div className={`${field} font-mono text-[11.5px]`}>
              https://acme.dev
            </div>
          </div>
        </div>
        <div className="mt-3 mb-1 text-[11.5px] text-app-muted">
          Allowed domains
        </div>
        <div className={`${field} gap-1.5`}>
          {[
            'https://acme.dev',
            'https://docs.acme.dev',
            'https://app.acme.dev',
          ].map((d) => (
            <span
              className="rounded bg-app-field px-1.5 py-px font-mono text-[10.5px]"
              key={d}
            >
              {d}
            </span>
          ))}
        </div>
        {[
          [
            'Cross domain support',
            'Track users across your marketing site, docs and app.',
            true,
          ],
          [
            'Revenue tracking from client code',
            'Allow revenue events sent from the browser.',
            false,
          ],
          [
            'Session replay',
            'Record sessions to replay them later. Inputs are masked.',
            true,
          ],
        ].map(([t, d, on]) => (
          <div
            className="mt-3 flex items-center justify-between gap-4 border-app-line border-t pt-3"
            key={t as string}
          >
            <div>
              <div className="text-[12.5px]">{t}</div>
              <div className="text-[11.5px] text-app-muted">{d}</div>
            </div>
            <Toggle on={on as boolean} />
          </div>
        ))}
        <div className="mt-4 flex justify-end">
          <span
            className={`${btn} border-transparent bg-paper font-medium text-ink`}
          >
            Save
          </span>
        </div>
      </div>
    </Page>
  );
}

/* ---------------------------------------------------------------- References */

export function ReferencesView() {
  const rows = [
    ['Launched on Hacker News', 'Nov 14, 2026', 'marketing'],
    ['Pricing page redesign', 'Nov 6, 2026', 'website'],
    ['v2.0 release', 'Oct 30, 2026', 'product'],
    ['Newsletter #12 sent', 'Oct 28, 2026', 'marketing'],
    ['Docs moved to docs.acme.dev', 'Oct 21, 2026', 'website'],
    ['Black Friday campaign starts', 'Nov 27, 2026', 'marketing'],
    ['New onboarding checklist', 'Oct 15, 2026', 'product'],
    ['Paid search paused', 'Oct 9, 2026', 'marketing'],
    ['EU region launched', 'Oct 2, 2026', 'product'],
    ['Status: API incident (14 min)', 'Sep 26, 2026', 'ops'],
  ];
  return (
    <Page
      actions={
        <span
          className={`${btn} border-transparent bg-paper font-medium text-ink`}
        >
          <Plus className="size-3.5" />
          Create reference
        </span>
      }
      subtitle="References keep track of important moments. They show up in your reports."
      title="References"
    >
      <Table
        columns={['Title', 'Date', 'Tag', 'Created at']}
        rows={rows.map(([t, d, tag]) => [
          <span className="font-medium" key="t">
            {t}
          </span>,
          <span className="font-mono text-[11px]" key="d">
            {d}
          </span>,
          <span
            className="rounded bg-app-field px-1.5 py-px text-[11px]"
            key="g"
          >
            {tag}
          </span>,
          <span className="text-app-muted" key="c">
            {d}
          </span>,
        ])}
        template="minmax(0,1.5fr) 120px 100px 120px"
      />
    </Page>
  );
}

/* ------------------------------------------------------------- Notifications */

export function NotificationsView() {
  const rows = [
    [
      'New sign-up from Acme Corp',
      'Slack',
      'de',
      'macos',
      'Chrome',
      'Maya Chen',
      '2 min ago',
    ],
    [
      'Checkout started over $500',
      'Webhook',
      'us',
      'windows',
      'Edge',
      'Leo Park',
      '18 min ago',
    ],
    [
      'Funnel: pricing to sign_up completed',
      'Discord',
      'gb',
      'ios',
      'Safari',
      'Anonymous',
      '42 min ago',
    ],
    [
      'New sign-up from Globex',
      'Slack',
      'se',
      'macos',
      'Arc',
      'Sam Ortiz',
      '1 hour ago',
    ],
    [
      'Error rate above 2%',
      'Email',
      'jp',
      'android',
      'Chrome',
      'Anonymous',
      '3 hours ago',
    ],
    [
      'New sign-up from Initech',
      'Slack',
      'in',
      'windows',
      'Chrome',
      'Priya N.',
      '5 hours ago',
    ],
    [
      'Checkout started over $500',
      'Webhook',
      'br',
      'macos',
      'Safari',
      'Anonymous',
      '7 hours ago',
    ],
    [
      'Funnel: pricing to sign_up completed',
      'Discord',
      'pt',
      'ios',
      'Safari',
      'Anonymous',
      'yesterday',
    ],
    [
      'New sign-up from Hooli',
      'Slack',
      'us',
      'macos',
      'Chrome',
      'Dan R.',
      'yesterday',
    ],
    [
      'Daily digest sent',
      'Email',
      'de',
      'macos',
      'Chrome',
      'Maya Chen',
      'yesterday',
    ],
  ] as const;
  return (
    <Page
      subtitle="See notifications and manage the rules that send them"
      title="Notifications"
    >
      <Tabs items={['Notifications', 'Rules']} />
      <Table
        columns={[
          'Title',
          'Integration',
          'Country',
          'OS',
          'Browser',
          'Profile',
          'Created at',
        ]}
        rows={rows.map(([t, integ, flag, os, browser, profile, at], i) => [
          <span className="font-medium" key="t">
            {t}
          </span>,
          <span
            className="rounded bg-app-field px-1.5 py-px text-[11px]"
            key="i"
          >
            {integ}
          </span>,
          <FlagIcon flag={flag} key="c" />,
          <OsIcon key="o" os={os} />,
          <span key="b">{browser}</span>,
          <span className="flex items-center gap-1.5" key="p">
            <Avatar seed={i + 2} size={16} />
            {profile}
          </span>,
          <span className="text-app-muted" key="a">
            {at}
          </span>,
        ])}
        template="minmax(0,1.6fr) 90px 60px 40px 70px 120px 90px"
      />
    </Page>
  );
}

/* -------------------------------------------------------------- Integrations */

export function IntegrationsView() {
  const items = [
    {
      name: 'Slack',
      body: 'Send notifications to a channel.',
      installed: true,
      tile: '#4a154b',
      mark: 'S',
    },
    {
      name: 'Google Search Console',
      body: 'Clicks, impressions and positions per page.',
      installed: true,
      tile: '#ffffff',
      mark: 'G',
    },
    {
      name: 'Discord',
      body: 'Post notifications to a server channel.',
      installed: false,
      tile: '#5865f2',
      mark: 'D',
    },
    {
      name: 'Webhook',
      body: 'POST events to your own endpoint, with a JavaScript transform.',
      installed: false,
      tile: '#232323',
      icon: true,
    },
    {
      name: 'Amazon S3 export',
      body: 'Copy raw events to your bucket every hour.',
      installed: false,
      tile: '#e9ab2b',
      mark: 'S3',
    },
    {
      name: 'Google Cloud Storage',
      body: 'The same hourly export, to a GCS bucket.',
      installed: false,
      tile: '#4cb0e5',
      mark: 'GCS',
    },
    {
      name: 'Email digest',
      body: 'A weekly summary with the week’s insights.',
      installed: true,
      tile: '#6b79ea',
      mail: true,
    },
  ];
  return (
    <Page subtitle="Manage your integrations here" title="Integrations">
      <Tabs items={['Installed', 'Available']} />
      <div className="grid gap-3 xl:grid-cols-2">
        {items.map((it) => (
          <div
            className="flex items-start gap-3 rounded-md border border-app-line bg-app-card p-3.5"
            key={it.name}
          >
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-md font-bold text-[13px]"
              style={{
                backgroundColor: it.tile,
                color: it.tile === '#ffffff' ? '#4285F4' : '#fff',
              }}
            >
              {it.icon ? (
                <Webhook className="size-4" strokeWidth={1.75} />
              ) : 'mail' in it ? (
                <Mail className="size-4" strokeWidth={1.75} />
              ) : (
                it.mark
              )}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-[13px]">{it.name}</span>
                {it.installed ? (
                  <span className="flex items-center gap-1 rounded bg-up/15 px-1.5 py-px text-[10.5px] text-up">
                    <Check className="size-3" strokeWidth={2.25} />
                    Installed
                  </span>
                ) : null}
              </div>
              <div className="mt-0.5 text-[11.5px] text-app-muted">
                {it.body}
              </div>
            </div>
            <span className={btn}>{it.installed ? 'Configure' : 'Add'}</span>
          </div>
        ))}
      </div>
    </Page>
  );
}

/* ----------------------------------------------------------------- Workspace */

export function WorkspaceView() {
  const projects = [
    {
      name: 'Acme Website',
      domain: 'acme.dev',
      visitors: '8,639',
      delta: 12.4,
      seed: 0,
    },
    {
      name: 'Acme App',
      domain: 'app.acme.dev',
      visitors: '3,212',
      delta: 6.1,
      seed: 2,
    },
    {
      name: 'Acme Docs',
      domain: 'docs.acme.dev',
      visitors: '5,904',
      delta: 21.7,
      seed: 4,
    },
    {
      name: 'Acme API',
      domain: 'server events',
      visitors: '41,880',
      delta: -2.3,
      seed: 1,
    },
  ];
  return (
    <Page
      actions={
        <span
          className={`${btn} border-transparent bg-paper font-medium text-ink`}
        >
          <Plus className="size-3.5" />
          Create project
        </span>
      }
      subtitle="Acme · 4 projects"
      title="Projects"
    >
      <div className="grid gap-3 xl:grid-cols-2">
        {projects.map((p) => (
          <div
            className="rounded-md border border-app-line bg-app-card p-4"
            key={p.name}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-[13px]">{p.name}</div>
                <div className="font-mono text-[11px] text-app-muted">
                  {p.domain}
                </div>
              </div>
              <Change value={p.delta} />
            </div>
            <div className="mt-3 flex items-end justify-between">
              <div>
                <div className={label}>Visitors · 30d</div>
                <div className="tabular font-mono font-semibold text-[18px]">
                  {p.visitors}
                </div>
              </div>
              <div className="flex h-24 w-[55%] items-end gap-[2px]">
                {VISITORS.slice(p.seed, p.seed + 24).map((d, i) => (
                  <span
                    className="flex-1 rounded-t-[1px] bg-chart-indigo"
                    // biome-ignore lint/suspicious/noArrayIndexKey: fixed series
                    key={i}
                    style={{
                      height: `${Math.min(100, (d.value / 620) * 100)}%`,
                      opacity: 0.9,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 text-[11.5px] text-app-muted">
        <Clock className="size-3.5" strokeWidth={1.75} />
        Trial · 23 days left
        <Copy className="ml-3 size-3.5" strokeWidth={1.75} />
        Client IDs live in each project's settings
      </div>
    </Page>
  );
}

import { ArrowUp, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';

// Small product previews for the capabilities grid. All values are
// illustrative sample data; the section labels them as such.

function Frame({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`h-full min-h-[216px] rounded-xl border border-rule bg-ink/60 p-4 transition-colors duration-300 group-hover:border-rule-strong ${className}`}
    >
      {children}
    </div>
  );
}

function Label({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono text-[10px] text-faint uppercase tracking-[0.08em]">
      {children}
    </span>
  );
}

// One colour per event type, shared by every preview.
const EVENT_COLOR: Record<string, string> = {
  screen_view: 'bg-chart-sky',
  sign_up: 'bg-chart-indigo',
  checkout_started: 'bg-chart-amber',
  project_created: 'bg-chart-teal',
};

function Dot({ className }: { className: string }) {
  return <span className={`size-1.5 shrink-0 rounded-full ${className}`} />;
}

/* Web analytics: visitors line against the previous period + top sources */

const CURRENT = [
  38, 42, 40, 47, 45, 52, 49, 55, 58, 54, 61, 66, 63, 70, 68, 74, 79, 76, 83,
  88,
];
const PREVIOUS = [
  34, 36, 37, 35, 40, 41, 39, 44, 43, 46, 45, 49, 48, 50, 52, 51, 55, 54, 57,
  58,
];

function toPath(values: number[], width: number, height: number) {
  const max = 100;
  const step = width / (values.length - 1);
  return values
    .map(
      (v, i) =>
        `${i === 0 ? 'M' : 'L'}${(i * step).toFixed(1)},${(height - (v / max) * height).toFixed(1)}`
    )
    .join(' ');
}

const SOURCES = [
  ['Google', 3412, 'bg-chart-indigo'],
  ['Direct', 2208, 'bg-chart-teal'],
  ['github.com', 1374, 'bg-chart-violet'],
  ['news.ycombinator.com', 890, 'bg-chart-amber'],
  ['Newsletter', 512, 'bg-chart-sky'],
] as const;

export function TrafficVisual() {
  const w = 480;
  const h = 132;
  const line = toPath(CURRENT, w, h);
  const prev = toPath(PREVIOUS, w, h);
  const lastY = h - ((CURRENT.at(-1) ?? 0) / 100) * h;
  return (
    <Frame className="grid gap-5 md:grid-cols-[minmax(0,1fr)_220px]">
      <div className="flex min-w-0 flex-col">
        <div className="flex items-end justify-between gap-3">
          <div>
            <Label>Unique visitors</Label>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-mono font-semibold text-[24px] tabular">
                12,486
              </span>
              <span className="flex items-center font-mono text-[11px] text-up">
                <ArrowUp className="size-3" strokeWidth={2.25} />
                18%
              </span>
            </div>
          </div>
          <div className="hidden gap-3 whitespace-nowrap font-mono text-[10.5px] text-faint sm:flex">
            <span className="flex items-center gap-1.5">
              <span className="h-[2px] w-3 rounded bg-coral" />
              This month
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-px w-3 border-faint border-t border-dashed" />
              Last month
            </span>
          </div>
        </div>
        <div className="relative mt-4 flex-1">
          <svg
            className="h-[132px] w-full overflow-visible"
            preserveAspectRatio="none"
            viewBox={`0 0 ${w} ${h}`}
          >
            <defs>
              <linearGradient id="traffic-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#FF496B" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#FF496B" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0.25, 0.5, 0.75].map((f) => (
              <line
                key={f}
                stroke="#27272A"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
                x1="0"
                x2={w}
                y1={h * f}
                y2={h * f}
              />
            ))}
            <path
              d={`${line} L${w},${h} L0,${h} Z`}
              fill="url(#traffic-fill)"
            />
            <path
              d={prev}
              fill="none"
              stroke="#727276"
              strokeDasharray="3 4"
              strokeWidth="1.25"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={line}
              fill="none"
              stroke="#FF496B"
              strokeLinejoin="round"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <span
            className="absolute right-0 size-2.5 translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-ink bg-coral"
            style={{ top: `${(lastY / h) * 132}px` }}
          />
        </div>
      </div>
      <div className="hidden min-w-0 border-rule md:block md:border-l md:pl-5">
        <div className="flex justify-between">
          <Label>Top sources</Label>
          <Label>Visitors</Label>
        </div>
        <ul className="mt-3 grid gap-1.5">
          {SOURCES.map(([name, value, color]) => (
            <li
              className="relative flex justify-between gap-2 rounded-[5px] px-2 py-[5px] text-[12.5px]"
              key={name}
            >
              <span
                className={`absolute inset-y-0 left-0 rounded-[5px] opacity-[0.16] ${color}`}
                style={{ width: `${(value / 3412) * 100}%` }}
              />
              <span className="relative flex min-w-0 items-center gap-2 text-soft">
                <Dot className={color} />
                <span className="truncate">{name}</span>
              </span>
              <span className="relative font-mono text-[11.5px] text-muted tabular">
                {value.toLocaleString('en-US')}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Frame>
  );
}

/* Product events: one expanded event with its properties */

export function EventsVisual() {
  return (
    <Frame className="flex flex-col gap-2 font-mono text-[12px]">
      <div className="rounded-lg border border-rule-strong bg-raised/60 px-3 py-2.5">
        <div className="flex justify-between">
          <span className="flex items-center gap-2 text-paper">
            <Dot className={EVENT_COLOR.sign_up ?? ''} />
            sign_up
          </span>
          <span className="text-faint">12:04:31</span>
        </div>
        <dl className="mt-2 grid grid-cols-[72px_1fr] gap-y-1 pl-3.5 text-[11.5px]">
          <dt className="text-faint">plan</dt>
          <dd className="text-chart-teal">"team"</dd>
          <dt className="text-faint">source</dt>
          <dd className="text-chart-teal">"pricing"</dd>
          <dt className="text-faint">country</dt>
          <dd className="text-chart-teal">"PT"</dd>
        </dl>
      </div>
      {[
        ['checkout_started', '12:03:58'],
        ['screen_view', '12:03:40'],
      ].map(([name, time]) => (
        <div
          className="flex justify-between rounded-lg border border-rule px-3 py-2.5"
          key={name}
        >
          <span className="flex items-center gap-2 text-soft">
            <Dot className={EVENT_COLOR[name ?? ''] ?? 'bg-faint'} />
            {name}
          </span>
          <span className="text-faint">{time}</span>
        </div>
      ))}
    </Frame>
  );
}

/* Profiles: identity plus an ordered journey */

const JOURNEY = [
  ['First visit', '/blog/edge-analytics', '3 days ago', 'screen_view'],
  ['Viewed pricing', '/pricing', '2 days ago', 'screen_view'],
  ['Signed up', 'plan: team', '2 days ago', 'sign_up'],
  ['Created a project', 'Acme Website', 'today', 'project_created'],
] as const;

export function ProfileVisual() {
  return (
    <Frame>
      <div className="flex items-center gap-3">
        <span className="grid size-8 place-items-center rounded-full bg-chart-violet/20 font-medium text-[12px] text-chart-violet">
          AL
        </span>
        <div className="min-w-0">
          <div className="truncate font-medium text-[13px]">Ana Lima</div>
          <div className="truncate font-mono text-[11px] text-faint">
            ana@acme.example
          </div>
        </div>
      </div>
      <ol className="relative mt-4 grid gap-3 pl-4">
        <span className="absolute top-1.5 bottom-1.5 left-[3px] w-px bg-rule-strong" />
        {JOURNEY.map(([what, detail, when, event]) => (
          <li className="relative" key={what}>
            <span
              className={`absolute top-[5px] -left-4 size-[7px] rounded-full ring-2 ring-panel ${EVENT_COLOR[event]}`}
            />
            <div className="flex justify-between gap-2 text-[12.5px]">
              <span className="text-soft">{what}</span>
              <span className="shrink-0 font-mono text-[10.5px] text-faint">
                {when}
              </span>
            </div>
            <div className="truncate font-mono text-[11px] text-faint">
              {detail}
            </div>
          </li>
        ))}
      </ol>
    </Frame>
  );
}

/* Funnels: steps with the biggest drop called out */

const STEPS = [
  ['Visited pricing', 100],
  ['Started sign-up', 46],
  ['Created project', 34],
  ['Sent first event', 27],
] as const;

export function FunnelVisual() {
  return (
    <Frame className="flex flex-col justify-between gap-3">
      {STEPS.map(([step, pct], index) => {
        const drop = index > 0 ? (STEPS[index - 1]?.[1] ?? 0) - pct : 0;
        const biggest = index === 1;
        return (
          <div key={step}>
            <div className="flex justify-between text-[12.5px]">
              <span className="text-soft">{step}</span>
              <span className="font-mono text-[11.5px] tabular">
                {index > 0 ? (
                  <span
                    className={
                      biggest ? 'mr-2 text-crimson' : 'mr-2 text-faint'
                    }
                  >
                    −{drop}%
                  </span>
                ) : null}
                <span className="text-paper">{pct}%</span>
              </span>
            </div>
            <div className="mt-1.5 h-2 rounded-full bg-raised">
              <div
                className="h-full rounded-full bg-chart-indigo"
                style={{ width: `${pct}%`, opacity: 1 - index * 0.18 }}
              />
            </div>
          </div>
        );
      })}
    </Frame>
  );
}

/* Retention: weekly cohort grid */

const COHORTS = [
  ['Oct 20', [100, 58, 44, 39, 36, 34]],
  ['Oct 27', [100, 61, 47, 41, 38]],
  ['Nov 3', [100, 55, 43, 40]],
  ['Nov 10', [100, 63, 49]],
  ['Nov 17', [100, 60]],
] as const;

export function RetentionVisual() {
  return (
    <Frame className="flex flex-col justify-center">
      <div className="grid grid-cols-[46px_repeat(6,minmax(0,1fr))] gap-1 font-mono text-[10px]">
        <span />
        {['W0', 'W1', 'W2', 'W3', 'W4', 'W5'].map((week) => (
          <span className="pb-1 text-center text-faint" key={week}>
            {week}
          </span>
        ))}
        {COHORTS.map(([label, values]) => (
          <div className="contents" key={label}>
            <span className="self-center text-faint">{label}</span>
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const value = values[i];
              return (
                <span
                  className={`grid h-[26px] place-items-center rounded-[4px] tabular ${
                    value === undefined ? 'bg-raised/40' : ''
                  } ${value !== undefined && value >= 50 ? 'text-paper' : 'text-soft'}`}
                  key={`${label}-${i}`}
                  style={
                    value === undefined
                      ? undefined
                      : {
                          backgroundColor: `rgba(255, 73, 107, ${(0.08 + (value / 100) * 0.62).toFixed(2)})`,
                        }
                  }
                >
                  {value === undefined ? '' : value}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </Frame>
  );
}

/* Reports and dashboards: a saved board of small charts */

export function ReportsVisual() {
  return (
    <Frame className="grid grid-cols-2 gap-2">
      <div className="rounded-lg border border-rule p-3">
        <Label>Sign-ups</Label>
        <div className="mt-1 font-mono font-semibold text-[18px] tabular">
          1,284
        </div>
        <div className="mt-2 flex h-9 items-end gap-[3px]">
          {[40, 55, 48, 62, 58, 70, 66, 84].map((v, i) => (
            <span
              className={`flex-1 rounded-t-[2px] bg-chart-teal ${i === 7 ? '' : 'opacity-35'}`}
              key={`s-${i}`}
              style={{ height: `${v}%` }}
            />
          ))}
        </div>
      </div>
      <div className="rounded-lg border border-rule p-3">
        <Label>Conversion</Label>
        <div className="mt-1 font-mono font-semibold text-[18px] tabular">
          4.2%
        </div>
        <svg
          className="mt-2 h-9 w-full"
          preserveAspectRatio="none"
          viewBox="0 0 100 36"
        >
          <path
            d="M0,28 L14,26 L28,27 L42,20 L56,22 L70,15 L84,13 L100,8"
            fill="none"
            stroke="#E9AB2B"
            strokeWidth="1.75"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
      <div className="col-span-2 rounded-lg border border-rule p-3">
        <div className="flex justify-between">
          <Label>Devices</Label>
          <Label>Share</Label>
        </div>
        <div className="mt-2.5 flex h-2 overflow-hidden rounded-full">
          <span className="bg-chart-indigo" style={{ width: '58%' }} />
          <span className="bg-chart-sky" style={{ width: '34%' }} />
          <span className="bg-chart-violet" style={{ width: '8%' }} />
        </div>
        <div className="mt-2 flex gap-4 font-mono text-[10.5px] text-muted">
          {[
            ['Desktop 58%', 'bg-chart-indigo'],
            ['Mobile 34%', 'bg-chart-sky'],
            ['Tablet 8%', 'bg-chart-violet'],
          ].map(([label, color]) => (
            <span className="flex items-center gap-1.5" key={label}>
              <Dot className={color ?? ''} />
              {label}
            </span>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* Ask AI: a question and an answer built from events */

const ANSWER = [
  ['/pricing', 6.1],
  ['/docs/quickstart', 4.4],
  ['/', 2.3],
] as const;

export function AskAiVisual() {
  return (
    <Frame className="flex flex-col gap-3">
      <div className="self-end rounded-[12px] rounded-br-[4px] bg-raised px-3.5 py-2 text-[13px] text-paper">
        Which pages convert best this month?
      </div>
      <div className="flex gap-3">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-chart-violet/15 text-chart-violet">
          <Sparkles className="size-3.5" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-soft leading-[1.55]">
            <span className="text-paper">/pricing</span> converts best: 6.1% of
            its visitors sign up, about 2.6× the site average.
          </p>
          <ul className="mt-3 grid max-w-[420px] gap-1.5">
            {ANSWER.map(([page, rate], index) => (
              <li
                className="grid grid-cols-[104px_minmax(0,1fr)_36px] sm:grid-cols-[130px_minmax(0,1fr)_40px] items-center gap-3 font-mono text-[11.5px]"
                key={page}
              >
                <span className="truncate text-soft">{page}</span>
                <span className="h-1.5 rounded-full bg-raised">
                  <span
                    className={`block h-full rounded-full ${index === 0 ? 'bg-coral' : 'bg-rule-strong'}`}
                    style={{ width: `${(rate / 6.1) * 100}%` }}
                  />
                </span>
                <span className="text-right text-muted tabular">{rate}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between rounded-lg border border-rule px-3 py-2 text-[12.5px] text-faint">
        Ask about your data…
        <span className="grid size-6 place-items-center rounded-md bg-paper text-ink">
          <ArrowUp className="size-3.5" strokeWidth={2.25} />
        </span>
      </div>
    </Frame>
  );
}

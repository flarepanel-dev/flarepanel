import { AppWindow, Cloud } from 'lucide-react';
import { CloudflareIcon } from './cloudflare-icons';
import { Container } from './ui';

const COMPARE = [
  ['Servers or VMs to patch', 'Several', 'None'],
  [
    'Analytics database to size and back up',
    'ClickHouse cluster',
    'Durable Objects + R2',
  ],
  ['Cache and job queue', 'Redis + workers', 'Queues'],
  ['Cost when nobody visits', 'Always on', 'Only the Workers plan'],
  ['Traffic spike', 'You scale it', 'Cloudflare scales it'],
] as const;

export function HowItWorks() {
  return (
    <section
      aria-labelledby="how-title"
      className="border-rule border-t py-24 sm:py-32"
      id="how-it-works"
    >
      <Container>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end lg:gap-14">
          <h2
            className="display max-w-[16ch] text-[36px] sm:text-[48px] lg:text-[56px]"
            id="how-title"
          >
            Four stops, all on Cloudflare.
          </h2>
          <p className="max-w-[60ch] text-[16px] text-muted leading-[1.6] lg:pb-1.5">
            Every event takes the same short route. Accounts and settings live
            in D1, background work runs on Queues, and nothing waits on a server
            you have to keep alive.
          </p>
        </div>
        <div className="mt-14 grid gap-4 rounded-[18px] border border-rule bg-panel p-5 sm:p-8 lg:grid-cols-[220px_56px_minmax(0,1fr)] lg:items-center lg:gap-0">
          <div className="rounded-2xl border border-rule bg-ink p-5">
            <span className="flex size-11 items-center justify-center rounded-xl border border-rule-strong bg-raised text-paper">
              <AppWindow className="size-5" strokeWidth={1.6} />
            </span>
            <div className="mt-4 font-semibold text-[15px]">
              Your site or app
            </div>
            <div className="font-mono text-[11.5px] text-faint">
              SDK · op1.js
            </div>
            <div className="mt-3 text-[13px] text-muted leading-[1.55]">
              Batches events and sends them to the closest Cloudflare location.
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5 font-mono text-[10.5px]">
              {[
                ['screen_view', '#4cb0e5'],
                ['sign_up', '#ff6a4d'],
                ['purchase', '#83c758'],
              ].map(([n, c]) => (
                <span
                  className="rounded px-1.5 py-0.5"
                  key={n}
                  style={{ backgroundColor: `${c}22`, color: c }}
                >
                  {n}
                </span>
              ))}
            </div>
          </div>
          <div
            aria-hidden
            className="route-wire mx-auto hidden w-full lg:block"
          />
          <div className="relative rounded-2xl border border-rule-strong border-dashed p-5 pt-9 sm:p-6 sm:pt-10">
            <span className="absolute -top-3 left-5 flex items-center gap-1.5 bg-panel px-2 font-mono text-[11px] text-soft uppercase tracking-[0.08em]">
              <Cloud className="size-3.5" strokeWidth={1.75} />
              Runs on Cloudflare
            </span>
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_32px_minmax(0,1fr)_32px_minmax(0,1fr)] md:items-center">
              {[
                {
                  icon: 'workers' as const,
                  name: 'Workers',
                  role: 'Checks the client, adds country and device, and answers straight away.',
                  tag: 'nearest edge',
                  hue: '#ff6a4d',
                },
                {
                  icon: 'durable-objects' as const,
                  name: 'Durable Objects',
                  role: 'One object per project keeps recent events and daily rollups ready for charts.',
                  tag: 'your project',
                  hue: '#08b6af',
                },
                {
                  icon: 'r2' as const,
                  name: 'R2',
                  role: 'Raw events, compressed by the hour, kept for as long as you choose.',
                  tag: 'archive',
                  hue: '#ffb547',
                },
              ].flatMap((s, i) => {
                const node = (
                  <div
                    className="rounded-2xl border border-rule bg-ink p-4"
                    key={s.name}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="flex size-11 shrink-0 items-center justify-center rounded-xl border"
                        style={{
                          borderColor: `${s.hue}99`,
                          backgroundColor: `${s.hue}2e`,
                          color: s.hue,
                        }}
                      >
                        <CloudflareIcon
                          className="size-[22px]"
                          product={s.icon}
                        />
                      </span>
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-[14.5px]">
                          {s.name}
                        </div>
                        <div className="font-mono text-[11px] text-faint">
                          {s.tag}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 text-[13px] text-muted leading-[1.55]">
                      {s.role}
                    </div>
                  </div>
                );
                return i === 0
                  ? [node]
                  : [
                      <div
                        aria-hidden
                        className="route-wire hidden md:block"
                        key={`wire-${s.name}`}
                      />,
                      node,
                    ];
              })}
            </div>
            <div className="mt-5 grid gap-4 border-rule border-t pt-5 md:grid-cols-2">
              {[
                {
                  icon: 'd1' as const,
                  name: 'D1',
                  role: 'Accounts, projects and settings.',
                  hue: '#a064db',
                },
                {
                  icon: 'queues' as const,
                  name: 'Queues',
                  role: 'Background work: exports, insights and notifications.',
                  hue: '#4cb0e5',
                },
              ].map((s) => {
                return (
                  <div
                    className="flex items-center gap-3 rounded-xl border border-rule bg-ink px-4 py-3"
                    key={s.name}
                  >
                    <span
                      className="flex size-9 shrink-0 items-center justify-center rounded-lg border"
                      style={{
                        borderColor: `${s.hue}99`,
                        backgroundColor: `${s.hue}2e`,
                        color: s.hue,
                      }}
                    >
                      <CloudflareIcon
                        className="size-[18px]"
                        product={s.icon}
                      />
                    </span>
                    <div>
                      <div className="font-semibold text-[14px]">{s.name}</div>
                      <div className="text-[12.5px] text-muted">{s.role}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="mt-24 border-rule border-t pt-16 sm:mt-28">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end lg:gap-14">
            <h3 className="display max-w-[16ch] text-[28px] sm:text-[34px]">
              What you no longer run.
            </h3>
            <p className="max-w-[46ch] text-[15.5px] text-muted leading-[1.6]">
              A typical self-hosted analytics stack is a set of servers that
              stay on all month. FlarePanel is a set of Cloudflare services you
              pay for as they are used, on a Workers Paid plan.
            </p>
          </div>
          <div className="mt-10 overflow-hidden rounded-2xl border border-rule">
            <div className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1.2fr)] border-rule border-b bg-panel px-5 py-3.5 font-mono text-[11px] uppercase tracking-[0.08em] sm:px-7">
              <span className="text-faint">What it takes</span>
              <span className="text-faint">Typical self-hosted</span>
              <span className="text-paper">FlarePanel on Cloudflare</span>
            </div>
            {COMPARE.map(([concern, typical, flare], i) => {
              const row = (
                [
                  { hue: '#3ccb7f', icons: [] },
                  { hue: '#08b6af', icons: ['durable-objects', 'r2'] },
                  { hue: '#4cb0e5', icons: ['queues'] },
                  { hue: '#ff6a4d', icons: ['workers'] },
                  { hue: '#a064db', icons: ['workers'] },
                ] as const
              )[i];
              return (
                <div
                  className="compare-row grid grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1.2fr)] items-center gap-3 border-rule border-b px-5 py-4 transition-colors last:border-b-0 sm:px-7"
                  key={concern}
                  style={{ ['--hue' as string]: row.hue }}
                >
                  <span className="text-[14.5px] text-soft">{concern}</span>
                  <span className="text-[14px] text-faint">{typical}</span>
                  <span className="flex items-center gap-3 font-medium text-[14.5px] text-paper">
                    <span className="flex shrink-0 gap-1.5">
                      {row.icons.length === 0 ? (
                        <span className="compare-tile flex size-7 items-center justify-center rounded-lg border">
                          <span className="compare-dot size-2 rounded-full" />
                        </span>
                      ) : (
                        row.icons.map((p) => (
                          <span
                            className="compare-tile flex size-7 items-center justify-center rounded-lg border"
                            key={p}
                          >
                            <CloudflareIcon className="size-4" product={p} />
                          </span>
                        ))
                      )}
                    </span>
                    {flare}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}

'use client';

import { Check, Copy } from 'lucide-react';
import { type KeyboardEvent, useState } from 'react';
import { Container, TextLink } from './ui';
import { site } from '@/lib/site';

type Line = { text: string; kind?: 'add' | 'del' | 'dim' };

const TABS: Array<{
  id: string;
  label: string;
  file: string;
  note: string;
  lines: Line[];
  copy: string;
}> = [
  {
    id: 'openpanel',
    label: 'Already on OpenPanel',
    file: 'src/analytics.ts',
    note: '1 line changed',
    lines: [
      { text: "import { OpenPanel } from '@openpanel/web';", kind: 'dim' },
      { text: '' },
      { text: 'export const op = new OpenPanel({' },
      { text: "  clientId: 'YOUR_CLIENT_ID'," },
      { text: "  apiUrl: 'https://api.openpanel.dev',", kind: 'del' },
      { text: "  apiUrl: 'https://api.flarepanel.dev',", kind: 'add' },
      { text: '  trackScreenViews: true,' },
      { text: '});' },
    ],
    copy: "apiUrl: 'https://api.flarepanel.dev',",
  },
  {
    id: 'script',
    label: 'Script tag',
    file: 'index.html',
    note: 'before </head>',
    lines: [
      { text: '<script>' },
      { text: '  window.op = window.op || /* queue stub */;', kind: 'dim' },
      { text: "  window.op('init', {" },
      { text: "    clientId: 'YOUR_CLIENT_ID'," },
      { text: '    trackScreenViews: true,' },
      { text: '    trackOutgoingLinks: true,' },
      { text: '  });' },
      { text: '</script>' },
      {
        text: '<script src="https://flarepanel.dev/op1.js" defer async></script>',
        kind: 'add',
      },
    ],
    copy: '<script src="https://flarepanel.dev/op1.js" defer async></script>',
  },
  {
    id: 'track',
    label: 'Track an event',
    file: 'src/signup.ts',
    note: 'same API',
    lines: [
      { text: "import { op } from './analytics';", kind: 'dim' },
      { text: '' },
      { text: "op.track('sign_up', { plan: 'team' });", kind: 'add' },
      { text: 'op.identify({ profileId: user.id, email: user.email });' },
      { text: "op.increment({ profileId: user.id, property: 'logins' });" },
    ],
    copy: "op.track('sign_up', { plan: 'team' });",
  },
];

export function DropIn() {
  const [active, setActive] = useState(TABS[0]!.id);
  const [copied, setCopied] = useState(false);
  const tab = TABS.find((t) => t.id === active) ?? TABS[0]!;

  const onTabKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') {
      return;
    }
    const index = TABS.findIndex((t) => t.id === active);
    const step = event.key === 'ArrowRight' ? 1 : -1;
    const next = TABS[(index + step + TABS.length) % TABS.length];
    if (next) {
      setActive(next.id);
      setCopied(false);
      document.getElementById(`tab-${next.id}`)?.focus();
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(tab.copy);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section
      aria-labelledby="drop-in-title"
      className="py-24 sm:py-32"
      id="get-started"
    >
      <Container>
        <div className="grid gap-12 lg:grid-cols-[380px_minmax(0,1fr)] lg:items-start lg:gap-16 xl:grid-cols-[440px_minmax(0,1fr)]">
          <div>
            <h2
              className="display text-[36px] sm:text-[48px] lg:text-[44px] xl:text-[50px]"
              id="drop-in-title"
            >
              Keep your SDK. <br className="hidden sm:block" />
              Change one URL.
            </h2>
            <p className="mt-5 max-w-[52ch] text-[16px] text-muted leading-[1.6]">
              FlarePanel speaks the OpenPanel tracking protocol, so the web,
              Next.js, React Native and server SDKs you already use keep
              working.
            </p>
            <ol className="mt-8 space-y-4">
              {[
                ['Keep your install', 'No new package and no new API.'],
                [
                  'Change apiUrl',
                  `Point it at ${site.api.replace('https://', '')}.`,
                ],
                [
                  'Watch events arrive',
                  'They land on Cloudflare, at the edge closest to each visitor.',
                ],
              ].map(([title, body], i) => (
                <li className="flex gap-4" key={title}>
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-[#ff6a4d]/50 bg-[#ff6a4d]/15 font-mono text-[#ff9e8a] text-[12px]">
                    {i + 1}
                  </span>
                  <div>
                    <div className="font-medium text-[15px] text-paper">
                      {title}
                    </div>
                    <div className="text-[14px] text-muted">{body}</div>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-7 text-[14px] text-faint leading-[1.6]">
              Starting fresh? Use the script tag or the @flarepanel packages.{' '}
              <TextLink href={site.docs}>Read the docs</TextLink>
            </p>
          </div>

          <div className="min-w-0 overflow-hidden rounded-2xl border border-rule bg-panel">
            <div className="grid border-rule border-b sm:grid-cols-2">
              <div className="flex items-center gap-3 border-rule px-5 py-4 max-sm:border-b sm:border-r">
                <span className="font-mono text-[11px] text-faint uppercase tracking-[0.08em]">
                  Before
                </span>
                <code className="font-mono text-[13.5px] text-muted line-through decoration-crimson/60">
                  api.openpanel.dev
                </code>
              </div>
              <div className="flex items-center gap-3 bg-up/[0.06] px-5 py-4">
                <span className="font-mono text-[11px] text-up uppercase tracking-[0.08em]">
                  After
                </span>
                <code className="font-mono text-[13.5px] text-paper">
                  {site.api.replace('https://', '')}
                </code>
              </div>
            </div>
            <div
              aria-label="Install options"
              className="flex items-center gap-1 border-rule border-b p-2"
              onKeyDown={onTabKey}
              role="tablist"
            >
              <div className="flex min-w-0 gap-1 overflow-x-auto [scrollbar-width:none]">
                {TABS.map((t) => (
                  <button
                    aria-controls={`panel-${t.id}`}
                    aria-selected={t.id === active}
                    className="group flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3.5 text-[14px] text-muted transition-colors duration-200 hover:text-paper aria-selected:bg-raised aria-selected:text-paper"
                    id={`tab-${t.id}`}
                    key={t.id}
                    onClick={() => {
                      setActive(t.id);
                      setCopied(false);
                    }}
                    role="tab"
                    tabIndex={t.id === active ? 0 : -1}
                    type="button"
                  >
                    <span className="size-1.5 rounded-full bg-rule-strong group-aria-selected:bg-chart-ember" />
                    {t.label}
                  </button>
                ))}
              </div>
              <button
                aria-label={copied ? 'Copied' : 'Copy highlighted line'}
                className="ml-auto inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-rule bg-raised px-2.5 text-[13px] text-muted transition-colors hover:text-paper"
                onClick={copy}
                type="button"
              >
                {copied ? (
                  <Check aria-hidden className="size-3.5 text-up" />
                ) : (
                  <Copy aria-hidden className="size-3.5" />
                )}
                <span className="hidden sm:inline">
                  {copied ? 'Copied' : 'Copy'}
                </span>
              </button>
            </div>
            <div
              aria-labelledby={`tab-${tab.id}`}
              className="overflow-x-auto py-4"
              id={`panel-${tab.id}`}
              role="tabpanel"
            >
              <pre className="min-w-max font-mono text-[11.5px] leading-[1.9] sm:text-[14px] xl:text-[15px]">
                {tab.lines.map((line, index) => (
                  <div
                    className={`grid grid-cols-[22px_1fr] pr-4 sm:grid-cols-[48px_26px_1fr] sm:pr-6 ${
                      line.kind === 'add'
                        ? 'bg-up/[0.08] text-paper'
                        : line.kind === 'del'
                          ? 'bg-crimson/[0.07] text-muted line-through decoration-crimson/50'
                          : line.kind === 'dim'
                            ? 'text-faint'
                            : 'text-soft'
                    }`}
                    key={`${tab.id}-${index}`}
                  >
                    <span className="hidden select-none pr-4 text-right text-rule-strong sm:block">
                      {index + 1}
                    </span>
                    <span
                      className={`select-none pl-3 sm:pl-0 ${line.kind === 'add' ? 'text-up' : line.kind === 'del' ? 'text-crimson' : ''}`}
                    >
                      {line.kind === 'add'
                        ? '+'
                        : line.kind === 'del'
                          ? '−'
                          : ''}
                    </span>
                    <code>{line.text || ' '}</code>
                  </div>
                ))}
              </pre>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

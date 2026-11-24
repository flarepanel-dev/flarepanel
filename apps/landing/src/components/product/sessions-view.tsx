'use client';

import {
  Filter,
  MousePointer2,
  Pause,
  Play,
  SlidersHorizontal,
  Video,
  X,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useRef, useState } from 'react';
import { Avatar, FlagIcon, OsIcon, SourceIcon } from './glyphs';
import type { Flag, Source } from './sample-data';
import { EVENT_COLORS } from './sample-data';
import { useLiveTick } from './use-live';

interface Session {
  started: string;
  id: string;
  profile: string;
  avatar: number;
  entry: string;
  exit: string;
  duration: string;
  bounce: boolean;
  referrer: { name: string; icon: Source };
  city: string;
  flag: Flag;
  os: 'macos' | 'windows' | 'ios' | 'android';
  replay: boolean;
}

const SESSIONS: Session[] = [
  {
    started: '2 min ago',
    id: '4D4Kgg88',
    profile: 'Maya Chen',
    avatar: 2,
    entry: '/pricing',
    exit: '/signup',
    duration: '6m 12s',
    bounce: false,
    referrer: { name: 'Hacker News', icon: 'hackernews' },
    city: 'Berlin',
    flag: 'de',
    os: 'macos',
    replay: true,
  },
  {
    started: '4 min ago',
    id: '093f85d1',
    profile: 'Anonymous',
    avatar: 1,
    entry: '/',
    exit: '/docs/quickstart',
    duration: '3m 40s',
    bounce: false,
    referrer: { name: 'Google', icon: 'google' },
    city: 'Stockholm',
    flag: 'se',
    os: 'ios',
    replay: true,
  },
  {
    started: '9 min ago',
    id: '160c7c39',
    profile: 'Anonymous',
    avatar: 3,
    entry: '/blog/edge-analytics',
    exit: '/blog/edge-analytics',
    duration: '48s',
    bounce: true,
    referrer: { name: 'Reddit', icon: 'reddit' },
    city: 'Toronto',
    flag: 'ca',
    os: 'windows',
    replay: false,
  },
  {
    started: '12 min ago',
    id: 'fqK1VxuJ',
    profile: 'Leo Park',
    avatar: 4,
    entry: '/',
    exit: '/settings/team',
    duration: '12m 05s',
    bounce: false,
    referrer: { name: 'Direct', icon: 'direct' },
    city: 'San Francisco',
    flag: 'us',
    os: 'macos',
    replay: true,
  },
  {
    started: '18 min ago',
    id: 'hxtG_4NN',
    profile: 'Anonymous',
    avatar: 5,
    entry: '/docs/self-hosting',
    exit: '/docs/self-hosting',
    duration: '2m 31s',
    bounce: true,
    referrer: { name: 'github.com', icon: 'github' },
    city: 'Bengaluru',
    flag: 'in',
    os: 'android',
    replay: false,
  },
  {
    started: '26 min ago',
    id: 'AZZSW42D',
    profile: 'Anonymous',
    avatar: 0,
    entry: '/changelog',
    exit: '/pricing',
    duration: '1m 58s',
    bounce: false,
    referrer: { name: 'newsletter', icon: 'newsletter' },
    city: 'London',
    flag: 'gb',
    os: 'macos',
    replay: false,
  },
  {
    started: '31 min ago',
    id: 'x_-U-Xhj',
    profile: 'Anonymous',
    avatar: 2,
    entry: '/',
    exit: '/',
    duration: '0s',
    bounce: true,
    referrer: { name: 'X', icon: 'x' },
    city: 'São Paulo',
    flag: 'br',
    os: 'ios',
    replay: false,
  },
  {
    started: '38 min ago',
    id: 'RfKbOZtZ',
    profile: 'Sam Ortiz',
    avatar: 3,
    entry: '/pricing',
    exit: '/checkout',
    duration: '4m 02s',
    bounce: false,
    referrer: { name: 'Google', icon: 'google' },
    city: 'Lisbon',
    flag: 'pt',
    os: 'windows',
    replay: true,
  },
  {
    started: '44 min ago',
    id: 'DlRQufLS',
    profile: 'Anonymous',
    avatar: 1,
    entry: '/docs',
    exit: '/docs/install',
    duration: '7m 19s',
    bounce: false,
    referrer: { name: 'DuckDuckGo', icon: 'duckduckgo' },
    city: 'Tokyo',
    flag: 'jp',
    os: 'macos',
    replay: false,
  },
  {
    started: '52 min ago',
    id: 'gg1jEVVY',
    profile: 'Anonymous',
    avatar: 4,
    entry: '/',
    exit: '/signup',
    duration: '2m 10s',
    bounce: false,
    referrer: { name: 'Hacker News', icon: 'hackernews' },
    city: 'Istanbul',
    flag: 'tr',
    os: 'android',
    replay: false,
  },
];

const COLS = '96px 92px 128px 120px 110px 64px 56px 120px 112px';

const REPLAY_EVENTS = [
  { at: 0.04, name: 'screen_view', label: '/pricing' },
  { at: 0.38, name: 'screen_view', label: 'Scrolled to plans' },
  { at: 0.66, name: 'checkout_started', label: 'Clicked "Start trial"' },
  { at: 0.86, name: 'sign_up', label: '/signup' },
];

/** A recorded visit to a sample pricing page, played back with the cursor and clicks. */
function ReplayPlayer({ running }: { running: boolean }) {
  const loop = {
    duration: 9,
    repeat: Number.POSITIVE_INFINITY,
    ease: 'easeInOut' as const,
  };
  return (
    <div className="flex h-full flex-col">
      <div className="relative flex-1 overflow-hidden rounded-md border border-app-line bg-[#f6f6f7]">
        <div className="flex h-6 items-center gap-1.5 border-[#e3e3e6] border-b bg-white px-2.5">
          <span className="size-2 rounded-full bg-[#e4e4e7]" />
          <span className="size-2 rounded-full bg-[#e4e4e7]" />
          <span className="size-2 rounded-full bg-[#e4e4e7]" />
          <span className="ml-2 rounded bg-[#f1f1f3] px-2 py-px font-mono text-[#71717a] text-[9px]">
            acme.dev/pricing
          </span>
        </div>
        <div className="px-5 pt-4 text-[#18181b]">
          <div className="flex items-center justify-between text-[#52525b] text-[9px]">
            <span className="font-bold text-[#18181b] text-[11px]">acme</span>
            <span className="flex gap-3">
              <span>Product</span>
              <span>Docs</span>
              <span className="font-semibold text-[#18181b]">Pricing</span>
            </span>
          </div>
          <div className="mt-4 text-center font-bold text-[17px] tracking-[-0.03em]">
            Simple plans for growing teams
          </div>
          <div className="mx-auto mt-1 w-[70%] text-center text-[#71717a] text-[9px]">
            Start free for 30 days. No card needed.
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {['Starter', 'Team', 'Scale'].map((plan, i) => (
              <div
                className={`rounded-md border bg-white p-2.5 ${i === 1 ? 'border-[#18181b]' : 'border-[#e4e4e7]'}`}
                key={plan}
              >
                <div className="font-semibold text-[10px]">{plan}</div>
                <div className="mt-1 font-bold text-[15px]">
                  ${[9, 29, 99][i]}
                  <span className="font-normal text-[#71717a] text-[8px]">
                    /mo
                  </span>
                </div>
                <div className="mt-2 space-y-1">
                  {[0, 1, 2].map((l) => (
                    <div
                      className="h-1 rounded bg-[#ececef]"
                      key={l}
                      style={{ width: `${88 - l * 18}%` }}
                    />
                  ))}
                </div>
                <div
                  className={`mt-2.5 rounded py-1 text-center font-medium text-[8.5px] ${
                    i === 1
                      ? 'bg-[#18181b] text-white'
                      : 'bg-[#f1f1f3] text-[#18181b]'
                  }`}
                >
                  Start trial
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-md border border-[#e4e4e7] bg-white p-2.5">
            <div className="font-semibold text-[10px]">Compare plans</div>
            {[
              'Events per month',
              'Team members',
              'Data retention',
              'Session replay',
            ].map((row, r) => (
              <div
                className="mt-1.5 flex items-center justify-between border-[#f1f1f3] border-t pt-1.5 text-[#52525b] text-[8.5px]"
                key={row}
              >
                <span>{row}</span>
                <span className="flex gap-6 font-mono text-[#18181b]">
                  {[
                    ['100K', '1M', '10M'],
                    ['3', '10', 'All'],
                    ['1 yr', '3 yr', '5 yr'],
                    ['-', 'Yes', 'Yes'],
                  ][r].map((v, c) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: fixed columns
                    <span className="w-7 text-right" key={c}>
                      {v}
                    </span>
                  ))}
                </span>
              </div>
            ))}
          </div>
        </div>
        {/* The recorded cursor: drifts over the plans, then clicks Team's button. */}
        <motion.div
          animate={
            running
              ? {
                  left: ['18%', '30%', '62%', '50%', '50%', '72%'],
                  top: ['30%', '58%', '52%', '83%', '83%', '40%'],
                }
              : { left: '50%', top: '83%' }
          }
          className="absolute"
          style={{ left: '50%', top: '83%' }}
          transition={
            running
              ? { ...loop, times: [0, 0.25, 0.45, 0.62, 0.7, 1] }
              : undefined
          }
        >
          <motion.span
            animate={
              running
                ? { scale: [0, 0, 1.6, 0], opacity: [0, 0, 0.5, 0] }
                : { opacity: 0 }
            }
            className="absolute -top-3 -left-3 size-6 rounded-full bg-chart-indigo"
            transition={
              running ? { ...loop, times: [0, 0.64, 0.7, 0.8] } : undefined
            }
          />
          <MousePointer2
            className="relative size-4 fill-[#18181b] text-white"
            strokeWidth={1.5}
          />
        </motion.div>
      </div>
      <div className="mt-2.5 flex items-center gap-2.5">
        <span className="flex size-7 items-center justify-center rounded-md bg-paper text-ink">
          {running ? (
            <Pause className="size-3.5" />
          ) : (
            <Play className="size-3.5" />
          )}
        </span>
        <div className="relative h-1.5 flex-1 rounded-full bg-app-field">
          <motion.div
            animate={running ? { width: ['0%', '100%'] } : { width: '66%' }}
            className="absolute inset-y-0 left-0 rounded-full bg-chart-indigo"
            transition={
              running
                ? {
                    duration: 9,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: 'linear',
                  }
                : undefined
            }
          />
          {REPLAY_EVENTS.map((e) => (
            <span
              className="absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-app-card"
              key={e.at}
              style={{
                left: `${e.at * 100}%`,
                backgroundColor: EVENT_COLORS[e.name],
              }}
            />
          ))}
        </div>
        <span className="tabular font-mono text-[10.5px] text-app-muted">
          6:12
        </span>
      </div>
      <div className="mt-3 space-y-1">
        {REPLAY_EVENTS.map((e) => (
          <div className="flex items-center gap-2 text-[11px]" key={e.at}>
            <span
              className="size-1.5 rounded-full"
              style={{ backgroundColor: EVENT_COLORS[e.name] }}
            />
            <span className="font-mono text-[10.5px] text-app-text">
              {e.name}
            </span>
            <span className="truncate text-app-muted">{e.label}</span>
            <span className="tabular ml-auto font-mono text-[10px] text-app-muted">
              {`${Math.floor(e.at * 6)}:${String(Math.round((e.at * 372) % 60)).padStart(2, '0')}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** The Sessions page with the replay sheet open on a recorded session. */
export function SessionsView({ active = true }: { active?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { running } = useLiveTick(ref, 60_000, active);
  const [selected, setSelected] = useState(0);
  const session = SESSIONS[selected];

  return (
    <div className="relative flex h-full flex-col" ref={ref}>
      <div className="px-5 pt-5">
        <div className="font-semibold text-[17px] tracking-[-0.01em]">
          Sessions
        </div>
        <div className="text-[12px] text-app-muted">
          Access all your sessions here
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span className="flex h-8 w-[160px] items-center rounded-md bg-app-field px-3 text-[12px] text-app-muted">
            Search sessions
          </span>
          <span className="flex h-8 items-center gap-1.5 rounded-md border border-app-line bg-app-card px-2.5 text-[12.5px]">
            <Filter className="size-3.5" strokeWidth={1.75} />
            Filters
          </span>
          <span className="ml-auto flex h-8 items-center gap-1.5 rounded-md border border-app-line bg-app-card px-2.5 text-[12.5px]">
            <SlidersHorizontal className="size-3.5" strokeWidth={1.75} />
            View
          </span>
        </div>
      </div>
      <div className="mx-5 mt-3 flex-1 overflow-hidden rounded-md border border-app-line">
        <div
          className="grid h-9 items-center gap-3 border-app-line border-b bg-app-card px-4 font-medium text-[10px] uppercase tracking-[0.5px]"
          style={{ gridTemplateColumns: COLS }}
        >
          <span>Started</span>
          <span>Session ID</span>
          <span>Profile</span>
          <span>Entry page</span>
          <span>Exit page</span>
          <span>Duration</span>
          <span>Bounce</span>
          <span>Referrer</span>
          <span>Location</span>
        </div>
        {SESSIONS.map((s, i) => (
          // biome-ignore lint/a11y/noStaticElementInteractions: decorative, aria-hidden frame
          // biome-ignore lint/a11y/noNoninteractiveElementInteractions: decorative, aria-hidden frame
          // biome-ignore lint/a11y/useKeyWithClickEvents: mouse shortcut; the tabs are the keyboard path
          <div
            className={`grid h-[38px] cursor-pointer items-center gap-3 whitespace-nowrap border-app-line border-b px-4 text-[12px] transition-colors ${
              i === selected ? 'bg-app-field' : 'hover:bg-app-hover'
            }`}
            key={s.id}
            onClick={() => setSelected(i)}
            style={{ gridTemplateColumns: COLS }}
          >
            <span className="text-app-muted">{s.started}</span>
            <span className="flex items-center gap-1.5 font-mono text-[11px]">
              {s.id.slice(0, 7)}…
              {s.replay ? (
                <Video className="size-3 text-app-muted" strokeWidth={1.75} />
              ) : null}
            </span>
            <span className="flex min-w-0 items-center gap-2 font-medium">
              <Avatar seed={s.avatar} />
              <span className="truncate">{s.profile}</span>
            </span>
            <span className="truncate font-mono text-[11px]">{s.entry}</span>
            <span className="truncate font-mono text-[11px]">{s.exit}</span>
            <span className="font-medium">{s.duration}</span>
            <span className={s.bounce ? 'text-chart-amber' : 'text-up'}>
              {s.bounce ? 'Yes' : 'No'}
            </span>
            <span className="flex min-w-0 items-center gap-1.5">
              <SourceIcon source={s.referrer.icon} />
              <span className="truncate">{s.referrer.name}</span>
            </span>
            <span className="flex min-w-0 items-center gap-1.5">
              <FlagIcon flag={s.flag} />
              <span className="truncate">{s.city}</span>
              <OsIcon os={s.os} />
            </span>
          </div>
        ))}
      </div>

      <div className="absolute inset-x-3 top-[118px] bottom-3 flex flex-col rounded-lg border border-app-line bg-app-card p-3.5 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.9)] lg:inset-x-auto lg:top-3 lg:right-3 lg:w-[min(400px,46%)]">
        <div className="mb-3 flex items-start gap-2.5">
          <Avatar seed={session.avatar} size={28} />
          <div className="min-w-0">
            <div className="truncate font-medium text-[13px]">
              {session.profile}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-app-muted">
              <FlagIcon flag={session.flag} />
              {session.city} · {session.duration} ·{' '}
              <span className="font-mono">{session.id}</span>
            </div>
          </div>
          <X className="ml-auto size-4 shrink-0 text-app-muted" />
        </div>
        {session.replay ? (
          <ReplayPlayer running={running} />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-md border border-app-line border-dashed text-center text-[12px] text-app-muted">
            <Video className="size-5" strokeWidth={1.5} />
            No replay for this session.
            <span className="text-[11px]">
              Pick a row with the camera icon.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

import { Monitor } from 'lucide-react';
import { Avatar, FlagIcon, OsIcon, SourceIcon } from './glyphs';
import { EVENT_COLORS } from './sample-data';

const PROPS: { label: string; value: React.ReactNode }[] = [
  {
    label: 'Location',
    value: (
      <span className="flex items-center gap-1.5">
        <FlagIcon flag="de" />
        Berlin, Germany
      </span>
    ),
  },
  {
    label: 'Device',
    value: (
      <span className="flex items-center gap-1.5">
        <Monitor className="size-3.5" strokeWidth={1.75} />
        Desktop
      </span>
    ),
  },
  {
    label: 'OS',
    value: (
      <span className="flex items-center gap-1.5">
        <OsIcon os="macos" />
        macOS 26
      </span>
    ),
  },
  { label: 'Browser', value: 'Chrome 142' },
  {
    label: 'First referrer',
    value: (
      <span className="flex items-center gap-1.5">
        <SourceIcon source="hackernews" />
        Hacker News
      </span>
    ),
  },
  { label: 'Plan', value: <span className="font-mono">team</span> },
  {
    label: 'First seen',
    value: <span className="font-mono">Nov 4, 09:12</span>,
  },
  { label: 'Last seen', value: <span className="font-mono">2 min ago</span> },
];

const METRICS = [
  ['Sessions', '14'],
  ['Events', '212'],
  ['Avg. session', '6m 40s'],
  ['Revenue', '$348'],
];

const DAYS: {
  day: string;
  events: { time: string; name: string; detail: string }[];
}[] = [
  {
    day: 'Today',
    events: [
      {
        time: '14:02',
        name: 'checkout_started',
        detail: 'plan: team · $29/mo',
      },
      { time: '13:58', name: 'screen_view', detail: '/pricing' },
      { time: '13:51', name: 'invite_sent', detail: 'role: viewer' },
      { time: '13:47', name: 'screen_view', detail: '/settings/team' },
    ],
  },
  {
    day: 'Nov 21',
    events: [
      { time: '10:20', name: 'project_created', detail: 'name: Acme Docs' },
      { time: '10:18', name: 'screen_view', detail: '/app/new' },
    ],
  },
  {
    day: 'Nov 4',
    events: [
      { time: '09:14', name: 'sign_up', detail: 'method: github' },
      { time: '09:12', name: 'screen_view', detail: '/ via Hacker News' },
    ],
  },
];

/** One person's page: who they are, what they did, in order. */
export function ProfileView() {
  return (
    <div className="flex h-full flex-col overflow-hidden p-5">
      <div className="flex items-center gap-3 pr-28">
        <Avatar seed={2} size={40} />
        <div>
          <div className="font-semibold text-[17px] tracking-[-0.01em]">
            Maya Chen
          </div>
          <div className="font-mono text-[11px] text-app-muted">
            user_8f2a91c4
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 overflow-hidden rounded-md border border-app-line sm:grid-cols-4">
        {METRICS.map(([label, value], i) => (
          <div
            className={`bg-app-bg px-3 py-2.5 ${i < 3 ? 'border-app-line sm:border-r' : ''} ${i % 2 === 0 ? 'max-sm:border-r' : ''}`}
            key={label}
          >
            <div className="font-medium text-[10px] text-app-muted uppercase tracking-[0.5px]">
              {label}
            </div>
            <div
              className={`tabular mt-0.5 font-mono font-semibold text-[18px] tracking-[-0.5px] ${label === 'Revenue' ? 'text-up' : ''}`}
            >
              {value}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 grid min-h-0 flex-1 gap-3 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="hidden rounded-md border border-app-line bg-app-card p-3.5 lg:block">
          <div className="mb-2 font-medium text-[10px] text-app-muted uppercase tracking-[0.5px]">
            Properties
          </div>
          {PROPS.map((p) => (
            <div
              className="flex h-8 items-center justify-between border-app-line border-t text-[12px] first-of-type:border-t-0"
              key={p.label}
            >
              <span className="text-app-muted">{p.label}</span>
              <span className="text-right">{p.value}</span>
            </div>
          ))}
          <div className="mt-4 mb-2 font-medium text-[10px] text-app-muted uppercase tracking-[0.5px]">
            Most viewed
          </div>
          {[
            ['/pricing', 9],
            ['/settings/team', 6],
            ['/docs/quickstart', 4],
          ].map(([path, n]) => (
            <div
              className="relative mb-1 flex h-7 items-center justify-between overflow-hidden rounded-[4px] px-2 text-[12px]"
              key={path}
            >
              <span
                className="absolute inset-y-0 left-0 bg-white/[0.04]"
                style={{ width: `${(Number(n) / 9) * 100}%` }}
              />
              <span className="relative font-mono text-[11px]">{path}</span>
              <span className="tabular relative font-mono font-semibold text-[11px]">
                {n}
              </span>
            </div>
          ))}
        </div>
        <div className="overflow-hidden rounded-md border border-app-line bg-app-card p-3.5">
          <div className="mb-2 font-medium text-[10px] text-app-muted uppercase tracking-[0.5px]">
            Activity
          </div>
          {DAYS.map((d) => (
            <div className="mb-3" key={d.day}>
              <div className="mb-1.5 font-medium text-[11.5px] text-app-muted">
                {d.day}
              </div>
              <div className="relative ml-[5px] border-app-line border-l pl-4">
                {d.events.map((e) => {
                  const color = EVENT_COLORS[e.name] ?? '#a6a6a6';
                  return (
                    <div
                      className="relative flex h-[30px] items-center gap-3 text-[12px]"
                      key={`${d.day}-${e.time}`}
                    >
                      <span
                        className="absolute -left-[21px] size-[9px] rounded-full ring-[3px] ring-app-card"
                        style={{ backgroundColor: color }}
                      />
                      <span className="tabular w-10 shrink-0 font-mono text-[10.5px] text-app-muted">
                        {e.time}
                      </span>
                      <span
                        className="font-mono text-[11.5px]"
                        style={{ color }}
                      >
                        {e.name}
                      </span>
                      <span className="truncate font-mono text-[10.5px] text-app-muted">
                        {e.detail}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

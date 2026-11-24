'use client';

import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { Avatar, FlagIcon } from './glyphs';
import { CITY_POSITIONS, MAP_RATIO } from './map-positions';
import { EVENT_COLORS, flagOf, LIVE_EVENTS } from './sample-data';
import { useLiveTick } from './use-live';

const MINUTE_BARS = [
  6, 9, 7, 11, 8, 12, 10, 14, 9, 13, 11, 15, 12, 10, 16, 13, 17, 12, 14, 18, 15,
  13, 19, 16, 14, 20, 17, 15, 21, 18,
];

function EventChip({ name }: { name: string }) {
  const color = EVENT_COLORS[name] ?? '#a6a6a6';
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-[4px] px-1.5 py-[1px] font-medium text-[11px]"
      style={{ backgroundColor: `${color}29`, color }}
    >
      <span
        className="size-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {name}
    </span>
  );
}

/**
 * The Realtime page: the world map with who is online now, new sessions on the
 * left and the event stream on the right. A new event lands every 1.8s and its
 * city pings on the map.
 */
export function RealtimeView({ active = true }: { active?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { tick } = useLiveTick(ref, 1800, active);
  const feed = Array.from({ length: 7 }, (_, i) => {
    const n = tick - i + LIVE_EVENTS.length * 10;
    return { ...LIVE_EVENTS[n % LIVE_EVENTS.length], id: tick - i, age: i };
  });
  const newest = feed[0];
  const online = 214 + ((tick * 5) % 9);
  const sessions = feed.filter((e) => e.name === 'screen_view').slice(0, 4);
  const bars = MINUTE_BARS.map((v, i) =>
    i === MINUTE_BARS.length - 1 ? v + (tick % 4) : v
  );
  const maxBar = Math.max(...bars);

  // Size the map like object-fit: cover, so the city dots share its coordinates.
  const [box, setBox] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    const resize = () => {
      const { width, height } = el.getBoundingClientRect();
      const w = Math.max(width, height * MAP_RATIO);
      setBox({ w, h: w / MAP_RATIO });
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative h-full overflow-hidden bg-app-bg" ref={ref}>
      {/* The same Natural Earth countries and Mercator band as the dashboard map. */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2"
        style={{ width: box.w || '100%', height: box.h || '100%' }}
      >
        <img
          alt=""
          className="absolute inset-0 size-full"
          decoding="async"
          height={668}
          loading="lazy"
          src="/realtime-map.svg"
          width={1000}
        />
        {Object.entries(CITY_POSITIONS).map(([city, [x, y]]) => {
          const hot = city === newest.city;
          return (
            <span
              className="absolute -translate-x-1/2 -translate-y-1/2"
              key={city}
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              {hot ? (
                <span
                  className="absolute inset-[-10px] animate-ping rounded-full bg-coral/40 motion-reduce:hidden"
                  key={newest.id}
                />
              ) : null}
              <span
                className={`relative block rounded-full transition-all duration-500 ${
                  hot
                    ? 'size-3 bg-coral shadow-[0_0_0_3px_rgba(255,73,107,0.25)]'
                    : 'size-2 bg-chart-indigo/80'
                }`}
              />
            </span>
          );
        })}
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(130%_100%_at_55%_35%,transparent_55%,rgba(21,21,21,0.85)_100%)]" />

      <div className="absolute top-5 left-5 w-[250px] max-sm:w-[200px]">
        <div className="tabular font-semibold text-[44px] leading-none tracking-[-0.03em]">
          {online}
        </div>
        <div className="mt-2 flex items-center gap-2 font-medium text-[11px] uppercase tracking-[0.08em]">
          <span className="size-2 rounded-full bg-up" />
          Online now
        </div>
        <div className="mt-5 flex items-center gap-1 font-medium text-[11px] text-app-muted uppercase tracking-[0.08em]">
          New sessions
          <ChevronDown className="size-3" />
        </div>
        <div className="mt-2 flex flex-col gap-1.5">
          <AnimatePresence initial={false}>
            {sessions.map((s) => (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-md border border-app-line bg-app-card/90 px-2.5 py-1.5 text-[11.5px] backdrop-blur-sm"
                exit={{ opacity: 0 }}
                initial={{ opacity: 0, y: -8 }}
                key={s.id}
                layout
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <Avatar seed={Math.abs(s.id)} size={16} />
                <span className="truncate font-mono text-[11px]">{s.path}</span>
                <span className="ml-auto flex shrink-0 items-center gap-1.5 text-app-muted">
                  <FlagIcon flag={flagOf(s.city)} />
                  {s.city}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="absolute top-5 right-5 hidden w-[290px] sm:block">
        <div className="rounded-lg border border-app-line bg-app-card/90 p-3 backdrop-blur-sm">
          <div className="flex items-center justify-between font-medium text-[10.5px] text-app-muted uppercase tracking-[0.08em]">
            Last 30 minutes
            <span className="font-mono text-[11px] text-app-text normal-case tracking-normal">
              <b className="font-semibold">{online + 412}</b>{' '}
              <span className="text-app-muted">sessions</span>
            </span>
          </div>
          <div className="mt-3 flex h-12 items-end gap-[2px]">
            {bars.map((v, i) => (
              <span
                className={`flex-1 rounded-t-[1px] transition-[height] duration-700 ease-out-expo ${
                  i === bars.length - 1
                    ? 'bg-chart-indigo'
                    : 'bg-chart-indigo/35'
                }`}
                // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length series
                key={i}
                style={{ height: `${(v / maxBar) * 100}%` }}
              />
            ))}
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1 font-medium text-[11px] text-app-muted uppercase tracking-[0.08em]">
          Events
          <ChevronDown className="size-3" />
        </div>
        <div className="mt-2 flex flex-col gap-1.5">
          <AnimatePresence initial={false}>
            {feed.slice(0, 6).map((e, i) => (
              <motion.div
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                className={`flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-[11.5px] backdrop-blur-sm ${
                  i === 0
                    ? 'border-coral/30 bg-[rgba(255,73,107,0.06)]'
                    : 'border-app-line bg-app-card/90'
                }`}
                exit={{ opacity: 0 }}
                initial={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
                key={e.id}
                layout
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <EventChip name={e.name} />
                <span className="min-w-0 truncate font-mono text-[10.5px] text-app-muted">
                  {e.path}
                </span>
                <span className="ml-auto flex shrink-0 items-center gap-1.5 text-[11px] text-app-muted">
                  <FlagIcon flag={flagOf(e.city)} />
                  {i === 0 ? 'now' : `${e.age * 2}s`}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

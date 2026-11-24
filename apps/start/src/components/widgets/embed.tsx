// Shared pieces for the public widget pages under /widget/*: the search
// params every embed takes, the forced light/dark theme, and the sample data
// the settings page previews before a widget is switched on.
import { useEffect, useState } from 'react';
import { z } from 'zod';

export const zEmbedTheme = z
  .enum(['light', 'dark'])
  .optional()
  .catch(undefined);
export type EmbedTheme = z.infer<typeof zEmbedTheme>;

/** Search params shared by every embed. `demo` renders sample data, no link needed. */
export const embedSearch = {
  shareId: z.string().optional(),
  demo: z.boolean().optional().catch(undefined),
  theme: zEmbedTheme,
  color: z.string().optional(),
};

/**
 * An embed lives on someone else's page: it follows the visitor's system
 * theme unless the embed code pins one with `?theme=`.
 */
export function useEmbedTheme(theme: EmbedTheme) {
  useEffect(() => {
    if (!theme) {
      return;
    }
    const root = document.documentElement;
    const previous = root.className;
    root.classList.remove('light', 'dark', 'system');
    root.classList.add(theme);
    return () => {
      root.className = previous;
    };
  }, [theme]);
}

/**
 * Sample data uses the clock and the browser's locale, so demo previews draw
 * only after hydration; the server renders the loading state.
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

export function MissingWidgetLink() {
  return (
    <div className="p-2 text-muted-foreground text-xs">
      Missing or invalid widget link.
    </div>
  );
}

const MINUTE_MS = 60_000;
const DAY_MS = 24 * 60 * MINUTE_MS;

/** A small deterministic generator, so server and client render the same numbers. */
function seeded(seed: number) {
  let t = seed;
  return () => {
    t = (t * 1_664_525 + 1_013_904_223) % 4_294_967_296;
    return t / 4_294_967_296;
  };
}

// Sample numbers only: shown in previews, labelled as a sample there.
export function sampleRealtime() {
  const rnd = seeded(11);
  const now = Math.floor(Date.now() / MINUTE_MS) * MINUTE_MS;
  const histogram = Array.from({ length: 31 }, (_, index) => {
    const timestamp = now - (30 - index) * MINUTE_MS;
    const sessionCount = Math.round(4 + rnd() * 9 + (index > 20 ? 4 : 0));
    return {
      minute: new Date(timestamp).toISOString(),
      sessionCount,
      visitorCount: sessionCount,
      timestamp,
      time: new Date(timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  });
  return {
    projectId: 'sample',
    liveCount: 42,
    project: { domain: null, name: 'Sample site' },
    histogram,
    countries: [
      { country: 'US', count: 14 },
      { country: 'DE', count: 9 },
      { country: 'GB', count: 6 },
      { country: 'TR', count: 5 },
      { country: 'JP', count: 4 },
    ],
    referrers: [
      { referrer: 'Google', count: 16 },
      { referrer: 'Hacker News', count: 9 },
      { referrer: 'GitHub', count: 6 },
      { referrer: 'X', count: 3 },
    ],
    paths: [
      { path: '/', count: 18 },
      { path: '/pricing', count: 9 },
      { path: '/docs/quickstart', count: 7 },
      { path: '/blog/edge-analytics', count: 5 },
    ],
  };
}

export const SAMPLE_COUNTER = { projectId: 'sample', counter: 42 };
export const SAMPLE_BADGE_VISITORS = 8639;

export function sampleTraffic(range: '7d' | '30d' = '30d') {
  const days = range === '7d' ? 7 : 30;
  const rnd = seeded(7);
  const today = Date.UTC(
    new Date().getUTCFullYear(),
    new Date().getUTCMonth(),
    new Date().getUTCDate()
  );
  const series = Array.from({ length: days }, (_, index) => {
    const start = today - (days - 1 - index) * DAY_MS;
    const weekday = new Date(start).getUTCDay();
    const weekend = weekday === 0 || weekday === 6 ? 0.68 : 1;
    const trend = 1 + (0.3 * index) / Math.max(1, days - 1);
    const visitors = Math.round(236 * weekend * trend * (0.88 + rnd() * 0.24));
    return {
      date: new Date(start).toISOString().slice(0, 10),
      visitors,
      pageviews: Math.round(visitors * (2.6 + rnd() * 0.5)),
    };
  });
  return {
    projectId: 'sample',
    project: { domain: null, name: 'Sample site' },
    range,
    visitors: series.reduce((sum, day) => sum + day.visitors, 0),
    pageviews: series.reduce((sum, day) => sum + day.pageviews, 0),
    series,
    pages: [
      { path: '/', count: 9812 },
      { path: '/pricing', count: 4206 },
      { path: '/docs/quickstart', count: 3118 },
      { path: '/blog/edge-analytics', count: 2240 },
      { path: '/changelog', count: 1402 },
    ],
    referrers: [
      { referrer: 'Google', count: 1288 },
      { referrer: 'Hacker News', count: 702 },
      { referrer: 'GitHub', count: 388 },
      { referrer: 'Reddit', count: 160 },
      { referrer: 'X', count: 121 },
    ],
  };
}

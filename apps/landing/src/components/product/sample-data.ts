// Illustrative sample data for the product previews. Nothing here is a real
// customer, site or metric; every preview carries the SAMPLE DATA tag.

export const nf = new Intl.NumberFormat('en-US');

/** A small deterministic generator, so server and client render the same numbers. */
function seeded(seed: number) {
  let t = seed;
  return () => {
    t = (t * 1_664_525 + 1_013_904_223) % 4_294_967_296;
    return t / 4_294_967_296;
  };
}

const DAY_LABELS = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(Date.UTC(2026, 9, 26 + i));
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
});

/** Unique visitors per day: weekday rhythm, a Hacker News spike, slow growth. */
function visitorSeries(seed: number, base: number, growth: number) {
  const rnd = seeded(seed);
  return DAY_LABELS.map((label, i) => {
    const weekday = (i + 1) % 7; // Oct 26 2026 is a Monday
    const weekend = weekday === 6 || weekday === 0 ? 0.68 : 1;
    const trend = 1 + (growth * i) / 29;
    const noise = 0.88 + rnd() * 0.24;
    return { label, value: Math.round(base * weekend * trend * noise) };
  });
}

export const VISITORS = visitorSeries(7, 236, 0.32).map((day, i) =>
  i === 19 ? { ...day, value: Math.round(day.value * 2.6) } : day
);
export const VISITORS_PREVIOUS = visitorSeries(19, 214, 0.18);
/** The day the Hacker News post landed: annotated on the chart. */
export const SPIKE_INDEX = 19;

export const KPIS = [
  { label: 'Unique visitors', value: '8,639', delta: 12.4, good: true },
  { label: 'Sessions', value: '11,204', delta: 9.1, good: true },
  { label: 'Pageviews', value: '31,872', delta: 14.6, good: true },
  { label: 'Pages per session', value: '2.84', delta: 5.0, good: true },
  { label: 'Bounce rate', value: '41.2', unit: '%', delta: -3.1, good: true },
  { label: 'Session duration', value: '3m 12s', delta: 6.4, good: true },
  { label: 'Revenue', value: '$4,920', delta: 18.2, good: true },
] as const;

/** Mini bars under each KPI: the same 30 days, scaled per metric. */
export function kpiBars(index: number) {
  const rnd = seeded(31 + index * 11);
  return VISITORS.map(
    (day) => day.value * (0.82 + rnd() * 0.36) * (index === 6 ? rnd() : 1)
  );
}

export type Source =
  | 'google'
  | 'direct'
  | 'hackernews'
  | 'github'
  | 'newsletter'
  | 'reddit'
  | 'x'
  | 'duckduckgo';

export const REFERRERS: {
  name: string;
  icon: Source;
  revenue: number | null;
  views: number;
  sessions: number;
}[] = [
  {
    name: 'Google',
    icon: 'google',
    revenue: 1240,
    views: 3412,
    sessions: 1288,
  },
  {
    name: 'Direct / Not set',
    icon: 'direct',
    revenue: 980,
    views: 2961,
    sessions: 1104,
  },
  {
    name: 'Hacker News',
    icon: 'hackernews',
    revenue: 640,
    views: 1870,
    sessions: 702,
  },
  {
    name: 'github.com',
    icon: 'github',
    revenue: 310,
    views: 940,
    sessions: 388,
  },
  {
    name: 'newsletter',
    icon: 'newsletter',
    revenue: 420,
    views: 512,
    sessions: 214,
  },
  { name: 'Reddit', icon: 'reddit', revenue: null, views: 388, sessions: 160 },
  { name: 'X', icon: 'x', revenue: null, views: 276, sessions: 121 },
  {
    name: 'DuckDuckGo',
    icon: 'duckduckgo',
    revenue: null,
    views: 190,
    sessions: 88,
  },
];

export const PAGES = [
  { path: '/', views: 9812, sessions: 4120 },
  { path: '/pricing', views: 4206, sessions: 2310 },
  { path: '/docs/quickstart', views: 3118, sessions: 1402 },
  { path: '/blog/edge-analytics', views: 2240, sessions: 1180 },
  { path: '/changelog', views: 1402, sessions: 690 },
  { path: '/signup', views: 1180, sessions: 1020 },
  { path: '/docs/self-hosting', views: 860, sessions: 410 },
  { path: '/blog/durable-objects', views: 744, sessions: 352 },
];

export type Flag =
  | 'us'
  | 'de'
  | 'gb'
  | 'se'
  | 'br'
  | 'jp'
  | 'in'
  | 'tr'
  | 'pt'
  | 'sg'
  | 'au'
  | 'ca'
  | 'ng';

/** Event names keep one colour across every preview (DESIGN.md, Data Palette Rule). */
export const EVENT_COLORS: Record<string, string> = {
  screen_view: '#4cb0e5',
  sign_up: '#6b79ea',
  checkout_started: '#e9ab2b',
  project_created: '#08b6af',
  invite_sent: '#a064db',
  purchase: '#83c758',
};

export const CITIES: { city: string; flag: Flag }[] = [
  { city: 'Berlin', flag: 'de' },
  { city: 'San Francisco', flag: 'us' },
  { city: 'London', flag: 'gb' },
  { city: 'Stockholm', flag: 'se' },
  { city: 'São Paulo', flag: 'br' },
  { city: 'Tokyo', flag: 'jp' },
  { city: 'Bengaluru', flag: 'in' },
  { city: 'Istanbul', flag: 'tr' },
  { city: 'Lisbon', flag: 'pt' },
  { city: 'Singapore', flag: 'sg' },
  { city: 'Sydney', flag: 'au' },
  { city: 'Toronto', flag: 'ca' },
  { city: 'New York', flag: 'us' },
  { city: 'Lagos', flag: 'ng' },
];

export const LIVE_EVENTS: { name: string; path: string; city: string }[] = [
  { name: 'screen_view', path: '/pricing', city: 'Lisbon' },
  { name: 'sign_up', path: '/signup', city: 'Berlin' },
  { name: 'screen_view', path: '/', city: 'São Paulo' },
  { name: 'checkout_started', path: '/checkout', city: 'Tokyo' },
  { name: 'screen_view', path: '/docs/quickstart', city: 'Istanbul' },
  { name: 'project_created', path: '/app', city: 'Toronto' },
  { name: 'screen_view', path: '/changelog', city: 'Singapore' },
  { name: 'invite_sent', path: '/settings/team', city: 'Stockholm' },
  { name: 'screen_view', path: '/blog/edge-analytics', city: 'Sydney' },
  { name: 'purchase', path: '/checkout/done', city: 'New York' },
  { name: 'screen_view', path: '/pricing', city: 'San Francisco' },
  { name: 'screen_view', path: '/docs/self-hosting', city: 'Bengaluru' },
  { name: 'sign_up', path: '/signup', city: 'London' },
  { name: 'screen_view', path: '/', city: 'Lagos' },
];

export function flagOf(city: string): Flag {
  return CITIES.find((c) => c.city === city)?.flag ?? 'us';
}

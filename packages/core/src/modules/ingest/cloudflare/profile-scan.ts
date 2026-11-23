// One profile's page (activity calendar, most used events, most visited
// pages and the event half of its metrics) from a project's stored events,
// with the rules of the ClickHouse profile queries. One scan answers all of
// them; the Durable Object caches it for the few calls one page view makes.

import { AI_INTERNAL_EVENT_NAMES } from '../../ai/ai.constants';
import type { IClickhouseEvent } from '../../event/event.service';
import { eventTimeMs } from './time-buckets';

const POPULAR_ROUTES_LIMIT = 10;
const SESSION_EVENTS = new Set(['screen_view', 'session_start', 'session_end']);
/** Internal AI events stay out of profile stats, as on ClickHouse. */
const AI_INTERNAL = new Set<string>(AI_INTERNAL_EVENT_NAMES);

export interface ProfileEventStats {
  screenViews: number;
  totalEvents: number;
  uniqueDaysActive: number;
  conversionEvents: number;
  revenue: number;
}

export interface ProfileSummary {
  /** Events per UTC day, newest first; `date` as ClickHouse writes it. */
  activity: { date: string; count: number }[];
  mostEvents: { name: string; count: number }[];
  popularRoutes: { path: string; count: number }[];
  stats: ProfileEventStats;
}

function utcDay(ms: number): string {
  return `${new Date(ms).toISOString().slice(0, 10)} 00:00:00`;
}

function ranked<K extends string>(
  counts: Map<string, number>,
  key: K,
  limit?: number
): (Record<K, string> & { count: number })[] {
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(
      ([value, count]) =>
        ({ [key]: value, count }) as Record<K, string> & { count: number }
    );
}

export class ProfileSummaryAccumulator {
  private readonly days = new Map<string, number>();
  private readonly names = new Map<string, number>();
  private readonly paths = new Map<string, number>();
  private readonly stats: ProfileEventStats = {
    screenViews: 0,
    totalEvents: 0,
    uniqueDaysActive: 0,
    conversionEvents: 0,
    revenue: 0,
  };

  constructor(private readonly profileId: string) {}

  add(event: IClickhouseEvent): void {
    if (event.profile_id !== this.profileId || AI_INTERNAL.has(event.name)) {
      return;
    }
    const day = utcDay(eventTimeMs(event.created_at));
    this.days.set(day, (this.days.get(day) ?? 0) + 1);
    this.stats.totalEvents += 1;
    if (event.name === 'screen_view') {
      this.stats.screenViews += 1;
      this.paths.set(event.path, (this.paths.get(event.path) ?? 0) + 1);
    }
    if (!SESSION_EVENTS.has(event.name)) {
      this.stats.conversionEvents += 1;
      this.names.set(event.name, (this.names.get(event.name) ?? 0) + 1);
    }
    if (event.name === 'revenue') {
      this.stats.revenue += event.revenue ?? 0;
    }
  }

  result(): ProfileSummary {
    return {
      activity: [...this.days.entries()]
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([date, count]) => ({ date, count })),
      mostEvents: ranked(this.names, 'name'),
      popularRoutes: ranked(this.paths, 'path', POPULAR_ROUTES_LIMIT),
      stats: { ...this.stats, uniqueDaysActive: this.days.size },
    };
  }
}

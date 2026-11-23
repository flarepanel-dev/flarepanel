// One group's page (event totals, activity per day, most used events and
// most visited pages) from a project's stored events, with the rules of the
// ClickHouse group queries: every event whose `groups` holds the id. One scan
// answers all of them; the Durable Object caches it for the page's calls.

import type { IClickhouseEvent } from '../../event/event.service';
import { eventTimeMs } from './time-buckets';

const TOP_LIST_LIMIT = 10;
const SESSION_EVENTS = new Set(['screen_view', 'session_start', 'session_end']);

export interface GroupSummary {
  totalEvents: number;
  /** ClickHouse date text (UTC) of the first and last event, or null. */
  firstSeen: string | null;
  lastSeen: string | null;
  /** Events per UTC day, newest first. */
  activity: { date: string; count: number }[];
  mostEvents: { name: string; count: number }[];
  popularRoutes: { path: string; count: number }[];
}

function clickhouseText(ms: number): string {
  return new Date(ms).toISOString().replace('T', ' ').replace('Z', '');
}

function top<K extends string>(
  counts: Map<string, number>,
  key: K
): (Record<K, string> & { count: number })[] {
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, TOP_LIST_LIMIT)
    .map(
      ([value, count]) =>
        ({ [key]: value, count }) as Record<K, string> & { count: number }
    );
}

export class GroupSummaryAccumulator {
  private total = 0;
  private first = Number.POSITIVE_INFINITY;
  private last = Number.NEGATIVE_INFINITY;
  private readonly days = new Map<string, number>();
  private readonly names = new Map<string, number>();
  private readonly paths = new Map<string, number>();

  constructor(private readonly groupId: string) {}

  add(event: IClickhouseEvent): void {
    if (!event.groups?.includes(this.groupId)) {
      return;
    }
    const at = eventTimeMs(event.created_at);
    this.total += 1;
    this.first = Math.min(this.first, at);
    this.last = Math.max(this.last, at);
    const day = `${new Date(at).toISOString().slice(0, 10)} 00:00:00`;
    this.days.set(day, (this.days.get(day) ?? 0) + 1);
    if (event.name === 'screen_view' && event.path) {
      this.paths.set(event.path, (this.paths.get(event.path) ?? 0) + 1);
    }
    if (!SESSION_EVENTS.has(event.name)) {
      this.names.set(event.name, (this.names.get(event.name) ?? 0) + 1);
    }
  }

  result(): GroupSummary {
    return {
      totalEvents: this.total,
      firstSeen: this.total > 0 ? clickhouseText(this.first) : null,
      lastSeen: this.total > 0 ? clickhouseText(this.last) : null,
      activity: [...this.days.entries()]
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([date, count]) => ({ date, count })),
      mostEvents: top(this.names, 'name'),
      popularRoutes: top(this.paths, 'path'),
    };
  }
}

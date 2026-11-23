// The Pages report from a project's stored events, with the rules of the
// ClickHouse page queries: page views are `screen_view` events with a path;
// a view lasts until the session's next view (the last view of a session
// counts 0); bounce rate is the share of a page's sessions that bounced; the
// title is the page's latest `__title`. The trend column is the same views
// and sessions per date bucket. Rows have the shape the SQL returns.

import type { IClickhouseEvent } from '../../event/event.service';
import {
  type BucketInterval,
  buildBuckets,
  type WeekStart,
  wallClockText,
} from './time-buckets';

export type PagesSortColumn =
  | 'sessions'
  | 'pageviews'
  | 'bounce_rate'
  | 'avg_duration';

export interface PagesScanQuery {
  from: number;
  to: number;
  search?: string;
  /** Only these pages (the trend column's previous-period rows). */
  pages?: { origin: string; path: string }[];
  sortBy?: PagesSortColumn;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface PageScanRow {
  origin: string;
  path: string;
  title: string;
  sessions: number;
  pageviews: number;
  /** Minutes, two decimals. */
  avg_duration: number;
  /** Percent, two decimals. */
  bounce_rate: number;
  /** Pages matching the query, before limit and offset. */
  total_count: number;
}

export interface PageSeriesQuery {
  from: number;
  to: number;
  interval: BucketInterval;
  timezone: string;
  weekStart?: WeekStart;
  origin?: string;
  path?: string;
  /** Keep only this many of the busiest pages per bucket. */
  topPerBucket?: number;
}

export interface PageSeriesRow {
  origin: string;
  path: string;
  date: string;
  pageviews: number;
  sessions: number;
}

const MS_PER_MINUTE = 60_000;
const PERCENT = 100;

function pageKey(origin: string, path: string): string {
  return `${origin}${path}`;
}

function round2(value: number): number {
  return Math.round(value * PERCENT) / PERCENT;
}

function isPageView(event: IClickhouseEvent): boolean {
  return event.name === 'screen_view' && Boolean(event.path);
}

interface PageTotals {
  origin: string;
  path: string;
  title: string;
  sessions: Set<string>;
  pageviews: number;
  durationMs: number;
}

export class PagesAccumulator {
  private readonly pages = new Map<string, PageTotals>();
  /** Each session's latest view, which lasts until the session's next one. */
  private readonly openViews = new Map<
    string,
    { page: PageTotals; at: number }
  >();
  private readonly viewsPerSession = new Map<string, number>();
  private readonly endedBounce = new Map<string, boolean>();
  private readonly only: Set<string> | null;

  constructor(private readonly query: PagesScanQuery) {
    this.only = query.pages
      ? new Set(query.pages.map((page) => pageKey(page.origin, page.path)))
      : null;
  }

  add(event: IClickhouseEvent, at: number): void {
    if (event.name === 'session_end' && event.session_id) {
      this.endedBounce.set(
        event.session_id,
        String(event.properties?.__bounce) === 'true'
      );
      return;
    }
    if (!isPageView(event)) {
      return;
    }
    const origin = event.origin ?? '';
    const key = pageKey(origin, event.path);
    if (this.only && !this.only.has(key)) {
      // Still ends the session's previous view.
      if (event.session_id) {
        this.closeView(event.session_id, at);
        this.openViews.delete(event.session_id);
      }
      return;
    }
    const page = this.pages.get(key) ?? {
      origin,
      path: event.path,
      title: '',
      sessions: new Set<string>(),
      pageviews: 0,
      durationMs: 0,
    };
    page.pageviews += 1;
    const title = event.properties?.__title;
    if (typeof title === 'string' && title) {
      page.title = title;
    }
    if (event.session_id) {
      page.sessions.add(event.session_id);
      this.closeView(event.session_id, at);
      this.openViews.set(event.session_id, { page, at });
      this.viewsPerSession.set(
        event.session_id,
        (this.viewsPerSession.get(event.session_id) ?? 0) + 1
      );
    }
    this.pages.set(key, page);
  }

  private closeView(sessionId: string, at: number) {
    const open = this.openViews.get(sessionId);
    if (open) {
      open.page.durationMs += Math.max(0, at - open.at);
    }
  }

  private bounced(sessionId: string): boolean {
    const ended = this.endedBounce.get(sessionId);
    if (ended !== undefined) {
      return ended;
    }
    return (this.viewsPerSession.get(sessionId) ?? 0) <= 1;
  }

  rows(): PageScanRow[] {
    const search = this.query.search?.trim().toLowerCase();
    const matching = [...this.pages.values()].filter(
      (page) =>
        !search ||
        page.path.toLowerCase().includes(search) ||
        page.origin.toLowerCase().includes(search) ||
        page.title.toLowerCase().includes(search)
    );
    const rows = matching.map((page) => {
      let bounces = 0;
      for (const sessionId of page.sessions) {
        if (this.bounced(sessionId)) {
          bounces += 1;
        }
      }
      return {
        origin: page.origin,
        path: page.path,
        title: page.title,
        sessions: page.sessions.size,
        pageviews: page.pageviews,
        avg_duration: round2(
          page.pageviews ? page.durationMs / page.pageviews / MS_PER_MINUTE : 0
        ),
        bounce_rate: round2(
          page.sessions.size ? (bounces * PERCENT) / page.sessions.size : 0
        ),
        total_count: matching.length,
      };
    });
    const column = this.query.sortBy ?? 'sessions';
    const direction = this.query.sortOrder === 'asc' ? 1 : -1;
    rows.sort(
      (a, b) =>
        direction * (a[column] - b[column]) ||
        a.origin.localeCompare(b.origin) ||
        a.path.localeCompare(b.path)
    );
    const offset = this.query.offset ?? 0;
    return rows.slice(
      offset,
      this.query.limit === undefined ? undefined : offset + this.query.limit
    );
  }
}

export class PageSeriesAccumulator {
  private readonly buckets;
  private readonly cells = new Map<
    number,
    Map<
      string,
      { origin: string; path: string; views: number; sessions: Set<string> }
    >
  >();

  constructor(private readonly query: PageSeriesQuery) {
    this.buckets = buildBuckets(
      query.from,
      query.to,
      query.interval,
      query.timezone,
      query.weekStart
    );
  }

  private bucketIndex(at: number): number {
    let low = 0;
    let high = this.buckets.length - 1;
    while (low <= high) {
      const middle = Math.floor((low + high) / 2);
      const bucket = this.buckets[middle];
      if (!bucket) {
        return -1;
      }
      if (at < bucket.start) {
        high = middle - 1;
      } else if (at >= bucket.end) {
        low = middle + 1;
      } else {
        return middle;
      }
    }
    return -1;
  }

  add(event: IClickhouseEvent, at: number): void {
    if (!isPageView(event)) {
      return;
    }
    const origin = event.origin ?? '';
    if (
      (this.query.origin !== undefined && origin !== this.query.origin) ||
      (this.query.path !== undefined && event.path !== this.query.path)
    ) {
      return;
    }
    const index = this.bucketIndex(at);
    if (index < 0) {
      return;
    }
    const cell = this.cells.get(index) ?? new Map();
    const key = pageKey(origin, event.path);
    const page = cell.get(key) ?? {
      origin,
      path: event.path,
      views: 0,
      sessions: new Set<string>(),
    };
    page.views += 1;
    if (event.session_id) {
      page.sessions.add(event.session_id);
    }
    cell.set(key, page);
    this.cells.set(index, cell);
  }

  rows(): PageSeriesRow[] {
    const rows: PageSeriesRow[] = [];
    this.buckets.forEach((bucket, index) => {
      const date = wallClockText(bucket.start, this.query.timezone);
      const pages = [...(this.cells.get(index)?.values() ?? [])]
        .sort(
          (a, b) =>
            b.views - a.views ||
            a.origin.localeCompare(b.origin) ||
            a.path.localeCompare(b.path)
        )
        .slice(0, this.query.topPerBucket);
      if (pages.length === 0) {
        // Empty buckets stay on the axis, as ClickHouse's WITH FILL keeps them.
        rows.push({
          origin: this.query.origin ?? '',
          path: this.query.path ?? '',
          date,
          pageviews: 0,
          sessions: 0,
        });
        return;
      }
      for (const page of pages) {
        rows.push({
          origin: page.origin,
          path: page.path,
          date,
          pageviews: page.views,
          sessions: page.sessions.size,
        });
      }
    });
    return rows;
  }
}

// Event counts grouped by one field (`name`, `properties.href`, ...), for the
// overview's Events and Link out boxes: the `count() GROUP BY` queries they
// ran on ClickHouse, over a project's stored events.

import type { IClickhouseEvent } from '../../event/event.service';
import { eventRow, type ProfileLookup, readsLookup } from './chart-scan';
import { matchesFilters, type RowFilter, readField } from './filter-eval';

export interface EventCountQuery {
  from: number;
  to: number;
  /** Field to group by, as filters name it: `name`, `path`, `properties.href`. */
  by: string;
  /** Only these event names. */
  names?: string[];
  excludeNames?: string[];
  filters?: RowFilter[];
  /** Only events whose `groups` hold this id. */
  groupId?: string;
  limit?: number;
}

export interface EventCountRow {
  key: string;
  count: number;
  /** The newest counted event, ClickHouse date text (UTC). */
  lastAt: string;
}

const DEFAULT_LIMIT = 1000;

export class EventCountAccumulator {
  private readonly counts = new Map<string, number>();
  private readonly last = new Map<string, string>();
  private readonly names: Set<string> | null;
  private readonly excluded: Set<string>;
  private readonly needsProfile: boolean;

  constructor(
    private readonly query: EventCountQuery,
    private readonly lookupProfile?: ProfileLookup
  ) {
    this.names = query.names?.length ? new Set(query.names) : null;
    this.excluded = new Set(query.excludeNames ?? []);
    this.needsProfile = (query.filters ?? []).some((filter) =>
      readsLookup(filter.name)
    );
  }

  add(event: IClickhouseEvent): void {
    if (
      (this.names && !this.names.has(event.name)) ||
      this.excluded.has(event.name) ||
      (this.query.groupId && !event.groups?.includes(this.query.groupId))
    ) {
      return;
    }
    const row = eventRow(
      event,
      this.needsProfile ? this.lookupProfile : undefined
    );
    if (
      this.query.filters?.length &&
      !matchesFilters(row, this.query.filters)
    ) {
      return;
    }
    const value = readField(row, this.query.by);
    if (value === null || value === undefined || value === '') {
      return;
    }
    const key = String(value);
    this.counts.set(key, (this.counts.get(key) ?? 0) + 1);
    if (event.created_at > (this.last.get(key) ?? '')) {
      this.last.set(key, event.created_at);
    }
  }

  rows(): EventCountRow[] {
    return [...this.counts.entries()]
      .map(([key, count]) => ({
        key,
        count,
        lastAt: this.last.get(key) ?? '',
      }))
      .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key))
      .slice(0, this.query.limit ?? DEFAULT_LIMIT);
  }
}

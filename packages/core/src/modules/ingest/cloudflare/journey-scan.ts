// The overview's user journey (page-to-page flow) from a project's stored
// events, with the ClickHouse statements' rules: per session, the matching
// page views' `origin + path` in time order with consecutive repeats
// collapsed, cut to `steps` pages and then at the first page seen twice;
// paths of at least two pages; the most common entry pages; and the counted
// transitions (source, target, step) of paths that start with one of them.

import type { IClickhouseEvent } from '../../event/event.service';
import { matchesFilters, type RowFilter } from './filter-eval';

export interface JourneyScanQuery {
  from: number;
  to: number;
  steps: number;
  topEntries: number;
  filters: RowFilter[];
}

export interface JourneyScanResult {
  topEntries: { entry_page: string; count: number }[];
  transitions: {
    source: string;
    target: string;
    step: number;
    value: number;
  }[];
}

const MIN_PATH_LENGTH = 2;

/** `arrayCompact`, `arraySlice(1, steps)`, then cut before the first repeat. */
export function journeyPath(pages: string[], steps: number): string[] {
  const compact: string[] = [];
  for (const page of pages) {
    if (compact.at(-1) !== page) {
      compact.push(page);
    }
  }
  const seen = new Set<string>();
  const path: string[] = [];
  for (const page of compact.slice(0, steps)) {
    if (seen.has(page)) {
      break;
    }
    seen.add(page);
    path.push(page);
  }
  return path;
}

export class JourneyAccumulator {
  private readonly sessions = new Map<
    string,
    { at: number; order: number; page: string }[]
  >();
  private order = 0;

  constructor(
    private readonly query: JourneyScanQuery,
    private readonly row: (event: IClickhouseEvent) => Record<string, unknown>
  ) {}

  add(event: IClickhouseEvent, at: number): void {
    if (event.name !== 'screen_view' || !event.session_id || !event.path) {
      return;
    }
    if (
      this.query.filters.length > 0 &&
      !matchesFilters(this.row(event), this.query.filters)
    ) {
      return;
    }
    const views = this.sessions.get(event.session_id) ?? [];
    views.push({
      at,
      order: this.order++,
      page: `${event.origin ?? ''}${event.path}`,
    });
    this.sessions.set(event.session_id, views);
  }

  result(): JourneyScanResult {
    const paths: string[][] = [];
    for (const views of this.sessions.values()) {
      views.sort((a, b) => a.at - b.at || a.order - b.order);
      const path = journeyPath(
        views.map((view) => view.page),
        this.query.steps
      );
      if (path.length >= MIN_PATH_LENGTH) {
        paths.push(path);
      }
    }
    const entries = new Map<string, number>();
    for (const path of paths) {
      const entry = path[0] as string;
      entries.set(entry, (entries.get(entry) ?? 0) + 1);
    }
    const topEntries = [...entries.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, this.query.topEntries)
      .map(([entry_page, count]) => ({ entry_page, count }));
    const top = new Set(topEntries.map((entry) => entry.entry_page));
    const transitions = new Map<
      string,
      { source: string; target: string; step: number; value: number }
    >();
    for (const path of paths) {
      if (!top.has(path[0] as string)) {
        continue;
      }
      for (let index = 0; index < path.length - 1; index++) {
        const source = path[index] as string;
        const target = path[index + 1] as string;
        const step = index + 1;
        const key = `${step}\u0000${source}\u0000${target}`;
        const entry = transitions.get(key) ?? {
          source,
          target,
          step,
          value: 0,
        };
        entry.value += 1;
        transitions.set(key, entry);
      }
    }
    return {
      topEntries,
      transitions: [...transitions.values()].sort(
        (a, b) => a.step - b.step || b.value - a.value
      ),
    };
  }
}

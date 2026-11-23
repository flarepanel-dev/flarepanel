// The AI page's reads as one Durable Object call. Answers are JSON text in
// the row shapes the ClickHouse queries return, so `createAiService` keeps
// one set of transforms for both sources.

import type {
  AiBreakdownDimension,
  AiBreakdownSort,
  IAiFilters,
} from '../../ai/ai.constants';
import type { IInterval } from '../../report/report.constants';

/** Wall-clock `yyyy-MM-dd[ HH:mm:ss]` boundaries in `timezone`, as the dashboard sends them. */
export interface AiQueryRange {
  startDate: string;
  endDate: string;
  timezone: string;
}

interface AiPageQuery {
  range: AiQueryRange;
  take: number;
  cursor?: string;
  filters?: IAiFilters;
}

export type AiQuery =
  | {
      kind: 'overview';
      range: AiQueryRange;
      interval: IInterval;
      filters?: IAiFilters;
    }
  | {
      kind: 'breakdown';
      range: AiQueryRange;
      dimension: AiBreakdownDimension;
      limit: number;
      sort: AiBreakdownSort;
      filters?: IAiFilters;
    }
  /** `cursor` is the `started_at` (or `created_at`) of the previous page's last row. */
  | ({ kind: 'traces' } & AiPageQuery)
  | ({ kind: 'events' } & AiPageQuery)
  /** `around`: an ISO time near the trace or event, narrowing the search to a day each side. */
  | { kind: 'trace'; traceId: string; around?: string }
  | { kind: 'event'; id: string; around?: string }
  /** Lifetime usage of one profile, group or session. */
  | { kind: 'summary'; by: 'profile' | 'group' | 'session'; id: string }
  | { kind: 'filterValues'; range: AiQueryRange };

// The read side of the Cloudflare ingest path. On Workers, events live in one
// Durable Object per project instead of ClickHouse; the services that the
// first dashboard screens use (event list, project card) read through this
// port when it is present. Bun leaves it unset and keeps its ClickHouse reads.

import type {
  DailyStats,
  ListEventsPage,
  ListEventsQuery,
  ProjectCard,
} from '../../ingest/cloudflare/engine';

export interface EventStore {
  /** Newest first; `cursor` is opaque and comes from the previous page. */
  listEvents(
    projectId: string,
    query: ListEventsQuery
  ): Promise<ListEventsPage>;
  projectCard(projectId: string): Promise<ProjectCard>;
  activeVisitors(projectId: string): Promise<number>;
  /** UTC daily rollups for `from`..`to` and the range's distinct visitors. */
  overview(
    projectId: string,
    from: Date,
    to: Date
  ): Promise<{ visitors: number; days: DailyStats[] }>;
}

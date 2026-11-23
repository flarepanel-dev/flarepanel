// The read side of the Cloudflare ingest path. On Workers, events live in one
// Durable Object per project instead of ClickHouse; the services that the
// first dashboard screens use (event list, project card) read through this
// port when it is present. Bun leaves it unset and keeps its ClickHouse reads.

import type {
  DailyStats,
  Dimension,
  DimensionRow,
  ListEventsPage,
  ListEventsQuery,
  MetricsQuery,
  MetricsResult,
  ProjectCard,
  SessionListQuery,
} from '../../ingest/cloudflare/engine';
import type { RowFilter } from '../../ingest/cloudflare/filter-eval';
import type { LiveSnapshot } from '../../ingest/cloudflare/live-window';
import type {
  ProfileListPage,
  ProfileListQuery,
} from '../../ingest/cloudflare/profile-store';
import type { IClickhouseSession } from '../../session/session.service';

export interface EventStore {
  /** Newest first; `cursor` is opaque and comes from the previous page. */
  listEvents(
    projectId: string,
    query: ListEventsQuery
  ): Promise<ListEventsPage>;
  projectCard(projectId: string): Promise<ProjectCard>;
  activeVisitors(projectId: string): Promise<number>;
  /** Billable events (everything but session_start/session_end) in `from`..`to`. */
  countEvents(projectId: string, from: Date, to: Date): Promise<number>;
  /** Top values of a page, source, place or device dimension over a range. */
  topDimension(
    projectId: string,
    dim: Dimension,
    from: Date,
    to: Date,
    limit?: number,
    filters?: RowFilter[]
  ): Promise<DimensionRow[]>;
  /** Overview totals and series in the project's timezone. */
  metrics(projectId: string, query: MetricsQuery): Promise<MetricsResult>;
  /** The live card: the last 30 minutes by minute. */
  liveData(projectId: string): Promise<LiveSnapshot>;
  /** Sessions, newest first: open ones and the ended-session log. */
  listSessions(
    projectId: string,
    query: SessionListQuery
  ): Promise<IClickhouseSession[]>;
  countSessions(projectId: string, query: SessionListQuery): Promise<number>;
  getSession(
    projectId: string,
    sessionId: string
  ): Promise<IClickhouseSession | null>;
  /** Identified profiles, newest activity first. */
  listProfiles(
    projectId: string,
    query: ProfileListQuery
  ): Promise<ProfileListPage>;
  /** Removes every stored and archived event of these projects. */
  deleteProjects(projectIds: string[]): Promise<void>;
  /** UTC daily rollups for `from`..`to` and the range's distinct visitors. */
  overview(
    projectId: string,
    from: Date,
    to: Date
  ): Promise<{ visitors: number; days: DailyStats[] }>;
}

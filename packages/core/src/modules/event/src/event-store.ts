// The read side of the Cloudflare ingest path. On Workers, events live in one
// Durable Object per project instead of ClickHouse; the services that the
// first dashboard screens use (event list, project card) read through this
// port when it is present. Bun leaves it unset and keeps its ClickHouse reads.

import type {
  ChartRow,
  ChartScanQuery,
} from '../../ingest/cloudflare/chart-scan';
import type {
  ConversionRow,
  ConversionScanQuery,
} from '../../ingest/cloudflare/conversion-scan';
import type {
  DailyStats,
  Dimension,
  DimensionDayRow,
  DimensionRow,
  ListEventsPage,
  ListEventsQuery,
  MetricsQuery,
  MetricsResult,
  ProjectCard,
  SessionListQuery,
} from '../../ingest/cloudflare/engine';
import type {
  EventCountQuery,
  EventCountRow,
} from '../../ingest/cloudflare/event-count-scan';
import type { RowFilter } from '../../ingest/cloudflare/filter-eval';
import type {
  FunnelScanQuery,
  FunnelScanResult,
} from '../../ingest/cloudflare/funnel-scan';
import type { LiveSnapshot } from '../../ingest/cloudflare/live-window';
import type {
  PageScanRow,
  PageSeriesQuery,
  PageSeriesRow,
  PagesScanQuery,
} from '../../ingest/cloudflare/pages-scan';
import type {
  ProfileListPage,
  ProfileListQuery,
} from '../../ingest/cloudflare/profile-store';
import type { RealtimeQuery } from '../../ingest/cloudflare/realtime-scan';
import type {
  RetentionRow,
  RetentionScanQuery,
} from '../../ingest/cloudflare/retention-scan';
import type {
  SankeyScanQuery,
  SankeyScanResult,
} from '../../ingest/cloudflare/sankey-scan';
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
  /** Report builder series rows, the shape ClickHouse's chart query returns. */
  chartRows(
    projectId: string,
    query: ChartScanQuery
  ): Promise<{ rows: ChartRow[]; partial: boolean }>;
  /** Funnel levels and time to convert, the shape of the funnel queries. */
  funnelRows(
    projectId: string,
    query: FunnelScanQuery
  ): Promise<FunnelScanResult & { partial: boolean }>;
  /** Conversion chart rows, the shape of the conversion query. */
  conversionRows(
    projectId: string,
    query: ConversionScanQuery
  ): Promise<{ rows: ConversionRow[]; partial: boolean }>;
  /** The Pages report: one row per page, sorted and paged. */
  pageRows(
    projectId: string,
    query: PagesScanQuery
  ): Promise<{ rows: PageScanRow[]; partial: boolean }>;
  /** Page views and sessions per date bucket. */
  pageSeries(
    projectId: string,
    query: PageSeriesQuery
  ): Promise<{ rows: PageSeriesRow[]; partial: boolean }>;
  /** Event counts grouped by one field, most first. */
  eventCounts(
    projectId: string,
    query: EventCountQuery
  ): Promise<{ rows: EventCountRow[]; partial: boolean }>;
  /** Property keys seen on the project's profiles. */
  profilePropertyKeys(projectId: string): Promise<string[]>;
  /** User flow entries and transitions, the shape of the sankey queries. */
  sankeyRows(
    projectId: string,
    query: SankeyScanQuery
  ): Promise<SankeyScanResult & { partial: boolean }>;
  /** Retention cohorts, the shape of the cohort query. */
  retentionRows(
    projectId: string,
    query: RetentionScanQuery
  ): Promise<{ rows: RetentionRow[]; partial: boolean }>;
  /** Event names with counts, most used first. */
  eventNames(
    projectId: string
  ): Promise<{ name: string; count: number; lastSeen: number }[]>;
  /** Property keys on recent events. */
  propertyKeys(projectId: string, eventName?: string): Promise<string[]>;
  /** Distinct values of a field on recent events. */
  propertyValues(
    projectId: string,
    eventName: string,
    property: string
  ): Promise<string[]>;
  /** Sends an in-app notification to the project's open dashboards. */
  publishNotification(projectId: string, notification: unknown): Promise<void>;
  /** One Realtime page read over the last 30 minutes, as JSON text. */
  realtime(projectId: string, query: RealtimeQuery): Promise<string>;
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
  /** One dimension's totals per UTC day, `fromDay`..`toDay` (`YYYY-MM-DD`). */
  dimensionDays(
    projectId: string,
    dim: Dimension,
    fromDay: string,
    toDay: string
  ): Promise<DimensionDayRow[]>;
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

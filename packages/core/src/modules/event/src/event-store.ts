// The read side of the Cloudflare ingest path. On Workers, events live in one
// Durable Object per project instead of ClickHouse; the services that the
// first dashboard screens use (event list, project card) read through this
// port when it is present. Bun leaves it unset and keeps its ClickHouse reads.

import type { ImportFileStore } from '../../import/src/workers-import';
import type { AiQuery } from '../../ingest/cloudflare/ai-query';
import type {
  BotImportBatch,
  BotImportResult,
  BotStatsQuery,
  BotEventRow as IClickhouseBotEvent,
} from '../../ingest/cloudflare/bot-store';
import type {
  ChartRow,
  ChartScanQuery,
} from '../../ingest/cloudflare/chart-scan';
import type { CohortQuery } from '../../ingest/cloudflare/cohort-query';
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
  ProfileSessionStats,
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
import type { GroupQuery } from '../../ingest/cloudflare/group-query';
import type { GscQuery } from '../../ingest/cloudflare/gsc-store';
import type { ImportQuery } from '../../ingest/cloudflare/import-store';
import type {
  JourneyScanQuery,
  JourneyScanResult,
} from '../../ingest/cloudflare/journey-scan';
import type { LiveSnapshot } from '../../ingest/cloudflare/live-window';
import type {
  PageScanRow,
  PageSeriesQuery,
  PageSeriesRow,
  PagesScanQuery,
} from '../../ingest/cloudflare/pages-scan';
import type { ProfileSummary } from '../../ingest/cloudflare/profile-scan';
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
import type { ToolQuery } from '../../ingest/cloudflare/tool-scans';
import type { IClickhouseSession } from '../../session/session.service';
import type { IBotStats } from '../event.constants';

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
  /** AI page reads, answered as JSON text in the ClickHouse row shapes. */
  ai(projectId: string, query: AiQuery): Promise<string>;
  /** Assistant, MCP and REST reads (retention activity, profile search), as JSON text. */
  tools(projectId: string, query: ToolQuery): Promise<string>;
  /** Search Console numbers (writes from the sync, reads for the SEO page), as JSON text. */
  gsc(projectId: string, query: GscQuery): Promise<string>;
  /** Import staging, sessions and commit in the project's Durable Object; JSON text. */
  importOp(projectId: string, query: ImportQuery): Promise<string>;
  /** R2 copies of import sources (Workers). */
  importFiles?: ImportFileStore;
  /** S3/GCS export: claim one export for a run (false while another holds it). */
  exportClaim(
    projectId: string,
    integrationId: string,
    token: string,
    ttlMs: number
  ): Promise<boolean>;
  exportRelease(
    projectId: string,
    integrationId: string,
    token: string
  ): Promise<void>;
  /** The next stored events after the export's cursor (JSON text) and the chunk id to acknowledge. */
  exportRead(
    projectId: string,
    integrationId: string,
    maxEvents: number
  ): Promise<{ eventsJson: string; through: number }>;
  exportAck(
    projectId: string,
    integrationId: string,
    through: number
  ): Promise<void>;
  /** Cohort compute, members and member activity, answered as JSON text. */
  cohorts(projectId: string, query: CohortQuery): Promise<string>;
  /** Group reads and writes, answered as JSON text. */
  groups(projectId: string, query: GroupQuery): Promise<string>;
  /** One stored event by id, as JSON text (`null` when not found). */
  findEvent(
    projectId: string,
    id: string,
    createdAt?: Date
  ): Promise<string | null>;
  /** One dimension's totals per bucket, for per-value trends. */
  dimensionSeries(
    projectId: string,
    dim: Dimension,
    buckets: { start: number; end: number }[],
    filters?: RowFilter[]
  ): Promise<{ start: number; rows: DimensionRow[] }[]>;
  /** The overview's user journey (top entry pages and transitions). */
  journeyRows(
    projectId: string,
    query: JourneyScanQuery
  ): Promise<JourneyScanResult & { partial: boolean }>;
  /** Per UTC day totals, stored and pending. */
  dailyStats(projectId: string, from: Date, to: Date): Promise<DailyStats[]>;
  /** Property keys seen on the project's profiles. */
  profilePropertyKeys(
    projectId: string,
    options?: { anonymous?: boolean }
  ): Promise<string[]>;
  /** Distinct values of one profile field, for filter pickers. */
  profilePropertyValues(projectId: string, property: string): Promise<string[]>;
  /** One profile's page: activity, top events and pages, metrics. */
  profileSummary(
    projectId: string,
    profileId: string
  ): Promise<
    ProfileSummary & {
      sessions: ProfileSessionStats;
      firstSeen: string | null;
      lastSeen: string | null;
    }
  >;
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
  /** Detected bot hits, newest first, with the total kept. */
  botEvents?(
    projectId: string,
    page: { limit: number; offset: number }
  ): Promise<{ rows: IClickhouseBotEvent[]; count: number }>;
  /** Bot hit totals per UTC day, bot and path (every hit, not only listed). */
  botStats?(projectId: string, query: BotStatsQuery): Promise<IBotStats>;
  /**
   * Hourly bot estimates from another source (a connected Cloudflare zone),
   * replacing that source's rows for the batch's hours.
   */
  botImport?(
    projectId: string,
    batch: BotImportBatch
  ): Promise<BotImportResult>;
  /**
   * A page of a session's replay chunks in playback order (started, ended,
   * index), each with its rrweb events as JSON text. `offset` counts chunks.
   */
  replayChunks?(
    projectId: string,
    sessionId: string,
    page: { offset: number; limit: number }
  ): Promise<{ chunk_index: number; payload: string }[]>;
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

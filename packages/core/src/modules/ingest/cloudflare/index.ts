// Entry point for the Cloudflare ingest runtime (`@flarepanel/core/ingest/cloudflare`).
// Kept off the main barrel so the Bun build never loads it.

export {
  type AdvancedAnalytics,
  AdvancedAnalyticsBudgetError,
  type AdvancedAnalyticsUsage,
} from '../../event/src/advanced-analytics';
export {
  type ArchiveBucket,
  type ArchiveObject,
  archivePrefix,
  buildArchiveObjects,
  type ColdStore,
  createArchiveColdStore,
} from './archive';
export {
  BASIN_EVENT_SCHEMA,
  type BasinEventRow,
  toBasinRow,
} from './basin-row';
export { assertTableName } from './basin-sql';
export {
  type ChartRow,
  type ChartScanEvent,
  type ChartScanQuery,
  eventRow,
  type ProfileLookup,
} from './chart-scan';
export type {
  ConversionRow,
  ConversionScanQuery,
} from './conversion-scan';
export {
  type DailyStats,
  type Dimension,
  type DimensionDayRow,
  type DimensionRow,
  type EngineClock,
  type EngineCodec,
  type EngineSql,
  type ListEventsPage,
  type ListEventsQuery,
  type MetricsQuery,
  type MetricsResult,
  openProjectEventsEngine,
  type ProjectCard,
  type ProjectEventsEngine,
  type RangeStats,
  type SessionListQuery,
  type SqlRow,
  type SqlValue,
  type StoredChunk,
  type TickResult,
} from './engine';
export type {
  EventCountQuery,
  EventCountRow,
} from './event-count-scan';
export { type RowFilter, unsupportedFilters } from './filter-eval';
export type { FunnelScanQuery, FunnelScanResult } from './funnel-scan';
export type { GroupQuery } from './group-query';
export type { GroupSummary } from './group-scan';
export {
  type GroupStore,
  openGroupStore,
  type StoredGroup,
} from './group-store';
export type {
  JourneyScanQuery,
  JourneyScanResult,
} from './journey-scan';
export type { LiveSnapshot } from './live-window';
export type {
  PageScanRow,
  PageSeriesQuery,
  PageSeriesRow,
  PagesScanQuery,
  PagesSortColumn,
} from './pages-scan';
export type { ProfileSummary } from './profile-scan';
export {
  openProfileStore,
  type ProfileListPage,
  type ProfileListQuery,
  type ProfileStore,
  profileFromVisitor,
  type SeenVisitor,
} from './profile-store';
export {
  createProjectEventsService,
  type ProjectEventsProject,
  type ProjectEventsService,
  type ProjectEventsTrackInput,
  type ProjectEventsTrackResult,
} from './project-events';
export type {
  RealtimeLocationFilter,
  RealtimeQuery,
} from './realtime-scan';
export type {
  RetentionInterval,
  RetentionRow,
  RetentionScanQuery,
} from './retention-scan';
export type {
  SankeyScanQuery,
  SankeyScanResult,
} from './sankey-scan';
export {
  type BucketInterval,
  buildBuckets,
  type WeekStart,
  wallClockIso,
  wallClockText,
  wallClockToMs,
} from './time-buckets';

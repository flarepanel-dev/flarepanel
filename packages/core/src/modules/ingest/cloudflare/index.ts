// Entry point for the Cloudflare ingest runtime (`@flarepanel/core/ingest/cloudflare`).
// Kept off the main barrel so the Bun build never loads it.

export {
  type AdvancedAnalytics,
  AdvancedAnalyticsBudgetError,
  type AdvancedAnalyticsUsage,
} from '../../event/src/advanced-analytics';
export type { AiQuery, AiQueryRange } from './ai-query';
export { aiRangeMs, answerAiQuery } from './ai-scan';
export {
  AI_CONTENT_TTL_MS,
  type AiContent,
  type AiContentArchive,
  type AiStore,
  aiContentKey,
  aiContentPrefix,
  flushAiContent,
  loadAiContent,
  openAiStore,
} from './ai-store';
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
  BOT_EVENTS_PER_DAY,
  BOT_EVENTS_TTL_MS,
  BOT_IMPORT_SAMPLES_MAX,
  type BotAddOptions,
  type BotAddResult,
  type BotEventRow,
  type BotImportBatch,
  type BotImportResult,
  type BotImportRow,
  type BotStatsQuery,
  type BotStore,
  openBotStore,
} from './bot-store';
export {
  type ChartRow,
  type ChartScanEvent,
  type ChartScanQuery,
  eventRow,
  type ProfileLookup,
} from './chart-scan';
export {
  cohortRowFilters,
  evaluateCohort,
} from './cohort-eval';
export type {
  CohortActivity,
  CohortComputeResult,
  CohortQuery,
} from './cohort-query';
export { type CohortStore, openCohortStore } from './cohort-store';
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
export {
  type GscQuery,
  type GscStore,
  type GscStoredRow,
  openGscStore,
} from './gsc-store';
export {
  type ImportQuery,
  type ImportState,
  type ImportStore,
  openImportStore,
} from './import-store';
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
  type ProjectEventsCap,
  type ProjectEventsProject,
  type ProjectEventsService,
  type ProjectEventsTrackInput,
  type ProjectEventsTrackResult,
} from './project-events';
export type {
  RealtimeLocationFilter,
  RealtimeQuery,
} from './realtime-scan';
export {
  isReplayId,
  openReplayIndex,
  REPLAY_TTL_MS,
  type ReplayChunkRef,
  type ReplayIndex,
  replayChunkKey,
  replayPrefix,
} from './replay-store';
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
  wallClockEndMs,
  wallClockIso,
  wallClockText,
  wallClockToMs,
} from './time-buckets';
export {
  answerToolQuery,
  type FindProfilesQuery,
  type ToolQuery,
} from './tool-scans';
export { createTrialCapCounter } from './trial-cap';

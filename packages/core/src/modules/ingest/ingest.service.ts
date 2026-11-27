// Nothing here throws for a caller error: each transport owns its own status
// codes and bodies, so the pipeline returns a `TrackOutcome` instead.

import { generateId } from '@flarepanel/shared';
import { parseUserAgent } from '@flarepanel/shared/server';
import { assocPath, pathOr, pick } from 'ramda';
import { v4 as uuid } from 'uuid';
import type { Buffers } from '../../buffers/create-buffers';
import { resolveSessionTimeoutMs } from '../../buffers/session-buffer';
import type { DbScope } from '../../cacheable-per-deps';
import type { AsnInfo, GeoLocation } from '../../clients/geo';
import type { Logger } from '../../logger';
import type { ServiceDeps, Services } from '../../services';
import { headerValue, type IngestHeaders } from '../../shared/headers';
import { generateDeviceId } from '../../shared/profileId';
import type { IAiPayload } from '../ai/ai.constants';
import { normalizeAiPayload } from '../ai/ai.service';
import { createBotEvent } from '../event/event.service';
import { getOrganizationByProjectIdCached } from '../organization/organization.service';
import {
  getProfileById,
  identifyProfile,
  upsertProfile,
} from '../profile/profile.service';
import { getSalts } from '../salt/salt.service';
import { convertClickhouseDateToJs } from '../session/src/dates';
import {
  type DeprecatedPostEventPayload,
  type IAssignGroupPayload,
  type ICrawlPayload,
  type IDecrementPayload,
  type IGroupPayload,
  type IIdentifyPayload,
  type IIncrementPayload,
  type IReplayPayload,
  type ITrackHandlerPayload,
  type ITrackPayload,
  zLooseIdentifyPayload,
} from './ingest.constants';
import type {
  DeviceRequest,
  IngestBackend,
  PartitionBy,
  TrackDraft,
} from './src/backend';
import { isBot } from './src/bots/detect';
import { applyBotSuspicion, stripBotProperties } from './src/bots/suspicion';
import { createBunIngestBackend } from './src/bun-backend';
import { isDuplicatedEvent } from './src/deduplicate';
import type { DeviceIdResult } from './src/device-id';
import type { IncomingEventProducer } from './src/incoming-event';

export type { IngestHeaders } from '../../shared/headers';
export type {
  BotRecordOutcome,
  DeviceRequest,
  DuplicateCheck,
  GeoRequest,
  IngestBackend,
  IngestBotHit,
  IngestSink,
  PartitionBy,
  ResolvedGeo,
  TrackDraft,
} from './src/backend';
export type { BotMatch } from './src/bots/detect';
export { detectBot, isBot } from './src/bots/detect';
export {
  applyBotSuspicion,
  BOT_CATEGORY_THRESHOLD,
  type BotSuspicion,
  stripBotProperties,
  summarizeBotSignals,
} from './src/bots/suspicion';
export {
  type BunIngestBackendOptions,
  createBunIngestBackend,
} from './src/bun-backend';
export {
  type IngestAuthErrorPayload,
  type IngestAuthOutcome,
  validateIngestRequest,
} from './src/client-auth';
export { isDuplicatedEvent } from './src/deduplicate';
export { getDeviceId } from './src/device-id';
export type {
  IncomingEventPayload,
  IncomingEventProducer,
} from './src/incoming-event';

/** The buffers this module touches. A subset of `AppDeps.buffers`. */
export type IngestBuffers = Pick<Buffers, 'session' | 'replay' | 'group'>;

export interface IngestTransport {
  /** Replay chunks and group rows; events go through `backend.sink`. */
  buffers: Pick<IngestBuffers, 'replay' | 'group'>;
  backend: IngestBackend;
  deps: ServiceDeps;
}

/** What the two context builders below need: the Postgres client the salt
 *  cache keys on, and the idle window every session decision reads. */
type IngestScope = DbScope & Pick<ServiceDeps, 'config' | 'logger'>;

const QUEUE_PAYLOAD_HEADERS = [
  'user-agent',
  'openpanel-sdk-name',
  'openpanel-sdk-version',
  'openpanel-client-id',
  'request-id',
];

const MAX_OVERRIDE_DEVICE_ID_LENGTH = 64;
const ONE_MINUTE_MS = 60 * 1000;
const FIFTEEN_MINUTES_MS = 15 * ONE_MINUTE_MS;
/**
 * A floor, not a window. Back-dating is a documented feature — the tracking
 * docs describe it and the Mixpanel migration guide imports years-old events
 * through it — so historical imports must keep working. This only catches
 * values that cannot be a real event time: `__timestamp: 12345` is read as
 * epoch milliseconds and lands on 1970-01-01, after which every date-filled
 * series starts there.
 */
const EARLIEST_ACCEPTED_TIMESTAMP_MS = Date.UTC(2000, 0, 1);
const FALLBACK_USER_AGENT = 'unknown/1.0';
const NO_DEVICE: DeviceIdResult = { deviceId: '', sessionId: '' };

/** The whitelisted subset that ships with the queue payload. */
export function getStringHeaders(
  headers: IngestHeaders
): Record<string, string | undefined> {
  const stringHeaders: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(
    pick(QUEUE_PAYLOAD_HEADERS, headers)
  )) {
    stringHeaders[key] = value ? String(value) : undefined;
  }
  return stringHeaders;
}

function getIdentity(body: ITrackHandlerPayload): IIdentifyPayload | undefined {
  if (body.type === 'track') {
    const submitted = body.payload.properties?.__identify;
    if (submitted !== undefined) {
      const identity = zLooseIdentifyPayload.safeParse(submitted);
      if (identity.success) {
        return identity.data;
      }
    }

    return body.payload.profileId
      ? { profileId: String(body.payload.profileId) }
      : undefined;
  }

  if (body.type === 'ai') {
    return body.payload.profileId
      ? { profileId: String(body.payload.profileId) }
      : undefined;
  }

  return undefined;
}

function sanitizeOverrideDeviceId(raw: unknown): string | undefined {
  if (typeof raw !== 'string') {
    return undefined;
  }
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > MAX_OVERRIDE_DEVICE_ID_LENGTH) {
    return undefined;
  }
  return trimmed;
}

/** Resolve a caller-supplied device id from `properties.__deviceId`. */
export function getOverrideDeviceId(
  body: ITrackHandlerPayload
): string | undefined {
  if (body.type === 'ai') {
    return sanitizeOverrideDeviceId(body.payload.deviceId);
  }
  if (body.type !== 'track') {
    return undefined;
  }
  return sanitizeOverrideDeviceId(body.payload?.properties?.__deviceId);
}

/**
 * `properties.__timestamp` off whatever arrived: `/event` has no body schema,
 * so `payload` can be a string or null, and `'properties' in payload` throws
 * on a primitive.
 */
export function getPropertyTimestamp(payload: unknown): unknown {
  if (typeof payload !== 'object' || payload === null) {
    return undefined;
  }
  if (!('properties' in payload)) {
    return undefined;
  }
  const { properties } = payload as { properties?: { __timestamp?: unknown } };
  return properties?.__timestamp;
}

/** The back-date a validated `/track` body carries, by its declared type. */
export function getUserDefinedTimestamp(body: ITrackHandlerPayload): unknown {
  if (body.type === 'ai') {
    return body.payload.timestamp;
  }
  return getPropertyTimestamp(body.payload);
}

export function getTimestamp(
  timestamp: number | undefined,
  userDefinedTimestamp: unknown
): { timestamp: number; isTimestampFromThePast: boolean } {
  const safeTimestamp = timestamp || Date.now();
  const isUsable =
    typeof userDefinedTimestamp === 'string' ||
    typeof userDefinedTimestamp === 'number';
  if (!(isUsable && userDefinedTimestamp)) {
    return { timestamp: safeTimestamp, isTimestampFromThePast: false };
  }

  const clientTimestamp = new Date(userDefinedTimestamp);
  const clientTimestampNumber = clientTimestamp.getTime();

  if (
    Number.isNaN(clientTimestampNumber) ||
    clientTimestampNumber < EARLIEST_ACCEPTED_TIMESTAMP_MS ||
    clientTimestampNumber > safeTimestamp + ONE_MINUTE_MS
  ) {
    return { timestamp: safeTimestamp, isTimestampFromThePast: false };
  }

  const isTimestampFromThePast =
    clientTimestampNumber < safeTimestamp - FIFTEEN_MINUTES_MS;

  return { timestamp: clientTimestampNumber, isTimestampFromThePast };
}

export interface TrackContext {
  projectId: string;
  ip: string;
  ua?: string;
  // Whitelisted subset (getStringHeaders) that ships with the queue payload.
  headers: Record<string, string | undefined>;
  // Full raw request headers — bot signals need sec-ch-ua / sec-fetch-* /
  // accept-language, which the whitelist above deliberately drops.
  requestHeaders: IngestHeaders;
  clientSecretAuth: boolean;
  timestamp: { value: number; isFromPast: boolean };
  identity?: IIdentifyPayload;
  /** Resolved up front, except for event types the sink resolves itself. */
  deviceId: string;
  sessionId: string;
  /** Null for an event with no device of its own (an AI call). */
  device: DeviceRequest | null;
  geo: GeoLocation;
  asnInfo: AsnInfo;
}

/** What a transport hands the pipeline, after its own auth ran. */
export interface TrackRequest {
  projectId: string | null | undefined;
  clientIp: string;
  headers: IngestHeaders;
  clientSecretAuth: boolean;
  /** The request-arrival timestamp. */
  timestamp: number | undefined;
  body: ITrackHandlerPayload;
  /** `request.cf` on Workers. */
  cf?: unknown;
}

export type TrackOutcome =
  | { status: 'ok'; deviceId: string; sessionId: string }
  | { status: 'alias-not-supported' }
  | { status: 'invalid-type' }
  | { status: 'missing-project-id' }
  | { status: 'replay-missing-session-id' }
  | { status: 'profile-not-found' }
  | { status: 'profile-property-not-a-number' };

/** `track` and `ai` events resolve their device inside `sink.track`. */
const SINK_RESOLVED_TYPES = new Set(['track', 'ai']);

async function buildContext(
  deps: IngestScope,
  request: TrackRequest,
  backend: IngestBackend
): Promise<TrackContext> {
  const projectId = request.projectId as string;
  const timestamp = getTimestamp(
    request.timestamp,
    getUserDefinedTimestamp(request.body)
  );
  const overrideIp =
    request.body.type === 'track'
      ? request.body.payload.properties?.__ip
      : undefined;
  const ip = overrideIp ? (overrideIp as string) : request.clientIp;
  const ua = headerValue(request.headers, 'user-agent') ?? FALLBACK_USER_AGENT;

  const headers = getStringHeaders(request.headers);
  const identity = getIdentity(request.body);
  const profileId = identity?.profileId;

  if (profileId && request.body.type === 'track') {
    request.body.payload.profileId = profileId;
  }

  const overrideDeviceId = getOverrideDeviceId(request.body);

  // Get geo location (needed for track and identify) + ASN (bot detection).
  const [{ geo, asnInfo }, salts] = await Promise.all([
    backend.geo({ ip, ipOverridden: Boolean(overrideIp), cf: request.cf }),
    getSalts(deps),
  ]);

  // The ip + user-agent hash identifies a browser; for an AI call it would
  // only name the backend that made it, and show up as an anonymous user.
  const isDeviceless = request.body.type === 'ai' && !overrideDeviceId;
  const device: DeviceRequest | null = isDeviceless
    ? null
    : {
        projectId,
        ip,
        ua,
        salts,
        overrideDeviceId,
        eventTimeMs: timestamp.timestamp,
      };
  const isResolvedBySink = SINK_RESOLVED_TYPES.has(request.body.type);
  const deviceIdResult =
    device && !isResolvedBySink
      ? await backend.sink.resolveDevice(device)
      : NO_DEVICE;

  return {
    projectId,
    ip,
    ua,
    headers,
    requestHeaders: request.headers,
    clientSecretAuth: request.clientSecretAuth,
    timestamp: {
      value: timestamp.timestamp,
      isFromPast: timestamp.isTimestampFromThePast,
    },
    identity,
    deviceId: deviceIdResult.deviceId,
    sessionId: deviceIdResult.sessionId,
    device,
    geo,
    asnInfo,
  };
}

async function handleTrack(
  payload: ITrackPayload,
  context: TrackContext,
  transport: IngestTransport
): Promise<DeviceIdResult> {
  const { projectId, geo, headers, timestamp } = context;

  const uaInfo = parseUserAgent(headers['user-agent'], payload.properties);
  // Mark (never block) likely bot traffic with __bot / __bot_reasons props.
  payload.properties = applyBotSuspicion(payload.properties, {
    asnInfo: context.asnInfo,
    headers: context.requestHeaders,
    clientSecretAuth: context.clientSecretAuth,
    isServer: uaInfo.isServer,
  });
  const serverPartition: PartitionBy = payload.profileId
    ? { by: 'key', key: `${projectId}:${payload.profileId}` }
    : { by: 'random' };
  const draft: TrackDraft = {
    device: context.device,
    event: {
      // The id of the ClickHouse row this event becomes, minted here so a
      // redelivered Kafka message is a duplicate we can recognise.
      id: uuid(),
      projectId,
      headers,
      event: {
        ...payload,
        groups: payload.groups ?? [],
        timestamp: timestamp.value,
        isTimestampFromThePast: timestamp.isFromPast,
      },
      uaInfo,
      geo,
    },
    partitionBy: uaInfo.isServer ? serverPartition : { by: 'device' },
  };

  const hasIdentity =
    context.identity && Object.keys(context.identity).length > 1;
  const [identity] = await Promise.all([
    transport.backend.sink.track(draft),
    hasIdentity && context.identity
      ? handleIdentify(transport.deps, context.identity, context)
      : undefined,
  ]);
  return identity;
}

/**
 * An AI event is a server event in all but name: no bot scoring, no session
 * of its own. It keys the partition on the profile so one user's trace stays
 * ordered, and ships the typed row draft next to the slim `events` payload.
 */
async function handleAi(
  payload: IAiPayload,
  context: TrackContext,
  transport: IngestTransport
): Promise<DeviceIdResult> {
  const { projectId, geo, headers, timestamp } = context;
  const normalized = normalizeAiPayload(payload);
  const uaInfo = parseUserAgent(headers['user-agent'], undefined);
  const profileId =
    payload.profileId === undefined ? undefined : String(payload.profileId);

  return await transport.backend.sink.track({
    device: context.device,
    event: {
      id: uuid(),
      projectId,
      headers,
      event: {
        name: normalized.name,
        properties: normalized.properties,
        profileId,
        groups: payload.groups ?? [],
        timestamp: timestamp.value,
        isTimestampFromThePast: timestamp.isFromPast,
      },
      uaInfo,
      geo,
      ai: normalized.draft,
    },
    partitionBy: profileId
      ? { by: 'key', key: `${projectId}:${profileId}` }
      : { by: 'device' },
  });
}

async function handleIdentify(
  deps: ServiceDeps,
  payload: IIdentifyPayload,
  context: TrackContext
): Promise<void> {
  // Profiles must not carry forged bot verdicts either.
  stripBotProperties(payload.properties);
  const userAgent = parseUserAgent(context.ua, payload.properties);
  await identifyProfile(deps, context.projectId, payload, {
    geo: context.geo,
    userAgent,
  });
}

async function adjustProfileProperty(
  deps: ServiceDeps,
  payload: IIncrementPayload | IDecrementPayload,
  projectId: string,
  direction: 1 | -1
): Promise<TrackOutcome | null> {
  const { profileId, property, value } = payload;
  const profile = await getProfileById(deps, String(profileId), projectId);
  if (!profile) {
    return { status: 'profile-not-found' };
  }

  const parsed = Number.parseInt(
    pathOr<string>('0', property.split('.'), profile.properties),
    10
  );

  if (Number.isNaN(parsed)) {
    return { status: 'profile-property-not-a-number' };
  }

  await upsertProfile(deps, {
    id: profile.id,
    projectId,
    properties: assocPath(
      property.split('.'),
      parsed + direction * (value || 1),
      profile.properties
    ),
    isExternal: true,
  });

  return null;
}

/** Replay only needs the server-issued session id (the SDK echoes it back).
 *  Trust it — scoped to the authed project, unguessable, same trust level as
 *  event data. */
export async function handleReplay(
  payload: IReplayPayload,
  {
    projectId,
    sessionId,
  }: { projectId: string; sessionId: string | undefined },
  replayBuffer: IngestBuffers['replay']
): Promise<TrackOutcome | null> {
  if (!sessionId) {
    return { status: 'replay-missing-session-id' };
  }

  await replayBuffer.add({
    project_id: projectId,
    session_id: sessionId,
    chunk_index: payload.chunk_index,
    started_at: payload.started_at,
    ended_at: payload.ended_at,
    events_count: payload.events_count,
    is_full_snapshot: payload.is_full_snapshot,
    payload: payload.payload,
  });
  return null;
}

async function handleGroup(
  payload: IGroupPayload,
  context: TrackContext,
  groupBuffer: IngestBuffers['group']
): Promise<void> {
  const { id, type, name, properties = {} } = payload;
  await groupBuffer.add({
    id,
    projectId: context.projectId,
    type,
    name,
    properties,
  });
}

async function handleAssignGroup(
  deps: ServiceDeps,
  payload: IAssignGroupPayload,
  context: TrackContext
): Promise<void> {
  const profileId = payload.profileId ?? context.deviceId;
  if (!profileId) {
    return;
  }
  await upsertProfile(deps, {
    id: String(profileId),
    projectId: context.projectId,
    isExternal: !!payload.profileId,
    groups: payload.groupIds,
  });
}

/** `POST /track`. An unknown type still resolves geo/device before it is
 *  refused. */
/** Request types that write profiles, groups or replays, not events. */
const PROFILE_ONLY_TYPES = new Set<string>([
  'identify',
  'increment',
  'decrement',
  'group',
  'assign_group',
  'replay',
]);

export async function ingestTrack(
  request: TrackRequest,
  transport: IngestTransport
): Promise<TrackOutcome> {
  const body = request.body;

  if (body.type === 'alias') {
    return { status: 'alias-not-supported' };
  }

  if (!request.projectId) {
    return { status: 'missing-project-id' };
  }

  const context = await buildContext(
    transport.deps,
    request,
    transport.backend
  );
  let identity: DeviceIdResult = {
    deviceId: context.deviceId,
    sessionId: context.sessionId,
  };

  if (
    transport.backend.storesProfiles === false &&
    PROFILE_ONLY_TYPES.has(body.type)
  ) {
    return { status: 'ok', ...identity };
  }

  switch (body.type) {
    case 'track':
      identity = await handleTrack(body.payload, context, transport);
      break;
    case 'identify':
      await handleIdentify(transport.deps, body.payload, context);
      break;
    case 'increment': {
      const failure = await adjustProfileProperty(
        transport.deps,
        body.payload,
        context.projectId,
        1
      );
      if (failure) {
        return failure;
      }
      break;
    }
    case 'decrement': {
      const failure = await adjustProfileProperty(
        transport.deps,
        body.payload,
        context.projectId,
        -1
      );
      if (failure) {
        return failure;
      }
      break;
    }
    case 'replay': {
      // BACKCOMPAT(replay-sessionid): TEMPORARY legacy branch, remove when new SDK is fully deployed
      const failure = await handleReplay(
        body.payload,
        {
          projectId: context.projectId,
          sessionId: body.payload.sessionId || context.sessionId,
        },
        transport.buffers.replay
      );
      if (failure) {
        return failure;
      }
      break;
    }
    case 'group':
      await handleGroup(body.payload, context, transport.buffers.group);
      break;
    case 'assign_group':
      await handleAssignGroup(transport.deps, body.payload, context);
      break;
    case 'ai':
      identity = await handleAi(body.payload, context, transport);
      break;
    default:
      return { status: 'invalid-type' };
  }

  return { status: 'ok', ...identity };
}

/**
 * Two things worth knowing about the shape of this:
 *
 * It gates on `windDownStep`, not on `subscriptionState`. Every expired trial
 * is already in `trial_expired`, so gating on the state would block thousands
 * of orgs at once, skipping the four warning emails entirely.
 *
 * It answers 202, not 402 or 403 (the caller does; this returns the verdict).
 * The SDKs treat only 401 and 2xx as terminal, so a "correct" status code
 * would multiply traffic from exactly the clients we are trying to quiet down.
 */
const WIND_DOWN_BLOCKED_STEPS = new Set(['blocked', 'final_warning']);

/**
 * A free trial stops collecting once it is over its event allowance: unlike a
 * paid plan, which keeps collecting over its limit (only the charts pause),
 * a trial has no one paying for the extra storage and requests. Workspaces
 * that start without a trial (limit 0) stop at their first counted events.
 */
export function isTrialOverLimit(organization: {
  subscriptionStatus: string | null;
  subscriptionProductId: string | null;
  subscriptionPeriodEventsCount: number;
  subscriptionPeriodEventsLimit: number;
  subscriptionPeriodEventsCountExceededAt: Date | string | null;
}): boolean {
  return (
    organization.subscriptionStatus === 'trialing' &&
    !organization.subscriptionProductId &&
    organization.subscriptionPeriodEventsCountExceededAt !== null &&
    organization.subscriptionPeriodEventsCount >
      organization.subscriptionPeriodEventsLimit
  );
}

const LAPSED_GRACE_MS = 7 * 24 * 60 * 60 * 1000;
const ENDED_STATUSES = new Set(['canceled', 'unpaid', 'incomplete_expired']);

/**
 * A paid plan that ended more than 7 days ago stops collecting, like an
 * expired trial: otherwise one month's payment would buy free collection
 * forever. A pause is different (it resumes by itself) and keeps collecting.
 */
export function isSubscriptionLapsed(
  organization: {
    subscriptionStatus: string | null;
    subscriptionEndsAt: Date | string | null;
    subscriptionCanceledAt: Date | string | null;
  },
  now: number = Date.now()
): boolean {
  const time = (value: Date | string | null) =>
    value ? new Date(value).getTime() : null;
  const endsAt = time(organization.subscriptionEndsAt);
  let endedAt: number | null = null;
  if (ENDED_STATUSES.has(organization.subscriptionStatus ?? '')) {
    // Ended early (revoked or refunded): the period end is still in the
    // future, so the cancellation time is when it really ended.
    endedAt =
      endsAt !== null && endsAt <= now
        ? endsAt
        : (time(organization.subscriptionCanceledAt) ?? endsAt);
  } else if (organization.subscriptionStatus === 'active') {
    // A missed webhook: the paid period is long over.
    endedAt = endsAt;
  }
  return endedAt !== null && now - endedAt > LAPSED_GRACE_MS;
}

export async function isIngestionWoundDown(
  deps: ServiceDeps,
  request: {
    projectId: string | null | undefined;
    selfHosted: boolean;
    logger: Logger;
  }
): Promise<boolean> {
  if (request.selfHosted || !request.projectId) {
    return false;
  }

  const { projectId, logger } = request;

  try {
    // Cached for 5 minutes and invalidated by the Polar webhook, so paying
    // again lifts the block on the next checkout rather than on a TTL.
    const organization = await getOrganizationByProjectIdCached(
      deps,
      projectId
    );

    if (!organization) {
      return false;
    }
    const woundDown = Boolean(
      organization.windDownStep &&
        WIND_DOWN_BLOCKED_STEPS.has(organization.windDownStep)
    );
    const trialOverLimit = isTrialOverLimit(organization);
    const lapsed = isSubscriptionLapsed(organization);
    if (!(woundDown || trialOverLimit || lapsed)) {
      return false;
    }

    logger.info(
      {
        organizationId: organization.id,
        projectId,
        windDownStep: organization.windDownStep,
        trialOverLimit,
        lapsed,
      },
      trialOverLimit
        ? 'Ingestion blocked: trial over its event allowance'
        : lapsed
          ? 'Ingestion blocked: plan ended more than 7 days ago'
          : 'Ingestion blocked by wind-down'
    );
    return true;
  } catch (error) {
    // Fail open. Dropping a paying customer's events because Redis or Postgres
    // hiccuped is far worse than letting a blocked org through for a tick.
    logger.error(
      { err: error, projectId },
      'Wind-down check failed, allowing ingestion'
    );
    return false;
  }
}

/**
 * `POST /event` — the legacy compat route, kept because production still has
 * projects posting to it.
 *
 * It is NOT `ingestTrack` with a different body: the legacy payload carries a
 * client-supplied ISO `timestamp`, has no `type` discriminator, no schema, and
 * no identify/increment/replay branches, so it builds its own queue payload
 * and mints the event id at the producer like `/track` does.
 */
export type LegacyEventOutcome =
  | { status: 'ok' }
  | { status: 'missing-project-id' };

function legacyProfileId(raw: unknown): string | undefined {
  return typeof raw === 'string' || typeof raw === 'number'
    ? String(raw)
    : undefined;
}

export async function ingestLegacyEvent(
  request: {
    projectId: string | null | undefined;
    clientIp: string;
    headers: IngestHeaders;
    clientSecretAuth: boolean;
    /** The request-arrival timestamp. */
    timestamp: number | undefined;
    body: DeprecatedPostEventPayload | null | undefined;
    /** `request.cf` on Workers. */
    cf?: unknown;
  },
  transport: IngestTransport
): Promise<LegacyEventOutcome> {
  const { projectId } = request;
  if (!projectId) {
    return { status: 'missing-project-id' };
  }

  // An event with no name is not an event. Writing one with `name = ''` shows
  // up in every picker and breakdown. The status stays 202 — this route has
  // no body schema and the HTTP contract must not change — but nothing is
  // written.
  const name = (request.body as { name?: unknown } | null | undefined)?.name;
  if (typeof name !== 'string' || name.trim() === '') {
    return { status: 'ok' };
  }

  const { timestamp, isTimestampFromThePast } = getTimestamp(
    request.timestamp,
    getPropertyTimestamp(request.body)
  );
  const ip = request.clientIp;
  const ua = headerValue(request.headers, 'user-agent') ?? FALLBACK_USER_AGENT;
  const headers = getStringHeaders(request.headers);

  const [salts, { geo, asnInfo }] = await Promise.all([
    getSalts(transport.deps),
    transport.backend.geo({ ip, ipOverridden: false, cf: request.cf }),
  ]);

  const uaInfo = parseUserAgent(ua, request.body?.properties);
  // Mark (never block) likely bot traffic with __bot / __bot_reasons props.
  // This deprecated route has no body schema, so body can be null/undefined.
  if (request.body) {
    request.body.properties = applyBotSuspicion(request.body.properties, {
      asnInfo,
      headers: request.headers,
      clientSecretAuth: request.clientSecretAuth,
      isServer: uaInfo.isServer,
    });
  }

  const partitionBy: PartitionBy = uaInfo.isServer
    ? {
        by: 'key',
        key: `${projectId}:${request.body?.profileId ?? generateId()}`,
      }
    : { by: 'device' };

  await transport.backend.sink.track({
    device: { projectId, ip, ua, salts },
    event: {
      // See handleTrack: the producer mints the event id.
      id: uuid(),
      projectId,
      headers,
      // Picked, not spread: this route has no body schema, and a stray field
      // (`groups` as an object, the body's `clientSecret`) would otherwise
      // ride into Kafka and onto the shared buffers' insert batches.
      event: {
        name,
        profileId: legacyProfileId(request.body?.profileId),
        properties: request.body?.properties,
        groups: [],
        timestamp,
        isTimestampFromThePast,
      },
      uaInfo,
      geo,
    } as TrackDraft['event'],
    partitionBy,
  });

  return { status: 'ok' };
}

export type DeviceIdentity =
  | { status: 'ok'; deviceId: string; sessionId: string; message: string }
  | { status: 'missing-project-id' }
  | { status: 'missing-ip' }
  | { status: 'missing-user-agent' };

/** `GET /track/device-id`. */
export async function fetchDeviceIdentity(
  deps: IngestScope,
  request: {
    projectId: string | null | undefined;
    clientIp: string | undefined;
    headers: IngestHeaders;
  },
  buffers: Pick<IngestBuffers, 'session'>,
  logger: Logger
): Promise<DeviceIdentity> {
  const salts = await getSalts(deps);
  const sessionTimeoutMs = resolveSessionTimeoutMs(deps.config);
  const projectId = request.projectId;
  if (!projectId) {
    return { status: 'missing-project-id' };
  }

  const ip = request.clientIp;
  if (!ip) {
    return { status: 'missing-ip' };
  }

  const ua = headerValue(request.headers, 'user-agent');
  if (!ua) {
    return { status: 'missing-user-agent' };
  }

  const currentDeviceId = generateDeviceId({
    salt: salts.current,
    origin: projectId,
    ip,
    ua,
  });
  const previousDeviceId = generateDeviceId({
    salt: salts.previous,
    origin: projectId,
    ip,
    ua,
  });

  try {
    const [current, previous] = await buffers.session.getExistingSessions(
      projectId,
      [currentDeviceId, previousDeviceId]
    );

    // Blob has no TTL — only treat the session as "current" if its last
    // event is within the idle window. Otherwise the SDK should ask the
    // server to start a fresh session id on the next event.
    const now = Date.now();

    if (current && isLiveSession(current, now, sessionTimeoutMs)) {
      return {
        status: 'ok',
        deviceId: currentDeviceId,
        sessionId: current.id,
        message: 'current session exists for this device id',
      };
    }

    if (previous && isLiveSession(previous, now, sessionTimeoutMs)) {
      return {
        status: 'ok',
        deviceId: previousDeviceId,
        sessionId: previous.id,
        message: 'previous session exists for this device id',
      };
    }
  } catch (error) {
    logger.error(
      { err: error },
      'Error getting session end GET /track/device-id'
    );
  }

  return {
    status: 'ok',
    deviceId: currentDeviceId,
    sessionId: '',
    message: 'No session exists for this device id',
  };
}

/** The web SDK can fire the same event twice; this catches the duplicate. */
export async function isDuplicateIngestRequest(
  request: {
    method: string;
    clientIp: string | undefined;
    headers: IngestHeaders;
    body: unknown;
  },
  backend: Pick<IngestBackend, 'isDuplicate'>
): Promise<boolean> {
  const ip = request.clientIp;
  const origin = headerValue(request.headers, 'origin');
  const clientId = headerValue(request.headers, 'openpanel-client-id');
  const isReplay = isTrackBody(request) && request.body.type === 'replay';
  const shouldCheck = ip && origin && clientId && !isReplay;

  if (!shouldCheck) {
    return false;
  }

  return await backend.isDuplicate({
    ip,
    origin,
    payload: request.body as Record<string, unknown>,
    projectId: clientId,
  });
}

function isTrackBody(request: {
  method: string;
  body: unknown;
}): request is { method: string; body: ITrackHandlerPayload } {
  if (request.method !== 'POST') {
    return false;
  }
  if (!request.body) {
    return false;
  }
  if (typeof request.body !== 'object' || Array.isArray(request.body)) {
    return false;
  }
  return 'type' in request.body;
}

export type BotVerdict = { name: string; type: string } | null;

/**
 * Requests authenticated with a client secret come from server-side SDKs
 * (node, php, go, rust, java, python, …). That auth is a far
 * stronger signal of legitimate first-party traffic than the user agent, so
 * never treat them as bots — bot detection is for public/frontend
 * (origin-authenticated) traffic.
 */
export async function checkIngestBot(
  request: {
    headers: IngestHeaders;
    clientSecretAuth: boolean;
    projectId: string | null | undefined;
    body: unknown;
  },
  backend: Pick<IngestBackend, 'recordBot'>
): Promise<BotVerdict> {
  if (request.clientSecretAuth) {
    return null;
  }

  const userAgent = headerValue(request.headers, 'user-agent');
  const bot = userAgent ? await isBot(userAgent) : null;

  if (!(bot && request.projectId)) {
    return null;
  }

  const path = getBotEventPath(request.body);
  if (path) {
    await backend.recordBot({
      ...bot,
      projectId: request.projectId,
      path,
      createdAt: new Date(),
    });
  }

  return bot;
}

function getBotEventPath(body: unknown): string | undefined {
  if (!body || typeof body !== 'object') {
    return undefined;
  }
  if ('type' in body && (body as ITrackHandlerPayload).type === 'track') {
    const properties = (
      body as { payload?: { properties?: Record<string, unknown> } }
    ).payload?.properties;
    return (properties?.__path || properties?.path) as string | undefined;
  }
  // Handle deprecated events (v1)
  if ('name' in body && 'properties' in body) {
    const properties = (body as { properties?: Record<string, unknown> })
      .properties;
    return (properties?.__path || properties?.path) as string | undefined;
  }
  return undefined;
}

const ABSOLUTE_URL = /^https?:\/\//i;
const HOST_PATTERN = /^[a-z0-9.-]+(?::\d{1,5})?$/i;

/** The full URL when a host is given, as the browser's bot rows store. */
function crawlPath(payload: ICrawlPayload): string {
  const path = payload.path.trim();
  if (ABSOLUTE_URL.test(path) || !payload.host) {
    return path;
  }
  const host = payload.host.trim().toLowerCase();
  if (!HOST_PATTERN.test(host)) {
    return path;
  }
  return `https://${host}${path.startsWith('/') ? '' : '/'}${path}`;
}

export interface CrawlOutcome {
  bot: BotVerdict;
  /** The project's monthly bot allowance is used up: the hit was not kept. */
  capped: boolean;
}

/**
 * `POST /track/crawl`: a page request a customer's server or edge saw. A known
 * bot's hit is kept for the bots page; anything else is dropped. Never an
 * analytics event, never billed. The caller has proven the client secret.
 */
export async function recordCrawlHit(
  request: { projectId: string; payload: ICrawlPayload; now?: Date },
  backend: Pick<IngestBackend, 'recordBot'>
): Promise<CrawlOutcome> {
  const { payload } = request;
  const userAgent = payload.userAgent.trim();
  const bot = userAgent ? await isBot(userAgent) : null;
  if (!bot) {
    return { bot: null, capped: false };
  }
  const verifiedCategory = payload.verifiedCategory?.trim() || undefined;
  const outcome = await backend.recordBot({
    ...bot,
    projectId: request.projectId,
    path: crawlPath(payload),
    createdAt: request.now ?? new Date(),
    status: payload.status,
    // A verified bot category is the edge saying it checked the bot.
    verified: payload.verified ?? (verifiedCategory ? true : undefined),
    verifiedCategory,
  });
  return { bot, capped: outcome?.capped ?? false };
}

function isLiveSession(
  session: { ended_at: string },
  now: number,
  sessionTimeoutMs: number
): boolean {
  return (
    now - convertClickhouseDateToJs(session.ended_at).getTime() <
    sessionTimeoutMs
  );
}

export function createIngestService(
  deps: ServiceDeps,
  _services: () => Services
) {
  const bunBackend = (produceIncomingEvent: IncomingEventProducer) =>
    createBunIngestBackend({
      deps,
      sessionBuffer: deps.buffers.session,
      produceIncomingEvent,
    });

  const track = (
    request: TrackRequest,
    produceIncomingEvent: IncomingEventProducer
  ): Promise<TrackOutcome> =>
    ingestTrack(request, {
      buffers: deps.buffers,
      backend: bunBackend(produceIncomingEvent),
      deps,
    });

  const checkBot = (
    request: Parameters<typeof checkIngestBot>[0]
  ): Promise<BotVerdict> =>
    checkIngestBot(request, {
      recordBot: async (event) => {
        await createBotEvent(deps, event);
        return undefined;
      },
    });

  const isDuplicate = (
    request: Parameters<typeof isDuplicateIngestRequest>[0]
  ): Promise<boolean> =>
    isDuplicateIngestRequest(request, { isDuplicate: isDuplicatedEvent });

  return { track, checkBot, isDuplicate };
}

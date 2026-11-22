// The storage seam under `/track`: everything the ingest routes need that is
// bound to a runtime. On Bun it is Redis, MaxMind and Kafka (`bun-backend.ts`);
// on Workers it is `request.cf` and the project's Durable Object.

import type { AsnInfo, GeoLocation } from '../../../clients/geo';
import type { IServiceCreateBotEventPayload } from '../../event/event.service';
import type { DeviceIdResult } from './device-id';
import type { IncomingEventPayload } from './incoming-event';

/** What the duplicate lock keys on: the whole body plus who sent it. */
export interface DuplicateCheck {
  ip: string;
  origin: string;
  payload: Record<string, unknown>;
  projectId: string;
}

export interface GeoRequest {
  /** The address the event is attributed to: the caller, or `__ip`. */
  ip: string;
  /** True when `__ip` replaced the caller's address. */
  ipOverridden: boolean;
  /** `request.cf` on Workers; absent on Bun. */
  cf?: unknown;
}

export interface ResolvedGeo {
  geo: GeoLocation;
  asnInfo: AsnInfo;
}

/** The inputs device and session id derivation reads. */
export interface DeviceRequest {
  projectId: string;
  ip: string;
  ua: string | undefined;
  salts: { current: string; previous: string };
  overrideDeviceId?: string;
  /** Defaults to the arrival time. */
  eventTimeMs?: number;
}

/**
 * How the Bun sink keys its Kafka partition once the device id is known:
 * events of one device (or one server-side profile) stay ordered.
 */
export type PartitionBy =
  | { by: 'device' }
  | { by: 'key'; key: string }
  | { by: 'random' };

/** A tracked event before its device and session are resolved. */
export interface TrackDraft {
  /** Null for an event with no device of its own (an AI call). */
  device: DeviceRequest | null;
  event: Omit<IncomingEventPayload, 'deviceId' | 'sessionId'>;
  partitionBy: PartitionBy;
}

export interface IngestSink {
  /** Identity for a request that stores no event (identify, replay, …). */
  resolveDevice(device: DeviceRequest): Promise<DeviceIdResult>;
  /** Store one event; resolves once it is accepted. */
  track(draft: TrackDraft): Promise<DeviceIdResult>;
}

export interface IngestBackend {
  /**
   * False where profiles, groups and replays have no store yet (Workers in
   * Phase 3a): identify, increment, decrement, group, assign_group and replay
   * are accepted and dropped instead of failing. Defaults to true.
   */
  storesProfiles?: boolean;
  isDuplicate(check: DuplicateCheck): Promise<boolean>;
  recordBot(event: IServiceCreateBotEventPayload): Promise<void>;
  geo(request: GeoRequest): Promise<ResolvedGeo>;
  sink: IngestSink;
}

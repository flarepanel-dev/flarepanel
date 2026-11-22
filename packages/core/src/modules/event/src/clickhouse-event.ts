// The `events` row an ingested event becomes. A leaf with no I/O, so the
// Cloudflare ingest engine builds the same row the ClickHouse buffer receives.

import { DateTime, toDots } from '@flarepanel/shared';
import type {
  IClickhouseEvent,
  IServiceCreateEventPayloadWithId,
} from '../event.service';

const CLICKHOUSE_DATETIME_FORMAT = 'yyyy-MM-dd HH:mm:ss.SSS';

/**
 * `insertedAt` is the ingestion time, used as the export cursor. Stamped here
 * rather than via the column DEFAULT so backdated events (server-side,
 * offline, past timestamps) still get a real, monotonic-ish insert time
 * instead of their event time.
 */
export function buildClickhouseEvent(
  payload: IServiceCreateEventPayloadWithId,
  insertedAt: Date = new Date()
): IClickhouseEvent {
  return {
    id: payload.id ?? crypto.randomUUID(),
    name: payload.name,
    device_id: payload.deviceId,
    profile_id: payload.profileId ? String(payload.profileId) : '',
    project_id: payload.projectId,
    session_id: payload.sessionId,
    properties: toDots(payload.properties),
    path: payload.path ?? '',
    origin: payload.origin ?? '',
    created_at: toClickhouseDateTime(payload.createdAt),
    country: payload.country ?? '',
    city: payload.city ?? '',
    region: payload.region ?? '',
    longitude: payload.longitude ?? null,
    latitude: payload.latitude ?? null,
    os: payload.os ?? '',
    os_version: payload.osVersion ?? '',
    browser: payload.browser ?? '',
    browser_version: payload.browserVersion ?? '',
    device: payload.device ?? '',
    brand: payload.brand ?? '',
    model: payload.model ?? '',
    duration: payload.duration ?? 0,
    referrer: payload.referrer ?? '',
    referrer_name: payload.referrerName ?? '',
    referrer_type: payload.referrerType ?? '',
    imported_at: null,
    inserted_at: toClickhouseDateTime(insertedAt),
    sdk_name: payload.sdkName ?? '',
    sdk_version: payload.sdkVersion ?? '',
    revenue: payload.revenue,
    groups: payload.groups ?? [],
  };
}

function toClickhouseDateTime(date: Date): string {
  return DateTime.fromJSDate(date)
    .setZone('UTC')
    .toFormat(CLICKHOUSE_DATETIME_FORMAT);
}

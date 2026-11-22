// The `session_end` event for a closed session, as pure functions: the Redis
// job and the Cloudflare ingest engine close sessions with the same payload.

import type { IServiceCreateEventPayload } from '../../event/event.service';
import type { IClickhouseSession } from '../session.service';
import { convertClickhouseDateToJs } from './dates';

/** The session_end event lands one second after the last event. */
const SESSION_END_OFFSET_MS = 1000;

export interface EnqueueSessionEndInput {
  payload: IServiceCreateEventPayload;
  closedSession: IClickhouseSession;
}

/** What rides on the `sessions` queue. */
export interface SessionEndJobData {
  event: IServiceCreateEventPayload;
  snapshot: IClickhouseSession;
}

export function sessionEndJobPayload({
  payload,
  closedSession,
}: EnqueueSessionEndInput): SessionEndJobData {
  return {
    event: {
      ...payload,
      projectId: closedSession.project_id,
      deviceId: closedSession.device_id,
      sessionId: closedSession.id,
      profileId: closedSession.profile_id || payload.profileId,
    },
    snapshot: closedSession,
  };
}

/**
 * `payload` is the event the close was triggered from (the boundary event or
 * the reaper's synthetic one); `session` is the state being closed.
 */
export function buildSessionEndPayload(
  payload: Omit<IServiceCreateEventPayload, 'createdAt'>,
  session: IClickhouseSession
): IServiceCreateEventPayload {
  return {
    ...payload,
    sessionId: session.id,
    properties: {
      ...payload.properties,
      __bounce: session.is_bounce,
    },
    name: 'session_end',
    duration: session.duration ?? 0,
    path: session.exit_path ?? '',
    createdAt: new Date(
      convertClickhouseDateToJs(session.ended_at).getTime() +
        SESSION_END_OFFSET_MS
    ),
    profileId: session.profile_id || payload.profileId,
  };
}

/** The trigger payload for closing a session no event is ending: the reaper's. */
export function sessionEndPayloadFromSnapshot(
  session: IClickhouseSession
): IServiceCreateEventPayload {
  return {
    projectId: session.project_id,
    deviceId: session.device_id,
    sessionId: session.id,
    profileId: session.profile_id ?? '',
    name: 'session_end',
    properties: {},
    groups: session.groups ?? [],
    createdAt: new Date(session.ended_at),
    duration: session.duration ?? 0,
    sdkName: '',
    sdkVersion: '',
    city: session.city ?? '',
    country: session.country ?? '',
    region: session.region ?? '',
    longitude: session.longitude ?? undefined,
    latitude: session.latitude ?? undefined,
    path: session.exit_path ?? '',
    origin: session.exit_origin ?? '',
    referrer: session.referrer ?? '',
    referrerName: session.referrer_name ?? '',
    referrerType: session.referrer_type ?? '',
    os: session.os ?? '',
    osVersion: session.os_version ?? '',
    browser: session.browser ?? '',
    browserVersion: session.browser_version ?? '',
    device: session.device ?? '',
    brand: session.brand ?? '',
    model: session.model ?? '',
  };
}

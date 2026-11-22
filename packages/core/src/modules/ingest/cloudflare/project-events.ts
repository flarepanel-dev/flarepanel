// What one project's Durable Object does per request, without the Durable
// Object: device and session ids from the engine's live sessions, the shared
// `incomingEvent()` pipeline with engine-backed dependencies, and the
// durability barrier before answering. The Worker class in apps/worker only
// adapts storage, alarms, R2 and sockets around this.

import type { Logger } from '../../../logger';
import type { DeviceRequest, TrackDraft } from '../src/backend';
import { type DeviceIdResult, getDeviceId } from '../src/device-id';
import {
  type IncomingEventDeps,
  type IncomingEventProject,
  incomingEvent,
} from '../src/incoming-event-handler';
import type { ProjectEventsEngine } from './engine';

const NO_DEVICE: DeviceIdResult = { deviceId: '', sessionId: '' };

/** Project fields the pipeline reads, loaded by the Worker from D1's cache. */
export interface ProjectEventsProject extends IncomingEventProject {
  aiStoreContent?: boolean | null;
}

export interface ProjectEventsTrackInput {
  draft: TrackDraft;
  project: ProjectEventsProject | null;
  /** Dedupe key for the whole request; skipped when absent. */
  dedupeKey?: string;
}

export interface ProjectEventsTrackResult extends DeviceIdResult {
  /** The project had no first event and this request stored one. */
  firstEvent: boolean;
  duplicate: boolean;
}

export interface ProjectEventsServiceOptions {
  engine: ProjectEventsEngine;
  logger: Logger;
  sessionTimeoutMs: number;
  /** Called after each stored batch, e.g. to schedule the alarm. */
  onStored?: () => void;
}

export function createProjectEventsService({
  engine,
  logger,
  sessionTimeoutMs,
  onStored,
}: ProjectEventsServiceOptions) {
  const resolveDevice = (device: DeviceRequest): Promise<DeviceIdResult> =>
    getDeviceId({
      ...device,
      sessionBuffer: engine.sessions,
      sessionTimeoutMs,
      logger,
    });

  async function track({
    draft,
    project,
    dedupeKey,
  }: ProjectEventsTrackInput): Promise<ProjectEventsTrackResult> {
    const identity = draft.device
      ? await resolveDevice(draft.device)
      : NO_DEVICE;
    if (dedupeKey && engine.isDuplicate(dedupeKey)) {
      return { ...identity, firstEvent: false, duplicate: true };
    }

    let firstEvent = false;
    const deps: IncomingEventDeps = {
      logger,
      sessions: engine.sessions,
      createEvent: engine.createEvent,
      // Notifications and AI rows arrive with Phase 3b / 4.
      checkNotificationRulesForEvent: () => Promise.resolve(null),
      projects: {
        getCached: () => Promise.resolve(project),
        markFirstEvent: () => {
          firstEvent = true;
          return Promise.resolve();
        },
        getAiStoreContent: () =>
          Promise.resolve(project?.aiStoreContent ?? null),
      },
      enqueueSessionEnd: engine.endSession,
      metrics: {
        sessionStarted: () => undefined,
        sessionEndEnqueued: () => undefined,
      },
      aiEvents: { add: () => Promise.resolve() },
    };

    await incomingEvent({ ...draft.event, ...identity }, deps);
    // The answer means "stored": wait for the group commit.
    await engine.sync();
    onStored?.();
    return { ...identity, firstEvent, duplicate: false };
  }

  return {
    track,
    resolveDevice,
    getExistingSessions: (projectId: string, deviceIds: string[]) =>
      engine.sessions.getExistingSessions(projectId, deviceIds),
  };
}

export type ProjectEventsService = ReturnType<
  typeof createProjectEventsService
>;

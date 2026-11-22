// The ingest backend on Bun: the Redis duplicate lock, MaxMind geo, the Redis
// session buffer for device/session ids and Kafka for events.

import { generateId } from '@flarepanel/shared';
import { resolveSessionTimeoutMs } from '../../../buffers/session-buffer';
import { getAsnInfo, getGeoLocation } from '../../../clients/geo';
import type { ServiceDeps } from '../../../services';
import { createBotEvent } from '../../event/event.service';
import type { DeviceRequest, IngestBackend, PartitionBy } from './backend';
import { isDuplicatedEvent } from './deduplicate';
import {
  type DeviceIdResult,
  getDeviceId,
  type SessionBufferReader,
} from './device-id';
import type { IncomingEventProducer } from './incoming-event';

const NO_DEVICE: DeviceIdResult = { deviceId: '', sessionId: '' };

export interface BunIngestBackendOptions {
  deps: ServiceDeps;
  sessionBuffer: SessionBufferReader;
  produceIncomingEvent: IncomingEventProducer;
}

function partitionKey(partitionBy: PartitionBy, deviceId: string): string {
  switch (partitionBy.by) {
    case 'key':
      return partitionBy.key;
    case 'device':
      return deviceId || generateId();
    default:
      return generateId();
  }
}

export function createBunIngestBackend({
  deps,
  sessionBuffer,
  produceIncomingEvent,
}: BunIngestBackendOptions): IngestBackend {
  const resolveDevice = (device: DeviceRequest): Promise<DeviceIdResult> =>
    getDeviceId({
      ...device,
      sessionBuffer,
      sessionTimeoutMs: resolveSessionTimeoutMs(deps.config),
      logger: deps.logger,
    });

  return {
    isDuplicate: isDuplicatedEvent,
    recordBot: async (event) => {
      await createBotEvent(deps, event);
    },
    geo: async ({ ip }) => {
      const [geo, asnInfo] = await Promise.all([
        getGeoLocation(ip),
        getAsnInfo(ip),
      ]);
      return { geo, asnInfo };
    },
    sink: {
      resolveDevice,
      track: async ({ device, event, partitionBy }) => {
        const identity = device ? await resolveDevice(device) : NO_DEVICE;
        await produceIncomingEvent(
          { ...event, ...identity },
          partitionKey(partitionBy, identity.deviceId)
        );
        return identity;
      },
    },
  };
}

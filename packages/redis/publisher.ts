import type { Prisma } from '@flarepanel/db';
import { getPlatformStores } from '@flarepanel/platform';
import { getSuperJson, setSuperJson } from '@flarepanel/shared';
import { getRedisSub, type Redis } from './redis';

export type IPublishChannels = {
  organization: {
    subscription_updated: {
      organizationId: string;
    };
  };
  events: {
    batch: { projectId: string; count: number };
  };
  notification: {
    created: Prisma.NotificationUncheckedCreateInput;
  };
  ops: {
    garbage_collect: { requestedAt: string };
  };
};

export function getSubscribeChannel<Channel extends keyof IPublishChannels>(
  channel: Channel,
  type: keyof IPublishChannels[Channel]
) {
  return `${channel}:${String(type)}`;
}

/**
 * Publishes on the configured platform pub/sub (Redis on Bun, a Durable Object
 * hub on Workers). `multi` keeps the old transactional form for callers that
 * publish inside a Redis MULTI; it is Redis-only.
 */
export function publishEvent<Channel extends keyof IPublishChannels>(
  channel: Channel,
  type: keyof IPublishChannels[Channel],
  event: IPublishChannels[Channel][typeof type],
  multi?: ReturnType<Redis['multi']>
) {
  const message = setSuperJson(event);
  const subscribeChannel = getSubscribeChannel(channel, type);
  if (multi) {
    return multi.publish(subscribeChannel, message);
  }
  return getPlatformStores().pubsub.publish(subscribeChannel, message);
}

export function parsePublishedEvent<Channel extends keyof IPublishChannels>(
  _channel: Channel,
  _type: keyof IPublishChannels[Channel],
  message: string
): IPublishChannels[Channel][typeof _type] {
  return getSuperJson<IPublishChannels[Channel][typeof _type]>(message)!;
}

export function subscribeToPublishedEvent<
  Channel extends keyof IPublishChannels,
>(
  channel: Channel,
  type: keyof IPublishChannels[Channel],
  callback: (event: IPublishChannels[Channel][typeof type]) => void
) {
  const subscribeChannel = getSubscribeChannel(channel, type);

  // Reference counting per channel lives in the pub/sub implementation, so
  // closing one subscriber never silences another on the same channel.
  const subscription = getPlatformStores().pubsub.subscribe(
    subscribeChannel,
    (message) => {
      const event = parsePublishedEvent(channel, type, message);
      if (event) {
        callback(event);
      }
    }
  );

  return () => subscription.unsubscribe();
}

export function psubscribeToPublishedEvent(
  pattern: string,
  callback: (key: string) => void
) {
  getRedisSub().psubscribe(pattern);
  const pmessage = (_: unknown, pattern: string, key: string) => callback(key);

  getRedisSub().on('pmessage', pmessage);

  return () => {
    getRedisSub().punsubscribe(pattern);
    getRedisSub().off('pmessage', pmessage);
  };
}

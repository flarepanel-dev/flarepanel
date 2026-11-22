import { storeContract } from '@flarepanel/platform/testing';
import Redis from 'ioredis';
import { afterAll, describe, expect, test } from 'vitest';
import { createRedisStores } from './stores';

// Needs the Redis from docker-compose (CI runs it as a service).
const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:23379', {
  lazyConnect: true,
  maxRetriesPerRequest: 1,
});

afterAll(() => redis.quit());

storeContract({ describe, test, expect }, 'redis', () =>
  createRedisStores(redis)
);

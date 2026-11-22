// A real `ServiceDeps` for integration tests, pointed at the isolated
// `openpanel_test` databases by preload.ts. `clients`, `buffers` and `queues`
// stay unbuilt, so a test that reaches one gets a named error instead of
// silently working against a half-built container.

import { createMemoryStores } from '@flarepanel/platform';
import type { Logger } from '../src/logger';
import type { ServiceDeps, Services } from '../src/services';
import { testCoreConfig } from './config-fixture';

/** Records what the ClickHouse/Postgres call was logged with: the requestId chain's observation point. */
export function recordingLogger(
  bindings: Record<string, unknown> = {},
  lines: Array<{ bindings: Record<string, unknown>; message: string }> = []
): Logger & { lines: typeof lines; bindings: Record<string, unknown> } {
  const noop = () => undefined;
  const logger = {
    bindings,
    lines,
    fatal: noop,
    error: noop,
    warn: noop,
    info: (_obj: unknown, message?: string) => {
      lines.push({ bindings, message: message ?? '' });
    },
    debug: noop,
    trace: noop,
    child: (extra: Record<string, unknown>) =>
      recordingLogger({ ...bindings, ...extra }, lines),
  };
  return logger as unknown as Logger & {
    lines: typeof lines;
    bindings: Record<string, unknown>;
  };
}

function unavailable(name: string): never {
  throw new Error(`${name} is not built in this test`);
}

/** The `services()` thunk every factory takes; calling it is a named error unless a suite passes its own. */
export function testServices(): () => Services {
  return () => unavailable('services()');
}

export async function testServiceDeps(
  overrides: Partial<ServiceDeps> = {}
): Promise<ServiceDeps> {
  const [{ db, Prisma }, { ch }, redis] = await Promise.all([
    import('@flarepanel/db/src/prisma-client'),
    import('@flarepanel/db/src/clickhouse/client'),
    import('@flarepanel/redis').then((m) => m.getRedisCache()),
  ]);
  return {
    db,
    prisma: { DbNull: Prisma.DbNull, JsonNull: Prisma.JsonNull },
    ch,
    redis,
    // In-memory stores: each suite starts clean and needs no Redis for them.
    stores: createMemoryStores(),
    logger: recordingLogger(),
    config: testCoreConfig(),
    auth: null,
    get clients(): never {
      return unavailable('ServiceDeps.clients');
    },
    get buffers(): never {
      return unavailable('ServiceDeps.buffers');
    },
    get queues(): never {
      return unavailable('ServiceDeps.queues');
    },
    ...overrides,
  };
}

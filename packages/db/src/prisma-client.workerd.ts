/**
 * The Prisma client for Cloudflare Workers: no Rust engine, Cloudflare D1
 * through `@prisma/adapter-d1`. The Worker build aliases
 * `@flarepanel/db/src/prisma-client` to this module, so the rest of the code
 * keeps importing `db` and `Prisma` as before.
 *
 * `db` is bound to the D1 database once per isolate with `bindD1Database`,
 * which the Worker calls before handling its first request. Typed as the Bun
 * client: both are generated from the same schema.
 */

import { AsyncLocalStorage } from 'node:async_hooks';
import { PrismaD1 } from '@prisma/adapter-d1';
import type { PrismaClient as BunPrismaClient } from './generated/prisma/client';
import { PrismaClient } from './generated/prisma-workerd/client';
import {
  extendPrismaClient,
  type FlarepanelPrismaClient,
} from './prisma-extend';

export * from './generated/prisma-workerd/client';

/** The part of the D1 binding the adapter needs; structural, so this file needs no Workers types. */
type D1DatabaseLike = ConstructorParameters<typeof PrismaD1>[0];

let binding: D1DatabaseLike | undefined;
let current: FlarepanelPrismaClient | undefined;

function createClient(database: D1DatabaseLike): FlarepanelPrismaClient {
  const client = new PrismaClient({
    adapter: new PrismaD1(database),
    errorFormat: 'minimal',
    log: [
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'warn' },
    ],
  });
  return extendPrismaClient(
    client as unknown as BunPrismaClient<'error' | 'warn'>
  );
}

export function bindD1Database(
  database: D1DatabaseLike
): FlarepanelPrismaClient {
  binding = database;
  current ??= createClient(database);
  return current;
}

/**
 * One Prisma client per request. Prisma batches `findUnique` calls made in the
 * same tick into one query through a per-client dataloader. With one client
 * per isolate, two concurrent requests' lookups merged, the query's I/O ran in
 * the first request, and the Workers runtime cancelled the second as hung (it
 * had no I/O of its own left), answering 500 / error 1101 at random under
 * load. Prisma's Cloudflare guide creates the client per request for this
 * reason.
 */
const requestClients = new AsyncLocalStorage<{
  client?: FlarepanelPrismaClient;
}>();

/**
 * Runs `fn` with its own Prisma client, created on its first database call,
 * so a request that never touches D1 pays nothing. Outside a scope (Durable
 * Objects, tests) `db` uses the isolate's shared client.
 */
export function withRequestDb<T>(fn: () => T): T {
  return requestClients.run({}, fn);
}

function activeClient(): FlarepanelPrismaClient {
  if (!(current && binding)) {
    throw new Error(
      'D1 is not bound yet: call bindD1Database(env.DB) before using db'
    );
  }
  const scope = requestClients.getStore();
  if (!scope) {
    return current;
  }
  scope.client ??= createClient(binding);
  return scope.client;
}

export const db = new Proxy({} as FlarepanelPrismaClient, {
  get(_target, property) {
    const client = activeClient();
    const value = Reflect.get(client, property);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

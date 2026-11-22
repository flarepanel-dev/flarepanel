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

let current: FlarepanelPrismaClient | undefined;

export function bindD1Database(
  database: D1DatabaseLike
): FlarepanelPrismaClient {
  if (!current) {
    const client = new PrismaClient({
      adapter: new PrismaD1(database),
      errorFormat: 'minimal',
      log: [
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
      ],
    });
    current = extendPrismaClient(
      client as unknown as BunPrismaClient<'error' | 'warn'>
    );
  }
  return current;
}

export const db = new Proxy({} as FlarepanelPrismaClient, {
  get(_target, property) {
    if (!current) {
      throw new Error(
        'D1 is not bound yet: call bindD1Database(env.DB) before using db'
      );
    }
    const value = Reflect.get(current, property);
    return typeof value === 'function' ? value.bind(current) : value;
  },
});

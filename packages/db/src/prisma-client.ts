import { PrismaClient } from './generated/prisma/client';
import { extendPrismaClient } from './prisma-extend';
import { resolveSqliteUrl } from './sqlite-url';

export * from './generated/prisma/client';

const getPrismaClient = () => {
  // emit: 'event' keeps the engine from writing prisma:error lines straight
  // to stderr, so they flow through pino to the OTLP pipeline instead.
  const client = new PrismaClient({
    // Prisma's default error format splices file, line and a source snippet
    // into messages that reach API clients verbatim. `minimal` keeps our
    // source layout out of a 500.
    errorFormat: 'minimal',
    // Relative SQLite paths resolve from the repo root (see sqlite-url.ts).
    datasourceUrl: resolveSqliteUrl(process.env.DATABASE_URL),
    log: [
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'warn' },
    ],
  });

  return extendPrismaClient(client);
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof getPrismaClient>;
};

export const db = globalForPrisma.prisma ?? getPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}

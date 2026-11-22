/**
 * Connection details for the suite's ISOLATED databases: tests never touch the application's own databases, whose
 * fixture teardown (`DELETE FROM events WHERE project_id = ...`) would mutate real data and, on a large table, outlast a
 * test timeout. Every test connection string derives from here; nothing in test/ may hard-code a database name.
 *
 * Metadata (accounts, projects, settings) lives in SQLite — Cloudflare D1 in production — so the test database is a
 * file under `.data/`. Events still use ClickHouse until they move to Durable Objects and R2.
 */

import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CLICKHOUSE_ORIGIN = 'http://localhost:23123';

const SHARED_TEST_DATABASE = 'flarepanel_test';
const WORKTREE_APP_DATABASE = /^flarepanel_(\w+)$/;

/** `file:/abs/flarepanel_foo.db` → `flarepanel_foo`; anything else → ''. */
function databaseName(url: string | undefined): string {
  if (!url?.startsWith('file:')) {
    return '';
  }
  return basename(url.slice('file:'.length).split('?')[0] ?? '').replace(
    /\.db$/,
    ''
  );
}

/**
 * A worktree's app database is `flarepanel_<name>`; its tests get `flarepanel_test_<name>`, so one branch's
 * migrations never reach another branch's test runs. The main checkout and CI share `flarepanel_test`. Already-pinned
 * test names are kept, so evaluating this after a preload has rewritten `DATABASE_URL` gives the same answer.
 */
function testDatabaseName(appDatabaseUrl: string | undefined): string {
  const appDatabase = databaseName(appDatabaseUrl);
  const isTestDatabase =
    appDatabase === SHARED_TEST_DATABASE ||
    appDatabase.startsWith(`${SHARED_TEST_DATABASE}_`);
  if (isTestDatabase) {
    return appDatabase;
  }
  const worktree = WORKTREE_APP_DATABASE.exec(appDatabase)?.[1];
  return worktree
    ? `${SHARED_TEST_DATABASE}_${worktree}`
    : SHARED_TEST_DATABASE;
}

export const TEST_SQLITE_DATABASE = testDatabaseName(process.env.DATABASE_URL);
export const TEST_SQLITE_PATH = join(
  REPO_ROOT,
  '.data',
  `${TEST_SQLITE_DATABASE}.db`
);
export const TEST_DATABASE_URL = `file:${TEST_SQLITE_PATH}`;

// ClickHouse keeps its historical test database name.
export const TEST_CLICKHOUSE_DATABASE = TEST_SQLITE_DATABASE.replace(
  /^flarepanel_test/,
  'openpanel_test'
);

export const clickhouseUrl = (database: string) =>
  `${CLICKHOUSE_ORIGIN}/${database}`;

export const TEST_CLICKHOUSE_URL = clickhouseUrl(TEST_CLICKHOUSE_DATABASE);

/** Redis is deliberately NOT isolated: it holds no production copy, so it carries neither hazard this module removes. */
export const TEST_REDIS_URL = 'redis://localhost:23379';

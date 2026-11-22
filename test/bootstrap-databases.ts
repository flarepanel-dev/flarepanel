/**
 * Creates and migrates the suite's isolated databases (see ./databases).
 *
 * Called from globalSetup before any fixture loads. Every step is idempotent,
 * so a warm box pays only the cost of the checks.
 */

import { readFileSync } from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '../packages/db/src/clickhouse/client';
import { applySqliteMigrations } from '../packages/db/src/sqlite-migrations';
import {
  clickhouseUrl,
  TEST_CLICKHOUSE_DATABASE,
  TEST_CLICKHOUSE_URL,
  TEST_SQLITE_PATH,
} from './databases';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const clickhouseSchema = path.join(testDir, 'clickhouse-schema.sql');

/** Always present; only used as a foothold for `CREATE DATABASE`. */
const CLICKHOUSE_DEFAULT_DATABASE = 'default';

// Every statement in clickhouse-schema.sql is terminated by a line holding
// nothing but ';'.
const STATEMENT_SEPARATOR = '\n;';
const COMMENT_PREFIX = '--';

/** Creates the SQLite file if needed and applies pending migrations. */
export function migrateSqliteSchema() {
  applySqliteMigrations(TEST_SQLITE_PATH);
}

function readClickhouseStatements() {
  return readFileSync(clickhouseSchema, 'utf8')
    .split('\n')
    .filter((line) => !line.startsWith(COMMENT_PREFIX))
    .join('\n')
    .split(STATEMENT_SEPARATOR)
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0);
}

async function ensureClickhouseDatabase() {
  const server = createClient({
    url: clickhouseUrl(CLICKHOUSE_DEFAULT_DATABASE),
  });
  try {
    await server.command({
      query: `CREATE DATABASE IF NOT EXISTS ${TEST_CLICKHOUSE_DATABASE}`,
    });
  } finally {
    await server.close();
  }
}

async function migrateClickhouseSchema() {
  const client = createClient({ url: TEST_CLICKHOUSE_URL });
  try {
    for (const query of readClickhouseStatements()) {
      await client.command({ query });
    }
  } finally {
    await client.close();
  }
}

export async function bootstrapTestDatabases() {
  migrateSqliteSchema();
  await ensureClickhouseDatabase();
  await migrateClickhouseSchema();
}

/**
 * Writes the next SQL migration from the difference between the existing
 * migrations and prisma/schema.prisma.
 *
 *   bun run migrate:new <name>
 *
 * It applies the current migrations to a scratch SQLite file, asks Prisma for
 * the SQL that turns that database into the schema, fixes what SQLite rejects,
 * and saves `migrations/NNNN_<name>.sql`. Review the file before committing:
 * table rebuilds on SQLite copy data and are worth a second look.
 */

import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  applySqliteMigrations,
  listMigrations,
  MIGRATIONS_DIR,
} from '../src/sqlite-migrations';

const NAME = /^[a-z0-9][a-z0-9_-]*$/;

/** Prisma prints JSON defaults unquoted (`DEFAULT []`), which SQLite rejects. */
export function fixSqliteDefaults(sql: string): string {
  return sql.replace(/DEFAULT (\[\]|\{\})/g, "DEFAULT '$1'");
}

const name = process.argv[2];
if (!(name && NAME.test(name))) {
  console.error(
    'Usage: bun run migrate:new <name>  (lowercase, digits, _ or -)'
  );
  process.exit(1);
}

const scratch = mkdtempSync(join(tmpdir(), 'flarepanel-migrate-'));
try {
  const scratchDb = join(scratch, 'current.db');
  applySqliteMigrations(scratchDb);
  const prisma = join(import.meta.dir, '..', 'node_modules', '.bin', 'prisma');
  const sql = execFileSync(
    prisma,
    [
      'migrate',
      'diff',
      '--from-url',
      `file:${scratchDb}`,
      '--to-schema-datamodel',
      join(import.meta.dir, '..', 'prisma', 'schema.prisma'),
      '--script',
    ],
    {
      encoding: 'utf8',
      env: { ...process.env, DATABASE_URL: `file:${scratchDb}` },
    }
  );
  if (!sql.trim() || sql.includes('This is an empty migration')) {
    console.log('Schema and migrations already match; nothing to write.');
    process.exit(0);
  }
  const next = String(listMigrations().length + 1).padStart(4, '0');
  const file = join(MIGRATIONS_DIR, `${next}_${name}.sql`);
  writeFileSync(file, fixSqliteDefaults(sql));
  console.log(`Wrote ${file}`);
} finally {
  rmSync(scratch, { recursive: true, force: true });
}

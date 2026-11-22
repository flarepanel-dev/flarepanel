/**
 * Applies the SQL migrations in `packages/db/migrations` to a local SQLite
 * file. Production applies the same files to Cloudflare D1 with
 * `wrangler d1 migrations apply`; this runner keeps the same bookkeeping table
 * (`d1_migrations`), so both agree on what has run.
 */

import { Database } from 'bun:sqlite';
import { mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveSqliteUrl } from './sqlite-url';

export const MIGRATIONS_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'migrations'
);

const MIGRATION_FILE = /^\d{4}_[\w-]+\.sql$/;

/** `file:./dev.db` or `file:/abs/path.db` → filesystem path. */
export function sqlitePathFromUrl(url: string | undefined): string {
  if (!url?.startsWith('file:')) {
    throw new Error(
      `DATABASE_URL must be a SQLite file URL (file:...), got ${url ? `"${url.split(':')[0]}:..."` : 'nothing'}`
    );
  }
  return resolveSqliteUrl(url)?.slice('file:'.length).split('?')[0] ?? '';
}

export function listMigrations(dir = MIGRATIONS_DIR): string[] {
  return readdirSync(dir)
    .filter((file) => MIGRATION_FILE.test(file))
    .sort();
}

/** Returns the names of the migrations it applied, in order. */
export function applySqliteMigrations(
  databasePath: string,
  dir = MIGRATIONS_DIR
): string[] {
  mkdirSync(dirname(databasePath), { recursive: true });
  const database = new Database(databasePath, { create: true });
  try {
    database.exec('PRAGMA foreign_keys = ON;');
    database.exec(
      `CREATE TABLE IF NOT EXISTS d1_migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );`
    );
    const done = new Set(
      database
        .query<{ name: string }, []>('SELECT name FROM d1_migrations')
        .all()
        .map((row) => row.name)
    );
    const applied: string[] = [];
    for (const name of listMigrations(dir)) {
      if (done.has(name)) {
        continue;
      }
      const sql = readFileSync(join(dir, name), 'utf8');
      database.transaction(() => {
        database.exec(sql);
        database.query('INSERT INTO d1_migrations (name) VALUES (?)').run(name);
      })();
      applied.push(name);
    }
    return applied;
  } finally {
    database.close();
  }
}

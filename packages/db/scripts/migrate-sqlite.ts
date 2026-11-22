// Applies pending SQL migrations to the SQLite file in DATABASE_URL.
import {
  applySqliteMigrations,
  sqlitePathFromUrl,
} from '../src/sqlite-migrations';

const path = sqlitePathFromUrl(process.env.DATABASE_URL);
const applied = applySqliteMigrations(path);
console.log(
  applied.length
    ? `Applied ${applied.length} migration(s) to ${path}: ${applied.join(', ')}`
    : `No pending migrations for ${path}`
);

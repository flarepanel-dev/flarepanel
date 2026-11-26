# @flarepanel/db

Database access for FlarePanel.

- **Metadata** (users, organizations, projects, dashboards, settings): Prisma on
  **SQLite**. Production uses **Cloudflare D1**; local development and tests use
  a SQLite file.
- **Events**: ClickHouse, until events move to Durable Objects and R2
  (see https://docs.flarepanel.dev/self-hosting/architecture).

## Configuration

`DATABASE_URL` is a SQLite file URL. Relative paths resolve from the repository
root, so every package opens the same file:

```bash
DATABASE_URL="file:.data/flarepanel.db"
```

`.data/` is git-ignored.

## Migrations

Schema changes ship as plain SQL files in `migrations/`, in the format
`wrangler d1 migrations apply` reads. The same files are applied locally by a
small runner that uses the same bookkeeping table (`d1_migrations`).

| Task | Command |
|---|---|
| Apply pending migrations to the local file | `bun run migrate` |
| Create a migration after editing `prisma/schema.prisma` | `bun run migrate:new <name>` |
| Apply to D1 (once the Worker exists) | `wrangler d1 migrations apply <db> --remote` |

`migrate:new` applies the existing migrations to a scratch database, asks
Prisma for the difference to the schema, and writes `migrations/NNNN_<name>.sql`.
Review it before committing: SQLite rebuilds tables for some changes.

## SQLite rules for new code

- No Postgres-only features: no scalar lists (`String[]` → typed `Json`), no
  `mode: 'insensitive'` (SQLite `LIKE` already ignores ASCII case; compare
  emails lowercase), no Postgres SQL in `$queryRaw`.
- Typed JSON columns use a `/// [TypeName]` comment above the field and a
  matching type in `src/types.ts` (`PrismaJson` namespace).
- Avoid `$transaction(async (tx) => ...)` in new code. D1 does not run
  interactive transactions; prefer a single statement or `$transaction([...])`.
  The four existing interactive transactions are tracked for the Workers step.
- D1 allows at most 100 bound parameters per query: do not pass large `in: [...]`
  lists; delete or update in batches with a subquery instead.

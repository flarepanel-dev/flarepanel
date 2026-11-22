# @flarepanel/worker

FlarePanel's API on Cloudflare Workers: sign-in, organizations, projects,
clients, the public API and `/trpc`, on D1 with the Cloudflare platform stores
and job queue. Phase 2c of `docs/project-plan.md`.

## Run it locally (free, nothing leaves your machine)

```bash
cd apps/worker
cp .dev.vars.example .dev.vars        # then put random values in the secrets
bun run db:migrate:local             # D1 schema into the local database
bun run dev                          # http://localhost:8787
```

Run the dashboard against it:

```bash
cd apps/start
CLOUDFLARE_INCLUDE_PROCESS_ENV=true API_URL=http://localhost:8787 \
  DASHBOARD_URL=http://localhost:3000 bun run dev
```

Use `localhost` for both (not `127.0.0.1` for one of them), so the session
cookie is shared.

## What works on Workers today

| Area | Status |
|---|---|
| Sign-up, sign-in, sessions (better-auth on D1) | works |
| Organizations, projects, clients (onboarding) | works |
| Rate limits, caches, locks | Cloudflare stores |
| Background jobs and cron | Cloudflare Queue + Cron Trigger |
| Analytics charts, ingest (`/track`), live views | not yet: they need the event pipeline (Phase 3) and the new query layer (Phase 4). Charts show 0 and the cards return errors |

Checked end to end with `wrangler dev`: sign-up 264 ms, onboarding (project +
two clients) 194 ms, sign-in 202 ms, then the dashboard in a browser.

## How it is built

- `src/index.ts` builds the same app as `apps/api` (`main.ts`) from core's
  Elysia plugins, with Workers dependencies: Prisma on D1
  (`packages/db/src/prisma-client.workerd.ts`), `@flarepanel/platform`'s
  Cloudflare stores, `createCloudflareProducers` for jobs.
- Elysia runs in dynamic mode (`aot: false`): Workers forbid code generation
  at request time. `patches/elysia@1.4.30.patch` makes that mode honour
  `parse: 'none'`, which the auth and tRPC routes need.
- `wrangler.jsonc` `alias` swaps Node-only dependencies:
  - `@node-rs/argon2` → pure-JS argon2id (`src/shims/argon2.ts`), hash
    compatible both ways (~160 ms per hash).
  - `@clickhouse/client` → `@clickhouse/client-web`.
  - `pino` → a console logger (Workers Logs).
  - `ioredis`, `bullmq`, `kafkajs`, `nodemailer`, GeoIP, Slack, GCS, unzipper
    → stand-ins that throw only if used.
- The bundle is ~24 MB raw, ~4.6 MB gzipped: it needs the **Workers Paid**
  plan (limit 10 MB; Free is 3 MB).

## Deployed

| | |
|---|---|
| API | `flarepanel-api` → https://api.flarepanel.dev |
| Dashboard | `flarepanel-dashboard` (apps/start) → https://dashboard.flarepanel.dev |
| D1 | `flarepanel` (no jurisdiction; placed in EEUR) |
| Queues | `flarepanel-jobs`, dead letters in `flarepanel-jobs-dlq` |
| Secrets | `COOKIE_SECRET`, `AUTH_SECRET` (generated, only in Cloudflare) |

First deployed 2026-11-22 and checked live: sign-up, project creation and a
client ID through the dashboard (the test account was deleted afterwards).

Costs are capped per Worker: `limits.cpu_ms`, `max_retries` + a dead-letter queue,
`max_concurrency`, sampled logs. Add a billing alert email in the Cloudflare
dashboard.

To redeploy:

```bash
cd apps/worker && wrangler d1 migrations apply flarepanel --remote && wrangler deploy
cd apps/start && bun run deploy
```

Limits and expected usage: `docs/cloudflare-runtime.md`.

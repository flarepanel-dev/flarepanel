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
| Ingest: `/track`, `/event`, `/track/device-id` | works (Phase 3a): one Durable Object per project stores the events |
| Onboarding "first event", event list, project card, live visitors and live event sockets | works, read from the project's Durable Object |
| R2 archive (`flarepanel-events`) and retention | every 10 min while there is new data; 90 days hot, R2 keeps all |
| Profiles: identify, increment, decrement, profile list and profile page | works: stored in the project's Durable Object (`identities` table) |
| Groups, replays | accepted and not stored yet |
| Overview numbers and chart, top pages, entry/exit pages, referrers/UTM, countries/regions/cities, devices/browsers/OS, map | works: hourly and daily rollups in the project's Durable Object (`hourly`, `daily`, `dims_h`, `dims`), in the project's timezone; minute series and filters are counted from the stored events (retention window) |
| Live 30-min card, Sessions page (list, filters, search, session detail) | works: live sessions in memory, ended ones in `session_log` |
| Report builder charts (series, breakdowns, filters, formulas, bar/pie), funnels, retention, event/property pickers | works: counted from the stored events in the project's Durable Object (`chart-scan`, `funnel-scan`, `retention-scan`), retention window |
| Conversion, Sankey, distribution, insights, notifications | not yet: Phase 4 (see `docs/adr/0002-query-layer.md`) |

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

## Email (Cloudflare Email Service)

Account emails (sign-up, invites, password reset, alerts) go through the
`EMAIL` `send_email` binding: `@flarepanel/email` gets a sender at boot
(`setEmailSender`) that is used before SMTP and Resend. Workers Paid includes
3,000 emails a month, then $0.35 per 1,000. The sender domain
(`hello@flarepanel.dev`, override with `EMAIL_SENDER`) must be onboarded once
under Compute > Email Service > Email Sending; until then sends fail and are
logged, and the request still succeeds. `wrangler dev` simulates the binding
and writes each email to a local file.

## Event ingestion (Phase 3a)

```
SDK -> POST /track (Worker: auth, schema, bot check, geo from request.cf)
    -> ProjectEventsDurableObject (one per project, SQLite)
       device + session ids, incomingEvent(), group commit (200 events or 500 ms)
    -> answer once stored
alarm: close idle sessions (session_end), checkpoint, R2 archive, retention
```

- `src/ingest/project-events-do.ts`: the Durable Object (RPC, alarm, R2,
  hibernating sockets). The logic is in `@flarepanel/core/ingest/cloudflare`
  (engine + `createProjectEventsService`), tested with `bun:sqlite`.
- `src/ingest/backend.ts`: the `IngestBackend` for `/track`, the Worker
  buffers (sessions from the Durable Object, no-op profile/group/replay) and
  the `EventStore` the dashboard reads through.
- `src/ingest/live.ts`: `/live/events|visitors/:projectId` upgrades are
  checked here (session + project access) and handed to the Durable Object.
- Duplicate requests are dropped for 1 s through the colo's Cache API, so the
  check costs no Durable Object request.
- `TRACK_LIMITER`: 600 ingest requests per minute per IP, before any Durable
  Object runs.
- gzip uses `node:zlib` (sync): a `CompressionStream` pump never finishes
  inside `blockConcurrencyWhile`, where the engine restores its chunks.
- The first two device-id salts are created at boot, as `apps/api` does.

R2 layout: `v1/events/project_id=<id>/date=YYYY-MM-DD/hour=HH/<first>-<last>.ndjson.gz`.

## Deployed

| | |
|---|---|
| API | `flarepanel-api` → https://api.flarepanel.dev |
| Dashboard | `flarepanel-dashboard` (apps/start) → https://dashboard.flarepanel.dev |
| D1 | `flarepanel` (no jurisdiction; placed in EEUR) |
| Queues | `flarepanel-jobs`, dead letters in `flarepanel-jobs-dlq` |
| Durable Objects | `CoordinatorDurableObject`, `PubSubHubDurableObject` (v1), `ProjectEventsDurableObject` (v2) |
| R2 | `flarepanel-events` (event archive) |
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

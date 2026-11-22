# @flarepanel/platform

The key-value stores FlarePanel needs outside the event pipeline, behind small
interfaces with one implementation per runtime.

| Store | Used for | Bun (today) | Workers | Tests |
|---|---|---|---|---|
| `CacheStore` | `cacheable` / `getCache`, client-secret cache, favicon cache, insight explanations | Redis (`@flarepanel/redis`) | Cache API | memory |
| `CoordinationStore` | rate limits (HTTP, RPC, sign-in, AI chat), `getLock`, job dedupe/cancel | Redis (`@flarepanel/redis`) | Durable Object `CoordinatorDurableObject` | memory |
| `PubSub` | `publishEvent` / `subscribeToPublishedEvent` (live dashboards, ops) | Redis pub/sub, reference-counted | Durable Object `PubSubHubDurableObject` with hibernating WebSockets | memory |

Services get the stores as `deps.stores` / `ctx.stores`. Module-level helpers
that hold no scope (`cacheable`, the rate limiters) use
`getPlatformStores()`, which the app shell sets with `configurePlatformStores()`
at boot (on Bun, Redis is registered as the default).

## The contract

`src/testing/contract.ts` is one behaviour suite every implementation must
pass: get/set/delete, expiry, set-if-absent, compare-and-delete,
compare-and-extend, windowed increments (including concurrent ones), ping, and
pub/sub ordering, fan-out, channel isolation and unsubscribe.

| Implementation | Command |
|---|---|
| Memory | `bun run --filter @flarepanel/platform test` |
| Redis | `vitest run packages/redis/stores.test.ts` (needs the docker-compose Redis) |
| Cloudflare | `bun run --filter @flarepanel/platform test:cloudflare` (runs inside workerd via Miniflare; local and free) |

## Cloudflare notes

- Coordination keys are spread over 16 Durable Objects (FNV hash). Each call is
  one Durable Object request; the Workers Free plan includes 100,000 a day.
- Expired rows are skipped on read and swept by an alarm every 10 minutes.
- The cache uses the Cache API, not KV: KV allows only 1,000 writes a day on
  the free plan. The Cache API is per data center and does nothing on
  `*.workers.dev`; use a custom domain.
- The Worker that hosts the API must export `CoordinatorDurableObject` and
  `PubSubHubDurableObject` and bind them as `COORDINATOR` and `PUBSUB_HUB`
  (see `test/cloudflare/wrangler.jsonc` and `docs/cloudflare-runtime.md`).

## Not here yet

The event pipeline (`packages/core/src/buffers`, sessions, dead letters,
exports, code-migration lock) still talks to Redis directly. It is replaced as
a whole in Phase 3, when ingest moves to Durable Objects and R2. Background
jobs have a Cloudflare backend in `packages/core/src/jobs/cloudflare.ts`.

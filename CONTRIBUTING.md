# Contributing to FlarePanel

Thanks for helping. A few things to know first.

## Before you start

- Read the [architecture page](https://docs.flarepanel.dev/self-hosting/architecture).
  FlarePanel is moving from OpenPanel's Postgres/ClickHouse/Redis/Kafka stack
  to Cloudflare (Workers, D1, Durable Objects, R2). New code should target the
  Cloudflare side, not the services being replaced.
- Open an issue before large changes.
- Keep OpenPanel's tracking protocol working (see `NOTICE`): existing
  OpenPanel SDKs must still be able to send events.

## Contributor License Agreement

Every contributor signs the [CLA](CLA.md) once. A bot asks on your first pull
request; reply with the sentence it gives you.

## Local setup

Requirements: Bun (version in `.bun-version` or newer) and Node (`.nvmrc`).

```bash
bun install
bun run codegen
bun run typecheck
bun run lint:format
```

Metadata lives in a local SQLite file (`DATABASE_URL="file:.data/flarepanel.db"`,
see `.env.example`); `bun run migrate` creates and updates it. Until the
Cloudflare port is done, the full test suite and `bun run dev` also need Redis,
ClickHouse and Redpanda from `docker-compose.yml` (`bun run dock:up`).

## Pull requests

- One topic per pull request, with a short description of what and why.
- CI must pass: formatting, type-check, dependency boundaries and tests.
- Write commit messages in the imperative ("add", "fix"), with a scope where it
  helps, for example `feat(ingest): ...`.

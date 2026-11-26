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

## This repository is public

Everything you push, and every issue, pull request and comment, can be read
and archived by anyone. Keep these out:

- secrets: API keys, tokens, passwords, `.env` and `.dev.vars` files, keys
- personal data: private email addresses, names that are not public,
  absolute paths from your machine (`/Users/<you>/…`)
- internal notes: plans, prices and margins, account or security setup
  details, customer or partner names, test reports

`bun run check:public --staged` checks what you are about to commit, and the
pre-push hook checks every push (install it once with `bunx simple-git-hooks`); CI runs the same
check with gitleaks. Put private words in your local denylist,
`$(git rev-parse --git-common-dir)/public-denylist`, one regular expression per
line; it is never committed. Commit with your GitHub noreply address
(`git config user.email <id>+<user>@users.noreply.github.com`).

If a secret was pushed, rotate it first: removing it from history does not
make it secret again.

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

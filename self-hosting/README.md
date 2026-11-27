# Self-hosting FlarePanel on your own server

FlarePanel can be self-hosted in two ways:

| | Cloudflare | Your own server (this folder) |
|---|---|---|
| Runs on | Workers, Durable Objects, D1, R2, Queues | Docker: ClickHouse, Redis, Redpanda, the API and the dashboard |
| You operate | Nothing: no servers or databases | One machine and its backups |
| Guide | [docs.flarepanel.dev/self-hosting/deploy](https://docs.flarepanel.dev/self-hosting/deploy) | Below |

Both run the same dashboard and accept the same SDKs. A few features exist on
one side only: see [What differs](#what-differs).

## Requirements

- A Linux server with Docker and the Compose plugin, 4 GB of memory or more
  (ClickHouse and Redpanda take most of it) and a disk sized for your events.
- Two hostnames pointing at the server, one for the dashboard and one for the
  API, for example `analytics.example.com` and `api.analytics.example.com`.

## Install

Get the code and build the two images. Images are not published to a registry
yet, so they are built on the server (or on another machine and pushed to your
own registry). The dashboard build needs about 6 GB of memory.

```bash
git clone https://github.com/flarepanel-dev/flarepanel.git
cd flarepanel
docker build -f apps/api/Dockerfile -t flarepanel-api:local .
docker build -f apps/start/Dockerfile -t flarepanel-dashboard:local .
cd self-hosting
cp env.example .env
```

Edit `.env`:

1. Set `DASHBOARD_URL`, `API_URL`, `DASHBOARD_HOST`, `API_HOST` and
   `CUSTOM_COOKIE_DOMAIN` to your hostnames.
2. Fill `COOKIE_SECRET` and `ENCRYPTION_KEY`, each with the output of
   `openssl rand -hex 32`. Keep a copy of `ENCRYPTION_KEY`: without it, stored
   AI and integration keys cannot be read.

Start everything, with the bundled TLS proxy:

```bash
docker compose --profile proxy up -d
```

Open the dashboard address and create the first account. With
`ALLOW_REGISTRATION=false` (the default here) everyone after that needs an
invitation.

### Your own proxy

Leave out `--profile proxy`. The dashboard then listens on `127.0.0.1:3300`
and the API on `127.0.0.1:3333`; point your proxy at them. The API serves
WebSockets under `/live/`, so the proxy must pass upgrade requests through.

## Point your SDKs at it

Use your API address as `apiUrl` and load the script from your dashboard:

```html
<script src="https://analytics.example.com/op1.js" defer async></script>
```

## Upgrade

```bash
git pull
docker build -f apps/api/Dockerfile -t flarepanel-api:local .
docker build -f apps/start/Dockerfile -t flarepanel-dashboard:local .
cd self-hosting && docker compose --profile proxy up -d
```

The `migrate` service applies database changes before the app starts.

## Check an install

On a fresh install, before the first account exists and before SMTP is set
(the script signs up without confirming an email):

```bash
API_URL=https://api.analytics.example.com DASHBOARD_URL=https://analytics.example.com ./smoke-test.sh
```

It creates a test account and project, sends five events and reads them back.
Use the same addresses as in `.env`. It leaves the test account behind.

## Back up and restore

```bash
./backup.sh                 # writes ./backups/flarepanel-<UTC time>/
./backup.sh /mnt/backups    # or into another folder
./restore.sh ./backups/flarepanel-20261127-101500
```

A backup holds the SQLite file (accounts, projects, settings) and a ClickHouse
backup (events, sessions, profiles, replays). It runs while the app is up.
Queues in flight (Redis, Redpanda) are not part of it, so events that arrive
during the backup may be missing. Run it on a schedule, copy the folder off
the server, and keep `.env` with it: `ENCRYPTION_KEY` is needed to read stored
keys after a restore.

`restore.sh` stops the app, replaces both databases with the backup and starts
it again. It asks before it overwrites anything.

## Keep events for a limited time

ClickHouse keeps events until you say otherwise (replay chunks are kept 30
days, AI prompt text 30 days). To drop events and sessions after, say, 400
days:

```bash
docker compose exec clickhouse clickhouse-client -q \
  "ALTER TABLE flarepanel.events MODIFY TTL toDateTime(created_at) + INTERVAL 400 DAY"
docker compose exec clickhouse clickhouse-client -q \
  "ALTER TABLE flarepanel.sessions MODIFY TTL toDateTime(created_at) + INTERVAL 400 DAY"
```

`ALTER TABLE flarepanel.events REMOVE TTL` undoes it. Rows already deleted do
not come back.

## Behind a proxy

The API reads the visitor's address from the header named in
`TRUSTED_IP_HEADER_ORDER` (default `x-forwarded-for`). It feeds the location
lookup and the tracking limit of 600 requests a minute per address. Your proxy
must overwrite that header, never pass on a value the visitor sent; the
bundled Caddy does.

## What differs

| | Cloudflare | Your own server |
|---|---|---|
| Connect Cloudflare (no-code crawler import) | Yes | No: report crawlers from your server or edge |
| Raw event archive | R2 | ClickHouse keeps everything |
| Event retention | A setting | A ClickHouse TTL (above) |
| Backups | D1 and Durable Object point-in-time recovery | `backup.sh` and `restore.sh` |
| Visitor location | Cloudflare's edge | A GeoLite2 database built into the image |
| Email | Cloudflare Email | SMTP or Resend |

Everything else is the same on both: reports, funnels, retention, sessions and
replay, profiles, cohorts, realtime, bots and AI crawlers, public widgets, AI answers and
observability, imports, exports, Search Console, the REST API and MCP.

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

## Back up

Everything lives in Docker volumes:

- `app-data`: accounts, projects and settings (one SQLite file).
- `clickhouse-data`: events, sessions, profiles and replays.
- `redis-data` and `redpanda-data`: queues and buffers in flight.

Back up `app-data` and `clickhouse-data` on a schedule, and keep `.env` with
them.

## What differs

| | Cloudflare | Your own server |
|---|---|---|
| Bots & AI crawlers: totals and charts | Yes | Latest hits only |
| Connect Cloudflare (crawler import) | Yes | No |
| Public "traffic" widget | Yes | No |
| Per-IP limit on `/track` | Yes | Use your proxy's rate limit |
| Raw event archive | R2 | ClickHouse keeps everything |
| Visitor location | Cloudflare's edge | A GeoLite2 database built into the image |
| Email | Cloudflare Email | SMTP or Resend |

Everything else is the same on both: reports, funnels, retention, sessions and
replay, profiles, cohorts, realtime, AI answers and observability, imports,
exports, Search Console, the REST API and MCP.

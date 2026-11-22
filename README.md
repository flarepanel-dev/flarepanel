<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="brand/wordmark-dark.svg">
    <img alt="FlarePanel" src="brand/wordmark-light.svg" width="340">
  </picture>
</p>

<p align="center">
  Open-source web and product analytics that runs entirely on Cloudflare.
</p>

<p align="center">
  <a href="LICENSE.md">AGPL-3.0</a> ·
  <a href="docs/adr/0001-architecture-and-product-strategy.md">Architecture</a> ·
  <a href="docs/project-plan.md">Roadmap</a> ·
  <a href="CONTRIBUTING.md">Contributing</a>
</p>

---

> **Status: early development.** FlarePanel is being ported from OpenPanel's
> Postgres/ClickHouse/Redis/Kafka stack to Cloudflare. It is not ready to
> deploy yet. Follow the [roadmap](docs/project-plan.md).

## What it is

FlarePanel is a fork of [OpenPanel](https://github.com/Openpanel-dev/openpanel)
rebuilt on Cloudflare's own services, so you can deploy it to your Cloudflare
account with no servers or databases to run:

| Part | Runs on |
|---|---|
| Dashboard and API | Cloudflare Workers |
| Accounts, projects, settings | D1 |
| Live counters, rollups, realtime | Durable Objects |
| Raw event archive | R2 |
| Scheduled jobs | Cron Triggers |

Planned:

- **Self-hosted:** free, one-click deploy to your own Cloudflare account, with
  a free-plan "lite" mode for small sites.
- **FlarePanel Cloud:** hosted by us, priced per event.
- **Data region choice:** keep data in the EU or US.
- **Works with OpenPanel SDKs:** point an existing OpenPanel SDK at your
  FlarePanel URL and keep tracking.

## Features (inherited from OpenPanel)

Web analytics, product analytics, funnels, retention, user profiles,
sessions, live visitors, dashboards, an AI assistant and AI observability.

## Development

```bash
bun install
bun run codegen
bun run typecheck
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full setup.

## License

AGPL-3.0, like OpenPanel. The client SDKs in `packages/sdks` are MIT. See
[NOTICE](NOTICE) for attribution.

FlarePanel is not affiliated with OpenPanel or Cloudflare.

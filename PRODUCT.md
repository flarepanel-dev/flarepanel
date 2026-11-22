# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

The marketing site (`apps/landing`) uses the same stack as OpenPanel's
marketing app: Next.js 16 (App Router), React 19,
Tailwind CSS v4, Geist, Framer Motion and lucide icons, deployed to Cloudflare
Workers with `@opennextjs/cloudflare`. Docs (Fumadocs, like OpenPanel) can be
added to the same app later. The product itself is the dashboard
(`apps/start`, TanStack Start on Workers) and the API (`apps/worker`).

## Users

Primary: developers and startup teams (engineers, technical founders)
choosing web and product analytics. They care that it runs on Cloudflare, is
open source, works with OpenPanel SDKs they may already use, and stays cheap.

Secondary: people who want to self-host on their own Cloudflare account, and
less technical teammates (marketers, founders) who read the dashboards.

## Product Purpose

FlarePanel is open-source web and product analytics (traffic, events,
funnels, retention, profiles, an AI assistant) that runs entirely on
Cloudflare's own services: Workers, D1, Durable Objects, R2 and Queues. No
servers or databases to run. Success: a team signs up or deploys, adds the
SDK, and sees its analytics without managing infrastructure.

## Positioning

The only OpenPanel-compatible analytics that is Cloudflare-native end to end:
events are received at the edge closest to the visitor, data stays on
Cloudflare, cost is pay-per-use instead of always-on ClickHouse servers, and
the same open-source code runs hosted or on your own Cloudflare account.

## Operating Context

- Hosted dashboard: https://dashboard.flarepanel.dev (sign-up works).
- API: https://api.flarepanel.dev.
- Source: https://github.com/flarepanel-dev/flarepanel (AGPL-3.0; SDKs MIT).
- Tracking uses OpenPanel's protocol, so OpenPanel SDKs work with a
  FlarePanel URL; FlarePanel's own SDK packages and the `op1.js` script are
  served from flarepanel.dev / npm once published.

## Capabilities and Constraints

- Availability today: **early access**. Sign-up and projects work; event
  tracking is rolling out; one-click self-hosting on your own Cloudflare is
  coming soon. Say so plainly.
- No pricing is decided: do not show prices or plans. (Direction: cheaper
  than OpenPanel Cloud, priced per event, paid through Polar.)
- Data region choice (EU / US / unrestricted) is a product capability for
  self-hosted installs and the hosted Cloud.
- Fork of OpenPanel: credit it, never imply endorsement or affiliation, and
  never use OpenPanel's name or logo as FlarePanel branding. Not affiliated
  with Cloudflare either.

## Brand Commitments

- Name: FlarePanel (one word, capital F and P); domain flarepanel.dev.
- Brand kit v1 in `brand/` (guide: `brand/README.md`, values:
  `brand/tokens.json`): the Bar F mark, Obsidian neutrals with Hot coral
  `#FF496B` as the accent, Geist wordmark. Coral is an accent, not a fill;
  down/negative is crimson, never coral; inverted icon on dark.
- A dark-background marketing site that matches the dark dashboard and looks
  clearly different from openpanel.dev.

## Evidence on Hand

- Real: the product itself, the open-source repository, the brand kit, the
  architecture and cost model (`docs/adr/0001-architecture-and-product-strategy.md`,
  `docs/cloudflare-runtime.md`).
- Absent and must not be fabricated: customers, logos, testimonials, usage
  numbers, benchmarks, press, pricing.

## Product Principles

1. Cloudflare-native end to end: no always-on servers.
2. Open source and compatible: the same code hosted or self-hosted, OpenPanel
   SDKs keep working.
3. Pay for what you use, and keep costs predictable.
4. Your data, your region.
5. Honest about what is ready and what is coming.

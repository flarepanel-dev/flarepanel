# Deploy FlarePanel to Cloudflare

Self-host [FlarePanel](https://flarepanel.dev), open-source web and product
analytics, on your own Cloudflare account in two clicks. This branch is built
automatically from `main` of [flarepanel-dev/flarepanel](https://github.com/flarepanel-dev/flarepanel)
on every release (version 1.0.0); send issues and changes there.

**You need** a Cloudflare account on the Workers Paid plan (the API is larger
than the free plan allows) with R2 turned on, and your workers.dev subdomain,
shown under Workers & Pages → Settings.

## 1. The API

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/flarepanel-dev/flarepanel/tree/cloudflare-deploy/api)

Cloudflare copies this folder to your GitHub account, creates the D1 database,
R2 bucket, queues and Durable Objects, sets up the database tables and deploys.
It asks for:

| Value | What to enter |
|---|---|
| `API_URL` | `https://flarepanel-api.<your-subdomain>.workers.dev` |
| `DASHBOARD_URL` | `https://flarepanel-dashboard.<your-subdomain>.workers.dev` |
| `CUSTOM_COOKIE_DOMAIN` | `<your-subdomain>.workers.dev` |
| `COOKIE_SECRET`, `AUTH_SECRET`, `ENCRYPTION_KEY` | Three different values from `openssl rand -hex 32`. Keep a copy of `ENCRYPTION_KEY`. |

Keep the Worker names `flarepanel-api` and `flarepanel-dashboard`, or change
the addresses above to match.

## 2. The dashboard

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/flarepanel-dev/flarepanel/tree/cloudflare-deploy/dashboard)

It asks for the same `API_URL` and `DASHBOARD_URL`.

## 3. Sign up

Open your dashboard address and create the first account. Sign-ups then close:
invite your team from the dashboard. To let anyone sign up, set the
`ALLOW_REGISTRATION` variable of the API Worker to `true`.

## Left out of the one-click setup

Add these later by following the [full guide](https://docs.flarepanel.dev/self-hosting/deploy):

- **Email** (sign-up verification, invitations, password reset): needs your
  domain onboarded to Cloudflare Email Service and the `send_email` binding.
  Without it, new accounts are not email-verified.
- **Your own domain** for the API and dashboard instead of workers.dev.
- **JavaScript webhook templates** (the `worker_loaders` binding).
- **IP geolocation** for server-side events, Google Search Console, and a
  server AI key.

## Updating

Each release updates this branch. Copy the new `api/` and `dashboard/`
folders into your copies; Workers Builds then redeploys, and the API's deploy
step applies new database migrations.

## Licence

AGPL-3.0, like FlarePanel. Built from
[flarepanel-dev/flarepanel](https://github.com/flarepanel-dev/flarepanel).

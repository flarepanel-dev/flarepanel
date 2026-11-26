# status.flarepanel.dev

FlarePanel Cloud's public status page: a Worker (`flarepanel-status`) with its
own D1 database (`flarepanel-status`) that shares nothing with the services it
watches. Every minute it checks the six services in `src/monitors.ts` (reads
only; nothing is stored in FlarePanel), keeps raw checks 48 hours and daily
totals 90 days, and opens an incident after two failed checks in a row,
resolving it after three good ones. Public docs: docs.flarepanel.dev/status.

```bash
bun test            # unit tests
bun run dev         # local; trigger a round: curl "localhost:8787/__scheduled?cron=*+*+*+*+*"
bun run migrate     # apply migrations to the remote database
bun run deploy
```

## Email updates

`/subscribe` takes an address, optionally limited to some services. The
emailed link opens a page whose button confirms (mail scanners open links;
they must not confirm or unsubscribe anyone). Incident changes are queued in
`email_outbox`, one email per subscriber per round, and the minute cron sends
up to 100. Automatic incidents on a service that recovered within the last
hour are not mailed (no storms from a flapping service).

Needs the `EMAIL` binding and the `STATUS_SIGNING_KEY` secret (signs
unsubscribe links, keys the rate limits; changing it breaks old unsubscribe
links). Without them the email option is hidden.

Limits: 5 subscribe attempts per IPv4 address or IPv6 /64 per hour; one
confirmation per address per hour and 3 in total; 30 confirmations per hour
and 150 per day overall; cross-site form posts refused. Unconfirmed addresses
are deleted a week after the last confirmation email. Emails share the
API's Cloudflare Email allowance (3,000 a month included).

Before deploying: `wrangler secret put STATUS_SIGNING_KEY`, then `bun run
migrate` (adds `0002_subscribers.sql`), then `bun run deploy`.

## Posting incidents and maintenance

Operator only, with the `STATUS_ADMIN_TOKEN` secret (kept outside the repo;
rotate with `wrangler secret put STATUS_ADMIN_TOKEN`).

```bash
TOKEN=...   # read it from where you keep it; never paste it into chat or commits

# New incident (impact: minor | major | maintenance;
# status: investigating | identified | monitoring | resolved | scheduled | in_progress | completed;
# monitors: api, tracking, dashboard, mcp, website, docs)
curl -X POST https://status.flarepanel.dev/api/admin/incidents \
  -H "authorization: Bearer $TOKEN" \
  -d '{"title":"Slow charts","impact":"minor","status":"investigating","monitors":["dashboard"],"message":"Charts load slowly; we are looking into it."}'

# Planned maintenance: starts and completes on its own at these times
curl -X POST https://status.flarepanel.dev/api/admin/incidents \
  -H "authorization: Bearer $TOKEN" \
  -d '{"title":"Database upgrade","impact":"maintenance","status":"scheduled","monitors":["api"],"message":"Read-only for up to 30 minutes.","startsAt":"2026-12-01T02:00:00Z","until":"2026-12-01T02:30:00Z"}'

# Update or resolve (works for automatic incidents too)
curl -X POST https://status.flarepanel.dev/api/admin/incidents/<id> \
  -H "authorization: Bearer $TOKEN" \
  -d '{"status":"resolved","message":"Fixed; charts load normally again."}'
```

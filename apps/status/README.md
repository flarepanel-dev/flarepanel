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

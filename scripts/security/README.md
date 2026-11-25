# Security probes

## Cross-workspace isolation (`tenant-isolation.ts`)

Black-box check that no workspace can read or change another's data. It
signs up two accounts on a running API, gives workspace B one of each object,
then calls every tRPC procedure that takes a workspace object as account A
with B's IDs. Reads are first run as B to find an input the owner succeeds
with, so A's refusal is proven, not assumed. It also checks MCP with A's
token, B's password-protected share link, and that a widget B switches off
stops answering.

It creates accounts and calls update/delete procedures with B's IDs, so it
refuses anything but localhost unless `--allow-remote` is passed. Never run it
against production.

```bash
# with the local API (apps/worker) on :8787 and the dashboard on :3000
bun run security:isolation
```

The report is written to `security-isolation-report.md` (git-ignored). Exit
code 1 means a leak; read the `LEAK` rows first.

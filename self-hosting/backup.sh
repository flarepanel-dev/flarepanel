#!/bin/sh
# Backs up a running server install: the SQLite metadata file and the
# ClickHouse database. Run it from this folder.
#
#   ./backup.sh              # writes ./backups/flarepanel-<UTC time>/
#   ./backup.sh /mnt/backups # or into another folder
#
# Queues in flight (Redis, Redpanda) are not part of a backup: events still
# being written when it runs may be missing from it.
set -eu

DEST_ROOT="${1:-./backups}"
STAMP="$(date -u +%Y%m%d-%H%M%S)"
DEST="${DEST_ROOT}/flarepanel-${STAMP}"
mkdir -p "$DEST"

echo "SQLite metadata..."
# VACUUM INTO writes a consistent copy while the app keeps running.
docker compose exec -T app sh -c "rm -f /data/backup.db && bun -e \"import { Database } from 'bun:sqlite'; new Database('/data/flarepanel.db').exec(\\\"VACUUM INTO '/data/backup.db'\\\")\""
docker compose cp app:/data/backup.db "$DEST/flarepanel.db" >/dev/null 2>&1
docker compose exec -T app rm -f /data/backup.db

echo "ClickHouse events..."
# The backups volume starts out owned by root.
docker compose exec -T -u root clickhouse chown clickhouse:clickhouse /backups
docker compose exec -T clickhouse clickhouse-client -q \
  "BACKUP DATABASE flarepanel TO File('/backups/${STAMP}.zip')" >/dev/null
docker compose cp "clickhouse:/backups/${STAMP}.zip" "$DEST/clickhouse.zip" >/dev/null 2>&1
docker compose exec -T clickhouse rm -f "/backups/${STAMP}.zip"

[ -s "$DEST/flarepanel.db" ] && [ -s "$DEST/clickhouse.zip" ] || { echo "Backup incomplete: check the messages above." >&2; exit 1; }
echo "Done: $DEST"
echo "Keep your .env with it: ENCRYPTION_KEY is needed to read stored keys."

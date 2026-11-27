#!/bin/sh
# Restores a backup made by backup.sh into this install, replacing its data.
#
#   ./restore.sh ./backups/flarepanel-20261127-140000
#
# The stack must be up (`docker compose up -d`). The app and dashboard stop
# during the restore and start again afterwards.
set -eu

SRC="${1:?usage: ./restore.sh <backup folder>}"
[ -f "$SRC/flarepanel.db" ] || { echo "No flarepanel.db in $SRC" >&2; exit 1; }
[ -f "$SRC/clickhouse.zip" ] || { echo "No clickhouse.zip in $SRC" >&2; exit 1; }

printf 'This replaces ALL data in this install with %s. Type "restore" to continue: ' "$SRC"
read -r answer
[ "$answer" = "restore" ] || { echo "Cancelled."; exit 1; }

docker compose stop dashboard app >/dev/null

echo "SQLite metadata..."
docker compose run --rm --no-deps -T -v "$(cd "$SRC" && pwd):/restore:ro" \
  --entrypoint sh migrate -c \
  "cp /restore/flarepanel.db /data/flarepanel.db && rm -f /data/flarepanel.db-wal /data/flarepanel.db-shm"

echo "ClickHouse events..."
docker compose exec -T -u root clickhouse chown clickhouse:clickhouse /backups
docker compose cp "$SRC/clickhouse.zip" clickhouse:/backups/restore.zip >/dev/null 2>&1
docker compose exec -T -u root clickhouse chown clickhouse:clickhouse /backups/restore.zip
docker compose exec -T clickhouse clickhouse-client -q "DROP DATABASE IF EXISTS flarepanel SYNC"
docker compose exec -T clickhouse clickhouse-client -q \
  "RESTORE DATABASE flarepanel FROM File('/backups/restore.zip')" >/dev/null
docker compose exec -T clickhouse rm -f /backups/restore.zip

# The migrate service brings an older backup up to this version's schema.
docker compose up -d >/dev/null
echo "Restored. The app is starting."

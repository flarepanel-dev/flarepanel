#!/bin/sh
# Checks a running server install end to end: creates an account and a
# project, sends events, and reads them back through the API the dashboard
# uses. Meant for a fresh install or a test stack: it leaves one test account,
# workspace and project behind.
#
#   API_URL=http://localhost:3333 DASHBOARD_URL=http://localhost:3300 ./smoke-test.sh
set -eu

API_URL="${API_URL:?set API_URL}"
DASHBOARD_URL="${DASHBOARD_URL:?set DASHBOARD_URL}"
RUN="$(date +%s)"
EMAIL="smoke-${RUN}@example.com"
PASSWORD="smoke-${RUN}-Pass"
JAR="$(mktemp)"
trap 'rm -f "$JAR"' EXIT

fail() { echo "FAIL: $1" >&2; exit 1; }
step() { printf '%s... ' "$1"; }
ok() { echo "ok"; }

step "API health"
[ "$(curl -s -o /dev/null -w '%{http_code}' "$API_URL/healthcheck")" = "200" ] || fail "API /healthcheck"
ok

step "Dashboard and tracking script"
[ "$(curl -s -o /dev/null -w '%{http_code}' "$DASHBOARD_URL/login")" = "200" ] || fail "dashboard /login"
[ "$(curl -s -o /dev/null -w '%{http_code}' "$DASHBOARD_URL/op1.js")" = "200" ] || fail "dashboard /op1.js"
ok

step "Sign up"
code="$(curl -s -o /dev/null -w '%{http_code}' -c "$JAR" -X POST "$API_URL/api/auth/sign-up/email" \
  -H 'content-type: application/json' -H "origin: $DASHBOARD_URL" \
  --data "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"name\":\"Smoke Test\",\"firstName\":\"Smoke\",\"lastName\":\"Test\"}")"
[ "$code" = "200" ] || fail "sign-up answered $code (is registration closed? the first account, or ALLOW_REGISTRATION=true, is needed)"
ok

step "Create a project"
project="$(curl -s -b "$JAR" -X POST "$API_URL/trpc/onboarding.project" \
  -H 'content-type: application/json' -H "origin: $DASHBOARD_URL" \
  --data "{\"json\":{\"organization\":\"Smoke $RUN\",\"project\":\"Smoke $RUN\",\"domain\":null,\"cors\":[],\"website\":false,\"app\":false,\"backend\":true}}")"
client_id="$(printf '%s' "$project" | sed -n 's/.*"id":"\([0-9a-f-]\{36\}\)".*/\1/p')"
secret="$(printf '%s' "$project" | sed -n 's/.*"secret":"\(sec_[0-9a-f]*\)".*/\1/p')"
project_id="$(printf '%s' "$project" | sed -n 's/.*"projectId":"\([^"]*\)".*/\1/p')"
[ -n "$client_id" ] && [ -n "$secret" ] && [ -n "$project_id" ] || fail "project not created: $project"
ok

step "Send 5 events"
for i in 1 2 3 4 5; do
  code="$(curl -s -o /dev/null -w '%{http_code}' -X POST "$API_URL/track" \
    -H 'content-type: application/json' -H "openpanel-client-id: $client_id" -H "openpanel-client-secret: $secret" \
    -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36' \
    --data "{\"type\":\"track\",\"payload\":{\"name\":\"smoke_event\",\"profileId\":\"smoke-$i\",\"properties\":{\"i\":$i}}}")"
  [ "$code" = "200" ] || fail "/track answered $code"
done
ok

step "Read them back"
input="$(printf '{"json":{"projectId":"%s","filters":[],"events":["smoke_event"]}}' "$project_id" | sed 's/"/%22/g; s/{/%7B/g; s/}/%7D/g; s/\[/%5B/g; s/\]/%5D/g; s/:/%3A/g; s/,/%2C/g')"
found=0
for attempt in 1 2 3 4 5 6 7 8 9 10 11 12; do
  body="$(curl -s -b "$JAR" -H "origin: $DASHBOARD_URL" "$API_URL/trpc/event.events?input=$input")"
  found="$(printf '%s' "$body" | grep -o '"name":"smoke_event"' | wc -l | tr -d ' ')"
  [ "$found" -ge 5 ] && break
  sleep 5
done
[ "$found" -ge 5 ] || fail "only $found of 5 events came back after a minute"
ok

echo "All checks passed."

#!/bin/sh
# git passes "<local ref> <local sha> <remote ref> <remote sha>" per ref on stdin.
#
# 1. Every push: the repository is public, so nothing private may leave the
#    machine (tooling/scripts/public-check.ts). SKIP_HOOKS does not skip this.
# 2. Pushes to main are releases, so they also pass typecheck and tests
#    (skip with SKIP_HOOKS=1 only after running them yourself).

zero=0000000000000000000000000000000000000000
pushes_main=false
status=0
while read -r _local_ref local_sha remote_ref remote_sha; do
  [ "$local_sha" = "$zero" ] && continue # deleting a branch publishes nothing
  [ "$remote_ref" = "refs/heads/main" ] && pushes_main=true
  if [ "$remote_sha" = "$zero" ]; then
    bun tooling/scripts/public-check.ts --range "$local_sha" --new-branch || status=1
  else
    bun tooling/scripts/public-check.ts --range "$remote_sha..$local_sha" || status=1
  fi
done
[ "$status" -eq 0 ] || exit 1

[ -n "$SKIP_HOOKS" ] && exit 0
[ "$pushes_main" = true ] || exit 0

bun run typecheck && bun run test

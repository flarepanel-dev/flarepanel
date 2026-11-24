/**
 * Runs before `bun run deploy` in apps/worker and apps/start, which deploy
 * the self-hosting template (wrangler.jsonc). The template uses the same
 * Worker names as flarepanel.dev, so deploying it from the hosted account
 * would replace production with example.com settings. This refuses that and
 * points to `bun run deploy:hosted`; any other account passes.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const HOSTED_CONFIG = join(
  import.meta.dir,
  '..',
  'apps',
  'worker',
  'wrangler.hosted.jsonc'
);

const hostedAccount = /"account_id":\s*"([0-9a-f]{32})"/.exec(
  readFileSync(HOSTED_CONFIG, 'utf8')
)?.[1];

function deployAccounts(): string[] {
  if (process.env.CLOUDFLARE_ACCOUNT_ID) {
    return [process.env.CLOUDFLARE_ACCOUNT_ID];
  }
  const whoami = spawnSync('bunx', ['wrangler', 'whoami', '--json'], {
    encoding: 'utf8',
  });
  try {
    const info = JSON.parse(whoami.stdout) as { accounts?: { id: string }[] };
    return (info.accounts ?? []).map((account) => account.id);
  } catch {
    // Not logged in: wrangler itself will stop the deploy.
    return [];
  }
}

const accounts = deployAccounts();
// With several accounts and no CLOUDFLARE_ACCOUNT_ID, wrangler asks which
// one; refuse whenever the hosted account is among them.
if (hostedAccount && accounts.includes(hostedAccount)) {
  console.error(
    'This deploys the self-hosting template (wrangler.jsonc) to the flarepanel.dev account.\n' +
      'Deploy flarepanel.dev with `bun run deploy:hosted`, or set CLOUDFLARE_ACCOUNT_ID to another account.'
  );
  process.exit(1);
}

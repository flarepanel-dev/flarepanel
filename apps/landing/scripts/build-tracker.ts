// Builds the browser tracker from packages/sdks/web and copies it to
// public/ so flarepanel.dev serves /op1.js (the script-tag snippet the
// dashboard shows) and /op1-replay.js (loaded lazily for session replay).
import { $ } from 'bun';
import { copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dir, '..');
const sdk = join(root, '../../packages/sdks/web');

await $`bun run build`.cwd(sdk);

const files: Array<[string, string]> = [
  ['dist/src/tracker.global.js', 'op1.js'],
  ['dist/src/replay.global.js', 'op1-replay.js'],
];

for (const [from, to] of files) {
  const src = join(sdk, from);
  if (!existsSync(src)) {
    throw new Error(`Tracker build output missing: ${src}`);
  }
  copyFileSync(src, join(root, 'public', to));
  console.log(`public/${to} <- packages/sdks/web/${from}`);
}

// Builds the browser tracker from packages/sdks/web and copies it to
// public/ so flarepanel.dev serves /op1.js (the script-tag snippet the
// dashboard shows) and /op1-replay.js (loaded lazily for session replay).
import { $ } from 'bun';
import { copyFileSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dir, '..');
const sdk = join(root, '../../packages/sdks/web');

// The SDKs read their version from `process.env.*_VERSION`, which tsup
// replaces at build time (tooling/publish passes the same flags). Without it
// the browser bundle references `process` and throws on load.
const version = (path: string) =>
  String(
    JSON.parse(readFileSync(join(sdk, path, 'package.json'), 'utf8')).version
  ).replace(/-local$/, '');
const webVersion = version('.');
const sdkVersion = version('../sdk');

await $`rm -rf dist`.cwd(sdk);
await $`bunx tsup --env.NODE_ENV=production --env.LANG=en --env.WEB_VERSION=${webVersion} --env.SDK_VERSION=${sdkVersion}`.cwd(
  sdk
);

const files: Array<[string, string]> = [
  ['dist/src/tracker.global.js', 'op1.js'],
  ['dist/src/replay.global.js', 'op1-replay.js'],
];

for (const [from, to] of files) {
  const src = join(sdk, from);
  if (!existsSync(src)) {
    throw new Error(`Tracker build output missing: ${src}`);
  }
  if (readFileSync(src, 'utf8').includes('process.env')) {
    throw new Error(`${from} still references process.env`);
  }
  copyFileSync(src, join(root, 'public', to));
  console.log(`public/${to} <- packages/sdks/web/${from}`);
}

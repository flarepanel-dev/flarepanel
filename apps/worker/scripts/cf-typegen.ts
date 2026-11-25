// Regenerates worker-configuration.d.ts from wrangler.hosted.jsonc, then drops
// the `NodeJS.ProcessEnv` block wrangler adds for nodejs_compat: next to
// bun-types it breaks node:child_process typings used by core's JS runtime.
// src/env-types.check.ts compares the result with the hand-written Env.
import { $ } from 'bun';

const OUT = 'worker-configuration.d.ts';
const PROCESS_ENV_BLOCK = /declare namespace NodeJS \{[\s\S]*?\n\}\n/;

await $`wrangler types -c wrangler.hosted.jsonc --include-runtime false ${OUT}`.quiet();
const file = Bun.file(OUT);
await Bun.write(OUT, (await file.text()).replace(PROCESS_ENV_BLOCK, ''));
console.log(`Updated ${OUT}`);

import { expect, test } from 'bun:test';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

// Cloudflare D1 has no interactive transactions: use reads followed by one
// `$transaction([...])` batch instead (see packages/db/README.md).
const INTERACTIVE_TRANSACTION = /\$transaction\(\s*async\b/;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      return sourceFiles(path);
    }
    return path.endsWith('.ts') && !path.endsWith('.test.ts') ? [path] : [];
  });
}

test('core uses no interactive Prisma transactions', () => {
  const offenders = sourceFiles(import.meta.dir).filter((file) =>
    INTERACTIVE_TRANSACTION.test(readFileSync(file, 'utf8'))
  );
  expect(offenders).toEqual([]);
});

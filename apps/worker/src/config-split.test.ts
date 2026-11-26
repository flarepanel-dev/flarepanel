/**
 * The self-hosting templates (wrangler.jsonc) and flarepanel.dev's configs
 * (wrangler.hosted.jsonc) must describe the same Workers: same code, bindings,
 * Durable Object migrations, queues and limits. Only what belongs to one
 * deployment may differ: account, domains, database ids, URLs, and the
 * self-hosted switch (always on in the templates).
 */
import { describe, expect, it } from 'bun:test';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dir, '..', '..', '..');

/** JSON with comments and trailing commas, as wrangler reads it. */
function parseJsonc(text: string): Record<string, unknown> {
  let out = '';
  let inString = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];
    if (inString) {
      out += char;
      if (char === '\\') {
        out += next ?? '';
        i++;
      } else if (char === '"') {
        inString = false;
      }
    } else if (char === '"') {
      inString = true;
      out += char;
    } else if (char === '/' && next === '/') {
      while (i < text.length && text[i] !== '\n') {
        i++;
      }
      out += '\n';
    } else if (char === '/' && next === '*') {
      i = text.indexOf('*/', i + 2) + 1;
    } else {
      out += char;
    }
  }
  return JSON.parse(out.replace(/,(\s*[}\]])/g, '$1'));
}

const read = (app: string, file: string) =>
  parseJsonc(readFileSync(join(ROOT, 'apps', app, file), 'utf8'));

/** Drops what may differ per deployment. */
function shape(config: Record<string, unknown>) {
  const {
    account_id: _account,
    routes: _routes,
    vars,
    d1_databases,
    ...rest
  } = config as {
    account_id?: string;
    routes?: unknown;
    vars?: Record<string, string>;
    d1_databases?: { binding: string; database_id: string }[];
  };
  return {
    ...rest,
    varNames: Object.keys(vars ?? {})
      // Deployment switches: billing and whether sign-ups are open.
      .filter((name) => name !== 'SELF_HOSTED' && name !== 'ALLOW_REGISTRATION')
      .sort(),
    d1: (d1_databases ?? []).map(({ database_id: _id, ...db }) => db),
  };
}

describe('hosted and self-hosting configs', () => {
  it('the API template matches flarepanel.dev except per-deployment values', () => {
    const template = read('worker', 'wrangler.jsonc');
    const hosted = read('worker', 'wrangler.hosted.jsonc');
    const t = shape(template);
    const h = shape(hosted);
    // GEO_DB is optional (commented out) in the template.
    expect({ ...t, d1: t.d1 }).toEqual({
      ...h,
      d1: h.d1.filter((db) => (db as { binding: string }).binding !== 'GEO_DB'),
    });
    expect((template.vars as Record<string, string>).SELF_HOSTED).toBe('true');
    expect(template.account_id).toBeUndefined();
    expect(hosted.account_id).toMatch(/^[0-9a-f]{32}$/);
    expect(JSON.stringify(template)).not.toContain('flarepanel.dev');
  });

  it('the dashboard template matches flarepanel.dev except per-deployment values', () => {
    const template = read('start', 'wrangler.jsonc');
    const hosted = read('start', 'wrangler.hosted.jsonc');
    expect(shape(template)).toEqual(shape(hosted));
    expect((template.vars as Record<string, string>).SELF_HOSTED).toBe('true');
    expect(JSON.stringify(template)).not.toContain('flarepanel.dev');
  });

  it('the deploy guard lets another account deploy the template', () => {
    const result = spawnSync(
      'bun',
      [join(ROOT, 'scripts', 'guard-template-deploy.ts')],
      {
        env: { ...process.env, CLOUDFLARE_ACCOUNT_ID: '0'.repeat(32) },
        encoding: 'utf8',
      }
    );
    expect(result.status).toBe(0);
  });
});

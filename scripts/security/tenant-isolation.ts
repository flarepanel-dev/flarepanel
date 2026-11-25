#!/usr/bin/env bun
/**
 * Cross-workspace isolation probe (black box).
 *
 * Creates two fresh accounts, A and B, each with its own workspace and
 * project, fills B with one of each object (dashboard, report, keys, share
 * links, widgets, ...), then calls EVERY tRPC procedure whose input names a
 * workspace object, signed in as A but pointing at B's IDs. Read procedures
 * are also called as B, the owner, to prove the input was valid.
 *
 * Verdicts per procedure:
 *   isolated     A was refused (401/403/404); for reads, B (owner) succeeded
 *                with the very same input
 *   public-by-design  B published it (an enabled widget, an invite link);
 *                only what the public page needs is returned
 *   refused      A was refused, but the owner call could not confirm the input
 *   LEAK         A got 2xx and the answer contains B's data
 *   review       A got 2xx without B's data (often an empty list): read it
 *   not-covered  the generated input was rejected (400) before any access check
 *   error        5xx
 *
 * Also checks: MCP with A's read token against B's project, and B's private
 * share link and turned-off widget fetched by A.
 *
 * It creates accounts and calls delete/update procedures with B's IDs, so it
 * refuses any API that is not on localhost unless --allow-remote is given.
 *
 * Run from packages/core (imports the router to read the input schemas):
 *   bun --preload ./test/preload.ts ../../scripts/security/tenant-isolation.ts \
 *     --api http://localhost:8787 --origin http://localhost:3000
 */

import { writeFileSync } from 'node:fs';
import { appRouter } from '../../packages/core/src/rpc.router';

// ---------- CLI ----------

function arg(name: string, fallback?: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : fallback;
}
const API = arg('api', 'http://localhost:8787') as string;
const ORIGIN = arg('origin', 'http://localhost:3000') as string;
const REPORT_PATH = arg('report');
const allowRemote = process.argv.includes('--allow-remote');
if (
  !(allowRemote || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(API))
) {
  console.error(
    `Refusing to probe ${API}: it creates accounts and calls delete/update procedures. Pass --allow-remote to override.`
  );
  process.exit(2);
}

// ---------- HTTP ----------

interface Call {
  status: number;
  code?: string;
  message?: string;
  body: unknown;
  text: string;
}

async function http(
  path: string,
  init: RequestInit & { cookie?: string } = {}
): Promise<Call> {
  const headers = new Headers(init.headers);
  headers.set('origin', ORIGIN);
  if (init.cookie) {
    headers.set('cookie', init.cookie);
  }
  const response = await fetch(`${API}${path}`, { ...init, headers });
  const text = await response.text();
  let body: unknown = text;
  try {
    body = JSON.parse(text);
  } catch {
    // not JSON
  }
  const error = (
    body as {
      error?: { json?: { message?: string; data?: { code?: string } } };
    }
  )?.error?.json;
  return {
    status: response.status,
    code: error?.data?.code,
    message: error?.message,
    body,
    text,
  };
}

function trpc(
  cookie: string | undefined,
  path: string,
  type: 'query' | 'mutation',
  input: unknown
): Promise<Call> {
  const payload = JSON.stringify({ json: input ?? null });
  if (type === 'query') {
    return http(`/trpc/${path}?input=${encodeURIComponent(payload)}`, {
      cookie,
    });
  }
  return http(`/trpc/${path}`, {
    method: 'POST',
    cookie,
    headers: { 'content-type': 'application/json' },
    body: payload,
  });
}

function data<T = Record<string, unknown>>(call: Call): T {
  return (call.body as { result?: { data?: { json?: T } } })?.result?.data
    ?.json as T;
}

// ---------- accounts and fixtures ----------

const RUN = Date.now().toString(36);

async function signUp(label: string) {
  const email = `iso-${label}-${RUN}@example.test`;
  const response = await fetch(`${API}/api/auth/sign-up/email`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: ORIGIN },
    body: JSON.stringify({
      email,
      password: `Iso-${RUN}-pass-${label}`,
      name: `Iso ${label}`,
    }),
  });
  const json = (await response.json()) as { user?: { id: string } };
  const cookie = response.headers
    .getSetCookie()
    .map((c) => c.split(';')[0])
    .join('; ');
  if (!(json.user?.id && cookie)) {
    throw new Error(`sign-up ${label} failed: ${response.status}`);
  }
  return { email, userId: json.user.id, cookie };
}

interface Tenant {
  label: string;
  cookie: string;
  ids: Record<string, string>;
  /** Strings that only this tenant's data contains. */
  markers: string[];
}

async function createTenant(label: string): Promise<Tenant> {
  const account = await signUp(label);
  const cookie = account.cookie;
  const orgName = `IsoOrg${label}${RUN}`;
  const projectName = `IsoProject${label}${RUN}`;
  const onboarding = await trpc(cookie, 'onboarding.project', 'mutation', {
    organization: orgName,
    project: projectName,
    domain: `https://${label.toLowerCase()}-${RUN}.example.test`,
    cors: [],
    website: true,
    app: false,
    backend: false,
  });
  const created = data<Record<string, any>>(onboarding);
  const projectId: string =
    created?.projectId ?? created?.project?.id ?? created?.id;
  const organizationId: string =
    created?.organizationId ??
    created?.project?.organizationId ??
    created?.organization?.id;
  if (!(projectId && organizationId)) {
    throw new Error(
      `onboarding ${label} failed: ${onboarding.status} ${onboarding.text.slice(0, 300)}`
    );
  }
  const ids: Record<string, string> = {
    projectId,
    organizationId,
    userId: account.userId,
  };
  const markers = [orgName, projectName, projectId, organizationId];
  return { label, cookie, ids, markers };
}

/** Best effort: each object B owns becomes an ID A then aims at. */
async function fillTenant(tenant: Tenant, log: string[]) {
  const { cookie, ids } = tenant;
  const { projectId, organizationId } = ids;
  const step = async (
    name: string,
    path: string,
    input: unknown,
    pick: (result: any) => Record<string, string | undefined>
  ) => {
    const call = await trpc(cookie, path, 'mutation', input);
    if (call.status >= 300) {
      log.push(`setup ${name}: ${call.status} ${call.message ?? ''}`);
      return;
    }
    for (const [key, value] of Object.entries(pick(data(call)) ?? {})) {
      if (value) {
        ids[key] = value;
      }
    }
  };

  const dashboardName = `IsoDash${tenant.label}${RUN}`;
  tenant.markers.push(dashboardName);
  await step(
    'dashboard',
    'dashboard.create',
    { name: dashboardName, projectId },
    (r) => ({ dashboardId: r?.id })
  );
  if (ids.dashboardId) {
    const reportName = `IsoReport${tenant.label}${RUN}`;
    tenant.markers.push(reportName);
    await step(
      'report',
      'report.create',
      {
        dashboardId: ids.dashboardId,
        report: {
          projectId,
          name: reportName,
          chartType: 'linear',
          lineType: 'monotone',
          interval: 'day',
          range: '30d',
          series: [
            {
              type: 'event',
              id: 'a1',
              name: 'screen_view',
              segment: 'event',
              filters: [],
            },
          ],
          breakdowns: [],
          metric: 'sum',
          previous: false,
        },
      },
      (r) => ({ reportId: r?.id })
    );
  }
  await step(
    'read client',
    'client.create',
    { name: `IsoKey${tenant.label}`, projectId, organizationId, type: 'read' },
    (r) => ({
      clientId: r?.id ?? r?.client?.id,
      clientSecret: r?.secret ?? r?.clientSecret,
    })
  );
  const referenceTitle = `IsoRef${tenant.label}${RUN}`;
  tenant.markers.push(referenceTitle);
  await step(
    'reference',
    'reference.create',
    { title: referenceTitle, projectId, datetime: new Date().toISOString() },
    (r) => ({ referenceId: r?.id })
  );
  await step(
    'private overview share',
    'share.createOverview',
    { organizationId, projectId, password: `pw-${RUN}`, public: false },
    (r) => ({ shareId: r?.id })
  );
  if (ids.dashboardId) {
    await step(
      'dashboard share',
      'share.createDashboard',
      {
        organizationId,
        projectId,
        dashboardId: ids.dashboardId,
        password: `pw-${RUN}`,
        public: false,
      },
      (r) => ({ dashboardShareId: r?.id })
    );
  }
  await step(
    'counter widget',
    'widget.toggle',
    { projectId, organizationId, type: 'counter', enabled: true },
    (r) => ({ widgetId: r?.id })
  );
  await step(
    'invite',
    'organization.inviteUser',
    {
      email: `iso-invitee-${tenant.label}-${RUN}@example.test`,
      organizationId,
      role: 'member',
      projectScope: 'all',
      access: [],
    },
    (r) => ({ inviteId: r?.id ?? r?.invite?.id })
  );
  const integrationName = `IsoHook${tenant.label}${RUN}`;
  tenant.markers.push(integrationName);
  await step(
    'webhook integration',
    'integration.createOrUpdate',
    {
      name: integrationName,
      projectId,
      config: {
        type: 'webhook',
        url: 'https://iso-probe.example.test/hook',
        headers: {},
        mode: 'message',
      },
    },
    (r) => ({ integrationId: r?.id })
  );
  const cohortName = `IsoCohort${tenant.label}${RUN}`;
  tenant.markers.push(cohortName);
  await step(
    'cohort',
    'cohort.create',
    {
      name: cohortName,
      projectId,
      isStatic: false,
      definition: {
        type: 'event',
        criteria: {
          operator: 'and',
          events: [
            {
              name: 'screen_view',
              filters: [],
              timeframe: { type: 'relative', value: '30d' },
              frequency: { operator: 'gte', count: 1 },
            },
          ],
        },
      },
    },
    (r) => ({ cohortId: r?.id })
  );
}

// ---------- input generation from zod 4 schemas ----------

interface Zod {
  _zod?: { def: Record<string, any> };
}

/** Router area -> what a bare `id` means there. */
const BARE_ID: Record<string, string> = {
  dashboard: 'dashboardId',
  report: 'reportId',
  client: 'clientId',
  reference: 'referenceId',
  cohort: 'cohortId',
  share: 'shareId',
  widget: 'widgetId',
  integration: 'integrationId',
  organization: 'organizationId',
  project: 'projectId',
};

function idFor(
  key: string,
  area: string,
  b: Record<string, string>
): string | undefined {
  if (key === 'id') {
    const mapped = BARE_ID[area];
    return mapped ? (b[mapped] ?? `iso-missing-${mapped}`) : 'iso-unknown-id';
  }
  if (key === 'shareId') {
    if (area === 'widget') {
      return b.widgetId;
    }
    return b.shareId;
  }
  if (/Id$/.test(key)) {
    return b[key] ?? `iso-missing-${key}`;
  }
  return;
}

const TENANT_KEYS = new Set([
  'projectId',
  'organizationId',
  'dashboardId',
  'reportId',
  'cohortId',
  'clientId',
  'inviteId',
  'shareId',
  'referenceId',
  'id',
]);

/**
 * Which optional fields to fill: `required` only the required ones, `scope`
 * also an optional projectId/organizationId, `all` every optional object ID.
 */
type Mode = 'required' | 'scope' | 'all';
let mode: Mode = 'all';
const SCOPE_KEYS = new Set(['projectId', 'organizationId']);

function valueFor(
  key: string,
  schema: Zod,
  area: string,
  b: Record<string, string>,
  depth = 0
): unknown {
  const id = idFor(key, area, b);
  if (id !== undefined) {
    return id;
  }
  return generate(schema, key, area, b, depth);
}

function generate(
  schema: Zod,
  key: string,
  area: string,
  b: Record<string, string>,
  depth = 0
): unknown {
  const def = schema?._zod?.def;
  if (!def || depth > 6) {
    return;
  }
  switch (def.type) {
    case 'object': {
      const out: Record<string, unknown> = {};
      for (const [k, child] of Object.entries(
        def.shape as Record<string, Zod>
      )) {
        const childType = child._zod?.def.type;
        const optional =
          childType === 'optional' ||
          childType === 'default' ||
          childType === 'prefault';
        const wanted =
          mode === 'all'
            ? TENANT_KEYS.has(k)
            : mode === 'scope'
              ? SCOPE_KEYS.has(k)
              : false;
        if (optional && !wanted) {
          continue;
        }
        const value = valueFor(k, child, area, b, depth + 1);
        if (value !== undefined) {
          out[k] = value;
        }
      }
      return out;
    }
    case 'optional':
    case 'nullable':
    case 'default':
    case 'prefault':
    case 'catch':
    case 'readonly':
    case 'nonoptional':
      return generate(def.innerType, key, area, b, depth);
    case 'pipe':
      return generate(def.in, key, area, b, depth);
    case 'lazy':
      return generate(def.getter(), key, area, b, depth);
    case 'union':
      return generate(def.options[0], key, area, b, depth);
    case 'intersection': {
      const left = generate(def.left, key, area, b, depth);
      const right = generate(def.right, key, area, b, depth);
      return typeof left === 'object' && typeof right === 'object'
        ? { ...(left as object), ...(right as object) }
        : (left ?? right);
    }
    case 'enum':
      return Object.values(def.entries)[0];
    case 'literal':
      return def.values[0];
    case 'array': {
      const min = (def.checks ?? []).find(
        (c: any) => c._zod?.def?.check === 'min_length'
      );
      return min ? [generate(def.element, key, area, b, depth + 1)] : [];
    }
    case 'record':
      return {};
    case 'boolean':
      return false;
    case 'number':
    case 'int':
      return /limit|take/i.test(key) ? 10 : 1;
    case 'date':
      return new Date().toISOString();
    case 'string':
      return stringFor(key);
    default:
      return;
  }
}

function stringFor(key: string): string {
  if (/startDate/i.test(key)) {
    return '2026-10-01';
  }
  if (/endDate/i.test(key)) {
    return '2026-11-25';
  }
  if (/email/i.test(key)) {
    return `iso-probe-${RUN}@example.test`;
  }
  if (/domain|url|website/i.test(key)) {
    return 'https://iso-probe.example.test';
  }
  if (/timezone/i.test(key)) {
    return 'UTC';
  }
  if (/datetime|date|At$/i.test(key)) {
    return new Date().toISOString();
  }
  return `iso-probe-${key}`;
}

// ---------- the probe ----------

type Verdict =
  | 'isolated'
  | 'public-by-design'
  | 'refused'
  | 'LEAK'
  | 'review'
  | 'not-covered'
  | 'error';

interface Row {
  path: string;
  type: string;
  verdict: Verdict;
  attacker: string;
  owner?: string;
  note?: string;
}

const DENIED = new Set([401, 403, 404]);

/** Answers anyone may get once B publishes something, and what they must not contain. */
const PUBLIC_BY_DESIGN: Record<string, { why: string; forbidden: string[] }> = {
  'widget.counter': {
    why: 'B turned the counter widget on (public embed)',
    forbidden: ['organizationId', 'email'],
  },
  'widget.badge': {
    why: 'B turned the counter widget on (public embed)',
    forbidden: ['organizationId', 'email'],
  },
  'organization.getInvite': {
    why: 'invite page: whoever holds the unguessable invite link',
    forbidden: ['createdById', 'projectAccess', 'role', 'organizationId'],
  },
};
const isDestructive = (path: string) =>
  /\.(delete|remove|revoke|leave|reset|disconnect|cancel)/i.test(path);

function summary(call: Call) {
  return `${call.status}${call.code ? ` ${call.code}` : ''}`;
}

function containsMarker(call: Call, markers: string[]) {
  return markers.filter((m) => call.text.includes(m));
}

async function main() {
  const setupLog: string[] = [];
  console.log(`Probing ${API}`);
  const a = await createTenant('A');
  const b = await createTenant('B');
  await fillTenant(b, setupLog);
  await fillTenant(a, setupLog);
  console.log('B ids:', Object.keys(b.ids).join(', '));

  const procedures = Object.entries(
    (appRouter as any)._def.procedures as Record<string, any>
  )
    .map(([path, p]) => ({
      path,
      type: p._def.type as 'query' | 'mutation',
      schema: (p._def.inputs?.[0] ?? null) as Zod | null,
    }))
    .filter(({ schema }) => {
      const shape = schema?._zod?.def?.shape as
        | Record<string, unknown>
        | undefined;
      const keys = shape ? Object.keys(shape) : [];
      return keys.some((k) => TENANT_KEYS.has(k));
    })
    // Reads, then writes, then destructive writes last.
    .sort(
      (x, y) =>
        Number(x.type === 'mutation') - Number(y.type === 'mutation') ||
        Number(isDestructive(x.path)) - Number(isDestructive(y.path))
    );

  const rows: Row[] = [];
  let sanityFailures = 0;
  for (const [index, proc] of procedures.entries()) {
    const area = proc.path.split('.')[0] ?? '';
    const build = (m: Mode) => {
      mode = m;
      return proc.schema ? generate(proc.schema, '', area, b.ids) : null;
    };
    // Reads: find an input the owner succeeds with, then replay it as A.
    let input = build('all');
    let owner: Call | undefined;
    if (proc.type === 'query') {
      for (const m of ['required', 'scope', 'all'] as Mode[]) {
        const candidate = build(m);
        const call = await trpc(b.cookie, proc.path, proc.type, candidate);
        owner ??= call;
        if (call.status >= 200 && call.status < 300) {
          input = candidate;
          owner = call;
          break;
        }
      }
    }
    const attacker = await trpc(a.cookie, proc.path, proc.type, input);
    const row: Row = {
      path: proc.path,
      type: proc.type,
      verdict: 'not-covered',
      attacker: summary(attacker),
      owner: owner ? summary(owner) : undefined,
    };
    const ownerOk = !!owner && owner.status >= 200 && owner.status < 300;
    if (attacker.status >= 500) {
      row.verdict = 'error';
      row.note = attacker.message?.slice(0, 120);
    } else if (attacker.status >= 200 && attacker.status < 300) {
      const found = containsMarker(attacker, b.markers);
      const publicPage = PUBLIC_BY_DESIGN[proc.path];
      if (publicPage) {
        const extraFields = publicPage.forbidden.filter((f) =>
          attacker.text.includes(`"${f}"`)
        );
        row.verdict = extraFields.length ? 'LEAK' : 'public-by-design';
        row.note = extraFields.length
          ? `public answer also returns ${extraFields.join(', ')}`
          : publicPage.why;
      } else {
        row.verdict = found.length > 0 ? 'LEAK' : 'review';
        row.note =
          found.length > 0
            ? `answer contains B's ${found.join(', ')}`
            : attacker.text.slice(0, 120);
      }
    } else if (DENIED.has(attacker.status)) {
      row.verdict = ownerOk ? 'isolated' : 'refused';
      if (!ownerOk && owner) {
        row.note = `owner could not confirm the input: ${owner.message?.slice(0, 80) ?? ''}`;
      }
    } else {
      row.note = attacker.message?.slice(0, 120);
    }
    rows.push(row);

    // A must still be signed in, or every later refusal proves nothing.
    if (index % 20 === 19) {
      const sanity = await trpc(a.cookie, 'organization.list', 'query', null);
      if (sanity.status !== 200) {
        sanityFailures++;
        console.error(
          `A's session failed after ${proc.path}: ${sanity.status}`
        );
        break;
      }
    }
  }

  // MCP: A's read token aimed at B's project.
  const extra: string[] = [];
  if (a.ids.clientId && a.ids.clientSecret) {
    const token = Buffer.from(
      `${a.ids.clientId}:${a.ids.clientSecret}`
    ).toString('base64');
    const mcp = await http('/mcp', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json, text/event-stream',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: 'get_analytics_overview',
          arguments: { projectId: b.ids.projectId },
        },
      }),
    });
    const found = containsMarker(mcp, b.markers);
    extra.push(
      `MCP get_analytics_overview with A's token and B's projectId: ${mcp.status}, ${
        found.length ? `LEAK (${found.join(', ')})` : 'no B data'
      }`
    );
    const projects = await http('/mcp', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json, text/event-stream',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: { name: 'list_projects', arguments: {} },
      }),
    });
    const leaked = containsMarker(projects, b.markers);
    extra.push(
      `MCP list_projects with A's token: ${projects.status}, ${
        leaked.length ? `LEAK (${leaked.join(', ')})` : 'no B data'
      }`
    );
  } else {
    extra.push('MCP: not checked (A has no read client secret)');
  }

  // A widget B turns off must stop answering.
  if (b.ids.widgetId) {
    await trpc(b.cookie, 'widget.toggle', 'mutation', {
      projectId: b.ids.projectId,
      organizationId: b.ids.organizationId,
      type: 'counter',
      enabled: false,
    });
    const off = await trpc(undefined, 'widget.counter', 'query', {
      shareId: b.ids.widgetId,
    });
    extra.push(
      `B's counter widget after B turned it off, fetched anonymously: ${summary(off)}${
        off.status >= 200 && off.status < 300 ? ' (LEAK: still answers)' : ''
      }`
    );
  }

  // Anonymous: B's private share and widget.
  if (b.ids.shareId) {
    const share = await trpc(undefined, 'share.overview', 'query', {
      shareId: b.ids.shareId,
    });
    const found = containsMarker(share, b.markers);
    extra.push(
      `Anonymous share.overview of B's password share: ${summary(share)}, ${
        found.length ? `contains ${found.join(', ')}` : 'no B data'
      }`
    );
  }

  const counts = rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.verdict] = (acc[row.verdict] ?? 0) + 1;
    return acc;
  }, {});
  const lines = [
    '# Cross-workspace isolation probe',
    '',
    `API ${API}, run ${RUN}, ${new Date().toISOString()}`,
    '',
    `Procedures probed: ${rows.length}. ${Object.entries(counts)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ')}.`,
    sanityFailures
      ? '\n**A session check failed: later rows are not reliable.**'
      : '',
    '',
    '## Other surfaces',
    '',
    ...extra.map((line) => `- ${line}`),
    '',
    '## Setup notes',
    '',
    ...(setupLog.length
      ? setupLog.map((line) => `- ${line}`)
      : ['- all fixtures created']),
    '',
    '## Procedures',
    '',
    '| Verdict | Procedure | Type | A (attacker) | B (owner) | Note |',
    '|---|---|---|---|---|---|',
    ...rows
      .sort((x, y) => x.verdict.localeCompare(y.verdict))
      .map(
        (r) =>
          `| ${r.verdict} | \`${r.path}\` | ${r.type} | ${r.attacker} | ${r.owner ?? ''} | ${(r.note ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ')} |`
      ),
  ];
  const report = lines.join('\n');
  if (REPORT_PATH) {
    writeFileSync(REPORT_PATH, report);
    console.log(`Report: ${REPORT_PATH}`);
  }
  console.log(`Probed ${rows.length}: ${JSON.stringify(counts)}`);
  for (const line of extra) {
    console.log(line);
  }
  const leaks = rows.filter((r) => r.verdict === 'LEAK');
  for (const leak of leaks) {
    console.log(`LEAK ${leak.path}: ${leak.note}`);
  }
  process.exit(
    leaks.length > 0 || extra.some((l) => l.includes('LEAK')) ? 1 : 0
  );
}

await main();

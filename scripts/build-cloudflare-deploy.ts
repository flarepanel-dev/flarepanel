// Builds the one-click "Deploy to Cloudflare" bundle: two folders that each
// stand on their own, as Cloudflare's deploy button requires ("fully isolated
// within that subdirectory, including any dependencies").
//
//   bun scripts/build-cloudflare-deploy.ts [out-dir]   (default: .cloudflare-deploy)
//
//   <out>/api/        the API Worker, prebuilt, with its D1 migrations
//   <out>/dashboard/  the dashboard Worker, prebuilt, with its static assets
//   <out>/README.md   the two buttons and what to fill in
//
// The release workflow (.github/workflows/cloudflare-deploy-bundle.yml) publishes
// this folder to the `cloudflare-deploy` branch, which the buttons point at.
// Differences from apps/worker/wrangler.jsonc, all so a fresh account deploys
// without manual steps: no custom domains (workers.dev), no send_email (needs
// a domain onboarded first) and no worker_loaders (JavaScript webhook
// templates); URLs and secrets are prompted at deploy time; sign-ups close
// after the first account.

import { $ } from 'bun';
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dir, '..');
const out = resolve(root, process.argv[2] ?? '.cloudflare-deploy');
const repo = 'https://github.com/flarepanel-dev/flarepanel';
const DEPLOY_BRANCH = 'cloudflare-deploy';
const buttonBase = 'https://deploy.workers.cloudflare.com/?url=';

const workerConfig = JSON.parse(
  stripJsonComments(
    readFileSync(join(root, 'apps/worker/wrangler.jsonc'), 'utf8')
  )
);
const wranglerVersion = String(
  JSON.parse(readFileSync(join(root, 'apps/worker/package.json'), 'utf8'))
    .devDependencies?.wrangler ?? 'latest'
).replace(/^[\^~]/, '');
const appVersion = String(
  JSON.parse(readFileSync(join(root, 'apps/start/package.json'), 'utf8'))
    .version ?? '1.0.0'
);

function stripJsonComments(text: string): string {
  // Line comments only outside strings; the configs use no block comments.
  return text
    .split('\n')
    .map((line) => {
      let inString = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"' && line[i - 1] !== '\\') {
          inString = !inString;
        } else if (!inString && ch === '/' && line[i + 1] === '/') {
          return line.slice(0, i);
        }
      }
      return line;
    })
    .join('\n')
    .replace(/,(\s*[}\]])/g, '$1');
}

function write(path: string, body: string) {
  mkdirSync(resolve(path, '..'), { recursive: true });
  writeFileSync(path, body.endsWith('\n') ? body : `${body}\n`);
}

const json = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

// ---------------------------------------------------------------- API
console.log('Bundling the API...');
const apiBuild = join(out, '.api-build');
await $`bunx wrangler deploy --dry-run --outdir ${apiBuild} -c wrangler.jsonc`
  .cwd(join(root, 'apps/worker'))
  .quiet();
const api = join(out, 'api');
mkdirSync(join(api, 'dist'), { recursive: true });
for (const file of readdirSync(apiBuild)) {
  if (file.endsWith('.js') || file.endsWith('.wasm')) {
    cpSync(join(apiBuild, file), join(api, 'dist', file));
  }
}
rmSync(apiBuild, { recursive: true, force: true });
cpSync(join(root, 'packages/db/migrations'), join(api, 'migrations'), {
  recursive: true,
});

const apiConfig = {
  $schema: 'node_modules/wrangler/config-schema.json',
  name: 'flarepanel-api',
  main: 'dist/index.js',
  compatibility_date: workerConfig.compatibility_date,
  compatibility_flags: workerConfig.compatibility_flags,
  // Prebuilt: upload as is. Modules are found next to main (dist/ only).
  no_bundle: true,
  rules: [
    { type: 'ESModule', globs: ['**/*.js'] },
    { type: 'CompiledWasm', globs: ['**/*.wasm'] },
  ],
  workers_dev: true,
  limits: workerConfig.limits,
  d1_databases: [
    {
      binding: 'DB',
      database_name: 'flarepanel',
      migrations_dir: 'migrations',
    },
  ],
  durable_objects: workerConfig.durable_objects,
  migrations: workerConfig.migrations,
  r2_buckets: workerConfig.r2_buckets,
  ratelimits: workerConfig.ratelimits,
  queues: workerConfig.queues,
  triggers: workerConfig.triggers,
  vars: {
    NODE_ENV: 'production',
    SELF_HOSTED: 'true',
    // The first account can sign up; everyone after that needs an invitation.
    ALLOW_REGISTRATION: 'false',
    TRUSTED_IP_HEADER_ORDER: 'cf-connecting-ip',
    FLAREPANEL_EVENT_RETENTION_DAYS: '90',
    UPTIME_URLS: '',
    FEEDBACK_EMAIL: '',
  },
  observability: workerConfig.observability,
};
write(join(api, 'wrangler.jsonc'), json(apiConfig));

const urlHelp =
  'Your workers.dev subdomain is under Workers & Pages → Settings in the Cloudflare dashboard.';
write(
  join(api, '.dev.vars.example'),
  [
    'API_URL=https://flarepanel-api.your-subdomain.workers.dev # this Worker’s address',
    'DASHBOARD_URL=https://flarepanel-dashboard.your-subdomain.workers.dev # the dashboard Worker’s address',
    'CUSTOM_COOKIE_DOMAIN=your-subdomain.workers.dev # shared by both addresses, so sign-in works on both',
    'COOKIE_SECRET=change-me # openssl rand -hex 32',
    'AUTH_SECRET=change-me # openssl rand -hex 32',
    'ENCRYPTION_KEY=change-me # openssl rand -hex 32; keep a copy',
  ].join('\n')
);
write(
  join(api, 'package.json'),
  json({
    name: 'flarepanel-api',
    version: appVersion,
    private: true,
    description:
      'FlarePanel API: tracking, the dashboard API, sign-in and background jobs.',
    scripts: {
      deploy: 'wrangler d1 migrations apply DB --remote && wrangler deploy',
    },
    devDependencies: { wrangler: wranglerVersion },
    cloudflare: {
      label: 'FlarePanel API',
      products: ['Workers', 'Durable Objects', 'D1', 'R2', 'Queues'],
      categories: ['analytics'],
      bindings: {
        API_URL: {
          description: `This Worker’s address: https://flarepanel-api.<your-subdomain>.workers.dev. ${urlHelp}`,
        },
        DASHBOARD_URL: {
          description:
            'The dashboard Worker’s address: https://flarepanel-dashboard.<your-subdomain>.workers.dev. Deploy it with the second button.',
        },
        CUSTOM_COOKIE_DOMAIN: {
          description:
            'Your workers.dev subdomain, for example `your-subdomain.workers.dev`, so the sign-in cookie reaches both Workers.',
        },
        COOKIE_SECRET: {
          description: 'A random string: run `openssl rand -hex 32`.',
        },
        AUTH_SECRET: {
          description: 'Another random string: run `openssl rand -hex 32`.',
        },
        ENCRYPTION_KEY: {
          description:
            'A third random string (`openssl rand -hex 32`). Keep a copy: stored AI and integration keys cannot be read without it.',
        },
        DB: { description: 'Accounts, projects and settings.' },
        EVENTS_ARCHIVE: {
          description:
            'Raw event archive, imports, replays and AI prompt text.',
        },
      },
    },
  })
);

// ---------------------------------------------------------------- dashboard
console.log('Building the dashboard...');
const start = join(root, 'apps/start');
const devVars = join(start, '.dev.vars');
const parkedDevVars = join(start, '.dev.vars.parked-by-deploy-build');
if (existsSync(devVars)) {
  renameSync(devVars, parkedDevVars);
}
try {
  await $`bun run build`
    .cwd(start)
    .env({ ...process.env, NODE_ENV: 'production' })
    .quiet();
} finally {
  if (existsSync(parkedDevVars)) {
    renameSync(parkedDevVars, devVars);
  }
}
const dashboard = join(out, 'dashboard');
const builtServer = join(start, 'dist/server');
const built = JSON.parse(
  readFileSync(join(builtServer, 'wrangler.json'), 'utf8')
);
cpSync(builtServer, join(dashboard, 'server'), {
  recursive: true,
  filter: (src) =>
    !(
      src.endsWith('.map') ||
      src.endsWith('wrangler.json') ||
      src.includes('.dev.vars')
    ),
});
cpSync(join(start, 'dist/client'), join(dashboard, 'client'), {
  recursive: true,
  filter: (src) => !(src.endsWith('.map') || src.includes('.dev.vars')),
});
write(
  join(dashboard, 'wrangler.jsonc'),
  json({
    $schema: 'node_modules/wrangler/config-schema.json',
    name: 'flarepanel-dashboard',
    main: 'server/index.js',
    compatibility_date: built.compatibility_date,
    // On workers.dev a Worker cannot fetch another Worker of the same account
    // by its address (error 1042); this sends the dashboard's server-side
    // calls to the API over the public internet instead.
    compatibility_flags: [
      ...(built.compatibility_flags ?? []),
      'global_fetch_strictly_public',
    ],
    no_bundle: true,
    rules: built.rules ?? [
      { type: 'ESModule', globs: ['**/*.js', '**/*.mjs'] },
    ],
    assets: { directory: 'client' },
    workers_dev: true,
    limits: built.limits,
    vars: {
      NODE_ENV: 'production',
      SELF_HOSTED: 'true',
      APP_VERSION: appVersion,
    },
    observability: built.observability,
  })
);
write(
  join(dashboard, '.dev.vars.example'),
  [
    'API_URL=https://flarepanel-api.your-subdomain.workers.dev # the API Worker’s address',
    'DASHBOARD_URL=https://flarepanel-dashboard.your-subdomain.workers.dev # this Worker’s address',
  ].join('\n')
);
write(
  join(dashboard, 'package.json'),
  json({
    name: 'flarepanel-dashboard',
    version: appVersion,
    private: true,
    description: 'FlarePanel dashboard.',
    scripts: { deploy: 'wrangler deploy' },
    devDependencies: { wrangler: wranglerVersion },
    cloudflare: {
      label: 'FlarePanel dashboard',
      products: ['Workers'],
      categories: ['analytics'],
      bindings: {
        API_URL: {
          description:
            'The API Worker’s address from the first button: https://flarepanel-api.<your-subdomain>.workers.dev.',
        },
        DASHBOARD_URL: {
          description:
            'This Worker’s address: https://flarepanel-dashboard.<your-subdomain>.workers.dev.',
        },
      },
    },
  })
);

// ---------------------------------------------------------------- README
const button = (folder: string) =>
  `[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](${buttonBase}${repo}/tree/${DEPLOY_BRANCH}/${folder})`;
write(
  join(out, 'README.md'),
  `# Deploy FlarePanel to Cloudflare

Self-host [FlarePanel](https://flarepanel.dev), open-source web and product
analytics, on your own Cloudflare account in two clicks. This branch is built
automatically from \`main\` of [flarepanel-dev/flarepanel](https://github.com/flarepanel-dev/flarepanel)
on every release (version ${appVersion}); send issues and changes there.

**You need** a Cloudflare account on the Workers Paid plan (the API is larger
than the free plan allows) with R2 turned on, and your workers.dev subdomain,
shown under Workers & Pages → Settings.

## 1. The API

${button('api')}

Cloudflare copies this folder to your GitHub account, creates the D1 database,
R2 bucket, queues and Durable Objects, sets up the database tables and deploys.
It asks for:

| Value | What to enter |
|---|---|
| \`API_URL\` | \`https://flarepanel-api.<your-subdomain>.workers.dev\` |
| \`DASHBOARD_URL\` | \`https://flarepanel-dashboard.<your-subdomain>.workers.dev\` |
| \`CUSTOM_COOKIE_DOMAIN\` | \`<your-subdomain>.workers.dev\` |
| \`COOKIE_SECRET\`, \`AUTH_SECRET\`, \`ENCRYPTION_KEY\` | Three different values from \`openssl rand -hex 32\`. Keep a copy of \`ENCRYPTION_KEY\`. |

Keep the Worker names \`flarepanel-api\` and \`flarepanel-dashboard\`, or change
the addresses above to match.

## 2. The dashboard

${button('dashboard')}

It asks for the same \`API_URL\` and \`DASHBOARD_URL\`.

## 3. Sign up

Open your dashboard address and create the first account. Sign-ups then close:
invite your team from the dashboard. To let anyone sign up, set the
\`ALLOW_REGISTRATION\` variable of the API Worker to \`true\`.

## Left out of the one-click setup

Add these later by following the [full guide](https://docs.flarepanel.dev/self-hosting/deploy):

- **Email** (sign-up verification, invitations, password reset): needs your
  domain onboarded to Cloudflare Email Service and the \`send_email\` binding.
  Without it, new accounts are not email-verified.
- **Your own domain** for the API and dashboard instead of workers.dev.
- **JavaScript webhook templates** (the \`worker_loaders\` binding).
- **IP geolocation** for server-side events, Google Search Console, and a
  server AI key.

## Updating

Each release updates this branch. Copy the new \`api/\` and \`dashboard/\`
folders into your copies; Workers Builds then redeploys, and the API's deploy
step applies new database migrations.

## Licence

AGPL-3.0, like FlarePanel. Built from
[flarepanel-dev/flarepanel](https://github.com/flarepanel-dev/flarepanel).
`
);
cpSync(join(root, 'LICENSE.md'), join(out, 'LICENSE.md'));
console.log(`Wrote ${out}`);

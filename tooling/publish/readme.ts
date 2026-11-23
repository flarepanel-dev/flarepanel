import fs from 'node:fs';
import { join, resolve } from 'node:path';
import type { PackageInfo } from './publish';

const DOCS = 'https://docs.flarepanel.dev';
const REPO = 'https://github.com/flarepanel-dev/flarepanel';

/** The docs page each package points to. */
const DOC_PAGES: Record<string, { path: string; usage: string }> = {
  '@flarepanel/sdk': {
    path: '/sdks/server',
    usage: `import { FlarePanel } from '@flarepanel/sdk';

const op = new FlarePanel({
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
});

op.track('signup', { plan: 'pro' });`,
  },
  '@flarepanel/web': {
    path: '/sdks/web',
    usage: `import { FlarePanel } from '@flarepanel/web';

const op = new FlarePanel({
  clientId: 'YOUR_CLIENT_ID',
  trackScreenViews: true,
});

op.track('signup', { plan: 'pro' });`,
  },
  '@flarepanel/nextjs': {
    path: '/sdks/nextjs',
    usage: `import { FlarePanelComponent } from '@flarepanel/nextjs';

<FlarePanelComponent clientId="YOUR_CLIENT_ID" trackScreenViews />`,
  },
  '@flarepanel/express': { path: '/sdks/server', usage: '' },
  '@flarepanel/astro': { path: '/sdks/web', usage: '' },
  '@flarepanel/nuxt': { path: '/sdks/web', usage: '' },
  '@flarepanel/react-native': {
    path: '/getting-started/quickstart',
    usage: '',
  },
  '@flarepanel/ai': { path: '/tracking/events', usage: '' },
};

/**
 * A short README per published package: what it is, how to install it and
 * where the docs are. Written next to package.json for the publish, removed
 * afterwards. Returns the paths it wrote.
 */
export function writeReadmes(
  packages: Record<string, PackageInfo>,
  dependents: string[]
): string[] {
  const written: string[] = [];
  for (const name of dependents) {
    const pkg = packages[name];
    if (!pkg) {
      continue;
    }
    const target = join(resolve(pkg.localPath), 'README.md');
    if (fs.existsSync(target)) {
      continue;
    }
    const page = DOC_PAGES[name] ?? { path: '', usage: '' };
    const description =
      typeof pkg.description === 'string' ? pkg.description : '';
    const body = [
      `# ${name}`,
      '',
      description ||
        'FlarePanel SDK: open-source web and product analytics that runs on Cloudflare.',
      '',
      '## Install',
      '',
      '```bash',
      `npm install ${name}`,
      '```',
      ...(page.usage ? ['', '## Usage', '', '```ts', page.usage, '```'] : []),
      '',
      `Events go to \`https://api.flarepanel.dev\` by default. Self-hosting? Pass \`apiUrl\` with your own API address.`,
      '',
      `Docs: ${DOCS}${page.path}`,
      '',
      `FlarePanel is a fork of [OpenPanel](https://openpanel.dev) and accepts the same events. Source: ${REPO}`,
      '',
    ].join('\n');
    fs.writeFileSync(target, body, 'utf-8');
    written.push(target);
  }
  return written;
}

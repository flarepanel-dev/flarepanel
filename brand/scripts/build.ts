// Builds every FlarePanel logo file from one geometry: brand/ itself and the
// copies each app serves (favicons, app icons, wordmarks, social images).
//
//   bun brand/scripts/build.ts
//
// SVGs are written directly; PNG and ICO files are rendered with Playwright's
// Chromium (installed for the dashboard's end-to-end tests) and ImageMagick.

import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dir, '../..');
const BRAND = join(ROOT, 'brand');

export const COLORS = {
  ink: '#0D0D10',
  paper: '#F9FAFE',
  flare: '#FF3D6E',
  ember: '#FF6A4D',
  spark: '#FFB547',
} as const;

// The mark lives in a 64-unit square: a 44-unit panel (4 × 4 cells of 11),
// lit along a rising staircase, with the top-right cell lifted 4.5 units up
// and right as the flare.
const S = 44;
const D = 4.5;
const C = S / 4;
const X = (64 - S - D) / 2;
const Y = X + D;
const RX = 11;

type Surface = 'dark' | 'light';

function n(v: number) {
  return Number(v.toFixed(2)).toString();
}

function sparkPath() {
  const px = X + 3 * C + D;
  const py = Y - D;
  const ri = 2.6;
  const ro = 5.5;
  return (
    `M${n(px + ri)} ${n(py)}H${n(px + C - ro)}A${ro} ${ro} 0 0 1 ${n(px + C)} ${n(py + ro)}` +
    `V${n(py + C - ri)}A${ri} ${ri} 0 0 1 ${n(px + C - ri)} ${n(py + C)}H${n(px + ri)}` +
    `A${ri} ${ri} 0 0 1 ${n(px)} ${n(py + C - ri)}V${n(py + ri)}A${ri} ${ri} 0 0 1 ${n(px + ri)} ${n(py)}Z`
  );
}

const PANEL = `M${n(X)} ${n(Y)}H${n(X + 3 * C)}V${n(Y + C)}H${n(X + 4 * C)}V${n(Y + S)}H${n(X)}Z`;
const LIT = `M${n(X)} ${n(Y + S)}V${n(Y + 3 * C)}H${n(X + C)}V${n(Y + 2 * C)}H${n(X + 2 * C)}V${n(Y + C)}H${n(X + 4 * C)}V${n(Y + S)}Z`;

/** The mark's drawing (no <svg> wrapper), in the 64-unit space. */
export function markBody({
  surface = 'dark',
  mono,
  glow = true,
  id = 'fp',
}: {
  surface?: Surface;
  /** One-colour version in this colour (the unlit panel at 30%). */
  mono?: string;
  glow?: boolean;
  id?: string;
}) {
  const [b0, b1] =
    surface === 'dark' ? ['#2E2E36', '#1B1B21'] : ['#ECECF1', '#DCDCE3'];
  const defs =
    '<defs>' +
    `<linearGradient id="${id}-lit" gradientUnits="userSpaceOnUse" x1="${n(X)}" y1="${n(Y + S)}" x2="${n(X + S)}" y2="${n(Y)}">` +
    `<stop offset="0" stop-color="${COLORS.flare}"/><stop offset=".6" stop-color="${COLORS.ember}"/><stop offset="1" stop-color="#FF9A4A"/></linearGradient>` +
    `<linearGradient id="${id}-spark" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#FFA047"/><stop offset="1" stop-color="#FFCF70"/></linearGradient>` +
    `<linearGradient id="${id}-panel" gradientUnits="userSpaceOnUse" x1="${n(X)}" y1="${n(Y)}" x2="${n(X + S)}" y2="${n(Y + S)}"><stop offset="0" stop-color="${b0}"/><stop offset="1" stop-color="${b1}"/></linearGradient>` +
    `<clipPath id="${id}-clip"><rect x="${n(X)}" y="${n(Y)}" width="${S}" height="${S}" rx="${RX}"/></clipPath>` +
    `<filter id="${id}-glow" x="-120%" y="-120%" width="340%" height="340%"><feGaussianBlur stdDeviation="3.5"/></filter>` +
    '</defs>';
  const panelFill = mono ?? `url(#${id}-panel)`;
  const litFill = mono ?? `url(#${id}-lit)`;
  const sparkFill = mono ?? `url(#${id}-spark)`;
  const spark = sparkPath();
  return (
    (mono ? '' : defs) +
    (mono
      ? `<defs><clipPath id="${id}-clip"><rect x="${n(X)}" y="${n(Y)}" width="${S}" height="${S}" rx="${RX}"/></clipPath></defs>`
      : '') +
    `<g clip-path="url(#${id}-clip)"><path d="${PANEL}" fill="${panelFill}"${mono ? ' opacity=".3"' : ''}/>` +
    `<path d="${LIT}" fill="${litFill}"/></g>` +
    (glow && !mono
      ? `<path d="${spark}" fill="${COLORS.spark}" opacity=".7" filter="url(#${id}-glow)"/>`
      : '') +
    `<path d="${spark}" fill="${sparkFill}"/>`
  );
}

const svg = (viewBox: string, w: number, h: number, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${viewBox}" role="img" aria-label="FlarePanel">${body}</svg>\n`;

/** The bare mark, framed with room for the flare's glow. */
const MARK_BOX = '5.75 5.75 52.5 52.5';
const mark = (opts: Parameters<typeof markBody>[0], size = 512) =>
  svg(MARK_BOX, size, size, markBody(opts));

/** The mark on a rounded tile: favicons and app icons. */
const icon = (
  tile: string,
  surface: Surface,
  opts: { rx?: number; glow?: boolean; scale?: number } = {}
) =>
  svg(
    '0 0 64 64',
    512,
    512,
    `<rect width="64" height="64" rx="${opts.rx ?? 14}" fill="${tile}"/>` +
      `<g transform="translate(32 32) scale(${opts.scale ?? 0.8}) translate(-32 -32)">${markBody({ surface, glow: opts.glow ?? true })}</g>`
  );

// Outlined "FlarePanel" in Geist SemiBold (weight 640, tracking -3.5%), kept
// from brand kit v1 so the wordmark renders the same without the font.
const v1 = readFileSync(join(BRAND, 'wordmark-text.path'), 'utf8').trim();
const wordmark = (surface: Surface) => {
  const text = surface === 'dark' ? COLORS.paper : COLORS.ink;
  // The mark is drawn in a 48-unit box (64-unit art minus the 8-unit margin),
  // with the flare's glow allowed to spill past it.
  const body =
    `<g transform="translate(-7.67 -7.67) scale(${n(48 / 48.5)})">${markBody({ surface, id: `fp-${surface}` })}</g>` +
    v1.replace('fill="FILL"', `fill="${text}"`);
  return svg('-2 -2 213.72 52', 855, 208, body);
};

const out = new Map<string, string>();
const put = (path: string, content: string) => out.set(path, content);

// brand/ (the source of truth, documented in brand/README.md)
put('brand/mark.svg', mark({ surface: 'dark' }));
put('brand/mark-light.svg', mark({ surface: 'light' }));
put('brand/mark-mono-paper.svg', mark({ mono: COLORS.paper, glow: false }));
put('brand/mark-mono-ink.svg', mark({ mono: COLORS.ink, glow: false }));
put('brand/icon.svg', icon(COLORS.ink, 'dark'));
put('brand/icon-light.svg', icon('#FFFFFF', 'light'));
put(
  'brand/favicon.svg',
  icon(COLORS.ink, 'dark', { rx: 12, glow: false, scale: 0.9 })
);
put('brand/wordmark-dark.svg', wordmark('dark'));
put('brand/wordmark-light.svg', wordmark('light'));

// What each app serves
const favicon = out.get('brand/favicon.svg')!;
put('apps/landing/public/icon.svg', favicon);
put('apps/landing/public/mark.svg', out.get('brand/mark.svg')!);
put('apps/start/public/icon.svg', favicon);
put('apps/start/public/logo.svg', out.get('brand/mark-light.svg')!);
put('apps/start/public/logo-inverted.svg', out.get('brand/mark.svg')!);
put('apps/docs/public/icon.svg', favicon);
put('apps/docs/public/wordmark-dark.svg', out.get('brand/wordmark-dark.svg')!);
put(
  'apps/docs/public/wordmark-light.svg',
  out.get('brand/wordmark-light.svg')!
);
put('apps/status/public/icon.svg', favicon);
put('apps/status/public/mark.svg', out.get('brand/mark.svg')!);

for (const [path, content] of out) {
  const abs = join(ROOT, path);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, content);
}
console.log(`wrote ${out.size} svg files`);

// ---------------------------------------------------------------- rasters

const require = createRequire(join(ROOT, 'apps/start/package.json'));
const { chromium } =
  require('@playwright/test') as typeof import('@playwright/test');
const geist = readFileSync(
  join(
    ROOT,
    'apps/landing/node_modules/geist/dist/fonts/geist-sans/Geist-Variable.woff2'
  )
).toString('base64');
const geistMono = readFileSync(
  join(
    ROOT,
    'apps/landing/node_modules/geist/dist/fonts/geist-mono/GeistMono-Variable.woff2'
  )
).toString('base64');

const fonts = `@font-face{font-family:Geist;src:url(data:font/woff2;base64,${geist}) format("woff2");font-weight:100 900}
@font-face{font-family:"Geist Mono";src:url(data:font/woff2;base64,${geistMono}) format("woff2");font-weight:100 900}`;

const og = (
  headline: string,
  sub: string,
  foot: string
) => `<!doctype html><html><head><style>${fonts}
*{margin:0;box-sizing:border-box} body{width:1200px;height:630px;background:${COLORS.ink};font-family:Geist;overflow:hidden;position:relative;color:${COLORS.paper}}
.glow{position:absolute;right:-180px;bottom:-260px;width:900px;height:900px;background:radial-gradient(closest-side,rgba(255,106,77,.16),rgba(255,61,110,.05) 55%,transparent)}
.mark{position:absolute;right:-50px;bottom:-200px;width:620px;height:620px}
.brand{position:absolute;left:72px;top:64px;display:flex;align-items:center;gap:14px;font-size:30px;font-weight:640;letter-spacing:-.035em}
h1{position:absolute;left:72px;top:176px;width:640px;font-size:76px;line-height:.98;font-weight:700;letter-spacing:-.045em}
p{position:absolute;left:72px;top:${headline.length > 30 ? 414 : 340}px;width:560px;font-size:26px;line-height:1.4;color:#A3A3AB;letter-spacing:-.01em}
small{position:absolute;left:72px;bottom:60px;font:400 19px "Geist Mono";color:#74747C;letter-spacing:.01em}
</style></head><body><div class="glow"></div>
<div class="mark">${mark({ surface: 'dark', id: 'og' }).replace('width="512" height="512"', 'width="620" height="620" style="overflow:visible"')}</div>
<div class="brand">${mark({ surface: 'dark', id: 'ogs' }).replace('width="512" height="512"', 'width="46" height="46"')}FlarePanel</div>
<h1>${headline}</h1><p>${sub}</p><small>${foot}</small></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 1 });

async function png(
  content: string,
  w: number,
  h: number,
  path: string,
  html = false
) {
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(
    html
      ? content
      : `<html><body style="margin:0;background:transparent">${content.replace(/width="\d+" height="\d+"/, `width="${w}" height="${h}"`)}</body></html>`
  );
  await page.waitForTimeout(150);
  const abs = join(ROOT, path);
  mkdirSync(dirname(abs), { recursive: true });
  await page.screenshot({
    path: abs,
    omitBackground: !html,
    clip: { x: 0, y: 0, width: w, height: h },
  });
}

const iconTile = out.get('brand/icon.svg')!;
// iOS rounds its own corners: the touch icon is a full square tile.
const squareTile = icon(COLORS.ink, 'dark', { rx: 0 });
await png(iconTile, 512, 512, 'brand/icon-512.png');
await png(iconTile, 512, 512, 'apps/start/public/logo512.png');
await png(iconTile, 192, 192, 'apps/start/public/logo192.png');
await png(iconTile, 256, 256, 'apps/landing/public/logo.png');
for (const p of ['apps/start/public', 'apps/landing/public']) {
  await png(squareTile, 180, 180, `${p}/apple-touch-icon.png`);
}
const tmp = join(ROOT, 'brand/.tmp');
mkdirSync(tmp, { recursive: true });
for (const s of [16, 32, 48, 64]) {
  await png(favicon, s, s, `brand/.tmp/fav-${s}.png`);
}

const headline = 'Your users, your traffic, your Cloudflare.';
const sub =
  'Open-source web and product analytics that runs entirely on Cloudflare.';
await png(
  og(headline, sub, 'flarepanel.dev · open source · early access'),
  1200,
  630,
  'apps/landing/public/og.png',
  true
);
await png(
  og(
    'The FlarePanel docs',
    'Set up, track events, self-host on your own Cloudflare account.',
    'docs.flarepanel.dev'
  ),
  1200,
  630,
  'apps/docs/public/og.png',
  true
);
// Social profiles (X and others). The avatar is cropped to a circle, so the
// mark sits well inside it; the banner keeps its lower left clear because
// the avatar overlaps that corner.
await png(
  icon(COLORS.ink, 'dark', { rx: 0, scale: 0.64 }),
  1000,
  1000,
  'brand/social/avatar.png'
);
await png(
  `<!doctype html><html><head><style>${fonts}
*{margin:0;box-sizing:border-box} body{width:1500px;height:500px;background:${COLORS.ink};font-family:Geist;overflow:hidden;position:relative;color:${COLORS.paper}}
.glow{position:absolute;right:-120px;top:-260px;width:1000px;height:1000px;background:radial-gradient(closest-side,rgba(255,106,77,.17),rgba(255,154,74,.05) 55%,transparent)}
.mark{position:absolute;right:40px;top:-95px;width:640px;height:640px}
h1{position:absolute;left:96px;top:118px;width:760px;font-size:72px;line-height:.98;font-weight:700;letter-spacing:-.045em}
small{position:absolute;left:100px;top:290px;font:400 22px "Geist Mono";color:#A3A3AB;letter-spacing:.01em}
</style></head><body><div class="glow"></div>
<div class="mark">${mark({ surface: 'dark', id: 'bn' }).replace('width="512" height="512"', 'width="640" height="640" style="overflow:visible"')}</div>
<h1>Analytics that runs on Cloudflare.</h1><small>open source · no servers to run · flarepanel.dev</small></body></html>`,
  1500,
  500,
  'brand/social/banner.png',
  true
);
await browser.close();

execFileSync('magick', [
  ...[16, 32, 48, 64].map((s) => join(tmp, `fav-${s}.png`)),
  join(ROOT, 'apps/start/public/favicon.ico'),
]);
execFileSync('rm', ['-rf', tmp]);
console.log('wrote png, ico and og images');

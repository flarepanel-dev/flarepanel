// Server-rendered HTML for status.flarepanel.dev. No JavaScript: the page has
// to load when everything else is on fire. Colours and type follow DESIGN.md.

import { type Impact, type IncidentStatus, STATUS_LABEL } from './incidents';
import { MONITORS, monitorById } from './monitors';
import type { Incident } from './store';
import {
  type DisplayState,
  formatUptime,
  type MonitorView,
  OVERALL_TEXT,
  type Overall,
  type PageView,
} from './view';

export const SITE = 'https://status.flarepanel.dev';

const escape = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export function formatTime(at: number): string {
  const d = new Date(at);
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()} ${hh}:${mm} UTC`;
}

function time(at: number): string {
  return `<time datetime="${new Date(at).toISOString()}">${formatTime(at)}</time>`;
}

function duration(from: number, to: number): string {
  const total = Math.max(1, Math.round((to - from) / 60_000));
  if (total < 60) {
    return `${total} min`;
  }
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  return rest ? `${hours} h ${rest} min` : `${hours} h`;
}

const STATE_TEXT: Record<DisplayState, string> = {
  up: 'Operational',
  degraded: 'Slow',
  down: 'Not responding',
  maintenance: 'Maintenance',
  unknown: 'No data yet',
};

const IMPACT_TEXT: Record<Impact, string> = {
  minor: 'Minor',
  major: 'Major',
  maintenance: 'Maintenance',
};

const OVERALL_TONE: Record<Overall, string> = {
  operational: 'up',
  degraded: 'minor',
  partial: 'major',
  major: 'major',
  maintenance: 'maint',
};

const STATE_TONE: Record<DisplayState, string> = {
  up: 'up',
  degraded: 'minor',
  down: 'major',
  maintenance: 'maint',
  unknown: 'none',
};

const IMPACT_TONE: Record<Impact, string> = {
  minor: 'minor',
  major: 'major',
  maintenance: 'maint',
};

const STYLE = `
@font-face{font-family:Geist;src:url(/fonts/Geist-Variable.woff2) format("woff2");font-weight:100 900;font-display:swap}
@font-face{font-family:"Geist Mono";src:url(/fonts/GeistMono-Variable.woff2) format("woff2");font-weight:100 900;font-display:swap}
:root{--ink:#0d0d10;--panel:#111114;--raised:#18181b;--hover:#1c1c20;--rule:#27272a;--rule-strong:#3f3f43;--faint:#727276;--muted:#a1a1a5;--soft:#d4d4d8;--paper:#f9fafe;--coral:#ff496b;--up:#3ccb7f;--minor:#e9ab2b;--major:#f0605d;--maint:#4cb0e5;--none:#27272a;color-scheme:dark}
:root[data-theme=light]{--ink:#f6f6f7;--panel:#ffffff;--raised:#f1f1f3;--hover:#f6f6f8;--rule:#e4e4e7;--rule-strong:#d0d0d5;--faint:#6b6b72;--muted:#4f4f56;--soft:#33333a;--paper:#0d0d10;--up:#15803d;--minor:#b45309;--major:#dc2626;--maint:#0369a1;--none:#e4e4e7;color-scheme:light}
@media (prefers-color-scheme:light){:root:not([data-theme=dark]){--ink:#f6f6f7;--panel:#ffffff;--raised:#f1f1f3;--hover:#f6f6f8;--rule:#e4e4e7;--rule-strong:#d0d0d5;--faint:#6b6b72;--muted:#4f4f56;--soft:#33333a;--paper:#0d0d10;--up:#15803d;--minor:#b45309;--major:#dc2626;--maint:#0369a1;--none:#e4e4e7;color-scheme:light}}
*{box-sizing:border-box}
html{background:var(--ink)}
body{margin:0;background:var(--ink);color:var(--soft);font:400 15.5px/1.6 Geist,ui-sans-serif,system-ui,sans-serif;font-feature-settings:"ss01","cv11";-webkit-font-smoothing:antialiased}
a{color:var(--paper);text-decoration-color:var(--rule-strong);text-underline-offset:3px}
a:hover{text-decoration-color:var(--paper)}
a:focus-visible,summary:focus-visible{outline:2px solid var(--coral);outline-offset:3px;border-radius:6px}
.wrap{max-width:780px;margin:0 auto;padding:0 20px}
header.top{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:28px 0 36px}
.brand{display:flex;align-items:center;gap:10px;color:var(--paper);text-decoration:none;font-weight:600;letter-spacing:-.015em;font-size:17px}
.brand img{width:26px;height:26px;border-radius:7px}
.brand span{color:var(--faint);font-weight:500}
nav{display:flex;gap:4px;flex-wrap:wrap}
nav a{color:var(--muted);text-decoration:none;font-size:14px;padding:6px 10px;border-radius:8px}
nav a:hover,nav a[aria-current=page]{color:var(--paper);background:var(--raised)}
.banner{display:flex;align-items:center;gap:14px;padding:22px 24px;border:1px solid var(--rule);border-radius:14px;background:var(--panel)}
.banner h1{margin:0;font-size:22px;line-height:1.25;font-weight:600;letter-spacing:-.02em;color:var(--paper)}
.banner p{margin:2px 0 0;color:var(--faint);font-size:13.5px}
.dot{flex:none;width:10px;height:10px;border-radius:50%;background:var(--none)}
.banner .dot{width:14px;height:14px;box-shadow:0 0 0 5px color-mix(in srgb,currentColor 16%,transparent)}
.t-up{color:var(--up)}.t-minor{color:var(--minor)}.t-major{color:var(--major)}.t-maint{color:var(--maint)}.t-none{color:var(--faint)}
.dot.t-up{background:var(--up)}.dot.t-minor{background:var(--minor)}.dot.t-major{background:var(--major)}.dot.t-maint{background:var(--maint)}.dot.t-none{background:var(--rule-strong)}
section{margin-top:40px}
h2{margin:0 0 12px;font-size:13px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--faint)}
.card{border:1px solid var(--rule);border-radius:14px;background:var(--panel);overflow:hidden}
.svc{border-top:1px solid var(--rule)}
.svc:first-child{border-top:0}
.svc summary{list-style:none;cursor:pointer;padding:18px 20px 16px;display:block}
.svc summary::-webkit-details-marker{display:none}
.svc summary:hover{background:var(--hover)}
.row{display:flex;align-items:center;gap:10px}
.name{color:var(--paper);font-weight:500}
.state{font-size:13.5px}
.pct{margin-left:auto;font-family:"Geist Mono",ui-monospace,monospace;font-size:13px;color:var(--muted)}
.chev{width:16px;height:16px;color:var(--faint);transition:transform .2s}
details[open] .chev{transform:rotate(90deg)}
.bars{display:flex;gap:2px;height:30px;margin-top:12px}
.bars span{flex:1;border-radius:2px;background:var(--none);position:relative}
.bars .b-up{background:#3ccb7f}.bars .b-minor{background:#e9ab2b}.bars .b-major{background:#f0605d}
.bars span:hover{opacity:.75}
.bars span:hover::after{content:attr(data-tip);position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);white-space:nowrap;background:var(--raised);border:1px solid var(--rule-strong);color:var(--paper);font-size:12px;padding:5px 8px;border-radius:7px;z-index:2;pointer-events:none}
.bars span:nth-child(-n+12):hover::after{left:0;transform:none}
.bars span:nth-last-child(-n+12):hover::after{left:auto;right:0;transform:none}
.span{display:flex;justify-content:space-between;margin-top:6px;font-size:12px;color:var(--faint)}
.span .m{display:none}
.more{padding:0 20px 18px;font-size:13.5px;color:var(--muted)}
.more p{margin:0 0 10px}
.spark{display:block;width:100%;height:56px;margin:4px 0 6px}
.facts{display:flex;flex-wrap:wrap;gap:4px 18px;font-size:13px;color:var(--faint)}
.facts b{color:var(--soft);font-weight:500}
.err{color:var(--major)}
.inc{padding:18px 20px;border-top:1px solid var(--rule);position:relative}
.inc:first-child{border-top:0}
.inc h3{margin:0;font-size:16px;font-weight:600;color:var(--paper);letter-spacing:-.01em}
.inc h3 a{text-decoration:none}
.inc h3 a:hover{text-decoration:underline}
.meta{display:flex;flex-wrap:wrap;gap:6px 12px;align-items:center;margin-top:6px;font-size:13px;color:var(--faint)}
.pill{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:500;padding:2px 8px;border-radius:999px;background:var(--raised);border:1px solid var(--rule)}
.inc .last{margin:10px 0 0;color:var(--soft)}
.stripe{border-left:3px solid var(--rule-strong)}
.stripe.s-major{border-left-color:var(--major)}.stripe.s-minor{border-left-color:var(--minor)}.stripe.s-maint{border-left-color:var(--maint)}
.empty{padding:22px 20px;color:var(--faint)}
.timeline{list-style:none;margin:14px 0 0;padding:0}
.timeline li{position:relative;padding:0 0 18px 22px;border-left:1px solid var(--rule)}
.timeline li:last-child{border-left-color:transparent;padding-bottom:0}
.timeline li::before{content:"";position:absolute;left:-5px;top:6px;width:9px;height:9px;border-radius:50%;background:var(--rule-strong)}
.timeline strong{color:var(--paper);font-weight:500}
.timeline p{margin:2px 0 0}
.timeline time{font-size:12.5px;color:var(--faint)}
.month{margin-top:28px}
.month h3{margin:0 0 10px;font-size:15px;color:var(--paper);font-weight:600}
footer{margin:56px 0 40px;padding-top:20px;border-top:1px solid var(--rule);display:flex;flex-wrap:wrap;gap:8px 20px;justify-content:space-between;font-size:13px;color:var(--faint)}
footer a{color:var(--muted)}
.back{display:inline-block;margin-bottom:18px;font-size:14px;color:var(--muted);text-decoration:none}
.back:hover{color:var(--paper)}
.title{margin:0;font-size:28px;line-height:1.15;font-weight:700;letter-spacing:-.03em;color:var(--paper)}
.theme{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border:0;border-radius:8px;background:transparent;color:var(--muted);cursor:pointer}
.theme:hover{background:var(--raised);color:var(--paper)}
.theme svg{width:16px;height:16px}
.tabs{display:flex;gap:4px;margin:22px 0 0}
.tabs a{color:var(--muted);text-decoration:none;font-size:14px;padding:6px 12px;border-radius:8px;border:1px solid var(--rule)}
.tabs a[aria-current=page]{color:var(--paper);background:var(--raised);border-color:var(--rule-strong)}
.opt{padding:22px 24px;border-top:1px solid var(--rule)}
.opt:first-child{border-top:0}
.opt h2{margin:0 0 4px;font-size:16px;font-weight:600;letter-spacing:-.01em;text-transform:none;color:var(--paper)}
.opt p{margin:0 0 12px;color:var(--muted);font-size:14px}
form .field{display:flex;gap:8px;flex-wrap:wrap}
input[type=email]{flex:1;min-width:220px;height:40px;padding:0 12px;border-radius:9px;border:1px solid var(--rule-strong);background:var(--ink);color:var(--paper);font:inherit;font-size:15px}
input[type=email]:focus-visible{outline:2px solid var(--coral);outline-offset:1px}
button.primary{height:40px;padding:0 16px;border-radius:9px;border:0;background:var(--paper);color:var(--ink);font:inherit;font-weight:600;font-size:14.5px;cursor:pointer}
button.primary:hover{opacity:.9}
fieldset{border:0;margin:14px 0 0;padding:0}
legend{font-size:13px;color:var(--faint);margin-bottom:8px}
.checks{display:flex;flex-wrap:wrap;gap:6px 16px}
.checks label{display:inline-flex;gap:7px;align-items:center;font-size:14px;color:var(--soft)}
code{font-family:"Geist Mono",ui-monospace,monospace;font-size:13px;background:var(--raised);border:1px solid var(--rule);padding:2px 6px;border-radius:6px;color:var(--paper)}
.msg{padding:28px 24px}
.msg h1{margin:0 0 8px;font-size:22px;color:var(--paper);letter-spacing:-.02em}
.msg p{margin:0;color:var(--muted)}
@media (max-width:640px){
  header.top{flex-direction:column;align-items:flex-start;padding-bottom:24px}
  .bars span:nth-child(-n+60){display:none}
  .span .d{display:none}.span .m{display:inline}
  .banner{padding:18px}
  .banner h1{font-size:19px}
}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/**
 * The only script: remembers the light/dark choice and shows times in the
 * visitor's own time zone. Allowed by its hash in the CSP (SCRIPT_HASH), so
 * no other inline script can run. The page works without it (UTC, system
 * theme).
 */
export const SCRIPT = `(function(){var d=document.documentElement,k='fp-status-theme';try{var t=localStorage.getItem(k);if(t==='light'||t==='dark')d.setAttribute('data-theme',t)}catch(e){}document.addEventListener('DOMContentLoaded',function(){var f=new Intl.DateTimeFormat(undefined,{dateStyle:'medium',timeStyle:'short'});var n=document.querySelectorAll('time[datetime]');for(var i=0;i<n.length;i++){var v=new Date(n[i].getAttribute('datetime'));if(!isNaN(v.getTime())){n[i].title=n[i].textContent;n[i].textContent=f.format(v)}}var z=document.getElementById('tz');if(z){try{z.textContent='Times in your time zone ('+Intl.DateTimeFormat().resolvedOptions().timeZone+').'}catch(e){}}var b=document.getElementById('theme');if(b){b.hidden=false;b.addEventListener('click',function(){var c=d.getAttribute('data-theme')||(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');var x=c==='light'?'dark':'light';d.setAttribute('data-theme',x);try{localStorage.setItem(k,x)}catch(e){}})}})})();`;

/** `sha256-…` of SCRIPT; a test keeps them in step. */
export const SCRIPT_HASH =
  'sha256-6GNDEFpFqLYvbfdmcoT4VPXOpQgw/PDa5F9x+lzO5Rk=';

const THEME_ICON =
  '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/><path d="M8 2a6 6 0 0 1 0 12z" fill="currentColor"/></svg>';

const CHEVRON =
  '<svg class="chev" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function layout(opts: {
  title: string;
  description: string;
  path: string;
  body: string;
  current: 'status' | 'history' | 'updates' | 'none';
}): string {
  const nav = (href: string, label: string, key: string) =>
    `<a href="${href}"${opts.current === key ? ' aria-current="page"' : ''}>${label}</a>`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escape(opts.title)}</title>
<meta name="description" content="${escape(opts.description)}">
<link rel="canonical" href="${SITE}${opts.path}">
<link rel="icon" href="/icon.svg" type="image/svg+xml">
<link rel="alternate" type="application/atom+xml" title="FlarePanel status updates" href="/feed.atom">
<link rel="preload" href="/fonts/Geist-Variable.woff2" as="font" type="font/woff2" crossorigin>
<meta name="theme-color" content="#0d0d10">
<meta property="og:title" content="${escape(opts.title)}">
<meta property="og:description" content="${escape(opts.description)}">
<style>${STYLE}</style>
<script>${SCRIPT}</script>
</head>
<body>
<div class="wrap">
<header class="top">
<a class="brand" href="/"><img src="/icon.svg" alt="" width="26" height="26">FlarePanel <span>Status</span></a>
<nav aria-label="Status pages">${nav('/', 'Status', 'status')}${nav('/history', 'History', 'history')}${nav('/subscribe', 'Get updates', 'updates')}<a href="https://flarepanel.dev">flarepanel.dev</a><button class="theme" id="theme" type="button" hidden aria-label="Switch between light and dark">${THEME_ICON}</button></nav>
</header>
<main>
${opts.body}
</main>
<footer>
<span>Checked every minute from Cloudflare, by a Worker separate from the services it watches. <span id="tz">Times in UTC.</span></span>
<span><a href="/api/status.json">JSON</a> · <a href="/feed.atom">Atom feed</a> · <a href="https://docs.flarepanel.dev/status">About this page</a></span>
</footer>
</div>
</body>
</html>`;
}

function sparkline(values: (number | null)[]): string {
  const known = values.filter((v): v is number => v !== null);
  if (known.length < 2) {
    return '<p class="facts">Response times appear after the first hour of checks.</p>';
  }
  const width = 240;
  const height = 40;
  const max = Math.max(...known) * 1.2 || 1;
  const step = width / (values.length - 1);
  const points: string[] = [];
  values.forEach((v, i) => {
    if (v !== null) {
      points.push(
        `${(i * step).toFixed(1)},${(height - (v / max) * height).toFixed(1)}`
      );
    }
  });
  const first = points[0]?.split(',')[0] ?? '0';
  const last = points.at(-1)?.split(',')[0] ?? `${width}`;
  return `<svg class="spark" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" role="img" aria-label="Average response time per hour, last 24 hours">
<polygon points="${first},${height} ${points.join(' ')} ${last},${height}" fill="rgba(76,176,229,.12)"/>
<polyline points="${points.join(' ')}" fill="none" stroke="#4cb0e5" stroke-width="1.5" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>
</svg>`;
}

function monitorRow(view: MonitorView, now: number): string {
  const tone = STATE_TONE[view.state];
  const bars = view.bars
    .map(
      (bar) =>
        `<span class="b-${bar.level}" data-tip="${escape(bar.label)}"></span>`
    )
    .join('');
  const facts = [
    view.avgLatency !== null
      ? `<span>Average response <b>${view.avgLatency} ms</b> (24 h)</span>`
      : '',
    view.lastCheckedAt
      ? `<span>Last checked <b>${Math.max(0, Math.round((now - view.lastCheckedAt) / 1000))} s ago</b></span>`
      : '',
    `<span>90-day uptime <b>${formatUptime(view.uptime)}</b></span>`,
  ].join('');
  return `<details class="svc">
<summary>
<div class="row"><span class="dot t-${tone}" aria-hidden="true"></span><span class="name">${escape(view.monitor.name)}</span><span class="state t-${tone}">${STATE_TEXT[view.state]}</span><span class="pct" title="Uptime over the last 90 days">${formatUptime(view.uptime)}</span>${CHEVRON}</div>
<div class="bars" role="img" aria-label="${escape(view.monitor.name)}: ${formatUptime(view.uptime)} uptime over 90 days">${bars}</div>
<div class="span"><span class="d">90 days ago</span><span class="m">30 days ago</span><span>Today</span></div>
</summary>
<div class="more">
<p>${escape(view.monitor.description)}</p>
${sparkline(view.latency)}
<div class="facts">${facts}</div>
${view.lastError ? `<p class="err">Last check: ${escape(view.lastError)}</p>` : ''}
</div>
</details>`;
}

function affected(incident: Incident): string {
  return incident.monitors
    .map((id) => monitorById.get(id)?.name ?? id)
    .map(escape)
    .join(', ');
}

function incidentCard(incident: Incident, now: number, full = false): string {
  const tone = IMPACT_TONE[incident.impact];
  const latest = incident.updates[0];
  const closedAt = incident.resolvedAt;
  const when =
    incident.status === 'scheduled'
      ? `Starts ${time(incident.startedAt)}${incident.scheduledUntil ? `, until ${time(incident.scheduledUntil)}` : ''}`
      : closedAt
        ? `${time(incident.startedAt)} · lasted ${duration(incident.startedAt, closedAt)}`
        : `Since ${time(incident.startedAt)} · ${duration(incident.startedAt, now)} so far`;
  const timeline = full
    ? `<ol class="timeline">${incident.updates
        .map(
          (u) =>
            `<li><strong>${STATUS_LABEL[u.status as IncidentStatus] ?? escape(u.status)}</strong> <time datetime="${new Date(u.at).toISOString()}">${formatTime(u.at)}</time><p>${escape(u.message)}</p></li>`
        )
        .join('')}</ol>`
    : latest
      ? `<p class="last">${escape(latest.message)}</p>`
      : '';
  return `<article class="inc stripe s-${tone}">
${full ? '' : `<h3><a href="/incidents/${encodeURIComponent(incident.id)}">${escape(incident.title)}</a></h3>`}
<div class="meta"><span class="pill"><span class="dot t-${tone}" aria-hidden="true"></span>${STATUS_LABEL[incident.status]}</span><span>${IMPACT_TEXT[incident.impact]}</span>${incident.monitors.length ? `<span>${affected(incident)}</span>` : ''}<span>${when}</span></div>
${timeline}
</article>`;
}

export function renderStatusPage(view: PageView): string {
  const tone = OVERALL_TONE[view.overall];
  const active = view.active.length
    ? `<section aria-labelledby="active"><h2 id="active">Current incidents</h2><div class="card">${view.active.map((i) => incidentCard(i, view.now)).join('')}</div></section>`
    : '';
  const scheduled = view.scheduled.length
    ? `<section aria-labelledby="planned"><h2 id="planned">Scheduled maintenance</h2><div class="card">${view.scheduled.map((i) => incidentCard(i, view.now)).join('')}</div></section>`
    : '';
  const recent = view.recent.length
    ? view.recent.map((i) => incidentCard(i, view.now)).join('')
    : '<p class="empty">No incidents in the last 7 days.</p>';
  const body = `
<div class="banner t-${tone}" role="status"><span class="dot t-${tone}" aria-hidden="true"></span><div><h1>${OVERALL_TEXT[view.overall]}</h1><p>Updated ${time(view.now)}</p></div></div>
${active}
${scheduled}
<section aria-labelledby="services"><h2 id="services">Services</h2><div class="card">${view.monitors.map((m) => monitorRow(m, view.now)).join('')}</div></section>
<section aria-labelledby="recent"><h2 id="recent">Last 7 days</h2><div class="card">${recent}</div><p style="margin:12px 2px 0;font-size:14px"><a href="/history">Incident history</a></p></section>`;
  return layout({
    title: `FlarePanel Status: ${OVERALL_TEXT[view.overall]}`,
    description:
      'Live status and uptime history of FlarePanel: API, event tracking, dashboard, MCP server, website and docs.',
    path: '/',
    body,
    current: 'status',
  });
}

export type HistoryTab = 'incidents' | 'maintenance';

export function renderHistoryPage(
  all: Incident[],
  now: number,
  tab: HistoryTab = 'incidents'
): string {
  const incidents = all.filter((i) =>
    tab === 'maintenance'
      ? i.impact === 'maintenance'
      : i.impact !== 'maintenance'
  );
  const byMonth = new Map<string, Incident[]>();
  for (const incident of incidents) {
    const d = new Date(incident.startedAt);
    const key = `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
    byMonth.set(key, [...(byMonth.get(key) ?? []), incident]);
  }
  const months = [...byMonth.entries()]
    .map(
      ([month, list]) =>
        `<div class="month"><h3>${month}</h3><div class="card">${list.map((i) => incidentCard(i, now)).join('')}</div></div>`
    )
    .join('');
  const tabLink = (key: HistoryTab, label: string, href: string) =>
    `<a href="${href}"${tab === key ? ' aria-current="page"' : ''}>${label}</a>`;
  const empty =
    tab === 'maintenance'
      ? 'No maintenance in the last 90 days.'
      : 'No incidents in the last 90 days.';
  const body = `<h1 class="title">History</h1>
<p style="color:var(--faint);margin:8px 0 0">The last 90 days.</p>
<nav class="tabs" aria-label="History">${tabLink('incidents', 'Incidents', '/history')}${tabLink('maintenance', 'Maintenance', '/history?type=maintenance')}</nav>
${months || `<div class="card" style="margin-top:28px"><p class="empty">${empty}</p></div>`}`;
  return layout({
    title: `${tab === 'maintenance' ? 'Maintenance' : 'Incident'} history · FlarePanel Status`,
    description:
      'Incidents and maintenance of FlarePanel over the last 90 days.',
    path: tab === 'maintenance' ? '/history?type=maintenance' : '/history',
    body,
    current: 'history',
  });
}

export function renderSubscribePage(emailEnabled: boolean): string {
  const checks = MONITORS.map(
    (m) =>
      `<label><input type="checkbox" name="monitors" value="${m.id}"> ${escape(m.name)}</label>`
  ).join('');
  const email = emailEnabled
    ? `<div class="opt"><h2>Email</h2><p>An email when an incident or maintenance starts, changes or ends. We send nothing else, and every email has an unsubscribe link.</p>
<form method="post" action="/subscribe">
<div class="field"><input type="email" name="email" required autocomplete="email" placeholder="you@example.com" aria-label="Email address"><button class="primary" type="submit">Subscribe</button></div>
<fieldset><legend>Only some services? Leave all unticked for everything.</legend><div class="checks">${checks}</div></fieldset>
</form></div>`
    : '';
  const body = `<h1 class="title">Get updates</h1>
<p style="color:var(--faint);margin:8px 0 24px">Hear about incidents and maintenance as they happen.</p>
<div class="card">
${email}
<div class="opt"><h2>RSS or Atom</h2><p>Add the feed to any feed reader.</p><a href="/feed.atom">${SITE}/feed.atom</a></div>
<div class="opt"><h2>Slack</h2><p>With Slack's RSS app, type in any channel:</p><code>/feed subscribe ${SITE}/feed.atom</code></div>
<div class="opt"><h2>JSON</h2><p>The current state of every service, for your own tools and badges.</p><a href="/api/status.json">${SITE}/api/status.json</a></div>
</div>`;
  return layout({
    title: 'Get updates · FlarePanel Status',
    description:
      'Get FlarePanel incident and maintenance updates by email, RSS, Slack or JSON.',
    path: '/subscribe',
    body,
    current: 'updates',
  });
}

/**
 * A page whose action needs a button press. Mail security scanners open every
 * link in an email; a link that acted on GET would let them confirm sign-ups
 * someone else made, or unsubscribe people.
 */
export function renderActionPage(
  title: string,
  text: string,
  button: string,
  action: string
): string {
  return layout({
    title: `${title} · FlarePanel Status`,
    description: text,
    path: '/subscribe',
    body: `<div class="card msg"><h1>${escape(title)}</h1><p>${escape(text)}</p><form method="post" action="${escape(action)}" style="margin-top:18px"><button class="primary" type="submit">${escape(button)}</button></form></div>`,
    current: 'updates',
  });
}

export function renderMessage(title: string, text: string): string {
  return layout({
    title: `${title} · FlarePanel Status`,
    description: text,
    path: '/subscribe',
    body: `<div class="card msg"><h1>${escape(title)}</h1><p>${escape(text)}</p><p style="margin-top:14px"><a href="/">Back to the status page</a></p></div>`,
    current: 'updates',
  });
}

export function renderIncidentPage(incident: Incident, now: number): string {
  const body = `<a class="back" href="/history">← Incident history</a>
<h1 class="title">${escape(incident.title)}</h1>
<div class="card" style="margin-top:20px">${incidentCard(incident, now, true)}</div>`;
  return layout({
    title: `${incident.title} · FlarePanel Status`,
    description: incident.updates[0]?.message ?? incident.title,
    path: `/incidents/${encodeURIComponent(incident.id)}`,
    body,
    current: 'none',
  });
}

export function renderNotFound(): string {
  return layout({
    title: 'Not found · FlarePanel Status',
    description: 'This page does not exist.',
    path: '/',
    body: '<h1 class="title">Not found</h1><p style="color:var(--faint)">This incident or page does not exist. <a href="/">Back to the status page</a>.</p>',
    current: 'none',
  });
}

export function renderFeed(incidents: Incident[]): string {
  const updated =
    incidents[0]?.updates[0]?.at ?? incidents[0]?.startedAt ?? Date.now();
  const entries = incidents
    .map((incident) => {
      const last = incident.updates[0];
      const at = last?.at ?? incident.startedAt;
      const url = `${SITE}/incidents/${encodeURIComponent(incident.id)}`;
      const content = incident.updates
        .map(
          (u) =>
            `${STATUS_LABEL[u.status as IncidentStatus] ?? u.status} (${formatTime(u.at)}): ${u.message}`
        )
        .join('\n\n');
      return `<entry><id>${url}</id><title>${escape(`${incident.title} [${STATUS_LABEL[incident.status]}]`)}</title><link href="${url}"/><updated>${new Date(at).toISOString()}</updated><published>${new Date(incident.startedAt).toISOString()}</published><content type="text">${escape(content)}</content></entry>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
<id>${SITE}/</id>
<title>FlarePanel status</title>
<subtitle>Incidents and maintenance of FlarePanel</subtitle>
<link href="${SITE}/" />
<link rel="self" href="${SITE}/feed.atom" />
<updated>${new Date(updated).toISOString()}</updated>
${entries}
</feed>`;
}

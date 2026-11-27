// AI crawler and bot capture: report the page requests your server or edge
// saw to FlarePanel (`POST /track/crawl`). Crawlers fetch HTML and never run
// the tracking script, so only the server can tell FlarePanel what they read.
// Only requests whose user agent looks like a bot are sent, so human traffic
// costs nothing extra, and a report never delays or fails your response.

const DEFAULT_API_URL = 'https://api.flarepanel.dev';
const USER_AGENT_MAX_LENGTH = 1024;

// Cheap pre-filter; FlarePanel decides what is really a bot.
const BOT_HINT =
  /bot|crawl|spider|slurp|scrape|archiver|preview|fetch|GPT|Claude|anthropic|Perplexity|Google-|cohere|MistralAI|meta-external|facebookexternalhit|Bytespider|Amazonbot|Applebot|DuckAssist|YouBot|CCBot|Kimi|Grok|xAI/i;
// Assets are noise; pages, robots.txt, sitemaps, llms.txt and .md are not.
const ASSET =
  /\.(?:css|js|mjs|map|png|jpe?g|gif|webp|avif|svg|ico|woff2?|ttf|mp4|webm)$/i;

export interface CrawlReporterOptions {
  clientId: string;
  /** A client secret: the endpoint refuses reports without one. */
  clientSecret: string;
  /** Defaults to `https://api.flarepanel.dev`. */
  apiUrl?: string;
  /** Defaults to the global `fetch`. */
  fetch?: typeof fetch;
}

/** One page request, as `POST /track/crawl` takes it. */
export interface CrawlHit {
  /** The requested path (`/pricing`), or the full URL. */
  path: string;
  /** The site's host, when one project tracks several. */
  host?: string;
  userAgent: string;
  referrer?: string;
  /** The HTTP status your site answered with. */
  status?: number;
  /** Whether your edge verified the bot; leave out when unknown. */
  verified?: boolean;
  /** Your edge's category for a verified bot (Cloudflare's `verifiedBotCategory`). */
  verifiedCategory?: string;
}

export interface CrawlResult {
  /** The bot FlarePanel recognised, or null for anything else. */
  bot: { name: string; type: string } | null;
  /** The project used its monthly bot allowance: the hit was not kept. */
  capped: boolean;
}

/** Something that keeps a promise alive after the response (Workers, Next.js). */
export interface WaitUntil {
  waitUntil(promise: Promise<unknown>): void;
}

/** The environment variables the wrappers read. */
export interface CrawlCaptureEnv {
  FLAREPANEL_CLIENT_ID?: string;
  FLAREPANEL_CLIENT_SECRET?: string;
  FLAREPANEL_API_URL?: string;
}

/** True when a user agent might be a bot or AI crawler (a cheap pre-filter). */
export function looksLikeBot(userAgent: string | null | undefined): boolean {
  return Boolean(userAgent && BOT_HINT.test(userAgent));
}

/** Sends one hit. Never throws: null when the report could not be sent. */
export async function trackCrawl(
  options: CrawlReporterOptions,
  hit: CrawlHit
): Promise<CrawlResult | null> {
  const api = (options.apiUrl || DEFAULT_API_URL).replace(/\/+$/, '');
  const send = options.fetch ?? fetch;
  try {
    const response = await send(`${api}/track/crawl`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'openpanel-client-id': options.clientId,
        'openpanel-client-secret': options.clientSecret,
      },
      body: JSON.stringify({
        ...hit,
        userAgent: hit.userAgent.slice(0, USER_AGENT_MAX_LENGTH),
      }),
    });
    if (!response.ok) {
      return null;
    }
    const body = (await response.json()) as Partial<CrawlResult>;
    return { bot: body.bot ?? null, capped: body.capped ?? false };
  } catch {
    return null;
  }
}

interface CloudflareCf {
  verifiedBotCategory?: string;
  botManagement?: { verifiedBot?: boolean };
}

/**
 * What Cloudflare says about the bot. Cloudflare lists `verifiedBotCategory`
 * and `botManagement.verifiedBot` with its Bot Management variables
 * (developers.cloudflare.com/bots/reference/bot-management-variables/); they
 * are not set on every plan, so each is sent only when present.
 */
function edgeVerification(
  request: Request
): Pick<CrawlHit, 'verified' | 'verifiedCategory'> {
  const cf = (request as Request & { cf?: CloudflareCf }).cf;
  const verifiedCategory = cf?.verifiedBotCategory || undefined;
  if (verifiedCategory) {
    return { verified: true, verifiedCategory };
  }
  const verified = cf?.botManagement?.verifiedBot;
  return typeof verified === 'boolean' ? { verified } : {};
}

/**
 * The hit to report for a request, or null when it is not worth one: not a
 * GET or HEAD, no bot-like user agent, or an asset (CSS, images, fonts).
 */
export function crawlHitFromRequest(
  request: Request,
  response?: { status: number }
): CrawlHit | null {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return null;
  }
  const userAgent = request.headers.get('user-agent') ?? '';
  const url = new URL(request.url);
  if (!looksLikeBot(userAgent) || ASSET.test(url.pathname)) {
    return null;
  }
  return {
    path: url.pathname,
    host: url.host,
    userAgent,
    referrer: request.headers.get('referer') ?? undefined,
    status: response?.status,
    ...edgeVerification(request),
  };
}

function optionsFromEnv(
  env: CrawlCaptureEnv | undefined
): CrawlReporterOptions | null {
  const source: CrawlCaptureEnv =
    env ??
    (typeof process === 'undefined'
      ? {}
      : (process.env as unknown as CrawlCaptureEnv));
  if (!(source.FLAREPANEL_CLIENT_ID && source.FLAREPANEL_CLIENT_SECRET)) {
    return null;
  }
  return {
    clientId: source.FLAREPANEL_CLIENT_ID,
    clientSecret: source.FLAREPANEL_CLIENT_SECRET,
    apiUrl: source.FLAREPANEL_API_URL,
  };
}

/**
 * Reports a request in the background when it looks like a bot. Pass the
 * response when you have it, so FlarePanel sees the status the bot got.
 * Options default to `FLAREPANEL_CLIENT_ID`, `FLAREPANEL_CLIENT_SECRET` and
 * `FLAREPANEL_API_URL` from `process.env`; without them nothing is sent.
 *
 * Next.js middleware: `captureCrawl(request, event)` with the middleware's
 * `NextFetchEvent` (the response is not known there, so no status is sent).
 */
export function captureCrawl(
  request: Request,
  context: WaitUntil,
  options?: CrawlReporterOptions & { response?: { status: number } }
): void {
  const reporter = options ?? optionsFromEnv(undefined);
  if (!reporter) {
    return;
  }
  const hit = crawlHitFromRequest(request, options?.response);
  if (hit) {
    context.waitUntil(trackCrawl(reporter, hit));
  }
}

export interface CrawlWorkerHandler<Env> {
  fetch?(
    request: Request,
    env: Env,
    ctx: WaitUntil
  ): Response | Promise<Response>;
}

/**
 * Wraps a Cloudflare Worker's handler: every response is returned as is, and
 * bot requests are reported with their status after it is sent. Reads
 * `FLAREPANEL_CLIENT_ID`, `FLAREPANEL_CLIENT_SECRET` and (optionally)
 * `FLAREPANEL_API_URL` from the Worker's env.
 *
 *     export default withCrawlCapture({ fetch(request, env) { ... } });
 */
export function withCrawlCapture<
  Env extends object,
  H extends CrawlWorkerHandler<Env>,
>(handler: H & CrawlWorkerHandler<Env>): H {
  const handle = handler.fetch;
  if (!handle) {
    return handler;
  }
  return {
    ...handler,
    async fetch(request: Request, env: Env, ctx: WaitUntil) {
      const response = await handle.call(handler, request, env, ctx);
      const reporter = optionsFromEnv(env as CrawlCaptureEnv);
      if (reporter) {
        captureCrawl(request, ctx, { ...reporter, response });
      }
      return response;
    },
  };
}

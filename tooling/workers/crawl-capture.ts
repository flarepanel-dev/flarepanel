/**
 * Reports AI crawler and bot requests to FlarePanel (POST /track/crawl).
 * Crawlers fetch HTML and never run the tracking script, so the site's own
 * Worker has to tell FlarePanel what they read. Used by the flarepanel.dev,
 * docs and status Workers; the same code is in the docs for customers
 * (docs.flarepanel.dev/tracking/ai-crawlers).
 *
 * Only requests whose user agent looks like a bot are reported, so human
 * traffic costs nothing extra, and the report never delays the response.
 */

export interface CrawlCaptureEnv {
  FLAREPANEL_CLIENT_ID?: string;
  FLAREPANEL_CLIENT_SECRET?: string;
  FLAREPANEL_API_URL?: string;
}

// Cheap pre-filter; FlarePanel decides what is really a bot.
const BOT_HINT =
  /bot|crawl|spider|slurp|scrape|archiver|preview|fetch|GPT|Claude|anthropic|Perplexity|Google-|cohere|MistralAI|meta-external|facebookexternalhit|Bytespider|Amazonbot|Applebot|DuckAssist|YouBot|CCBot/i;
// Assets are noise; pages, robots.txt, sitemaps, llms.txt and .md are not.
const ASSET =
  /\.(?:css|js|mjs|map|png|jpe?g|gif|webp|avif|svg|ico|woff2?|ttf|mp4|webm)$/i;

/**
 * What Cloudflare says about the bot. Cloudflare lists `verifiedBotCategory`
 * and `botManagement.verifiedBot` with its Bot Management variables
 * (developers.cloudflare.com/bots/reference/bot-management-variables/); they
 * are not set on every plan, so each is sent only when present.
 */
function edgeVerification(request: Request): {
  verified?: boolean;
  verifiedCategory?: string;
} {
  const cf = (
    request as Request & {
      cf?: {
        verifiedBotCategory?: string;
        botManagement?: { verifiedBot?: boolean };
      };
    }
  ).cf;
  const verifiedCategory = cf?.verifiedBotCategory || undefined;
  if (verifiedCategory) {
    return { verified: true, verifiedCategory };
  }
  const verified = cf?.botManagement?.verifiedBot;
  return typeof verified === 'boolean' ? { verified } : {};
}

export function reportCrawl(
  request: Request,
  response: Response,
  env: CrawlCaptureEnv,
  ctx: { waitUntil(promise: Promise<unknown>): void }
): void {
  if (!(env.FLAREPANEL_CLIENT_ID && env.FLAREPANEL_CLIENT_SECRET)) {
    return;
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return;
  }
  const userAgent = request.headers.get('user-agent') ?? '';
  const url = new URL(request.url);
  if (!(userAgent && BOT_HINT.test(userAgent)) || ASSET.test(url.pathname)) {
    return;
  }
  const api = (env.FLAREPANEL_API_URL ?? 'https://api.flarepanel.dev').replace(
    /\/+$/,
    ''
  );
  ctx.waitUntil(
    fetch(`${api}/track/crawl`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'openpanel-client-id': env.FLAREPANEL_CLIENT_ID,
        'openpanel-client-secret': env.FLAREPANEL_CLIENT_SECRET,
      },
      body: JSON.stringify({
        path: url.pathname,
        host: url.host,
        userAgent: userAgent.slice(0, 1024),
        referrer: request.headers.get('referer') ?? undefined,
        status: response.status,
        ...edgeVerification(request),
      }),
    }).catch(() => undefined)
  );
}

// Serves the static site and reports AI crawler visits to FlarePanel.
// Typed without @cloudflare/workers-types so the site's own build can check it.
import {
  type CrawlCaptureEnv,
  reportCrawl,
} from '../../../tooling/workers/crawl-capture';

interface Env extends CrawlCaptureEnv {
  ASSETS: { fetch(request: Request): Promise<Response> };
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: { waitUntil(promise: Promise<unknown>): void }
  ): Promise<Response> {
    const response = await env.ASSETS.fetch(request);
    reportCrawl(request, response, env, ctx);
    return response;
  },
};

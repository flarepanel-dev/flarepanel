import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

// Runs the store contract inside workerd (Cloudflare's runtime) with a real
// Durable Object and Cache API, via Miniflare. Free and fully local.
export default defineWorkersConfig({
  test: {
    include: ['test/cloudflare/**/*.test.ts'],
    poolOptions: {
      workers: {
        singleWorker: true,
        isolatedStorage: false,
        wrangler: { configPath: './test/cloudflare/wrangler.jsonc' },
      },
    },
  },
});

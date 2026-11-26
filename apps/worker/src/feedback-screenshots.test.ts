import { describe, expect, it } from 'bun:test';
import {
  createFeedbackScreenshotStore,
  serveFeedbackScreenshot,
} from './feedback-screenshots';

function fakeBucket() {
  const objects = new Map<string, { bytes: Uint8Array; type: string }>();
  return {
    objects,
    put: async (
      key: string,
      bytes: Uint8Array,
      opts: { httpMetadata: { contentType: string } }
    ) => {
      objects.set(key, { bytes, type: opts.httpMetadata.contentType });
      return null;
    },
    get: async (key: string) => {
      const o = objects.get(key);
      return o ? { body: new Blob([new Uint8Array(o.bytes)]).stream() } : null;
    },
  };
}

describe('feedback screenshots', () => {
  it('stores under feedback/ with a 256-bit random name and returns its API URL', async () => {
    const bucket = fakeBucket();
    const store = createFeedbackScreenshotStore(
      bucket as never,
      'https://api.example.com/'
    );
    const url = await store.put(new Uint8Array([1, 2, 3]), 'image/webp');
    expect(url).toMatch(
      /^https:\/\/api\.example\.com\/feedback\/screenshots\/[0-9a-f]{64}\.webp$/
    );
    const [key] = [...bucket.objects.keys()];
    expect(key).toMatch(/^feedback\/[0-9a-f]{64}\.webp$/);
  });

  it('serves a stored image with safe headers, and 404s anything else', async () => {
    const bucket = fakeBucket();
    const store = createFeedbackScreenshotStore(
      bucket as never,
      'https://api.example.com'
    );
    const url = new URL(await store.put(new Uint8Array([9]), 'image/png'));
    const ok = await serveFeedbackScreenshot(
      new Request(url),
      url.pathname,
      bucket as never
    );
    expect(ok?.status).toBe(200);
    expect(ok?.headers.get('content-type')).toBe('image/png');
    expect(ok?.headers.get('x-content-type-options')).toBe('nosniff');
    const missing = await serveFeedbackScreenshot(
      new Request('https://api.example.com/x'),
      `/feedback/screenshots/${'0'.repeat(64)}.png`,
      bucket as never
    );
    expect(missing?.status).toBe(404);
    expect(
      await serveFeedbackScreenshot(
        new Request(url),
        '/feedback/screenshots/../../secret',
        bucket as never
      )
    ).toBeNull();
    expect(
      await serveFeedbackScreenshot(
        new Request(url),
        '/trpc/x',
        bucket as never
      )
    ).toBeNull();
  });
});

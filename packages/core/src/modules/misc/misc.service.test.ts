import { afterEach, describe, expect, mock, spyOn, test } from 'bun:test';
import { testCoreConfig } from '../../../test/config-fixture';
import { getFavicon } from './misc.service';
import * as providers from './src/favicon-providers';

const ICON = { buffer: Buffer.from('icon'), contentType: 'image/png' };

// A hostname no earlier run left in the cache.
const uncachedUrl = () => `https://${crypto.randomUUID()}.example.com`;

afterEach(() => {
  mock.restore();
});

describe('getFavicon', () => {
  test('returns the provider icon while fetching is enabled', async () => {
    const fetchProviderIcon = spyOn(
      providers,
      'fetchProviderIcon'
    ).mockResolvedValue(ICON);

    const result = await getFavicon(testCoreConfig(), uncachedUrl());

    expect(result.status).toBe(200);
    expect(fetchProviderIcon).toHaveBeenCalled();
  });

  test('answers 404 without asking any icon service when disabled', async () => {
    const fetchProviderIcon = spyOn(providers, 'fetchProviderIcon');

    const result = await getFavicon(
      testCoreConfig({ faviconFetchDisabled: true }),
      uncachedUrl()
    );

    expect(result.status).toBe(404);
    expect(fetchProviderIcon).not.toHaveBeenCalled();
  });

  test("answers FlarePanel's own sites with the current brand icon", async () => {
    const fetchProviderIcon = spyOn(providers, 'fetchProviderIcon');

    for (const url of [
      'https://flarepanel.dev',
      'https://docs.flarepanel.dev/x',
    ]) {
      const result = await getFavicon(testCoreConfig(), url);
      expect(result.status).toBe(200);
      if (result.status === 200) {
        // PNG signature
        expect([...result.buffer.subarray(0, 4)]).toEqual([
          0x89, 0x50, 0x4e, 0x47,
        ]);
      }
    }
    expect(fetchProviderIcon).not.toHaveBeenCalled();
  });

  test('a look-alike domain is not treated as ours', async () => {
    const fetchProviderIcon = spyOn(
      providers,
      'fetchProviderIcon'
    ).mockResolvedValue(ICON);

    await getFavicon(
      testCoreConfig(),
      `https://${crypto.randomUUID()}-flarepanel.dev`
    );

    expect(fetchProviderIcon).toHaveBeenCalled();
  });
});

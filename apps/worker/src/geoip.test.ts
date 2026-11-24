import { describe, expect, it } from 'bun:test';
import { geoipDbip } from '@flarepanel/core';
import { MemoryCacheStore } from '@flarepanel/platform';
import { createGeoipLookup } from './geoip';

/** A D1 stand-in: geo_meta says generation 1; ranges answer from a table. */
function fakeD1(
  ranges: { start: string; end: string; country: string; city: string }[]
) {
  let lookups = 0;
  const db = {
    prepare(sql: string) {
      return {
        bind: (...args: unknown[]) => ({
          first: () => {
            if (sql.startsWith('SELECT v FROM geo_meta')) {
              return Promise.resolve(args[0] === 'active' ? { v: '1' } : null);
            }
            lookups++;
            const key = new Uint8Array(args[0] as ArrayBuffer);
            const hit = ranges
              .map((r) => ({
                ...r,
                s: geoipDbip.ipToKey(r.start) as Uint8Array,
                e: geoipDbip.ipToKey(r.end) as Uint8Array,
              }))
              .filter((r) => geoipDbip.compareKeys(r.s, key) <= 0)
              .sort((a, b) => geoipDbip.compareKeys(b.s, a.s))[0];
            return Promise.resolve(
              hit
                ? {
                    e: hit.e.buffer,
                    country: hit.country,
                    region: '',
                    city: hit.city,
                    lat: 1,
                    lon: 2,
                  }
                : null
            );
          },
        }),
        run: () => Promise.resolve(),
      };
    },
  };
  return { db: db as unknown as D1Database, lookups: () => lookups };
}

describe('GeoIP lookup', () => {
  const table = [
    { start: '1.0.0.0', end: '1.0.0.255', country: 'AU', city: 'Brisbane' },
    { start: '2.0.0.0', end: '2.0.0.255', country: 'ZZ', city: '' },
  ];

  it('finds the range holding an address and caches the answer', async () => {
    const { db, lookups } = fakeD1(table);
    const lookup = createGeoipLookup(db, new MemoryCacheStore());
    expect(await lookup('1.0.0.7')).toEqual({
      country: 'AU',
      region: undefined,
      city: 'Brisbane',
      latitude: 1,
      longitude: 2,
    });
    await lookup('1.0.0.7');
    expect(lookups()).toBe(1);
  });

  it('answers null between ranges, for unknown (ZZ) ranges and bad input', async () => {
    const { db } = fakeD1(table);
    const lookup = createGeoipLookup(db, new MemoryCacheStore());
    expect(await lookup('1.0.1.0')).toBeNull();
    expect(await lookup('2.0.0.1')).toBeNull();
    expect(await lookup('not-an-ip')).toBeNull();
  });
});

import { describe, expect, it } from 'bun:test';
import { getGeoFromCf } from './geo-cf';

const CF = {
  country: 'SE',
  city: 'Stockholm',
  region: 'Stockholm County',
  latitude: '59.32930',
  longitude: '18.06860',
  asn: 16_509,
  asOrganization: 'Amazon.com',
};

describe('getGeoFromCf', () => {
  it('reads location and network from request.cf', () => {
    expect(getGeoFromCf(CF, { ipOverridden: false })).toEqual({
      geo: {
        country: 'SE',
        city: 'Stockholm',
        region: 'Stockholm County',
        latitude: 59.3293,
        longitude: 18.0686,
      },
      asnInfo: { asn: 16_509, org: 'Amazon.com', isHosting: true },
    });
  });

  it('describes nobody when __ip replaced the caller', () => {
    const { geo, asnInfo } = getGeoFromCf(CF, { ipOverridden: true });
    expect(Object.values(geo).every((value) => value === undefined)).toBe(true);
    expect(asnInfo).toEqual({
      asn: undefined,
      org: undefined,
      isHosting: false,
    });
  });

  it('tolerates a missing or partial cf object', () => {
    expect(getGeoFromCf(undefined, { ipOverridden: false }).geo.country).toBe(
      undefined
    );
    const partial = getGeoFromCf(
      { country: 'DE', latitude: 'not-a-number', asn: 3320 },
      { ipOverridden: false }
    );
    expect(partial.geo).toMatchObject({ country: 'DE', latitude: undefined });
    expect(partial.asnInfo.isHosting).toBe(false);
  });
});

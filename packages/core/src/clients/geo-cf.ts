// Geo and ASN on Workers come from the edge, not a MaxMind file: Cloudflare
// resolves the connecting IP and hands the result in as `request.cf`.

import datacenterAsns from './datacenter-asns';
import type { AsnInfo, GeoLocation } from './geo';

/** The `IncomingRequestCfProperties` fields geo reads, all optional. */
export interface CfGeoProperties {
  country?: string | null;
  city?: string | null;
  region?: string | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
  asn?: number | null;
  asOrganization?: string | null;
}

export interface CfGeoResult {
  geo: GeoLocation;
  asnInfo: AsnInfo;
}

const EMPTY_GEO: GeoLocation = {
  country: undefined,
  city: undefined,
  region: undefined,
  longitude: undefined,
  latitude: undefined,
};

const EMPTY_ASN: AsnInfo = { asn: undefined, org: undefined, isHosting: false };

const datacenterAsnSet = new Set<number>(datacenterAsns);

function text(value: string | null | undefined): string | undefined {
  return value ? value : undefined;
}

function coordinate(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function isCfGeoProperties(cf: unknown): cf is CfGeoProperties {
  return typeof cf === 'object' && cf !== null;
}

/**
 * `ipOverridden` is set when the payload's `__ip` replaced the caller's
 * address: `request.cf` describes the caller, so it says nothing about that
 * IP and the event gets no geo at all.
 */
export function getGeoFromCf(
  cf: unknown,
  { ipOverridden }: { ipOverridden: boolean }
): CfGeoResult {
  if (ipOverridden || !isCfGeoProperties(cf)) {
    return { geo: EMPTY_GEO, asnInfo: EMPTY_ASN };
  }

  const asn = typeof cf.asn === 'number' ? cf.asn : undefined;
  return {
    geo: {
      country: text(cf.country),
      city: text(cf.city),
      region: text(cf.region),
      longitude: coordinate(cf.longitude),
      latitude: coordinate(cf.latitude),
    },
    asnInfo: {
      asn,
      org: text(cf.asOrganization),
      isHosting: asn !== undefined && datacenterAsnSet.has(asn),
    },
  };
}

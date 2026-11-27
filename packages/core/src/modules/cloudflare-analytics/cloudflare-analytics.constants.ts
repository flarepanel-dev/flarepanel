// Connect Cloudflare: a project imports AI crawler and search bot hits from
// its Cloudflare zone's HTTP request analytics, without any code on the site.
import { z } from 'zod';

/** Days the first sync reads back. */
export const CLOUDFLARE_SYNC_FIRST_DAYS = 7;
/** The furthest back any sync reads (Cloudflare keeps about 30 days). */
export const CLOUDFLARE_SYNC_MAX_DAYS = 30;
/** Hostnames one connection may filter on. */
export const CLOUDFLARE_HOSTNAMES_MAX = 20;

export const CLOUDFLARE_SYNC_STATUSES = [
  'success',
  'error',
  'auth_error',
  'rate_limited',
] as const;
export type CloudflareSyncStatus = (typeof CLOUDFLARE_SYNC_STATUSES)[number];

const ZONE_ID = /^[a-f0-9]{32}$/;
const TOKEN = /^[A-Za-z0-9._-]{20,512}$/;
const HOSTNAME = /^(?=.{1,253}$)[a-z0-9-]+(?:\.[a-z0-9-]+)+$/;
const SCHEME = /^[a-z][a-z0-9+.-]*:\/\//;
const PATH_OR_PORT = /[/:?#].*$/;

/**
 * The bare hostname of `value` (`https://www.example.com/x` →
 * `www.example.com`), or null when it is not one.
 */
export function normalizeHostname(value: string): string | null {
  const host = value
    .trim()
    .toLowerCase()
    .replace(SCHEME, '')
    .replace(PATH_OR_PORT, '')
    .replace(/\.$/, '');
  return HOSTNAME.test(host) ? host : null;
}

/** Unique, valid hostnames from a free-text list (comma, space or newline separated). */
export function parseHostnames(text: string | readonly string[]): string[] {
  const parts = typeof text === 'string' ? text.split(/[\s,]+/) : text;
  const hosts: string[] = [];
  for (const part of parts) {
    const host = normalizeHostname(part);
    if (host && !hosts.includes(host)) {
      hosts.push(host);
    }
  }
  return hosts;
}

export const zCloudflareZoneId = z
  .string()
  .trim()
  .toLowerCase()
  .regex(ZONE_ID, 'A zone ID is 32 characters of 0-9 and a-f.');

export const zCloudflareToken = z
  .string()
  .trim()
  .regex(TOKEN, 'That does not look like a Cloudflare API token.');

export const zCloudflareHostnames = z
  .array(z.string().trim().max(300))
  .max(CLOUDFLARE_HOSTNAMES_MAX)
  .transform((hosts) => parseHostnames(hosts));

export const zCloudflareListZonesInput = z.object({
  projectId: z.string(),
  /** Absent: the connection's stored token. */
  token: zCloudflareToken.optional(),
});

export const zCloudflareConnectInput = z.object({
  projectId: z.string(),
  /** Absent: keep the connection's stored token (changing zone or hostnames). */
  token: zCloudflareToken.optional(),
  zoneId: zCloudflareZoneId,
  /** Empty: every hostname in the zone. */
  hostnames: zCloudflareHostnames,
});
export type CloudflareConnectInput = z.infer<typeof zCloudflareConnectInput>;

export interface ICloudflareZone {
  id: string;
  name: string;
  status: string | null;
}

/** What the dashboard sees of a connection: never the token itself. */
export interface ICloudflareConnection {
  zoneId: string;
  zoneName: string;
  /** Last 4 characters of the token. */
  tokenHint: string;
  hostnames: string[];
  /** Requests before this instant are imported. */
  syncedThrough: Date | null;
  lastSyncedAt: Date | null;
  lastSyncStatus: CloudflareSyncStatus | null;
  lastSyncError: string | null;
  lastSyncHits: number | null;
  createdAt: Date;
}

export interface ICloudflareSetup {
  /** False where bot traffic is not kept (the Bun deployment). */
  available: boolean;
  /** The project's own hostnames, suggested as the filter. */
  defaultHostnames: string[];
  connection: ICloudflareConnection | null;
}

export interface ICloudflareZoneList {
  zones: ICloudflareZone[];
  /** Why the token could not list zones; the zone ID can still be entered. */
  listError: string | null;
}

/**
 * The two Cloudflare APIs a connection uses, with the token the customer
 * pasted (read-only: Zone → Analytics → Read, plus Zone → Zone → Read to list
 * zones):
 *
 * - `GET /zones` lists the zones the token can see, for the zone picker.
 * - `POST /graphql` reads `httpRequestsAdaptiveGroups`, the sampled HTTP
 *   request analytics every plan has (about 30 days back).
 *
 * The GraphQL API allows 300 queries per 5 minutes per user. A 429 (or a
 * `budget` error) is retried a few times with backoff, then surfaces as a
 * rate-limit error so the job retries later.
 */
import type { ICloudflareZone } from '../cloudflare-analytics.constants';

export const CLOUDFLARE_API = 'https://api.cloudflare.com/client/v4';
export const CLOUDFLARE_GRAPHQL = `${CLOUDFLARE_API}/graphql`;
const ZONES_PER_PAGE = 50;
const ZONE_PAGES_MAX = 4;
const RATE_LIMIT_ATTEMPTS = 3;
const RATE_LIMIT_BASE_DELAY_MS = 2000;
const RETRY_AFTER_MAX_MS = 30_000;
const ERROR_TEXT_MAX = 300;

export type Fetcher = (input: string, init?: RequestInit) => Promise<Response>;
export type Sleep = (ms: number) => Promise<void>;

export const defaultSleep: Sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export type CloudflareErrorKind =
  /** The token is invalid or cannot read this zone. */
  | 'auth'
  /** The GraphQL budget (300 queries / 5 minutes) is used up. */
  | 'rate_limit'
  /** The query named a field this zone's schema does not have. */
  | 'unknown_field'
  /** Cloudflare failed (5xx) or could not be reached. */
  | 'unavailable'
  /** Anything else Cloudflare refused. */
  | 'request';

export class CloudflareApiError extends Error {
  readonly kind: CloudflareErrorKind;
  readonly status: number | null;
  /** For `unknown_field`: the field Cloudflare named. */
  readonly field: string | null;

  constructor(
    kind: CloudflareErrorKind,
    message: string,
    options: { status?: number | null; field?: string | null } = {}
  ) {
    super(message);
    this.name = 'CloudflareApiError';
    this.kind = kind;
    this.status = options.status ?? null;
    this.field = options.field ?? null;
  }
}

export interface ApiOptions {
  fetcher?: Fetcher;
  sleep?: Sleep;
}

interface RestEnvelope<T> {
  success?: boolean;
  errors?: { code?: number; message?: string }[];
  result?: T;
  result_info?: { page?: number; total_pages?: number };
}

interface GraphqlError {
  message?: string;
  extensions?: { code?: string };
}

function clip(text: string): string {
  return text.length > ERROR_TEXT_MAX
    ? `${text.slice(0, ERROR_TEXT_MAX)}…`
    : text;
}

function headers(token: string): Record<string, string> {
  return {
    authorization: `Bearer ${token}`,
    'content-type': 'application/json',
    accept: 'application/json',
  };
}

async function readJson<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function restErrorText(body: RestEnvelope<unknown> | null): string {
  const messages = (body?.errors ?? [])
    .map((error) => error.message)
    .filter(Boolean);
  return messages.length > 0 ? clip(messages.join('; ')) : '';
}

/** Milliseconds a 429 asks us to wait, within reason. */
function retryAfterMs(response: Response, attempt: number): number {
  const header = Number(response.headers.get('retry-after'));
  if (Number.isFinite(header) && header > 0) {
    return Math.min(header * 1000, RETRY_AFTER_MAX_MS);
  }
  return RATE_LIMIT_BASE_DELAY_MS * 2 ** (attempt - 1);
}

const AUTH_MESSAGE =
  /unauthori[sz]ed|not authori[sz]ed|authentication|invalid (?:api )?token|access token|does not have access|permission/i;
const RATE_MESSAGE = /rate limit|budget|too many|try again after/i;
const UNKNOWN_FIELD_MESSAGE =
  /unknown (?:field|argument)|cannot query field|not (?:a )?(?:valid|known|available|defined)|does not exist|undefined field|no such field|not found in type/i;

/**
 * The field a GraphQL error says is unknown, if it names one of
 * `candidates` (the optional fields of the query).
 */
export function unknownFieldIn(
  errors: readonly GraphqlError[],
  candidates: readonly string[]
): string | null {
  for (const error of errors) {
    const message = error.message ?? '';
    if (!UNKNOWN_FIELD_MESSAGE.test(message)) {
      continue;
    }
    const field = candidates.find((candidate) =>
      new RegExp(`\\b${candidate}(?:_[a-z]+)?\\b`).test(message)
    );
    if (field) {
      return field;
    }
  }
  return null;
}

function graphqlError(
  errors: readonly GraphqlError[],
  optionalFields: readonly string[]
): CloudflareApiError {
  const text = clip(
    errors
      .map((error) => error.message)
      .filter(Boolean)
      .join('; ') || 'Cloudflare answered with an error.'
  );
  if (
    errors.some(
      (error) =>
        error.extensions?.code === 'budget' ||
        RATE_MESSAGE.test(error.message ?? '')
    )
  ) {
    return new CloudflareApiError('rate_limit', text);
  }
  if (
    errors.some(
      (error) =>
        error.extensions?.code === 'authz' ||
        error.extensions?.code === 'authn' ||
        AUTH_MESSAGE.test(error.message ?? '')
    )
  ) {
    return new CloudflareApiError('auth', text);
  }
  const field = unknownFieldIn(errors, optionalFields);
  if (field) {
    return new CloudflareApiError('unknown_field', text, { field });
  }
  return new CloudflareApiError('request', text);
}

/**
 * One GraphQL query. Rate limits are retried with backoff; anything else
 * throws a CloudflareApiError of the matching kind.
 */
export async function cloudflareGraphql<T>(
  token: string,
  query: string,
  options: ApiOptions & {
    variables?: Record<string, unknown>;
    /** Fields the caller can drop: an error naming one is `unknown_field`. */
    optionalFields?: readonly string[];
  } = {}
): Promise<T> {
  const fetcher = options.fetcher ?? fetch;
  const sleep = options.sleep ?? defaultSleep;
  const body = JSON.stringify({ query, variables: options.variables ?? {} });
  let lastError: CloudflareApiError | null = null;

  for (let attempt = 1; attempt <= RATE_LIMIT_ATTEMPTS; attempt += 1) {
    let response: Response;
    try {
      response = await fetcher(CLOUDFLARE_GRAPHQL, {
        method: 'POST',
        headers: headers(token),
        body,
      });
    } catch (error) {
      throw new CloudflareApiError(
        'unavailable',
        `Could not reach Cloudflare: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    const json = await readJson<{
      data?: T | null;
      errors?: GraphqlError[] | null;
    }>(response);
    const errors = json?.errors ?? [];

    if (response.status === 429) {
      lastError = new CloudflareApiError(
        'rate_limit',
        'Cloudflare rate limit reached (300 analytics queries per 5 minutes).',
        { status: 429 }
      );
      if (attempt < RATE_LIMIT_ATTEMPTS) {
        await sleep(retryAfterMs(response, attempt));
      }
      continue;
    }
    if (response.status === 401 || response.status === 403) {
      throw new CloudflareApiError(
        'auth',
        clip(
          errors.map((error) => error.message).join('; ') ||
            'Cloudflare rejected the token.'
        ),
        { status: response.status }
      );
    }
    if (response.status >= 500) {
      throw new CloudflareApiError(
        'unavailable',
        `Cloudflare answered ${response.status}.`,
        { status: response.status }
      );
    }
    if (errors.length > 0) {
      const error = graphqlError(errors, options.optionalFields ?? []);
      if (error.kind === 'rate_limit') {
        lastError = error;
        if (attempt < RATE_LIMIT_ATTEMPTS) {
          await sleep(retryAfterMs(response, attempt));
        }
        continue;
      }
      throw error;
    }
    if (!(response.ok && json?.data)) {
      throw new CloudflareApiError(
        'request',
        `Cloudflare answered ${response.status} without data.`,
        { status: response.status }
      );
    }
    return json.data;
  }
  throw (
    lastError ??
    new CloudflareApiError('rate_limit', 'Cloudflare rate limit reached.')
  );
}

/** The zones this token can see (needs Zone → Zone → Read). */
export async function listCloudflareZones(
  token: string,
  options: ApiOptions = {}
): Promise<ICloudflareZone[]> {
  const fetcher = options.fetcher ?? fetch;
  const zones: ICloudflareZone[] = [];
  for (let page = 1; page <= ZONE_PAGES_MAX; page += 1) {
    let response: Response;
    try {
      response = await fetcher(
        `${CLOUDFLARE_API}/zones?per_page=${ZONES_PER_PAGE}&page=${page}`,
        { headers: headers(token) }
      );
    } catch (error) {
      throw new CloudflareApiError(
        'unavailable',
        `Could not reach Cloudflare: ${error instanceof Error ? error.message : String(error)}`
      );
    }
    const body =
      await readJson<
        RestEnvelope<{ id?: string; name?: string; status?: string }[]>
      >(response);
    if (response.status === 429) {
      throw new CloudflareApiError(
        'rate_limit',
        'Cloudflare rate limit reached. Try again in a few minutes.',
        { status: 429 }
      );
    }
    if (response.status >= 500) {
      throw new CloudflareApiError(
        'unavailable',
        `Cloudflare answered ${response.status}.`,
        { status: response.status }
      );
    }
    if (!response.ok || body?.success === false) {
      // 400/401/403: a malformed or revoked token, or one without Zone Read.
      throw new CloudflareApiError(
        'auth',
        restErrorText(body) || `Cloudflare answered ${response.status}.`,
        { status: response.status }
      );
    }
    for (const zone of body?.result ?? []) {
      if (zone.id && zone.name) {
        zones.push({
          id: zone.id,
          name: zone.name,
          status: zone.status ?? null,
        });
      }
    }
    const totalPages = body?.result_info?.total_pages ?? 1;
    if (page >= totalPages) {
      break;
    }
  }
  return zones;
}

/** What Cloudflare allows this zone for `httpRequestsAdaptiveGroups`. */
export interface ZoneDatasetLimits {
  /** Widest window one query may cover, in seconds. */
  maxDuration: number | null;
  /** How far back a query may read, in seconds. */
  notOlderThan: number | null;
  /** Most rows one query returns. */
  maxPageSize: number | null;
}

const SETTINGS_QUERY = `query FlarePanelZoneCheck($zoneTag: string) {
  viewer {
    zones(filter: { zoneTag: $zoneTag }) {
      settings {
        httpRequestsAdaptiveGroups {
          enabled
          maxDuration
          maxPageSize
          notOlderThan
        }
      }
    }
  }
}`;

const PROBE_QUERY = `query FlarePanelZoneProbe($zoneTag: string, $since: Time, $until: Time) {
  viewer {
    zones(filter: { zoneTag: $zoneTag }) {
      httpRequestsAdaptiveGroups(limit: 1, filter: { datetime_geq: $since, datetime_lt: $until }) {
        count
      }
    }
  }
}`;

interface SettingsData {
  viewer?: {
    zones?: {
      settings?: {
        httpRequestsAdaptiveGroups?: {
          enabled?: boolean;
          maxDuration?: number;
          maxPageSize?: number;
          notOlderThan?: number;
        } | null;
      } | null;
    }[];
  };
}

const NO_ZONE_ACCESS =
  'This token cannot read analytics for that zone. Check the zone ID and that the token has Zone → Analytics → Read for it.';

/**
 * Checks that the token can read this zone's HTTP analytics with one small
 * query, and returns the dataset's limits. Falls back to a one-row probe
 * when the zone's schema has no `settings` node.
 */
export async function checkCloudflareZone(
  token: string,
  zoneId: string,
  options: ApiOptions & { now?: number } = {}
): Promise<ZoneDatasetLimits> {
  try {
    const data = await cloudflareGraphql<SettingsData>(token, SETTINGS_QUERY, {
      ...options,
      variables: { zoneTag: zoneId },
      optionalFields: [
        'settings',
        'maxDuration',
        'maxPageSize',
        'notOlderThan',
      ],
    });
    const zone = data.viewer?.zones?.[0];
    if (!zone) {
      throw new CloudflareApiError('auth', NO_ZONE_ACCESS);
    }
    const dataset = zone.settings?.httpRequestsAdaptiveGroups;
    if (dataset?.enabled === false) {
      throw new CloudflareApiError(
        'request',
        'HTTP request analytics are not available for this zone.'
      );
    }
    return {
      maxDuration: dataset?.maxDuration ?? null,
      notOlderThan: dataset?.notOlderThan ?? null,
      maxPageSize: dataset?.maxPageSize ?? null,
    };
  } catch (error) {
    if (
      !(error instanceof CloudflareApiError && error.kind === 'unknown_field')
    ) {
      throw error;
    }
  }
  const until = new Date(options.now ?? Date.now());
  const since = new Date(until.getTime() - 60 * 60 * 1000);
  const data = await cloudflareGraphql<{
    viewer?: { zones?: unknown[] };
  }>(token, PROBE_QUERY, {
    ...options,
    variables: {
      zoneTag: zoneId,
      since: since.toISOString(),
      until: until.toISOString(),
    },
  });
  if (!data.viewer?.zones?.length) {
    throw new CloudflareApiError('auth', NO_ZONE_ACCESS);
  }
  return { maxDuration: null, notOlderThan: null, maxPageSize: null };
}

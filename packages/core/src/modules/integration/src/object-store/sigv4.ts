// AWS Signature Version 4 with WebCrypto, for the fetch-based S3 and STS calls
// (Cloudflare Workers has no AWS SDK transport). Signs the method, path, query,
// the `host` and `x-amz-*` headers plus any listed, and the payload hash.
// https://docs.aws.amazon.com/IAM/latest/UserGuide/create-signed-request.html

const encoder = new TextEncoder();
/** What WebCrypto takes as bytes, in both the Bun and the Workers typings. */
type CryptoBytes = Parameters<typeof crypto.subtle.digest>[1];

export interface AwsCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
}

export interface SignInput {
  method: string;
  url: URL;
  region: string;
  service: string;
  credentials: AwsCredentials;
  /** Extra headers to send and sign (e.g. content-type, x-amz-server-side-encryption). */
  headers?: Record<string, string>;
  body?: Uint8Array | string;
  /** Defaults to now; fixed in tests. */
  date?: Date;
}

function toHex(bytes: ArrayBuffer): string {
  return [...new Uint8Array(bytes)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

async function sha256Hex(data: Uint8Array | string): Promise<string> {
  const bytes = typeof data === 'string' ? encoder.encode(data) : data;
  return toHex(await crypto.subtle.digest('SHA-256', bytes as CryptoBytes));
}

async function hmac(
  key: ArrayBuffer | Uint8Array,
  data: string
): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key as CryptoBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(data));
}

/** RFC 3986 encoding, as SigV4 wants it (`/` kept in paths). */
function uriEncode(value: string, keepSlash: boolean): string {
  return encodeURIComponent(value)
    .replace(
      /[!'()*]/g,
      (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`
    )
    .replace(/%2F/g, keepSlash ? '/' : '%2F');
}

function canonicalPath(url: URL, service: string): string {
  const path = url.pathname || '/';
  // S3 paths are encoded once; other services normalise and encode twice.
  const segments = path.split('/').map((segment) => {
    const decoded = decodeURIComponent(segment);
    const once = uriEncode(decoded, false);
    return service === 's3' ? once : uriEncode(once, false);
  });
  return segments.join('/') || '/';
}

function canonicalQuery(url: URL): string {
  return [...url.searchParams.entries()]
    .map(([key, value]): [string, string] => [
      uriEncode(key, false),
      uriEncode(value, false),
    ])
    .sort(([a, av], [b, bv]) => {
      if (a !== b) {
        return a < b ? -1 : 1;
      }
      return av < bv ? -1 : 1;
    })
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
}

function amzDate(date: Date): { stamp: string; day: string } {
  const stamp = date.toISOString().replace(/[:-]|\.\d{3}/g, '');
  return { stamp, day: stamp.slice(0, 8) };
}

/** The headers to send with the request, `authorization` included. */
export async function signRequest(
  input: SignInput
): Promise<Record<string, string>> {
  const { stamp, day } = amzDate(input.date ?? new Date());
  const payloadHash = await sha256Hex(input.body ?? '');
  const headers: Record<string, string> = {
    host: input.url.host,
    'x-amz-date': stamp,
    ...(input.service === 's3' ? { 'x-amz-content-sha256': payloadHash } : {}),
    ...(input.credentials.sessionToken
      ? { 'x-amz-security-token': input.credentials.sessionToken }
      : {}),
  };
  for (const [key, value] of Object.entries(input.headers ?? {})) {
    headers[key.toLowerCase()] = value;
  }
  const names = Object.keys(headers).sort();
  const canonicalHeaders = names
    .map(
      (name) => `${name}:${String(headers[name]).trim().replace(/\s+/g, ' ')}\n`
    )
    .join('');
  const signedHeaders = names.join(';');
  const canonicalRequest = [
    input.method.toUpperCase(),
    canonicalPath(input.url, input.service),
    canonicalQuery(input.url),
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n');
  const scope = `${day}/${input.region}/${input.service}/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    stamp,
    scope,
    await sha256Hex(canonicalRequest),
  ].join('\n');
  const dateKey = await hmac(
    encoder.encode(`AWS4${input.credentials.secretAccessKey}`),
    day
  );
  const regionKey = await hmac(dateKey, input.region);
  const serviceKey = await hmac(regionKey, input.service);
  const signingKey = await hmac(serviceKey, 'aws4_request');
  const signature = toHex(await hmac(signingKey, stringToSign));
  const { host: _host, ...sent } = headers;
  return {
    ...sent,
    authorization: `AWS4-HMAC-SHA256 Credential=${input.credentials.accessKeyId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
  };
}

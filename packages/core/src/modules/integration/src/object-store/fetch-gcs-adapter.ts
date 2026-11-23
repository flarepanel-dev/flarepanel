// Google Cloud Storage exports over `fetch`, for Cloudflare Workers, where the
// Google Node SDK does not run. The service account signs a JWT (RS256, with
// WebCrypto) that Google's token endpoint trades for an access token; objects
// go up through the JSON API's simple upload. Same behaviour and errors as
// gcs-adapter.ts, including the write-based connection test.

import { decryptCredential } from '@flarepanel/shared/server';
import { ProviderError } from '../../../../clients/provider-error';
import type { CoreConfig } from '../../../../config';
import {
  type IGCSExportConfig,
  parseServiceAccountKey,
} from '../../integration.constants';
import type { FetchLike } from './fetch-s3-adapter';
import type {
  IObjectStoreAdapter,
  IUploadOptions,
  IUploadResult,
} from './types';

const GCS_PROVIDER = 'gcs';
const CONNECTION_TEST_FILENAME = '.openpanel-connection-test';
const SCOPE = 'https://www.googleapis.com/auth/devstorage.read_write';
const DEFAULT_TOKEN_URI = 'https://oauth2.googleapis.com/token';
const DEFAULT_API = 'https://storage.googleapis.com';
const TOKEN_SECONDS = 3600;
const TOKEN_REFRESH_MARGIN_MS = 5 * 60 * 1000;
const encoder = new TextEncoder();

function base64Url(bytes: Uint8Array | string): string {
  const data = typeof bytes === 'string' ? encoder.encode(bytes) : bytes;
  let binary = '';
  for (const byte of data) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function pemToPkcs8(pem: string): Uint8Array {
  const body = pem
    .replace(/-----BEGIN [^-]+-----/, '')
    .replace(/-----END [^-]+-----/, '')
    .replace(/\s+/g, '');
  const binary = atob(body);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index++) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

/** A signed JWT assertion for the OAuth 2.0 JWT bearer grant. */
export async function signServiceAccountJwt(input: {
  clientEmail: string;
  privateKey: string;
  privateKeyId?: string;
  tokenUri: string;
  scope: string;
  now?: number;
}): Promise<string> {
  const issuedAt = Math.floor((input.now ?? Date.now()) / 1000);
  const header = {
    alg: 'RS256',
    typ: 'JWT',
    ...(input.privateKeyId ? { kid: input.privateKeyId } : {}),
  };
  const claims = {
    iss: input.clientEmail,
    scope: input.scope,
    aud: input.tokenUri,
    iat: issuedAt,
    exp: issuedAt + TOKEN_SECONDS,
  };
  const unsigned = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(claims))}`;
  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToPkcs8(input.privateKey) as Parameters<typeof crypto.subtle.digest>[1],
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    encoder.encode(unsigned)
  );
  return `${unsigned}.${base64Url(new Uint8Array(signature))}`;
}

export class FetchGcsAdapter implements IObjectStoreAdapter {
  private readonly config: IGCSExportConfig;
  private token: { value: string; expiresAt: number } | null = null;
  private readonly api: string;

  constructor(
    config: IGCSExportConfig,
    coreConfig: CoreConfig,
    private readonly fetchImpl: FetchLike = (input, init) => fetch(input, init)
  ) {
    this.config = {
      ...config,
      serviceAccountKey: decryptCredential(
        coreConfig.encryptionKey,
        config.serviceAccountKey
      ),
    };
    this.api = (
      coreConfig.objectStoreExport.gcsApiEndpoint || DEFAULT_API
    ).replace(/\/$/, '');
  }

  private async accessToken(): Promise<string> {
    if (
      this.token &&
      this.token.expiresAt > Date.now() + TOKEN_REFRESH_MARGIN_MS
    ) {
      return this.token.value;
    }
    const parsed = parseServiceAccountKey(this.config.serviceAccountKey);
    if (!parsed.ok) {
      throw new ProviderError(
        GCS_PROVIDER,
        `Invalid service account key: ${parsed.error}`,
        { retryable: false }
      );
    }
    const { credentials } = parsed;
    // The key file's `token_uri` is tenant-supplied: always use Google's, as
    // Google's own SDK does, so a key cannot point the server at another host.
    const tokenUri = DEFAULT_TOKEN_URI;
    let assertion: string;
    try {
      assertion = await signServiceAccountJwt({
        clientEmail: credentials.client_email,
        privateKey: credentials.private_key,
        privateKeyId: credentials.private_key_id,
        tokenUri,
        scope: SCOPE,
      });
    } catch (error) {
      throw new ProviderError(
        GCS_PROVIDER,
        'The service account private key could not be read',
        { retryable: false, cause: error }
      );
    }
    const response = await this.send(tokenUri, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion,
      }).toString(),
    });
    const body = (await response.json().catch(() => ({}))) as {
      access_token?: string;
      expires_in?: number;
    };
    if (!(response.ok && body.access_token)) {
      throw new ProviderError(
        GCS_PROVIDER,
        'Google refused the service account credentials',
        { status: response.status }
      );
    }
    this.token = {
      value: body.access_token,
      expiresAt: Date.now() + (body.expires_in ?? TOKEN_SECONDS) * 1000,
    };
    return body.access_token;
  }

  private async send(url: string, init: RequestInit): Promise<Response> {
    try {
      return await this.fetchImpl(url, init);
    } catch (error) {
      throw new ProviderError(
        GCS_PROVIDER,
        'Could not reach Google Cloud Storage',
        {
          cause: error,
        }
      );
    }
  }

  async upload(options: IUploadOptions): Promise<IUploadResult> {
    const body =
      typeof options.content === 'string'
        ? encoder.encode(options.content)
        : new Uint8Array(options.content);
    const url = `${this.api}/upload/storage/v1/b/${encodeURIComponent(options.bucket)}/o?uploadType=media&name=${encodeURIComponent(options.key)}`;
    const response = await this.send(url, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${await this.accessToken()}`,
        'content-type': options.contentType,
      },
      body,
    });
    if (!response.ok) {
      throw new ProviderError(
        GCS_PROVIDER,
        `GCS upload failed (${response.status})`,
        { status: response.status }
      );
    }
    const result = (await response.json().catch(() => ({}))) as {
      etag?: string;
    };
    return {
      bucket: options.bucket,
      key: options.key,
      etag: result.etag,
      location: `gs://${options.bucket}/${options.key}`,
    };
  }

  async uploadMany(
    options: Array<IUploadOptions>
  ): Promise<Array<IUploadResult | Error>> {
    const results = await Promise.allSettled(
      options.map((option) => this.upload(option))
    );
    return results.map((result) =>
      result.status === 'fulfilled'
        ? result.value
        : result.reason instanceof Error
          ? result.reason
          : new Error(String(result.reason))
    );
  }

  /** Writes and removes one small object: exactly the permission exports need. */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    const prefix = this.config.prefix || 'openpanel-exports';
    const key = `${prefix}/${CONNECTION_TEST_FILENAME}`;
    try {
      await this.upload({
        bucket: this.config.bucket,
        key,
        content: 'openpanel connection test\n',
        contentType: 'text/plain',
      });
      await this.send(
        `${this.api}/storage/v1/b/${encodeURIComponent(this.config.bucket)}/o/${encodeURIComponent(key)}`,
        {
          method: 'DELETE',
          headers: { authorization: `Bearer ${await this.accessToken()}` },
        }
      ).catch(() => undefined);
      return { success: true };
    } catch (error) {
      return { success: false, error: this.describeError(error) };
    }
  }

  private describeError(error: unknown): string {
    const status = error instanceof ProviderError ? error.status : undefined;
    if (status === 404) {
      return `Bucket '${this.config.bucket}' does not exist or is not accessible`;
    }
    if (status === 401 || status === 403) {
      return `The service account cannot write to bucket '${this.config.bucket}'. Grant it roles/storage.objectAdmin (or objectCreator) on the bucket.`;
    }
    return error instanceof Error ? error.message : 'Unknown error';
  }
}

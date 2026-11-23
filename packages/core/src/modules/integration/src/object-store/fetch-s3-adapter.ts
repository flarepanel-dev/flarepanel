// S3 and S3-compatible exports (R2, MinIO, Spaces) over `fetch` with SigV4,
// for Cloudflare Workers, where the AWS SDK's Node transport does not run.
// Same behaviour as s3-adapter.ts: SSE-S3/SSE-KMS headers, path-style
// addressing for a custom endpoint, IAM-role exports through STS AssumeRole,
// and the same user-facing errors.

import { decryptCredential, isBlockedIp } from '@flarepanel/shared/server';
import { ProviderError } from '../../../../clients/provider-error';
import type { CoreConfig } from '../../../../config';
import type { IS3ExportConfig } from '../../integration.constants';
import { type AwsCredentials, signRequest } from './sigv4';
import type {
  IObjectStoreAdapter,
  IUploadOptions,
  IUploadResult,
} from './types';

/** `fetch` as these adapters call it; injectable in tests. */
export type FetchLike = (
  input: string | URL,
  init?: RequestInit
) => Promise<Response>;

const S3_PROVIDER = 's3';
const STS_VERSION = '2011-06-15';
const ROLE_SESSION_SECONDS = 3600;
const ROLE_REFRESH_MARGIN_MS = 5 * 60 * 1000;
const encoder = new TextEncoder();
const INTERNAL_HOSTS = ['localhost', '.localhost', '.local', '.internal'];
/** An IPv4 or IPv6 literal (hostnames are judged by name; Workers cannot reach private networks). */
const IP_LITERAL = /^(\d{1,3}(\.\d{1,3}){3}|[0-9a-f:]*:[0-9a-f:.]*)$/i;

/** The server's own AWS identity, which an IAM-role export assumes from. */
export interface OperatorAwsCredentials {
  accessKeyId?: string;
  secretAccessKey?: string;
  sessionToken?: string;
}

function xmlValue(xml: string, tag: string): string | undefined {
  return new RegExp(`<${tag}>([^<]*)</${tag}>`).exec(xml)?.[1];
}

/** A custom endpoint is tenant-controlled: public http(s) hosts only. */
function assertPublicEndpoint(endpoint: string): URL {
  let url: URL;
  try {
    url = new URL(endpoint);
  } catch {
    throw new ProviderError(S3_PROVIDER, 'The endpoint is not a valid URL', {
      retryable: false,
    });
  }
  const host = url.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  const internal =
    INTERNAL_HOSTS.some((suffix) =>
      suffix.startsWith('.') ? host.endsWith(suffix) : host === suffix
    ) ||
    (IP_LITERAL.test(host) && isBlockedIp(host));
  if ((url.protocol !== 'https:' && url.protocol !== 'http:') || internal) {
    throw new ProviderError(
      S3_PROVIDER,
      `Endpoint '${endpoint}' is not a permitted export destination`,
      { retryable: false }
    );
  }
  return url;
}

export class FetchS3Adapter implements IObjectStoreAdapter {
  private readonly config: IS3ExportConfig;
  private roleCredentials: { value: AwsCredentials; expiresAt: number } | null =
    null;

  constructor(
    config: IS3ExportConfig,
    coreConfig: CoreConfig,
    private readonly operator: OperatorAwsCredentials = {},
    private readonly fetchImpl: FetchLike = (input, init) => fetch(input, init)
  ) {
    this.config =
      config.authMode === 'access_key'
        ? {
            ...config,
            secretAccessKey: decryptCredential(
              coreConfig.encryptionKey,
              config.secretAccessKey
            ),
          }
        : config;
  }

  /** Path-style on a custom endpoint, virtual-hosted on AWS. */
  private objectUrl(bucket: string, key = ''): URL {
    const path = key
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/');
    if (this.config.authMode === 'access_key' && this.config.endpoint) {
      const base = assertPublicEndpoint(this.config.endpoint);
      const prefix = base.pathname.replace(/\/$/, '');
      return new URL(
        `${base.origin}${prefix}/${encodeURIComponent(bucket)}${key ? `/${path}` : ''}`
      );
    }
    return new URL(
      `https://${bucket}.s3.${this.config.region}.amazonaws.com/${path}`
    );
  }

  private async credentials(): Promise<AwsCredentials> {
    if (this.config.authMode === 'access_key') {
      return {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
      };
    }
    if (
      this.roleCredentials &&
      this.roleCredentials.expiresAt > Date.now() + ROLE_REFRESH_MARGIN_MS
    ) {
      return this.roleCredentials.value;
    }
    const { accessKeyId, secretAccessKey, sessionToken } = this.operator;
    if (!(accessKeyId && secretAccessKey)) {
      throw new ProviderError(
        S3_PROVIDER,
        'IAM role exports need AWS credentials on the server (AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY). Use access keys instead, or ask the operator to set them.',
        { retryable: false }
      );
    }
    const url = new URL('https://sts.amazonaws.com/');
    url.searchParams.set('Action', 'AssumeRole');
    url.searchParams.set('Version', STS_VERSION);
    url.searchParams.set('RoleArn', this.config.roleArn);
    url.searchParams.set('RoleSessionName', 'FlarePanelExport');
    url.searchParams.set('DurationSeconds', String(ROLE_SESSION_SECONDS));
    if (this.config.externalId) {
      url.searchParams.set('ExternalId', this.config.externalId);
    }
    const headers = await signRequest({
      method: 'GET',
      url,
      region: 'us-east-1',
      service: 'sts',
      credentials: { accessKeyId, secretAccessKey, sessionToken },
    });
    const response = await this.send(url, { method: 'GET', headers });
    const xml = await response.text();
    if (!response.ok) {
      throw new ProviderError(
        S3_PROVIDER,
        `Failed to assume role ${this.config.roleArn} for S3 access`,
        { status: response.status }
      );
    }
    const value: AwsCredentials = {
      accessKeyId: xmlValue(xml, 'AccessKeyId') ?? '',
      secretAccessKey: xmlValue(xml, 'SecretAccessKey') ?? '',
      sessionToken: xmlValue(xml, 'SessionToken'),
    };
    const expiration = Date.parse(xmlValue(xml, 'Expiration') ?? '');
    this.roleCredentials = {
      value,
      expiresAt: Number.isFinite(expiration)
        ? expiration
        : Date.now() + ROLE_SESSION_SECONDS * 1000,
    };
    return value;
  }

  private encryptionHeaders(): Record<string, string> {
    switch (this.config.encryption || 'SSE-S3') {
      case 'SSE-KMS':
        return {
          'x-amz-server-side-encryption': 'aws:kms',
          ...(this.config.kmsKeyId
            ? {
                'x-amz-server-side-encryption-aws-kms-key-id':
                  this.config.kmsKeyId,
              }
            : {}),
        };
      case 'none':
        return {};
      default:
        return { 'x-amz-server-side-encryption': 'AES256' };
    }
  }

  /** One request; transport failures become a retryable provider error. */
  private async send(url: URL, init: RequestInit): Promise<Response> {
    try {
      return await this.fetchImpl(url, { ...init, redirect: 'manual' });
    } catch (error) {
      throw new ProviderError(S3_PROVIDER, 'Could not reach the bucket', {
        cause: error,
      });
    }
  }

  async upload(options: IUploadOptions): Promise<IUploadResult> {
    const body =
      typeof options.content === 'string'
        ? encoder.encode(options.content)
        : new Uint8Array(options.content);
    const url = this.objectUrl(options.bucket, options.key);
    const headers = await signRequest({
      method: 'PUT',
      url,
      region: this.config.region,
      service: 's3',
      credentials: await this.credentials(),
      headers: {
        'content-type': options.contentType,
        ...this.encryptionHeaders(),
      },
      body,
    });
    const response = await this.send(url, { method: 'PUT', headers, body });
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new ProviderError(
        S3_PROVIDER,
        `S3 upload failed (${response.status} ${xmlValue(text, 'Code') ?? ''})`.trim(),
        { status: response.status }
      );
    }
    return {
      bucket: options.bucket,
      key: options.key,
      etag: response.headers.get('etag') ?? undefined,
      location: `s3://${options.bucket}/${options.key}`,
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

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const url = this.objectUrl(this.config.bucket);
      const headers = await signRequest({
        method: 'HEAD',
        url,
        region: this.config.region,
        service: 's3',
        credentials: await this.credentials(),
      });
      const response = await this.send(url, { method: 'HEAD', headers });
      if (response.ok) {
        return { success: true };
      }
      return { success: false, error: this.describeStatus(response.status) };
    } catch (error) {
      if (error instanceof ProviderError && error.retryable === false) {
        return { success: false, error: error.message };
      }
      return {
        success: false,
        error:
          'Could not reach the bucket. Check the endpoint, region and bucket name.',
      };
    }
  }

  private describeStatus(status: number): string {
    if (status === 404) {
      return `Bucket '${this.config.bucket}' does not exist or is not accessible`;
    }
    if (status === 403) {
      return `Access denied to bucket '${this.config.bucket}'. Check the credentials and their bucket permissions.`;
    }
    if (status === 301 || status === 307) {
      return `Bucket '${this.config.bucket}' is in a different region than '${this.config.region}'`;
    }
    if (status === 400 || status === 401) {
      return 'The access key or secret is not valid for this endpoint';
    }
    return 'Could not reach the bucket. Check the endpoint, region and bucket name.';
  }
}

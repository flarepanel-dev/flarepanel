import { describe, expect, it } from 'bun:test';
import type { CoreConfig } from '../../../../config';
import type {
  IGCSExportConfig,
  IS3ExportConfig,
} from '../../integration.constants';
import { FetchGcsAdapter, signServiceAccountJwt } from './fetch-gcs-adapter';
import { FetchS3Adapter } from './fetch-s3-adapter';
import { signRequest } from './sigv4';

// The worked examples in AWS's "Signature Calculations for the Authorization
// Header: Transferring Payload in a Single Chunk" (S3 API reference).
const EXAMPLE_CREDENTIALS = {
  accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
  secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
};
const EXAMPLE_DATE = new Date('2013-05-24T00:00:00Z');

function signatureOf(headers: Record<string, string>): string {
  return /Signature=([0-9a-f]+)/.exec(headers.authorization ?? '')?.[1] ?? '';
}

describe('SigV4', () => {
  it('signs the AWS S3 GET object example', async () => {
    const headers = await signRequest({
      method: 'GET',
      url: new URL('https://examplebucket.s3.amazonaws.com/test.txt'),
      region: 'us-east-1',
      service: 's3',
      credentials: EXAMPLE_CREDENTIALS,
      headers: { range: 'bytes=0-9' },
      date: EXAMPLE_DATE,
    });
    expect(signatureOf(headers)).toBe(
      'f0e8bdb87c964420e857bd35b5d6ed310bd44f0170aba48dd91039c6036bdb41'
    );
    expect(headers.authorization).toContain(
      'SignedHeaders=host;range;x-amz-content-sha256;x-amz-date'
    );
  });

  it('signs the AWS S3 PUT object example', async () => {
    const headers = await signRequest({
      method: 'PUT',
      url: new URL('https://examplebucket.s3.amazonaws.com/test$file.text'),
      region: 'us-east-1',
      service: 's3',
      credentials: EXAMPLE_CREDENTIALS,
      headers: {
        date: 'Fri, 24 May 2013 00:00:00 GMT',
        'x-amz-storage-class': 'REDUCED_REDUNDANCY',
      },
      body: 'Welcome to Amazon S3.',
      date: EXAMPLE_DATE,
    });
    expect(signatureOf(headers)).toBe(
      '98ad721746da40c64f1a55b78f14c238d841ea1380cd77a1b5971af0ece108bd'
    );
  });

  it('signs the AWS S3 list objects example (sorted query)', async () => {
    const headers = await signRequest({
      method: 'GET',
      url: new URL(
        'https://examplebucket.s3.amazonaws.com/?max-keys=2&prefix=J'
      ),
      region: 'us-east-1',
      service: 's3',
      credentials: EXAMPLE_CREDENTIALS,
      date: EXAMPLE_DATE,
    });
    expect(signatureOf(headers)).toBe(
      '34b48302e7b5fa45bde8084f4b7868a86f0a534bc59db6670ed5711ef69dc6f7'
    );
  });
});

const coreConfig = {
  // decryptCredential passes plain text through when the value is not encrypted.
  encryptionKey: undefined,
  objectStoreExport: {},
} as unknown as CoreConfig;

function recordingFetch(
  respond: (url: string, init: RequestInit) => Response
): {
  calls: { url: string; init: RequestInit }[];
  fetch: (input: string | URL, init?: RequestInit) => Promise<Response>;
} {
  const calls: { url: string; init: RequestInit }[] = [];
  return {
    calls,
    fetch: (input, init = {}) => {
      calls.push({ url: String(input), init });
      return Promise.resolve(respond(String(input), init));
    },
  };
}

const s3Config = (extra: Partial<IS3ExportConfig> = {}): IS3ExportConfig =>
  ({
    type: 's3_export',
    bucket: 'exports',
    prefix: 'fp',
    region: 'eu-central-1',
    format: 'jsonl_gzip',
    encryption: 'SSE-S3',
    authMode: 'access_key',
    accessKeyId: 'AKIDEXAMPLE',
    secretAccessKey: 'secret',
    ...extra,
  }) as IS3ExportConfig;

describe('fetch S3 adapter', () => {
  it('puts objects virtual-hosted on AWS with SSE and a signature', async () => {
    const fake = recordingFetch(
      () => new Response(null, { status: 200, headers: { etag: '"abc"' } })
    );
    const adapter = new FetchS3Adapter(s3Config(), coreConfig, {}, fake.fetch);
    const result = await adapter.upload({
      bucket: 'exports',
      key: 'fp/batch 1/data.jsonl.gz',
      content: 'hello',
      contentType: 'application/gzip',
    });
    expect(result.etag).toBe('"abc"');
    const [call] = fake.calls;
    expect(call?.url).toBe(
      'https://exports.s3.eu-central-1.amazonaws.com/fp/batch%201/data.jsonl.gz'
    );
    const headers = call?.init.headers as Record<string, string>;
    expect(call?.init.method).toBe('PUT');
    expect(headers['x-amz-server-side-encryption']).toBe('AES256');
    expect(headers.authorization).toContain('Credential=AKIDEXAMPLE/');
    expect(headers.authorization).toContain('/eu-central-1/s3/aws4_request');
  });

  it('uses path-style on a custom endpoint (R2) and refuses internal ones', async () => {
    const fake = recordingFetch(() => new Response(null, { status: 200 }));
    const adapter = new FetchS3Adapter(
      s3Config({
        endpoint: 'https://account.r2.cloudflarestorage.com',
        region: 'auto',
        encryption: 'none',
      }),
      coreConfig,
      {},
      fake.fetch
    );
    await adapter.upload({
      bucket: 'exports',
      key: 'a.json',
      content: '{}',
      contentType: 'application/json',
    });
    expect(fake.calls[0]?.url).toBe(
      'https://account.r2.cloudflarestorage.com/exports/a.json'
    );
    expect(
      (fake.calls[0]?.init.headers as Record<string, string>)[
        'x-amz-server-side-encryption'
      ]
    ).toBeUndefined();

    const internal = new FetchS3Adapter(
      s3Config({ endpoint: 'http://169.254.169.254' }),
      coreConfig,
      {},
      fake.fetch
    );
    expect(await internal.testConnection()).toMatchObject({ success: false });
  });

  it('explains connection failures and errors', async () => {
    const missing = new FetchS3Adapter(
      s3Config(),
      coreConfig,
      {},
      recordingFetch(() => new Response(null, { status: 404 })).fetch
    );
    expect((await missing.testConnection()).error).toContain('does not exist');
    const denied = new FetchS3Adapter(
      s3Config(),
      coreConfig,
      {},
      recordingFetch(
        () =>
          new Response('<Error><Code>AccessDenied</Code></Error>', {
            status: 403,
          })
      ).fetch
    );
    await expect(
      denied.upload({
        bucket: 'exports',
        key: 'x',
        content: 'x',
        contentType: 'text/plain',
      })
    ).rejects.toMatchObject({ status: 403, retryable: false });
  });

  it('assumes an IAM role through STS with the server credentials', async () => {
    const sts = `<AssumeRoleResponse><AssumeRoleResult><Credentials><AccessKeyId>ASIAROLE</AccessKeyId><SecretAccessKey>rolesecret</SecretAccessKey><SessionToken>token123</SessionToken><Expiration>2099-01-01T00:00:00Z</Expiration></Credentials></AssumeRoleResult></AssumeRoleResponse>`;
    const fake = recordingFetch((url) =>
      url.startsWith('https://sts.')
        ? new Response(sts, { status: 200 })
        : new Response(null, { status: 200 })
    );
    const config = {
      ...s3Config(),
      authMode: 'iam_role',
      roleArn: 'arn:aws:iam::123:role/export',
    } as unknown as IS3ExportConfig;
    const adapter = new FetchS3Adapter(
      config,
      coreConfig,
      { accessKeyId: 'AKIDSERVER', secretAccessKey: 'server' },
      fake.fetch
    );
    await adapter.upload({
      bucket: 'exports',
      key: 'k',
      content: 'x',
      contentType: 'text/plain',
    });
    expect(fake.calls[0]?.url).toContain('Action=AssumeRole');
    const put = fake.calls[1]?.init.headers as Record<string, string>;
    expect(put.authorization).toContain('Credential=ASIAROLE/');
    expect(put['x-amz-security-token']).toBe('token123');

    const noServerKeys = new FetchS3Adapter(config, coreConfig, {}, fake.fetch);
    expect((await noServerKeys.testConnection()).error).toContain(
      'IAM role exports need AWS credentials'
    );
  });
});

async function serviceAccount() {
  const pair = await crypto.subtle.generateKey(
    {
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['sign', 'verify']
  );
  const pkcs8 = new Uint8Array(
    await crypto.subtle.exportKey('pkcs8', pair.privateKey)
  );
  const b64 = btoa(String.fromCharCode(...pkcs8));
  const pem = `-----BEGIN PRIVATE KEY-----\n${b64.match(/.{1,64}/g)?.join('\n')}\n-----END PRIVATE KEY-----\n`;
  return { pair, pem };
}

function fromBase64Url(text: string): Uint8Array {
  const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

describe('fetch GCS adapter', () => {
  it('signs a JWT the public key verifies', async () => {
    const { pair, pem } = await serviceAccount();
    const jwt = await signServiceAccountJwt({
      clientEmail: 'export@proj.iam.gserviceaccount.com',
      privateKey: pem,
      tokenUri: 'https://oauth2.googleapis.com/token',
      scope: 'scope',
      now: 1_700_000_000_000,
    });
    const [header, claims, signature] = jwt.split('.') as [
      string,
      string,
      string,
    ];
    expect(
      JSON.parse(new TextDecoder().decode(fromBase64Url(claims)))
    ).toMatchObject({
      iss: 'export@proj.iam.gserviceaccount.com',
      aud: 'https://oauth2.googleapis.com/token',
      iat: 1_700_000_000,
      exp: 1_700_003_600,
    });
    const valid = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      pair.publicKey,
      fromBase64Url(signature),
      new TextEncoder().encode(`${header}.${claims}`)
    );
    expect(valid).toBe(true);
  });

  it('trades the JWT for a token once and uploads with it', async () => {
    const { pem } = await serviceAccount();
    const fake = recordingFetch((url) =>
      url.includes('oauth2')
        ? Response.json({ access_token: 'tok', expires_in: 3600 })
        : Response.json({ etag: 'e1' })
    );
    const config = {
      type: 'gcs_export',
      bucket: 'exports',
      prefix: 'fp',
      format: 'jsonl_gzip',
      serviceAccountKey: JSON.stringify({
        type: 'service_account',
        project_id: 'proj',
        client_email: 'export@proj.iam.gserviceaccount.com',
        private_key: pem,
        // Tenant-supplied: never followed.
        token_uri: 'http://169.254.169.254/token',
      }),
    } as IGCSExportConfig;
    const adapter = new FetchGcsAdapter(config, coreConfig, fake.fetch);
    await adapter.upload({
      bucket: 'exports',
      key: 'fp/a b.json',
      content: '{}',
      contentType: 'application/json',
    });
    await adapter.upload({
      bucket: 'exports',
      key: 'fp/c.json',
      content: '{}',
      contentType: 'application/json',
    });
    expect(fake.calls[0]?.url).toBe('https://oauth2.googleapis.com/token');
    expect(
      fake.calls.filter((call) => call.url.includes('oauth2'))
    ).toHaveLength(1);
    expect(fake.calls[1]?.url).toBe(
      'https://storage.googleapis.com/upload/storage/v1/b/exports/o?uploadType=media&name=fp%2Fa%20b.json'
    );
    expect(
      (fake.calls[1]?.init.headers as Record<string, string>).authorization
    ).toBe('Bearer tok');
  });
});

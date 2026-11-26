/**
 * Screenshots attached to in-app feedback, kept in the R2 bucket under
 * `feedback/`. Each one gets a random 256-bit name, which is the only way to
 * reach it: the GitHub issue and the team email link to it, nothing lists it.
 * A bucket lifecycle rule deletes the prefix after 90 days (README, ops docs).
 */

const EXT = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
} as const;
const TYPE_BY_EXT: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  webp: 'image/webp',
};
const PATH = /^\/feedback\/screenshots\/([0-9a-f]{64})\.(png|jpg|webp)$/;

function randomName(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function createFeedbackScreenshotStore(
  bucket: Pick<R2Bucket, 'put'>,
  apiUrl: string
) {
  const base = apiUrl.replace(/\/+$/, '');
  return {
    async put(bytes: Uint8Array, contentType: string): Promise<string> {
      const ext = EXT[contentType as keyof typeof EXT];
      if (!ext) {
        throw new Error('unsupported screenshot type');
      }
      const name = `${randomName()}.${ext}`;
      await bucket.put(`feedback/${name}`, bytes, {
        httpMetadata: { contentType },
      });
      return `${base}/feedback/screenshots/${name}`;
    },
  };
}

/** Serves `/feedback/screenshots/<name>`; null for any other path. */
export async function serveFeedbackScreenshot(
  request: Request,
  pathname: string,
  bucket: Pick<R2Bucket, 'get'> | undefined
): Promise<Response | null> {
  const match = PATH.exec(pathname);
  if (!match) {
    return null;
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method not allowed', { status: 405 });
  }
  const object = bucket
    ? await bucket.get(`feedback/${match[1]}.${match[2]}`)
    : null;
  if (!object) {
    return new Response('Not found', { status: 404 });
  }
  return new Response(request.method === 'HEAD' ? null : object.body, {
    headers: {
      'content-type':
        TYPE_BY_EXT[match[2] as string] ?? 'application/octet-stream',
      'cache-control': 'private, max-age=86400',
      'content-disposition': 'inline',
      'content-security-policy': "default-src 'none'; img-src 'self'",
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'no-referrer',
      'x-robots-tag': 'noindex, nofollow',
    },
  });
}

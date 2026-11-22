/**
 * SQLite `file:` URLs with a relative path are resolved from the repository
 * root, so every package (whatever its working directory) and Prisma (which
 * would otherwise resolve from the schema folder) open the same file.
 */

import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

export function resolveSqliteUrl(url: string | undefined): string | undefined {
  if (!url?.startsWith('file:')) {
    return url;
  }
  const [path = '', query] = url.slice('file:'.length).split('?');
  const absolute = isAbsolute(path) ? path : join(REPO_ROOT, path);
  return `file:${absolute}${query ? `?${query}` : ''}`;
}

/**
 * Import source copies in the archive bucket (`imports/<project>/<import>/`):
 * streamed in with a multipart upload (every part but the last the same size,
 * as R2 requires), read back in byte ranges by the import steps, and removed
 * when the import ends.
 */

import type { ImportFileStore } from '@flarepanel/core';

const PART_BYTES = 10 * 1024 * 1024;

export function createImportFileStore(bucket: R2Bucket): ImportFileStore {
  return {
    async put(key, body, maxBytes) {
      const reader = body.getReader();
      let buffer = new Uint8Array(PART_BYTES);
      let filled = 0;
      let total = 0;
      let upload: R2MultipartUpload | null = null;
      const parts: R2UploadedPart[] = [];
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          total += value.byteLength;
          if (total > maxBytes) {
            throw new Error(
              `The import source is larger than ${Math.round(maxBytes / 1e9)} GB`
            );
          }
          let read = 0;
          while (read < value.byteLength) {
            const take = Math.min(PART_BYTES - filled, value.byteLength - read);
            buffer.set(value.subarray(read, read + take), filled);
            filled += take;
            read += take;
            if (filled === PART_BYTES) {
              upload ??= await bucket.createMultipartUpload(key);
              parts.push(await upload.uploadPart(parts.length + 1, buffer));
              buffer = new Uint8Array(PART_BYTES);
              filled = 0;
            }
          }
        }
        if (!upload) {
          await bucket.put(key, buffer.subarray(0, filled));
          return total;
        }
        if (filled > 0) {
          parts.push(
            await upload.uploadPart(parts.length + 1, buffer.subarray(0, filled))
          );
        }
        await upload.complete(parts);
        return total;
      } catch (error) {
        await upload?.abort().catch(() => undefined);
        await reader.cancel().catch(() => undefined);
        throw error;
      }
    },

    async readRange(key, offset, length) {
      const object = await bucket.get(key, { range: { offset, length } });
      if (!object) {
        throw new Error('The import copy is missing');
      }
      return new Uint8Array(await object.arrayBuffer());
    },

    async read(key) {
      const object = await bucket.get(key);
      return object ? (object.body as ReadableStream<Uint8Array>) : null;
    },

    async removePrefix(prefix) {
      let cursor: string | undefined;
      do {
        const page = await bucket.list({ prefix, cursor, limit: 1000 });
        const keys = page.objects.map((object) => object.key);
        if (keys.length > 0) {
          await bucket.delete(keys);
        }
        cursor = page.truncated ? page.cursor : undefined;
      } while (cursor);
    },
  };
}

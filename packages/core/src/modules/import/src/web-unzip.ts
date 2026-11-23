// Reading ZIP archives and gzip files with Web APIs only (DecompressionStream),
// for imports on Cloudflare Workers, where the Node streaming zip and readline
// libraries the Bun server uses are not available. The archive is read from
// its central directory, so entries written with data descriptors work too.

const EOCD_SIGNATURE = 0x06_05_4b_50;
const CENTRAL_SIGNATURE = 0x02_01_4b_50;
const LOCAL_SIGNATURE = 0x04_03_4b_50;
const STORED = 0;
const DEFLATED = 8;
/** End-of-central-directory record: 22 bytes plus a comment of up to 64 KiB. */
const EOCD_MAX_SEARCH = 22 + 0xff_ff;

export interface ZipEntry {
  name: string;
  read(): Promise<Uint8Array>;
}

async function pipeThrough(
  bytes: Uint8Array,
  format: 'gzip' | 'deflate-raw'
): Promise<Uint8Array> {
  const stream = new Blob([bytes as Uint8Array<ArrayBuffer>])
    .stream()
    .pipeThrough(new DecompressionStream(format));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

export function isGzip(bytes: Uint8Array): boolean {
  return bytes.length >= 2 && bytes[0] === 0x1f && bytes[1] === 0x8b;
}

export function gunzip(bytes: Uint8Array): Promise<Uint8Array> {
  return pipeThrough(bytes, 'gzip');
}

/** The archive's files, in central-directory order. */
export function readZip(bytes: Uint8Array): ZipEntry[] {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let eocd = -1;
  const stop = Math.max(0, bytes.length - EOCD_MAX_SEARCH);
  for (let index = bytes.length - 22; index >= stop; index--) {
    if (view.getUint32(index, true) === EOCD_SIGNATURE) {
      eocd = index;
      break;
    }
  }
  if (eocd < 0) {
    throw new Error('Not a ZIP archive (no end of central directory)');
  }
  const count = view.getUint16(eocd + 10, true);
  let cursor = view.getUint32(eocd + 16, true);
  const decoder = new TextDecoder();
  const entries: ZipEntry[] = [];
  for (let index = 0; index < count; index++) {
    if (view.getUint32(cursor, true) !== CENTRAL_SIGNATURE) {
      throw new Error('Corrupt ZIP central directory');
    }
    const method = view.getUint16(cursor + 10, true);
    const compressedSize = view.getUint32(cursor + 20, true);
    const nameLength = view.getUint16(cursor + 28, true);
    const extraLength = view.getUint16(cursor + 30, true);
    const commentLength = view.getUint16(cursor + 32, true);
    const localOffset = view.getUint32(cursor + 42, true);
    const name = decoder.decode(
      bytes.subarray(cursor + 46, cursor + 46 + nameLength)
    );
    cursor += 46 + nameLength + extraLength + commentLength;
    if (name.endsWith('/')) {
      continue;
    }
    entries.push({
      name,
      read: async () => {
        if (view.getUint32(localOffset, true) !== LOCAL_SIGNATURE) {
          throw new Error(`Corrupt ZIP entry ${name}`);
        }
        const start =
          localOffset +
          30 +
          view.getUint16(localOffset + 26, true) +
          view.getUint16(localOffset + 28, true);
        const data = bytes.subarray(start, start + compressedSize);
        if (method === STORED) {
          return data;
        }
        if (method === DEFLATED) {
          return pipeThrough(data, 'deflate-raw');
        }
        throw new Error(`Unsupported ZIP compression method ${method}`);
      },
    });
  }
  return entries;
}

/** Newline-delimited JSON (gzipped or not) as parsed objects; bad lines skipped. */
export async function* ndjsonRecords<T>(
  bytes: Uint8Array,
  onBadLine?: (line: string) => void
): AsyncGenerator<T> {
  const text = new TextDecoder().decode(
    isGzip(bytes) ? await gunzip(bytes) : bytes
  );
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }
    try {
      yield JSON.parse(trimmed) as T;
    } catch {
      onBadLine?.(trimmed);
    }
  }
}

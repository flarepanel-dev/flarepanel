// Screenshots for the feedback form. Each image is redrawn on a canvas
// before upload: that shrinks it (at most 1600 px on the long side) and drops
// everything but the pixels (EXIF, location, camera details).

export const MAX_SCREENSHOTS = 3;
const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp'];
const TARGET_BYTES = 1_200_000;

export interface Screenshot {
  id: string;
  contentType: 'image/png' | 'image/jpeg' | 'image/webp';
  /** Base64, without the data: prefix. */
  data: string;
  preview: string;
  bytes: number;
}

function toBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

function readBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '');
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export function isAcceptedImage(file: File): boolean {
  return ACCEPTED.includes(file.type);
}

export async function prepareScreenshot(file: File): Promise<Screenshot> {
  const bitmap = await createImageBitmap(file);
  let blob: Blob | null = null;
  for (const [edge, quality] of [
    [1600, 0.85],
    [1280, 0.75],
    [1024, 0.7],
  ] as const) {
    const scale = Math.min(1, edge / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    canvas
      .getContext('2d')
      ?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    // WebP where the browser can encode it, JPEG otherwise (older Safari
    // silently falls back to PNG, which can be large).
    blob = await toBlob(canvas, 'image/webp', quality);
    if (!blob || blob.type !== 'image/webp') {
      blob = await toBlob(canvas, 'image/jpeg', quality);
    }
    if (blob && blob.size <= TARGET_BYTES) {
      break;
    }
  }
  bitmap.close();
  if (!blob || blob.size > TARGET_BYTES * 1.2) {
    throw new Error('This image is too large, even after resizing.');
  }
  return {
    id: crypto.randomUUID(),
    contentType: blob.type as Screenshot['contentType'],
    data: await readBase64(blob),
    preview: URL.createObjectURL(blob),
    bytes: blob.size,
  };
}

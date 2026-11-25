// A cap on request bodies, enforced at the edge before the app parses them.
// The app reads whole bodies (JSON parsing, the Polar signature check), and a
// Worker has 128 MB of memory: one large or never-ending body could take the
// isolate, and every request in it, down. Every route takes small JSON; the
// largest is a session replay chunk (about 1 MB from the SDK).

export const MAX_BODY_BYTES = 5 * 1024 * 1024;
const PAYLOAD_TOO_LARGE = 413;

function tooLarge(): Response {
  return Response.json(
    {
      status: PAYLOAD_TOO_LARGE,
      error: 'Payload Too Large',
      message: `Request bodies are limited to ${MAX_BODY_BYTES} bytes.`,
    },
    { status: PAYLOAD_TOO_LARGE }
  );
}

/**
 * A body that declares its size is refused up front. One that does not
 * (chunked) is passed through a counting stream that fails once the cap is
 * passed, so the app's read errors instead of buffering without end.
 */
export function limitRequestBody(
  request: Request,
  maxBytes = MAX_BODY_BYTES
): { request: Request } | { response: Response } {
  if (!request.body) {
    return { request };
  }
  const declared = request.headers.get('content-length');
  if (declared !== null) {
    const size = Number(declared);
    if (Number.isFinite(size) && size > maxBytes) {
      return { response: tooLarge() };
    }
    if (Number.isFinite(size)) {
      return { request };
    }
  }
  let seen = 0;
  const counter = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      seen += chunk.byteLength;
      if (seen > maxBytes) {
        controller.error(new Error('Request body too large'));
        return;
      }
      controller.enqueue(chunk);
    },
  });
  return {
    request: new Request(request, {
      body: request.body.pipeThrough(counter),
    }),
  };
}

export { tooLarge as payloadTooLargeResponse };

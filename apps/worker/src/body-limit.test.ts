import { describe, expect, it } from 'bun:test';
import { limitRequestBody } from './body-limit';

const url = 'https://api.example.com/track';

function chunked(bytes: number): Request {
  const chunk = new Uint8Array(1024);
  let sent = 0;
  const body = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (sent >= bytes) {
        controller.close();
        return;
      }
      controller.enqueue(chunk);
      sent += chunk.byteLength;
    },
  });
  // No content-length: the size is unknown until the body is read.
  return new Request(url, {
    method: 'POST',
    body,
    duplex: 'half',
  } as RequestInit);
}

describe('limitRequestBody', () => {
  it('refuses a declared body over the cap before reading it', async () => {
    const request = new Request(url, {
      method: 'POST',
      headers: { 'content-length': String(10 * 1024 * 1024) },
      body: 'x',
    });
    const result = limitRequestBody(request, 1024 * 1024);
    expect('response' in result && result.response.status).toBe(413);
  });

  it('passes a small declared body unchanged', async () => {
    const request = new Request(url, { method: 'POST', body: '{"a":1}' });
    const result = limitRequestBody(request);
    expect('request' in result && (await result.request.text())).toBe(
      '{"a":1}'
    );
  });

  it('fails a chunked body once it passes the cap', async () => {
    const result = limitRequestBody(chunked(64 * 1024), 16 * 1024);
    expect('request' in result).toBe(true);
    if ('request' in result) {
      await expect(result.request.arrayBuffer()).rejects.toThrow();
    }
  });

  it('lets a chunked body under the cap through whole', async () => {
    const result = limitRequestBody(chunked(8 * 1024), 16 * 1024);
    if ('request' in result) {
      expect((await result.request.arrayBuffer()).byteLength).toBe(8 * 1024);
    }
  });

  it('leaves bodiless requests alone', () => {
    const request = new Request(url);
    const result = limitRequestBody(request);
    expect('request' in result && result.request).toBe(request);
  });
});

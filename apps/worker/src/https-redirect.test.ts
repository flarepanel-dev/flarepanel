import { describe, expect, it } from 'bun:test';
import { httpsRedirect } from './https-redirect';

const viaEdge = (url: string, scheme: string, init: RequestInit = {}) =>
  new Request(url, {
    ...init,
    headers: { 'cf-visitor': JSON.stringify({ scheme }) },
  });

describe('httpsRedirect', () => {
  it('sends a plain-HTTP visit to the same URL on HTTPS', () => {
    const response = httpsRedirect(
      viaEdge('http://app.example.com/login?next=%2Fx', 'http')
    );
    expect(response?.status).toBe(301);
    expect(response?.headers.get('location')).toBe(
      'https://app.example.com/login?next=%2Fx'
    );
  });

  it('keeps the method for a plain-HTTP POST', () => {
    const response = httpsRedirect(
      viaEdge('http://app.example.com/track', 'http', {
        method: 'POST',
        body: '{}',
      })
    );
    expect(response?.status).toBe(308);
  });

  it('leaves HTTPS visits alone', () => {
    expect(
      httpsRedirect(viaEdge('https://app.example.com/', 'https'))
    ).toBeNull();
  });

  it('leaves local development alone, even with the production host', () => {
    expect(httpsRedirect(new Request('http://app.example.com/'))).toBeNull();
    expect(httpsRedirect(new Request('http://localhost:8787/'))).toBeNull();
  });

  it('ignores a malformed cf-visitor header', () => {
    const request = new Request('http://app.example.com/', {
      headers: { 'cf-visitor': 'not json' },
    });
    expect(httpsRedirect(request)).toBeNull();
  });
});

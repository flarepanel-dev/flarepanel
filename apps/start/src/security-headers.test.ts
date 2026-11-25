import { describe, expect, test } from 'vitest';
import {
  isEmbeddablePath,
  securityHeadersFor,
  withSecurityHeaders,
} from './security-headers';

const page = (path: string) => new Request(`https://dashboard.example${path}`);

describe('security headers', () => {
  test('app pages cannot be framed by other sites', () => {
    const headers = securityHeadersFor('/acme/site/settings/details');
    expect(headers['X-Frame-Options']).toBe('DENY');
    expect(headers['Content-Security-Policy']).toBe("frame-ancestors 'none'");
    expect(headers['Strict-Transport-Security']).toContain('max-age=');
  });

  test('widgets and share links stay embeddable', () => {
    for (const path of ['/widget/realtime', '/share/overview/abc']) {
      expect(isEmbeddablePath(path)).toBe(true);
      const headers = securityHeadersFor(path);
      expect(headers['X-Frame-Options']).toBeUndefined();
      expect(headers['Content-Security-Policy']).toBeUndefined();
      expect(headers['X-Content-Type-Options']).toBe('nosniff');
    }
  });

  test('a header the page set itself is kept', async () => {
    const response = withSecurityHeaders(
      page('/login'),
      new Response('ok', {
        status: 200,
        headers: { 'Referrer-Policy': 'no-referrer', 'x-own': '1' },
      })
    );
    expect(response.headers.get('Referrer-Policy')).toBe('no-referrer');
    expect(response.headers.get('x-own')).toBe('1');
    expect(response.headers.get('X-Frame-Options')).toBe('DENY');
    expect(await response.text()).toBe('ok');
  });
});

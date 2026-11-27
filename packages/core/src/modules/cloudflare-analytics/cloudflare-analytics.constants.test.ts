import { describe, expect, it } from 'bun:test';
import {
  normalizeHostname,
  parseHostnames,
  zCloudflareConnectInput,
} from './cloudflare-analytics.constants';

const ZONE = '0123456789abcdef0123456789abcdef';

describe('connect input', () => {
  it('accepts a token, a zone ID and cleans the hostnames', () => {
    expect(
      zCloudflareConnectInput.parse({
        projectId: 'p1',
        token: ' cfTestToken_0123456789abcdefWXYZ ',
        zoneId: ZONE.toUpperCase(),
        hostnames: ['https://Example.com/', 'www.example.com', 'example.com'],
      })
    ).toEqual({
      projectId: 'p1',
      token: 'cfTestToken_0123456789abcdefWXYZ',
      zoneId: ZONE,
      hostnames: ['example.com', 'www.example.com'],
    });
  });

  it('rejects a malformed zone ID or token', () => {
    expect(
      zCloudflareConnectInput.safeParse({
        projectId: 'p1',
        zoneId: 'example.com',
        hostnames: [],
      }).success
    ).toBe(false);
    expect(
      zCloudflareConnectInput.safeParse({
        projectId: 'p1',
        token: 'short',
        zoneId: ZONE,
        hostnames: [],
      }).success
    ).toBe(false);
  });
});

describe('hostnames', () => {
  it('reduce URLs to hostnames and drop what is not one', () => {
    expect(normalizeHostname('https://Docs.Example.com:8443/x?y')).toBe(
      'docs.example.com'
    );
    expect(normalizeHostname('localhost')).toBeNull();
    expect(parseHostnames('example.com, www.example.com\nnope')).toEqual([
      'example.com',
      'www.example.com',
    ]);
  });
});

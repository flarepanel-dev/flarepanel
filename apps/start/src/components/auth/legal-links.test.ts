import { describe, expect, it } from 'vitest';
import { isFlarePanelCloud } from './legal-links';

describe('isFlarePanelCloud', () => {
  it('is true only on the flarepanel.dev dashboard', () => {
    expect(isFlarePanelCloud('https://dashboard.flarepanel.dev')).toBe(true);
    expect(isFlarePanelCloud('https://analytics.example.com')).toBe(false);
    expect(isFlarePanelCloud('http://localhost:3000')).toBe(false);
    expect(isFlarePanelCloud(undefined)).toBe(false);
  });
});

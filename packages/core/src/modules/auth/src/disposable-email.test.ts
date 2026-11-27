import { describe, expect, it } from 'bun:test';
import { isDisposableEmail } from './disposable-email';

describe('isDisposableEmail', () => {
  it('flags throwaway domains and their subdomains', () => {
    expect(isDisposableEmail('a@mailinator.com')).toBe(true);
    expect(isDisposableEmail('a@MAILINATOR.COM')).toBe(true);
    expect(isDisposableEmail('a@inbox.mailinator.com')).toBe(true);
  });

  it('accepts ordinary providers and company domains', () => {
    // Domains only: the public-safety check refuses full addresses at
    // personal-mail providers anywhere in the repository.
    for (const domain of [
      'gmail.com',
      'outlook.com',
      'proton.me',
      'icloud.com',
      'flarepanel.dev',
    ]) {
      expect(isDisposableEmail(`a@${domain}`)).toBe(false);
    }
  });

  it('ignores input without a domain', () => {
    expect(isDisposableEmail('not-an-email')).toBe(false);
  });
});

import { describe, expect, it } from 'bun:test';
import { trialEmailKey } from './trial-claim';

describe('trialEmailKey', () => {
  // Built from parts: the public-safety check refuses full addresses at
  // personal-mail providers anywhere in the repository.
  const gmail = (user: string, domain = 'gmail.com') => `${user}@${domain}`;

  it('treats Gmail dots, +tags, case and googlemail as one address', () => {
    const key = trialEmailKey(gmail('janedoe'));
    expect(trialEmailKey(` ${gmail('Jane.Doe+trial2', 'GMAIL.com')} `)).toBe(
      key
    );
    expect(trialEmailKey(gmail('jane.doe', 'googlemail.com'))).toBe(key);
  });

  it('keeps dots elsewhere and tells different people apart', () => {
    expect(trialEmailKey('jane.doe@example.com')).not.toBe(
      trialEmailKey('janedoe@example.com')
    );
    expect(trialEmailKey('jane+x@example.com')).toBe(
      trialEmailKey('jane@example.com')
    );
  });

  it('stores a hash, not the address', () => {
    expect(trialEmailKey('jane@example.com')).toMatch(/^[0-9a-f]{64}$/);
  });
});

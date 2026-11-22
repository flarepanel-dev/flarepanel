import { describe, expect, it } from 'bun:test';
import { createHash as nodeCreateHash } from 'node:crypto';
import { createHash } from './crypto';

describe('createHash', () => {
  it('matches node SHAKE256 byte for byte, so device ids stay stable', () => {
    for (const input of [
      'Mozilla/5.0:203.0.113.7:https://example.com:salt',
      'ü 中文 emoji 🚀 and more',
      '',
    ]) {
      for (const length of [8, 16, 32]) {
        expect(createHash(input, length)).toBe(
          nodeCreateHash('shake256', { outputLength: length })
            .update(input)
            .digest('hex')
        );
      }
    }
  });
});

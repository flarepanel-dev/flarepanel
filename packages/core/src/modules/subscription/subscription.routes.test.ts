import { expect, test } from 'bun:test';
import { isSignatureFailure } from './subscription.routes';

// The messages the Polar SDK (standardwebhooks) throws, captured from the real
// library: each is a bad or missing signature and must answer 401, not 500.
test('a forged, unsigned or unverifiable webhook is a signature failure', () => {
  for (const message of [
    'No matching signature found',
    'Missing required headers',
    "Secret can't be empty.",
    'Message timestamp too old',
  ]) {
    expect(isSignatureFailure(new Error(message))).toBe(true);
  }
});

test('a real processing failure is not', () => {
  expect(isSignatureFailure(new Error('D1 is unavailable'))).toBe(false);
  expect(isSignatureFailure('not an error')).toBe(false);
});

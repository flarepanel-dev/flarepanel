import { describe, expect, test } from 'vitest';
import { Webhook } from 'standardwebhooks';
import { validatePolarEvent } from './polar.js';

// Polar issues Standard Webhooks secrets: `whsec_` + a base64 key.
const key = Buffer.from('0123456789abcdef0123456789abcdef').toString('base64');
const secret = `whsec_${key}`;

function signed(payload: string, withSecret = secret) {
  const id = 'msg_test';
  const timestamp = new Date();
  return {
    'webhook-id': id,
    'webhook-timestamp': String(Math.floor(timestamp.getTime() / 1000)),
    'webhook-signature': new Webhook(withSecret).sign(id, timestamp, payload),
  };
}

describe('validatePolarEvent with a whsec_ secret', () => {
  test('a correctly signed body passes verification and reaches parsing', async () => {
    const body = JSON.stringify({ type: 'not.a.real.event', data: {} });
    // Verification passes; the SDK then rejects the unknown type while parsing.
    await expect(
      validatePolarEvent(body, signed(body), secret)
    ).rejects.toThrow(/parse|Unknown event/i);
  });

  test('a body signed with another key fails the signature check', async () => {
    const body = JSON.stringify({ type: 'subscription.updated', data: {} });
    const other = `whsec_${Buffer.from('another-key-another-key-another!').toString('base64')}`;
    await expect(
      validatePolarEvent(body, signed(body, other), secret)
    ).rejects.toThrow(/signature/i);
  });

  test('a tampered body fails the signature check', async () => {
    const body = JSON.stringify({ type: 'subscription.updated', data: {} });
    const headers = signed(body);
    await expect(
      validatePolarEvent(`${body} `, headers, secret)
    ).rejects.toThrow(/signature/i);
  });
});

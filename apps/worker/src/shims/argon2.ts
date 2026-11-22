/**
 * `@node-rs/argon2` for Workers, in pure JavaScript (@noble/hashes): Workers
 * cannot compile WebAssembly at runtime, and a native addon cannot load. Same
 * algorithm (argon2id), defaults and PHC string format, so hashes made on Bun
 * verify here and the other way around (~160 ms per hash at the defaults).
 */
import { argon2id } from '@noble/hashes/argon2.js';

const DEFAULTS = {
  memoryCost: 19_456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
};
const SALT_BYTES = 16;
const VERSION = 19;

export interface Options {
  memoryCost?: number;
  timeCost?: number;
  outputLen?: number;
  parallelism?: number;
}

function toB64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/=+$/, '');
}

function fromB64(text: string): Uint8Array {
  const padded = text + '='.repeat((4 - (text.length % 4)) % 4);
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
}

function derive(
  password: string,
  salt: Uint8Array,
  o: Required<Options>
): Uint8Array {
  return argon2id(password, salt, {
    t: o.timeCost,
    m: o.memoryCost,
    p: o.parallelism,
    dkLen: o.outputLen,
  });
}

export async function hash(
  password: string,
  options: Options = {}
): Promise<string> {
  const o = { ...DEFAULTS, ...options };
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const digest = derive(password, salt, o);
  return `$argon2id$v=${VERSION}$m=${o.memoryCost},t=${o.timeCost},p=${o.parallelism}$${toB64(salt)}$${toB64(digest)}`;
}

const PHC =
  /^\$argon2id\$v=(\d+)\$m=(\d+),t=(\d+),p=(\d+)\$([A-Za-z0-9+/]+)\$([A-Za-z0-9+/]+)$/;

export async function verify(
  hashed: string,
  password: string
): Promise<boolean> {
  const match = PHC.exec(hashed);
  if (!match || Number(match[1]) !== VERSION) {
    return false;
  }
  const expected = fromB64(match[6] ?? '');
  const actual = derive(password, fromB64(match[5] ?? ''), {
    memoryCost: Number(match[2]),
    timeCost: Number(match[3]),
    parallelism: Number(match[4]),
    outputLen: expected.length,
  });
  if (actual.length !== expected.length) {
    return false;
  }
  let difference = 0;
  for (let i = 0; i < actual.length; i++) {
    difference |= (actual[i] ?? 0) ^ (expected[i] ?? 0);
  }
  return difference === 0;
}

export default { hash, verify };

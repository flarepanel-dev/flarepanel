import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { shake256 } from '@noble/hashes/sha3.js';
import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils.js';

export function generateSalt() {
  return randomBytes(16).toString('hex');
}

/**
 * Has a password or a secret with a password hashing algorithm (scrypt)
 * @param {string} password
 * @returns {string} The salt+hash
 */
export async function hashPassword(
  password: string,
  keyLength = 32
): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = generateSalt();
    scrypt(password, salt, keyLength, (err, derivedKey) => {
      if (err) {
        reject(err);
      }
      resolve(`${salt}.${derivedKey.toString('hex')}`);
    });
  });
}

/**
 * Compare a plain text password with a salt+hash password
 * @param {string} password The plain text password
 * @param {string} hash The hash+salt to check against
 * @returns {boolean}
 */
export async function verifyPassword(
  password: string,
  hash: string,
  keyLength = 32
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [salt, hashKey] = hash.split('.');
    // we need to pass buffer values to timingSafeEqual
    const hashKeyBuff = Buffer.from(hashKey!, 'hex');
    scrypt(password, salt!, keyLength, (err, derivedKey) => {
      if (err) {
        reject(err);
      }
      resolve(
        timingSafeEqual(new Uint8Array(hashKeyBuff), new Uint8Array(derivedKey))
      );
    });
  });
}

/**
 * SHAKE256 truncated to `len` bytes, as hex. Pure JS (@noble/hashes) because
 * workerd's node:crypto has no SHAKE; the output matches node's byte for byte.
 */
export function createHash(data: string, len: number) {
  return bytesToHex(shake256(utf8ToBytes(data), { dkLen: len }));
}

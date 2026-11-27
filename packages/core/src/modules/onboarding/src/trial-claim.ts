// One free trial per email address. The address is normalised (lower case,
// no +tag; for Gmail and Googlemail no dots and one domain) so that variants
// of one inbox count as one, and only a SHA-256 of it is stored.
import { createHash } from 'node:crypto';

const GMAIL_DOMAINS = new Set(['gmail.com', 'googlemail.com']);

export function trialEmailKey(email: string): string {
  const address = email.trim().toLowerCase();
  const at = address.lastIndexOf('@');
  const local = at > 0 ? address.slice(0, at) : address;
  let domain = at > 0 ? address.slice(at + 1) : '';
  let user = local.split('+')[0] ?? local;
  if (GMAIL_DOMAINS.has(domain)) {
    domain = 'gmail.com';
    user = user.replaceAll('.', '');
  }
  return createHash('sha256').update(`${user}@${domain}`).digest('hex');
}

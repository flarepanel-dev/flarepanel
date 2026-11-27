// Throwaway inboxes are refused at sign-up on FlarePanel Cloud, where each new
// address could otherwise start a free trial.
import { DISPOSABLE_DOMAINS_TEXT } from './disposable-domains.generated';

let domains: Set<string> | undefined;

/** True when the address is at a known disposable domain or one of its subdomains. */
export function isDisposableEmail(email: string): boolean {
  domains ??= new Set(DISPOSABLE_DOMAINS_TEXT.split('\n'));
  const at = email.lastIndexOf('@');
  if (at < 0) {
    return false;
  }
  const parts = email
    .slice(at + 1)
    .trim()
    .toLowerCase()
    .replace(/\.$/, '')
    .split('.');
  for (let i = 0; i < parts.length - 1; i += 1) {
    if (domains.has(parts.slice(i).join('.'))) {
      return true;
    }
  }
  return false;
}

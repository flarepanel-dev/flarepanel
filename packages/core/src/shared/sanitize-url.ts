// Request URLs are logged as plain strings, so key-based redaction never looks
// inside them, and some routes take credentials in the query (the MCP endpoint
// accepts `?token=`). The key list is shared so the logger's redaction and the
// URL filter match the same names.

// Lowercased substring match, so 'token' covers accessToken, refresh_token, etc.
export const SENSITIVE_KEY_PATTERNS = [
  'password',
  'passwd',
  'pwd',
  'token',
  'secret',
  'authorization',
  'apikey',
  'accesskey',
  'privatekey',
  'serviceaccount',
  'cookie',
  'bearer',
  'credential',
  'salt',
  'signature',
  'ip',
  'email',
  'firstname',
  'lastname',
  'surname',
] as const;

export const REDACTED = '[REDACTED]';

const PLUS_AS_SPACE = /\+/g;

export function isSensitiveKey(key: string): boolean {
  const lowered = key.toLowerCase();
  return SENSITIVE_KEY_PATTERNS.some((pattern) => lowered.includes(pattern));
}

/**
 * Replaces the values of sensitive query parameters, keeping everything else.
 * The query is rebuilt from the raw text, not URLSearchParams, so untouched
 * values keep their encoding.
 */
export function sanitizeUrlQuery(url: string): string {
  const queryIndex = url.indexOf('?');
  if (queryIndex === -1) {
    return url;
  }

  const query = url.slice(queryIndex + 1);
  if (query === '') {
    return url;
  }

  const sanitized = query
    .split('&')
    .map((param) => {
      const equalsIndex = param.indexOf('=');
      const rawName = equalsIndex === -1 ? param : param.slice(0, equalsIndex);
      let name = rawName;
      try {
        name = decodeURIComponent(rawName.replace(PLUS_AS_SPACE, ' '));
      } catch {
        // Malformed percent-encoding — match on the raw name instead.
      }
      return isSensitiveKey(name) ? `${rawName}=${REDACTED}` : param;
    })
    .join('&');

  return `${url.slice(0, queryIndex)}?${sanitized}`;
}

/** Redacts sensitive keys and URL query values, as every logger does. */
const MAX_REDACT_DEPTH = 5;

export function redactSensitive(value: unknown, depth = 0): unknown {
  if (value instanceof Error) {
    return {
      ...value,
      message: value.message,
      stack: value.stack,
      name: value.name,
    };
  }
  if (
    depth >= MAX_REDACT_DEPTH ||
    value === null ||
    typeof value !== 'object'
  ) {
    return value;
  }
  if (value instanceof Date) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((v) => redactSensitive(v, depth + 1));
  }

  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    if (isSensitiveKey(key)) {
      result[key] = REDACTED;
    } else if (key.toLowerCase().includes('url') && typeof val === 'string') {
      // Backstop for anything that logs a raw URL: the credentials sit in the
      // query, not the key.
      result[key] = sanitizeUrlQuery(val);
    } else {
      result[key] = redactSensitive(val, depth + 1);
    }
  }
  return result;
}

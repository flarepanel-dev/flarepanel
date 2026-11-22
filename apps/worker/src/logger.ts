import type { Logger } from '@flarepanel/core';

const LEVELS = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'] as const;
type Level = (typeof LEVELS)[number];

/**
 * JSON lines on the console: Workers Logs captures them. pino-style calls:
 * `logger.info({ field }, 'message')` or `logger.info('message')`.
 */
export function createConsoleLogger(
  level: string,
  bindings: Record<string, unknown> = {}
): Logger {
  const minimum = Math.max(0, LEVELS.indexOf(level as Level));
  const write =
    (name: Level) =>
    (first?: unknown, second?: unknown, ...rest: unknown[]) => {
      if (LEVELS.indexOf(name) < minimum) {
        return;
      }
      const fields =
        typeof first === 'object' && first !== null
          ? first instanceof Error
            ? { err: { message: first.message, stack: first.stack } }
            : (first as Record<string, unknown>)
          : {};
      const message = typeof first === 'string' ? first : second;
      const line = JSON.stringify({
        level: name,
        time: Date.now(),
        ...bindings,
        ...serialize(fields),
        msg: message,
        ...(rest.length ? { args: rest } : {}),
      });
      (name === 'error' || name === 'fatal' ? console.error : console.log)(
        line
      );
    };

  const logger = {
    trace: write('trace'),
    debug: write('debug'),
    info: write('info'),
    warn: write('warn'),
    error: write('error'),
    fatal: write('fatal'),
    child: (more: Record<string, unknown>) =>
      createConsoleLogger(level, { ...bindings, ...more }),
  };
  return logger as unknown as Logger;
}

function serialize(fields: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields)) {
    out[key] =
      value instanceof Error
        ? { message: value.message, name: value.name, stack: value.stack }
        : value;
  }
  return out;
}

/**
 * pino for Workers: the same call shape, written as JSON lines to the console
 * (Workers Logs). Transports, destinations and multistreams are no-ops.
 */
import { createConsoleLogger } from '../logger';

interface PinoOptions {
  level?: string;
  name?: string;
  base?: Record<string, unknown> | null;
}

function pino(options: PinoOptions = {}) {
  const logger = createConsoleLogger(options.level ?? 'info', {
    ...(options.name ? { name: options.name } : {}),
    ...(options.base ?? {}),
  }) as unknown as Record<string, unknown>;
  logger.level = options.level ?? 'info';
  logger.flush = () => undefined;
  logger.isLevelEnabled = () => true;
  return logger;
}

pino.stdTimeFunctions = {
  epochTime: () => `,"time":${Date.now()}`,
  isoTime: () => `,"time":"${new Date().toISOString()}"`,
  unixTime: () => `,"time":${Math.round(Date.now() / 1000)}`,
  nullTime: () => '',
};
pino.stdSerializers = {
  err: (err: Error) => ({
    type: err.name,
    message: err.message,
    stack: err.stack,
  }),
  req: (req: unknown) => req,
  res: (res: unknown) => res,
};
pino.destination = () => ({ write: () => true });
pino.multistream = () => ({ write: () => true });
pino.transport = () => ({ write: () => true });
pino.levels = {
  values: { trace: 10, debug: 20, info: 30, warn: 40, error: 50, fatal: 60 },
  labels: {
    10: 'trace',
    20: 'debug',
    30: 'info',
    40: 'warn',
    50: 'error',
    60: 'fatal',
  },
};

export default pino;
export { pino };
export const stdTimeFunctions = pino.stdTimeFunctions;
export const stdSerializers = pino.stdSerializers;

import { UnavailableClass } from './unavailable';

export class Kafka extends UnavailableClass {}
export const logLevel = { NOTHING: 0, ERROR: 1, WARN: 2, INFO: 4, DEBUG: 5 };
export const CompressionTypes = {
  None: 0,
  GZIP: 1,
  Snappy: 2,
  LZ4: 3,
  ZSTD: 4,
};
export const CompressionCodecs: Record<number, unknown> = {};
export const Partitioners = {
  DefaultPartitioner: () => () => 0,
  LegacyPartitioner: () => () => 0,
};
export class KafkaJSError extends Error {}
export class KafkaJSNonRetriableError extends KafkaJSError {}
export class KafkaJSProtocolError extends KafkaJSError {}
export class KafkaJSNumberOfRetriesExceeded extends KafkaJSError {}
export class KafkaJSConnectionError extends KafkaJSError {}
export class KafkaJSRequestTimeoutError extends KafkaJSError {}

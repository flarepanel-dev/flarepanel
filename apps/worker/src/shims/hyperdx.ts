// OpenTelemetry export is off on Workers (Cloudflare observability covers it).
export function init(): void {}
export function initSDK(): void {}
export function getPinoMixinFunction() {
  return () => ({});
}
export function getPinoTransport() {
  return undefined;
}
export function shutdown(): Promise<void> {
  return Promise.resolve();
}

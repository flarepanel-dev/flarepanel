import { a as reactExports } from "./worker-entry-C5kSRogq.js";
import { aW as op } from "./router-gBnYxPzA.js";
function trackFunnel(name, properties) {
  op.track(name, properties);
}
function useSecondsOnStep() {
  const mountedAt = reactExports.useRef(Date.now());
  return reactExports.useCallback(
    () => Math.round((Date.now() - mountedAt.current) / 1e3),
    []
  );
}
function failureReason(error) {
  const message = error instanceof Error ? error.message : String(error);
  return message.slice(0, 80);
}
export {
  failureReason as f,
  trackFunnel as t,
  useSecondsOnStep as u
};
//# sourceMappingURL=funnel-tracking-CMJu0A5n.js.map

import { B as createServerRpc, A as createServerFn, D as setCookie, C as getCookies } from "./worker-entry-C5kSRogq.js";
import { o as object, n as number, s as string, d as _enum, p as pick } from "./pick-CfnSzKDx.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
const VALID_COOKIES = ["ui-theme", "chartType", "range", "feedback-prompt-seen", "last-auth-provider"];
const setCookieFn_createServerFn_handler = createServerRpc("3e3c673b0348b9ed82af8390c66cb4ba9717a542ee7acc77356125afd2e50ede", (opts, signal) => {
  return setCookieFn.__executeServer(opts, signal);
});
const setCookieFn = createServerFn({
  method: "POST"
}).inputValidator(object({
  key: _enum(VALID_COOKIES),
  value: string(),
  maxAge: number().optional()
})).handler(setCookieFn_createServerFn_handler, ({
  data: {
    key,
    value,
    maxAge
  }
}) => {
  if (!VALID_COOKIES.includes(key)) {
    return;
  }
  const cookieMaxAge = maxAge ?? 60 * 60 * 24 * 365 * 10;
  setCookie(key, value, {
    maxAge: cookieMaxAge,
    path: "/",
    expires: new Date(Date.now() + cookieMaxAge)
  });
});
const getCookiesFn_createServerFn_handler = createServerRpc("4d23862dd62ae905ab1ff6614a6b57c1cbe04135645b43eb1f8815fd94a96b98", (opts, signal) => {
  return getCookiesFn.__executeServer(opts, signal);
});
const getCookiesFn = createServerFn({
  method: "GET"
}).handler(getCookiesFn_createServerFn_handler, () => pick(VALID_COOKIES, getCookies()));
export {
  getCookiesFn_createServerFn_handler,
  setCookieFn_createServerFn_handler
};
//# sourceMappingURL=use-cookie-store-Bgob8mWh.js.map

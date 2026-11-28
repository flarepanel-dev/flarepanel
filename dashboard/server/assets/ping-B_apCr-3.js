import { o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { d as cn, M as Badge } from "./router-gBnYxPzA.js";
function Ping({ className }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("size-2 rounded-full bg-live", className) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: cn(
          "absolute inset-0 size-2 animate-ping rounded-full bg-live",
          className
        )
      }
    )
  ] });
}
function PingBadge({
  children,
  className
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: cn("flex gap-1", className), variant: "outline", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Ping, {}),
    children
  ] });
}
export {
  Ping as P,
  PingBadge as a
};
//# sourceMappingURL=ping-B_apCr-3.js.map

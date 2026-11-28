import { o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { ao as Route, a6 as useEmbedTheme, a7 as MissingWidgetLink, a8 as useMounted, ap as SAMPLE_BADGE_VISITORS, a as useTRPC, j as useQuery, N as Users, a4 as useNumber } from "./router-gBnYxPzA.js";
import { L as LogoSquare } from "./logo-BXfRcVLd.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "./pick-CfnSzKDx.js";
import "fs";
import "util";
import "stream";
import "zlib";
import "assert";
import "buffer";
const BADGE_PLATE = "#16171c";
function RouteComponent() {
  const {
    shareId,
    color,
    demo,
    theme
  } = Route.useSearch();
  useEmbedTheme(theme);
  if (demo) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(DemoBadge, { color });
  }
  if (!shareId) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(MissingWidgetLink, {});
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(LiveBadge, { color, shareId });
}
function DemoBadge({
  color
}) {
  const mounted = useMounted();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(BadgeWidget, { color, isLoading: !mounted, visitors: SAMPLE_BADGE_VISITORS });
}
function LiveBadge({
  shareId,
  color
}) {
  const trpc = useTRPC();
  const {
    data,
    isLoading
  } = useQuery(trpc.widget.badge.queryOptions({
    shareId
  }));
  return /* @__PURE__ */ jsxRuntimeExports.jsx(BadgeWidget, { color, isLoading, visitors: data?.visitors ?? 0 });
}
function BadgeWidget({
  visitors,
  isLoading,
  color
}) {
  const number = useNumber();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "group center-center absolute inset-0 inline-flex items-center gap-3 rounded-lg px-2",
      style: {
        backgroundColor: color || BADGE_PLATE
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LogoSquare, { className: "h-8 w-8" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "-mt-px flex min-w-0 flex-1 flex-col items-start gap-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-3xs text-white/80 uppercase tracking-wide", children: "ANALYTICS FROM" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-white", children: "FlarePanel" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col center-center flex-shrink-0 gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "size-4 text-white" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-sm text-white tabular-nums", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "..." }) : number.short(visitors) })
        ] })
      ]
    }
  );
}
export {
  RouteComponent as component
};
//# sourceMappingURL=badge-CmGxM-hN.js.map

import { o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { W as WidgetHead, d as WidgetTitle } from "./overview-widget-q0VDaTtp.js";
import { E as EmptyState } from "./router-gBnYxPzA.js";
import { b as Widget } from "./widget-D7PGEeO1.js";
import { R as Route } from "./route-Cx_TL1Oz.js";
const PopularRoutes = ({ data }) => {
  const max = data.length > 0 ? Math.max(...data.map((item) => item.count)) : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Widget, { className: "w-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetTitle, { children: "Most visited pages" }) }),
    data.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      EmptyState,
      {
        icon: Route,
        title: "No pages visited yet",
        variant: "inline"
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-1 p-1", children: data.slice(0, 5).map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative px-3 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "absolute top-0 bottom-0 left-0 rounded bg-def-200",
          style: {
            width: `${item.count / max * 100}%`
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: item.path }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: item.count })
      ] })
    ] }, item.path)) })
  ] });
};
export {
  PopularRoutes as P
};
//# sourceMappingURL=popular-routes-o-BP_rMn.js.map

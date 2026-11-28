import { o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { W as WidgetHead, d as WidgetTitle } from "./overview-widget-q0VDaTtp.js";
import { E as EmptyState, eC as Zap } from "./router-gBnYxPzA.js";
import { b as Widget } from "./widget-D7PGEeO1.js";
const MostEvents = ({ data }) => {
  const max = data.length > 0 ? Math.max(...data.map((item) => item.count)) : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Widget, { className: "w-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetTitle, { children: "Popular events" }) }),
    data.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: Zap, title: "No events yet", variant: "inline" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-1 p-1", children: data.slice(0, 5).map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative px-3 py-2", children: [
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
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: item.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: item.count })
      ] })
    ] }, item.name)) })
  ] });
};
export {
  MostEvents as M
};
//# sourceMappingURL=most-events-DZTLKeUn.js.map

import { o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { d as cn } from "./router-gBnYxPzA.js";
function PageHeader({
  title,
  description,
  className,
  children,
  actions
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("col md:row gap-2", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-semibold text-xl", children: title }),
      description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-base text-muted-foreground", children: description }),
      children
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "row flex-wrap gap-2", children: actions })
  ] });
}
export {
  PageHeader as P
};
//# sourceMappingURL=page-header-DbGieVLw.js.map

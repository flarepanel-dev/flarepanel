import { o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { d as cn } from "./router-gBnYxPzA.js";
function WidgetHead({ children, className }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: cn(
        "border-border border-b p-4 [&_.title]:whitespace-nowrap [&_.title]:font-semibold [&_.title]:text-lg",
        className
      ),
      children
    }
  );
}
function WidgetTitle({
  children,
  className,
  icon: Icon
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: cn(
        "relative flex items-center gap-4",
        className,
        !!Icon && "pl-12"
      ),
      children: [
        Icon && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-0 rounded-lg bg-def-200 p-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 18 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "title", children })
      ]
    }
  );
}
function WidgetBody({ children, className }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("p-4", className), children });
}
function Widget({ children, className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("card self-start", className), ...props, children });
}
export {
  WidgetBody as W,
  WidgetHead as a,
  Widget as b,
  WidgetTitle as c
};
//# sourceMappingURL=widget-D7PGEeO1.js.map

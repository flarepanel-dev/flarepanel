import { o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { o as DropdownMenuItem, d as cn, D as DropdownMenu, m as DropdownMenuTrigger, dJ as Ellipsis, n as DropdownMenuContent, z as DropdownMenuGroup } from "./router-gBnYxPzA.js";
function Card({ children, hover, className }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: cn(
        "card relative",
        hover && "transition-all hover:-translate-y-0.5",
        className
      ),
      children
    }
  );
}
function CardActions({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-2 right-2 z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { className: "flex h-8 w-8 items-center justify-center rounded hover:border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Ellipsis, { size: 16 }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuContent, { align: "end", className: "w-[200px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuGroup, { children }) })
  ] }) });
}
const CardActionsItem = DropdownMenuItem;
export {
  Card as C,
  CardActions as a,
  CardActionsItem as b
};
//# sourceMappingURL=card-cYnxdFV_.js.map

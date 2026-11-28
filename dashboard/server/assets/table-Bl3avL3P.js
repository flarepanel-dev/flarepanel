import { o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { d as cn } from "./router-gBnYxPzA.js";
function TableButtons({
  children,
  className
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("row mb-2 flex-wrap items-center gap-2", className), children });
}
function Table({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "relative w-full overflow-x-auto",
      "data-slot": "table-container",
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "table",
        {
          className: cn("w-full caption-bottom bg-card", className),
          "data-slot": "table",
          ...props
        }
      )
    }
  );
}
function TableHeader({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "thead",
    {
      className: cn("[&_tr]:border-b", className),
      "data-slot": "table-header",
      ...props
    }
  );
}
function TableBody({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "tbody",
    {
      className: cn("[&_tr:last-child]:border-0", className),
      "data-slot": "table-body",
      ...props
    }
  );
}
function TableRow({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "tr",
    {
      className: cn(
        "group/row border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        className
      ),
      "data-slot": "table-row",
      ...props
    }
  );
}
function TableHead({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "th",
    {
      className: cn(
        "h-10 whitespace-nowrap px-4 text-left align-middle font-medium text-3xs text-foreground uppercase tracking-wider [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      ),
      "data-slot": "table-head",
      ...props
    }
  );
}
function TableCell({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "td",
    {
      className: cn(
        "max-w-94 whitespace-nowrap p-2 px-4 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      ),
      "data-slot": "table-cell",
      ...props
    }
  );
}
export {
  Table as T,
  TableHeader as a,
  TableRow as b,
  TableHead as c,
  TableBody as d,
  TableCell as e,
  TableButtons as f
};
//# sourceMappingURL=table-Bl3avL3P.js.map

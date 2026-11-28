import { o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { u as useIsFetching } from "./useIsFetching-BWA9Maly.js";
import { c as createLucideIcon, d as cn, B as Button, cn as ChevronLeft, co as ChevronRight } from "./router-gBnYxPzA.js";
const __iconNode$1 = [
  ["path", { d: "m11 17-5-5 5-5", key: "13zhaf" }],
  ["path", { d: "m18 17-5-5 5-5", key: "h8a8et" }]
];
const ChevronsLeft = createLucideIcon("chevrons-left", __iconNode$1);
const __iconNode = [
  ["path", { d: "m6 17 5-5-5-5", key: "xnjwq" }],
  ["path", { d: "m13 17 5-5-5-5", key: "17xmmf" }]
];
const ChevronsRight = createLucideIcon("chevrons-right", __iconNode);
function Pagination({
  canNextPage,
  canPreviousPage,
  pageIndex,
  firstPage,
  lastPage,
  nextPage,
  previousPage,
  className
}) {
  const isFetching = useIsFetching() > 0;
  const isLoading = isFetching;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: cn(
        "flex select-none items-center justify-end gap-1",
        className
      ),
      children: [
        typeof firstPage === "function" && /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            className: "max-sm:hidden",
            disabled: !canPreviousPage,
            icon: ChevronsLeft,
            onClick: () => firstPage?.(),
            size: "icon",
            variant: "outline"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            disabled: !canPreviousPage,
            icon: ChevronLeft,
            onClick: () => previousPage(),
            size: "icon",
            variant: "outline"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            className: cn(typeof pageIndex === "string" && "w-auto min-w-8 px-2"),
            disabled: true,
            loading: isLoading,
            loadingAbsolute: true,
            loadingType: "ring",
            size: "icon",
            variant: "outline",
            children: typeof pageIndex === "number" ? pageIndex + 1 : pageIndex
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            disabled: !canNextPage,
            icon: ChevronRight,
            onClick: () => nextPage(),
            size: "icon",
            variant: "outline"
          }
        ),
        typeof lastPage === "function" && /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            className: "max-sm:hidden",
            disabled: !canNextPage,
            icon: ChevronsRight,
            onClick: () => lastPage?.(),
            size: "icon",
            variant: "outline"
          }
        )
      ]
    }
  );
}
export {
  Pagination as P
};
//# sourceMappingURL=pagination-Dj6_PitL.js.map

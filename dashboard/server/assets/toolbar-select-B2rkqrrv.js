import { o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { D as DropdownMenu, m as DropdownMenuTrigger, B as Button, d as cn, n as DropdownMenuContent, y as DropdownMenuLabel, cb as CommandShortcut, p as DropdownMenuSeparator, z as DropdownMenuGroup, o as DropdownMenuItem, s as DropdownMenuShortcut, C as Check, h5 as DropdownMenuCheckboxItem } from "./router-gBnYxPzA.js";
function ToolbarSelect({
  icon,
  label,
  value,
  options,
  onChange,
  responsive,
  className
}) {
  const selected = options.find((option) => option.value === value);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        "aria-label": `${label}: ${selected?.label ?? "none"}`,
        className: cn("justify-start", className),
        icon,
        responsive,
        variant: "outline",
        children: selected?.label ?? label
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align: "start", className: "w-56", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuLabel, { className: "row items-center justify-between gap-4", children: [
        label,
        selected && /* @__PURE__ */ jsxRuntimeExports.jsx(CommandShortcut, { children: selected.label })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuSeparator, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuGroup, { children: options.map((option) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        DropdownMenuItem,
        {
          onClick: () => onChange(option.value),
          children: [
            option.label,
            option.value === value && /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuShortcut, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-4" }) })
          ]
        },
        option.value
      )) })
    ] })
  ] });
}
function ToolbarMultiSelect({
  icon,
  label,
  options,
  selected,
  onChange,
  emptyText = "Nothing to pick",
  responsive,
  className
}) {
  const hasSelection = selected.length > 0;
  const toggle = (value, checked) => onChange(
    checked ? [...selected, value] : selected.filter((current) => current !== value)
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Button,
      {
        "aria-label": label,
        className: cn("justify-start", className),
        icon,
        responsive,
        variant: "outline",
        children: [
          label,
          hasSelection && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 rounded bg-def-200 px-1.5 font-mono text-2xs", children: selected.length })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align: "start", className: "w-64", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuLabel, { className: "row items-center justify-between gap-4", children: [
        label,
        hasSelection && /* @__PURE__ */ jsxRuntimeExports.jsxs(CommandShortcut, { children: [
          selected.length,
          " selected"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuSeparator, {}),
      options.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-2 py-1.5 text-muted-foreground text-sm", children: emptyText }),
      options.map((option) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        DropdownMenuCheckboxItem,
        {
          checked: selected.includes(option.value),
          onCheckedChange: (checked) => toggle(option.value, checked),
          onSelect: (event) => event.preventDefault(),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "min-w-0 flex-1 truncate", children: option.label ?? option.value }),
            option.count !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 font-mono text-2xs text-muted-foreground", children: option.count })
          ]
        },
        option.value
      ))
    ] })
  ] });
}
export {
  ToolbarSelect as T,
  ToolbarMultiSelect as a
};
//# sourceMappingURL=toolbar-select-B2rkqrrv.js.map

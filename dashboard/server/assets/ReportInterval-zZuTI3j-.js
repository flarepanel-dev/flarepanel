import { o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { D as DropdownMenu, m as DropdownMenuTrigger, B as Button, ca as Clock, d as cn, n as DropdownMenuContent, y as DropdownMenuLabel, cb as CommandShortcut, p as DropdownMenuSeparator, z as DropdownMenuGroup, o as DropdownMenuItem, s as DropdownMenuShortcut, cc as isMinuteIntervalEnabledByRange, cd as isHourIntervalEnabledByRange } from "./router-gBnYxPzA.js";
import { d as differenceInDays } from "./differenceInDays-liXHUvyd.js";
function ReportInterval({
  className,
  variant = "outline",
  size,
  interval,
  onChange,
  chartType,
  range,
  startDate,
  endDate
}) {
  if (chartType !== "linear" && chartType !== "histogram" && chartType !== "area" && chartType !== "metric" && chartType !== "retention" && chartType !== "conversion") {
    return null;
  }
  let isHourIntervalEnabled = isHourIntervalEnabledByRange(range);
  if (startDate && endDate && range === "custom") {
    isHourIntervalEnabled = differenceInDays(endDate, startDate) <= 4;
  }
  const items = [
    {
      value: "minute",
      label: "Minute",
      disabled: !isMinuteIntervalEnabledByRange(range)
    },
    {
      value: "hour",
      label: "Hour",
      disabled: !isHourIntervalEnabled
    },
    {
      value: "day",
      label: "Day"
    },
    {
      value: "week",
      label: "Week",
      disabled: range === "today" || range === "lastHour" || range === "last24h" || range === "30min" || range === "7d"
    },
    {
      value: "month",
      label: "Month",
      disabled: range === "today" || range === "lastHour" || range === "last24h" || range === "30min"
    }
  ];
  const selectedItem = items.find((item) => item.value === interval);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        "aria-label": `Interval: ${selectedItem?.label ?? "none"}`,
        className: cn("justify-start", className),
        icon: Clock,
        responsive: true,
        size,
        variant,
        children: items.find((item) => item.value === interval)?.label || "Interval"
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { className: "w-56", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuLabel, { className: "row items-center justify-between", children: [
        "Select interval",
        !!selectedItem && /* @__PURE__ */ jsxRuntimeExports.jsx(CommandShortcut, { children: selectedItem?.label })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuSeparator, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuGroup, { children: items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        DropdownMenuItem,
        {
          disabled: item.disabled,
          onClick: () => onChange(item.value),
          children: [
            item.label,
            item.value === interval && /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuShortcut, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "size-4" }) })
          ]
        },
        item.value
      )) })
    ] })
  ] });
}
export {
  ReportInterval as R
};
//# sourceMappingURL=ReportInterval-zZuTI3j-.js.map

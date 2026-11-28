import { a as reactExports, o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { H as pushModal, d as cn, c3 as RotateCcw, F as Funnel, er as DeltaChip, S as SerieIcon } from "./router-gBnYxPzA.js";
function formatWindowKind(windowKind) {
  switch (windowKind) {
    case "yesterday":
      return "Yesterday";
    case "rolling_7d":
      return "7 Days";
    case "rolling_30d":
      return "30 Days";
  }
  return windowKind;
}
function InsightCard({
  insight,
  className,
  onFilter
}) {
  const payload = insight.payload;
  const dimensions = payload?.dimensions;
  const availableMetrics = Object.entries(payload?.metrics ?? {});
  const [metricIndex, setMetricIndex] = reactExports.useState(
    availableMetrics.findIndex(([key]) => key === payload?.primaryMetric)
  );
  const currentMetricKey = availableMetrics[metricIndex][0];
  const currentMetricEntry = availableMetrics[metricIndex][1];
  const metricUnit = currentMetricEntry?.unit;
  const currentValue = currentMetricEntry?.current ?? null;
  const compareValue = currentMetricEntry?.compare ?? null;
  const direction = currentMetricEntry?.direction ?? "flat";
  const isIncrease = direction === "up";
  const isDecrease = direction === "down";
  const deltaText = metricUnit === "ratio" ? `${Math.abs((currentMetricEntry?.delta ?? 0) * 100).toFixed(1)}pp` : `${Math.abs((currentMetricEntry?.changePct ?? 0) * 100).toFixed(1)}%`;
  const formatValue = (value) => {
    if (value == null) {
      return "-";
    }
    if (metricUnit === "ratio") {
      return `${(value * 100).toFixed(1)}%`;
    }
    return Math.round(value).toLocaleString();
  };
  const metricKeyToLabel = (key) => key === "share" ? "Share" : key === "pageviews" ? "Pageviews" : "Sessions";
  const metricLabel = metricKeyToLabel(currentMetricKey);
  const renderTitle = () => {
    if (dimensions[0]?.key === "country" || dimensions[0]?.key === "referrer_name" || dimensions[0]?.key === "device") {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2 capitalize", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SerieIcon, { name: dimensions[0]?.value }),
        " ",
        insight.displayName
      ] });
    }
    if (insight.displayName.startsWith("http")) {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          SerieIcon,
          {
            name: dimensions[0]?.displayName ?? dimensions[0]?.value
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "line-clamp-2", children: dimensions[1]?.displayName })
      ] });
    }
    return insight.displayName;
  };
  const openDetails = () => pushModal("InsightDetails", { insight });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: cn(
        "card group/card flex h-full cursor-pointer flex-col p-3 transition-colors hover:bg-def-50",
        className
      ),
      onClick: openDetails,
      onKeyDown: (event) => {
        if (event.target !== event.currentTarget) {
          return;
        }
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openDetails();
        }
      },
      role: "button",
      tabIndex: 0,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-w-0 flex-1 truncate font-semibold text-sm", children: renderTitle() }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: cn(
                "shrink-0 text-2xs text-muted-foreground",
                onFilter && "group-focus-within/card:hidden group-hover/card:hidden"
              ),
              children: formatWindowKind(insight.windowKind)
            }
          ),
          onFilter && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden shrink-0 items-center gap-2 group-focus-within/card:flex group-hover/card:flex", children: [
            availableMetrics.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                className: "flex items-center gap-1 text-2xs text-muted-foreground hover:text-foreground",
                onClick: (event) => {
                  event.stopPropagation();
                  setMetricIndex((metricIndex + 1) % availableMetrics.length);
                },
                type: "button",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "size-2.5" }),
                  metricKeyToLabel(
                    availableMetrics[(metricIndex + 1) % availableMetrics.length][0]
                  )
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                className: "flex items-center gap-1 text-2xs text-muted-foreground hover:text-foreground",
                onClick: (event) => {
                  event.stopPropagation();
                  onFilter();
                },
                type: "button",
                children: [
                  "Filter ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Funnel, { className: "size-2.5" })
                ]
              }
            )
          ] })
        ] }),
        insight.aiSummary && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 line-clamp-2 text-muted-foreground text-xs", children: insight.aiSummary }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-auto pt-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-xl tabular-nums tracking-tight", children: formatValue(currentValue) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              DeltaChip,
              {
                size: "sm",
                variant: isIncrease ? "inc" : isDecrease ? "dec" : "default",
                children: deltaText
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-0.5 text-2xs text-muted-foreground", children: [
            metricLabel,
            compareValue != null && ` · vs ${formatValue(compareValue)}`
          ] })
        ] })
      ]
    }
  );
}
export {
  InsightCard as I
};
//# sourceMappingURL=insight-card-Cf29F786.js.map

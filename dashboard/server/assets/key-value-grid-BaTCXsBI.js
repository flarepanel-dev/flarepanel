import { o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { bB as isSameDay, d as cn, bz as Copy, bA as clipboard, E as EmptyState, bC as formatTime, bn as formatDateTime, i as fancyMinutes, S as SerieIcon } from "./router-gBnYxPzA.js";
import { c as countries } from "./countries-CS917BhP.js";
function isToday(date) {
  return isSameDay(date, Date.now());
}
const camelCaseToWords = (str) => {
  return str.replaceAll("_", " ").trim().replaceAll(/([A-Z])/g, " $1").trim().replace(/^./, (str2) => str2.toUpperCase()).replaceAll(/\s./g, (str2) => str2.toUpperCase());
};
function toStringValue(value) {
  if (value === null || value === void 0) {
    return void 0;
  }
  if (typeof value === "string") {
    return value;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return void 0;
    }
  }
  return String(value);
}
function KeyValueGrid({
  data,
  columns = 1,
  className,
  rowClassName,
  keyClassName,
  valueClassName,
  renderKey,
  renderValue,
  onItemClick,
  copyable = false
}) {
  const defaultRenderKey = (item) => {
    const splitKey = item.name.split(".");
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1", children: splitKey.map((name, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "span",
      {
        className: index === splitKey.length - 1 ? "text-foreground" : "text-muted-foreground",
        children: [
          camelCaseToWords(name),
          index < splitKey.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "." })
        ]
      },
      name
    )) });
  };
  const defaultRenderValue = (item) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(FieldValue, { event: item.event, name: item.name, value: item.value });
  };
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: cn("card grid overflow-hidden", gridCols[columns], className),
      children: [
        data.map((item, index) => {
          const stringValue = toStringValue(item.value);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: cn(
                "group relative flex items-center justify-between gap-4 p-4 py-3 shadow-[0_0_0_0.5px] shadow-border",
                onItemClick && "cursor-pointer hover:bg-muted/50",
                rowClassName
              ),
              onClick: () => onItemClick?.(item),
              onKeyDown: (e) => {
                if (onItemClick && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  onItemClick(item);
                }
              },
              role: onItemClick ? "button" : void 0,
              tabIndex: onItemClick ? 0 : void 0,
              children: [
                copyable && stringValue !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    className: "absolute top-1/2 left-2 z-10 -translate-x-full -translate-y-1/2 rounded border border-border bg-background p-1 opacity-0 shadow-sm transition-all duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100",
                    onClick: (e) => {
                      e.stopPropagation();
                      clipboard(stringValue);
                    },
                    type: "button",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "size-3 shrink-0" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("min-w-0 flex-1 text-sm", keyClassName), children: renderKey ? renderKey(item) : defaultRenderKey(item) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: cn(
                      "min-w-0 max-w-[60%] truncate text-right text-sm tabular-nums",
                      valueClassName
                    ),
                    title: stringValue,
                    children: renderValue ? renderValue(item) : defaultRenderValue(item)
                  }
                )
              ]
            },
            `${item.name}-${index}`
          );
        }),
        data.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
          EmptyState,
          {
            className: "col-span-full py-6",
            title: "Nothing to show",
            variant: "inline"
          }
        )
      ]
    }
  );
}
function FieldValue({
  name,
  value,
  event
}) {
  if (!value) {
    return null;
  }
  if (value instanceof Date) {
    return isToday(value) ? formatTime(value) : formatDateTime(value);
  }
  if (event) {
    switch (name) {
      case "osVersion":
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SerieIcon, { name: event.os }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: value })
        ] });
      case "browserVersion":
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SerieIcon, { name: event.browser }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: value })
        ] });
      case "city":
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SerieIcon, { name: event.country }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: value })
        ] });
      case "region":
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SerieIcon, { name: event.country }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: value })
        ] });
      case "properties":
        return JSON.stringify(value);
      case "country":
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SerieIcon, { name: value }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: countries[value] ?? value })
        ] });
      case "browser":
      case "os":
      case "brand":
      case "model":
      case "device":
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SerieIcon, { name: value }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: value })
        ] });
      case "duration":
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
            "(",
            value,
            "ms)"
          ] }),
          " ",
          fancyMinutes(value / 1e3)
        ] });
    }
  }
  if (value === null || value === void 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "-" });
  }
  if (typeof value === "boolean") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: value ? "true" : "false" });
  }
  if (typeof value === "object") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: JSON.stringify(value) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: String(value) });
}
export {
  FieldValue as F,
  KeyValueGrid as K,
  isToday as i
};
//# sourceMappingURL=key-value-grid-BaTCXsBI.js.map

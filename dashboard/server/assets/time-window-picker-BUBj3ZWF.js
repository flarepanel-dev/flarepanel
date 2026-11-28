import { a as reactExports, o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { ce as addMonths, bL as toDate, cf as parseISO, cg as startOfYear, bN as endOfDay, ch as subMonths, bO as differenceInCalendarMonths, ci as startOfDay, a_ as format, bB as isSameDay, bM as differenceInCalendarDays, cj as useBreakpoint, ck as timeWindows, cl as getDefaultIntervalByDates, bR as Popover, bS as PopoverTrigger, B as Button, bU as Calendar, d as cn, bV as PopoverContent, cm as InputEnter, bW as Calendar$1, cn as ChevronLeft, co as ChevronRight, bn as formatDateTime, bQ as formatDate } from "./router-gBnYxPzA.js";
import { d as distExports } from "./index-DxXk7QJj.js";
import { a as addDays } from "./addDays-BIiJOlUZ.js";
import { e as endOfMonth } from "./endOfMonth-C3pRd8ne.js";
import { s as startOfMonth } from "./startOfMonth-Bf6CczcY.js";
function addYears(date, amount) {
  return addMonths(date, amount * 12);
}
function endOfYear(date) {
  const _date = toDate(date);
  const year = _date.getFullYear();
  _date.setFullYear(year + 1, 0, 0);
  _date.setHours(23, 59, 59, 999);
  return _date;
}
function subDays(date, amount) {
  return addDays(date, -amount);
}
function subYears(date, amount) {
  return addYears(date, -1);
}
function shouldIgnoreKeypress(event) {
  const feedbackWidget = typeof window !== "undefined" && "uj" in window ? window.uj.getWidgetState() : null;
  const tagName = event?.target?.tagName;
  const modifierPressed = event.ctrlKey || event.metaKey || event.altKey || event.keyCode === 229;
  const isTyping = event.isComposing || tagName === "INPUT" || tagName === "TEXTAREA";
  return modifierPressed || isTyping || feedbackWidget?.isOpen === true;
}
const DATE_TIME_FORMAT = "yyyy-MM-dd HH:mm:ss";
const MINUTES_30 = 30;
const MINUTES_60 = 60;
const MINUTES_24H = 24 * 60;
function minuteWindow(now, minutes) {
  return {
    start: new Date(now.getTime() - minutes * 6e4),
    end: now,
    unit: "minute",
    size: minutes
  };
}
function dayWindow(start, end) {
  return {
    start: startOfDay(start),
    end: endOfDay(end),
    unit: "day",
    size: differenceInCalendarDays(end, start) + 1
  };
}
function isStartOfDay(date) {
  return date.getTime() === startOfDay(date).getTime();
}
function isEndOfDay(date) {
  return format(date, "HH:mm:ss") === "23:59:59";
}
function boundsFromCustomDates(start, rawEnd) {
  const endsAtMidnight = isStartOfDay(rawEnd) && !isSameDay(start, rawEnd);
  const end = endsAtMidnight ? endOfDay(subDays(rawEnd, 1)) : rawEnd;
  const isWholeDays = isStartOfDay(start) && isEndOfDay(end);
  if (!isWholeDays) {
    const minutes = Math.round((end.getTime() - start.getTime()) / 6e4);
    return { start, end, unit: "minute", size: Math.max(minutes, 1) };
  }
  const isWholeMonths = isSameDay(start, startOfMonth(start)) && isSameDay(end, endOfMonth(end));
  if (isWholeMonths) {
    return {
      start,
      end,
      unit: "month",
      size: differenceInCalendarMonths(end, start) + 1
    };
  }
  return dayWindow(start, end);
}
function resolveTimeWindow(range, startDate, endDate, now = /* @__PURE__ */ new Date()) {
  if (startDate && endDate) {
    return boundsFromCustomDates(parseISO(startDate), parseISO(endDate));
  }
  switch (range) {
    case "30min":
      return minuteWindow(now, MINUTES_30);
    case "lastHour":
      return minuteWindow(now, MINUTES_60);
    case "last24h":
      return minuteWindow(now, MINUTES_24H);
    case "today":
      return dayWindow(now, now);
    case "yesterday": {
      const yesterday = subDays(now, 1);
      return dayWindow(yesterday, yesterday);
    }
    case "7d":
      return dayWindow(subDays(now, 7), now);
    case "3m":
      return {
        start: startOfDay(subMonths(now, 3)),
        end: endOfDay(now),
        unit: "month",
        size: 3
      };
    case "6m":
      return {
        start: startOfDay(subMonths(now, 6)),
        end: endOfDay(now),
        unit: "month",
        size: 6
      };
    case "12m": {
      const start = startOfMonth(subMonths(now, 12));
      const end = endOfMonth(now);
      return {
        start,
        end,
        unit: "month",
        size: differenceInCalendarMonths(end, start) + 1
      };
    }
    case "monthToDate":
      return {
        start: startOfMonth(now),
        end: endOfDay(now),
        unit: "month",
        size: 1
      };
    case "lastMonth": {
      const month = subMonths(now, 1);
      return {
        start: startOfMonth(month),
        end: endOfMonth(month),
        unit: "month",
        size: 1
      };
    }
    case "yearToDate":
      return {
        start: startOfYear(now),
        end: endOfDay(now),
        unit: "year",
        size: 1
      };
    case "lastYear": {
      const year = subYears(now);
      return {
        start: startOfYear(year),
        end: endOfYear(year),
        unit: "year",
        size: 1
      };
    }
    default:
      return dayWindow(subDays(now, 30), now);
  }
}
function shiftDate(date, unit, amount) {
  switch (unit) {
    case "minute":
      return new Date(date.getTime() + amount * 6e4);
    case "day":
      return addDays(date, amount);
    case "month":
      return addMonths(date, amount);
    default:
      return addYears(date, amount);
  }
}
function stepTimeWindow(bounds, direction) {
  const amount = direction === "next" ? bounds.size : -bounds.size;
  const start = shiftDate(bounds.start, bounds.unit, amount);
  let end = shiftDate(bounds.end, bounds.unit, amount);
  if (bounds.unit === "month" && isSameDay(bounds.end, endOfMonth(bounds.end))) {
    end = endOfMonth(end);
  }
  if (bounds.unit === "year" && isSameDay(bounds.end, endOfYear(bounds.end))) {
    end = endOfYear(end);
  }
  return { ...bounds, start, end };
}
function canStepTimeWindow(bounds, direction, now = /* @__PURE__ */ new Date()) {
  return stepTimeWindow(bounds, direction).start.getTime() <= now.getTime();
}
function formatTimeWindowBoundary(date) {
  return format(date, DATE_TIME_FORMAT);
}
const MAX_CUSTOM_DAYS = 365;
const DESKTOP_MONTHS = 2;
const MOBILE_MONTHS = 1;
const COLLISION_PADDING = 16;
const PRESET_GROUPS = [
  ["30min", "lastHour", "last24h"],
  ["today", "yesterday", "7d", "30d"],
  ["3m", "6m", "12m"],
  ["monthToDate", "lastMonth", "yearToDate", "lastYear"]
];
function formatWindowLabel(bounds) {
  if (bounds.unit === "minute") {
    return `${formatDateTime(bounds.start)} – ${formatDateTime(bounds.end)}`;
  }
  if (isSameDay(bounds.start, bounds.end)) {
    return formatDate(bounds.start);
  }
  return `${formatDate(bounds.start)} – ${formatDate(bounds.end)}`;
}
function TimeWindowPicker({
  value,
  onChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  onIntervalChange,
  interval,
  className,
  variant = "outline",
  size
}) {
  const { isBelowSm } = useBreakpoint("sm");
  const [open, setOpen] = reactExports.useState(false);
  const [draft, setDraft] = reactExports.useState();
  const [customDaysKey, setCustomDaysKey] = reactExports.useState(0);
  const isCustom = value === "custom";
  const bounds = reactExports.useMemo(
    () => resolveTimeWindow(value, startDate, endDate),
    [value, startDate, endDate]
  );
  const triggerLabel = isCustom ? formatWindowLabel(bounds) : timeWindows[value]?.label;
  const applyBounds = reactExports.useCallback(
    (next, nextInterval) => {
      onStartDateChange(formatTimeWindowBoundary(next.start));
      onEndDateChange(formatTimeWindowBoundary(next.end));
      onChange("custom");
      const resolvedInterval = nextInterval ?? getDefaultIntervalByDates(
        next.start.toISOString(),
        next.end.toISOString()
      );
      if (resolvedInterval) {
        onIntervalChange(resolvedInterval);
      }
    },
    [onChange, onStartDateChange, onEndDateChange, onIntervalChange]
  );
  const close = reactExports.useCallback(() => {
    setDraft(void 0);
    setOpen(false);
  }, []);
  const selectPreset = reactExports.useCallback(
    (range) => {
      onChange(range);
      close();
    },
    [onChange, close]
  );
  const applyDraft = reactExports.useCallback(() => {
    if (!(draft?.from && draft.to)) {
      return;
    }
    applyBounds(
      {
        start: startOfDay(draft.from),
        end: endOfDay(draft.to),
        unit: "day",
        size: 0
      },
      null
    );
    close();
  }, [draft, applyBounds, close]);
  const applyCustomDays = reactExports.useCallback(
    (raw) => {
      const days = Number(raw);
      if (!Number.isInteger(days) || days < 1 || days > MAX_CUSTOM_DAYS) {
        return;
      }
      const now = /* @__PURE__ */ new Date();
      applyBounds(
        {
          start: startOfDay(subDays(now, days - 1)),
          end: endOfDay(now),
          unit: "day",
          size: days
        },
        null
      );
      setCustomDaysKey((key) => key + 1);
      close();
    },
    [applyBounds, close]
  );
  const step = reactExports.useCallback(
    (direction) => {
      applyBounds(stepTimeWindow(bounds, direction), interval);
    },
    [bounds, interval, applyBounds]
  );
  reactExports.useEffect(() => {
    return distExports.bind(document, {
      type: "keydown",
      listener(event) {
        if (shouldIgnoreKeypress(event)) {
          return;
        }
        const match = Object.values(timeWindows).find(
          (window2) => event.key === window2.shortcut.toLowerCase()
        );
        if (!match) {
          return;
        }
        if (match.key === "custom") {
          setOpen(true);
          return;
        }
        selectPreset(match.key);
      }
    });
  }, [selectPreset]);
  const selectedRange = draft ?? {
    from: bounds.start,
    to: bounds.end
  };
  const canApply = Boolean(draft?.from && draft?.to);
  const canStepNext = canStepTimeWindow(bounds, "next");
  const stepperSize = size === "sm" ? "sm" : "default";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Popover,
      {
        onOpenChange: (nextOpen) => nextOpen ? setOpen(true) : close(),
        open,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              className: cn("justify-start", className),
              icon: Calendar,
              size,
              variant,
              children: triggerLabel
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            PopoverContent,
            {
              align: "start",
              className: "max-h-(--radix-popover-content-available-height) w-auto max-w-[calc(100vw-2rem)] overflow-y-auto p-0",
              collisionPadding: COLLISION_PADDING,
              portal: true,
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col gap-2 border-b p-2 sm:w-44 sm:border-r sm:border-b-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-2 pt-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-sm", children: "Last" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      InputEnter,
                      {
                        "aria-label": "Number of days",
                        className: "h-7 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
                        inputMode: "numeric",
                        max: MAX_CUSTOM_DAYS,
                        min: 1,
                        onChangeValue: applyCustomDays,
                        placeholder: "N",
                        step: 1,
                        type: "number",
                        value: ""
                      },
                      customDaysKey
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-sm", children: "days" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-x-2 gap-y-1.5 sm:flex sm:flex-col", children: PRESET_GROUPS.map((group) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col", children: group.map((range) => {
                    const preset = timeWindows[range];
                    const isActive = value === range;
                    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "button",
                      {
                        className: cn(
                          "flex h-7 items-center justify-between rounded-md px-2 text-left text-sm hover:bg-accent hover:text-accent-foreground",
                          isActive && "bg-accent font-medium"
                        ),
                        onClick: () => selectPreset(range),
                        type: "button",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: preset.label }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "kbd",
                            {
                              "aria-hidden": true,
                              className: "hidden rounded border border-border bg-def-200 px-1 font-mono text-2xs text-muted-foreground sm:inline",
                              children: preset.shortcut
                            }
                          )
                        ]
                      },
                      range
                    );
                  }) }, group[0])) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col justify-between gap-3 p-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Calendar$1,
                    {
                      captionLayout: "dropdown",
                      className: "p-0",
                      defaultMonth: subMonths(
                        bounds.start,
                        isBelowSm ? 0 : DESKTOP_MONTHS - 1
                      ),
                      disabled: { after: endOfDay(/* @__PURE__ */ new Date()) },
                      mode: "range",
                      numberOfMonths: isBelowSm ? MOBILE_MONTHS : DESKTOP_MONTHS,
                      onSelect: (range, day) => {
                        setDraft(draft ? range : { from: day, to: void 0 });
                      },
                      selected: selectedRange
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4 border-t pt-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-sm", children: draft?.from ? formatWindowLabel({
                      start: draft.from,
                      end: draft.to ?? draft.from,
                      unit: "day"
                    }) : formatWindowLabel(bounds) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Button,
                        {
                          onClick: close,
                          size: "sm",
                          type: "button",
                          variant: "outline",
                          children: "Cancel"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Button,
                        {
                          disabled: !canApply,
                          onClick: applyDraft,
                          size: "sm",
                          type: "button",
                          children: "Apply"
                        }
                      )
                    ] })
                  ] })
                ] })
              ] })
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden items-center sm:flex", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          "aria-label": "Previous period",
          className: cn(className, "rounded-r-none px-2"),
          onClick: () => step("previous"),
          size: stepperSize,
          type: "button",
          variant,
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "size-4" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          "aria-label": "Next period",
          className: cn(className, "-ml-px rounded-l-none px-2"),
          disabled: !canStepNext,
          onClick: () => step("next"),
          size: stepperSize,
          type: "button",
          variant,
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "size-4" })
        }
      )
    ] })
  ] });
}
export {
  TimeWindowPicker as T
};
//# sourceMappingURL=time-window-picker-BUBj3ZWF.js.map

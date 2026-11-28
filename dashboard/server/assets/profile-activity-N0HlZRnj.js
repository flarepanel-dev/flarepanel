import { a as reactExports, o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { W as WidgetHead, d as WidgetTitle, e as WidgetAbsoluteButtons } from "./overview-widget-q0VDaTtp.js";
import { bL as toDate, iv as addLeadingZeros, fE as Activity, B as Button, cn as ChevronLeft, ch as subMonths, co as ChevronRight, ce as addMonths, a_ as format, bE as Tooltiper, d as cn } from "./router-gBnYxPzA.js";
import { b as Widget, W as WidgetBody } from "./widget-D7PGEeO1.js";
import { s as startOfMonth } from "./startOfMonth-Bf6CczcY.js";
import { e as endOfMonth } from "./endOfMonth-C3pRd8ne.js";
import { i as isToday } from "./key-value-grid-BaTCXsBI.js";
function eachDayOfInterval(interval, options) {
  const startDate = toDate(interval.start);
  const endDate = toDate(interval.end);
  let reversed = +startDate > +endDate;
  const endTime = reversed ? +startDate : +endDate;
  const currentDate = reversed ? endDate : startDate;
  currentDate.setHours(0, 0, 0, 0);
  let step = 1;
  const dates = [];
  while (+currentDate <= endTime) {
    dates.push(toDate(currentDate));
    currentDate.setDate(currentDate.getDate() + step);
    currentDate.setHours(0, 0, 0, 0);
  }
  return reversed ? dates.reverse() : dates;
}
function formatISO(date, options) {
  const _date = toDate(date);
  if (isNaN(_date.getTime())) {
    throw new RangeError("Invalid time value");
  }
  const format2 = options?.format ?? "extended";
  let result = "";
  const dateDelimiter = format2 === "extended" ? "-" : "";
  {
    const day = addLeadingZeros(_date.getDate(), 2);
    const month = addLeadingZeros(_date.getMonth() + 1, 2);
    const year = addLeadingZeros(_date.getFullYear(), 4);
    result = `${year}${dateDelimiter}${month}${dateDelimiter}${day}`;
  }
  return result;
}
function isSameMonth(dateLeft, dateRight) {
  const _dateLeft = toDate(dateLeft);
  const _dateRight = toDate(dateRight);
  return _dateLeft.getFullYear() === _dateRight.getFullYear() && _dateLeft.getMonth() === _dateRight.getMonth();
}
const VISIBLE_MONTH_OFFSETS = [1, 0];
function getOpacityLevel(count, maxCount) {
  if (count === 0 || maxCount === 0) {
    return 0;
  }
  const ratio = count / maxCount;
  if (ratio <= 0.25) {
    return 0.25;
  }
  if (ratio <= 0.5) {
    return 0.5;
  }
  if (ratio <= 0.75) {
    return 0.75;
  }
  return 1;
}
const MonthCalendar = ({
  month,
  data,
  maxCount
}) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 text-sm", children: format(month, "MMMM yyyy") }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "-m-1 grid grid-cols-7 gap-1 p-1", children: eachDayOfInterval({
    start: startOfMonth(month),
    end: endOfMonth(month)
  }).map((date) => {
    const hit = data.find(
      (item) => item.date.includes(formatISO(date, {}))
    );
    const opacity = hit ? getOpacityLevel(hit.count, maxCount) : 0;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Tooltiper,
      {
        asChild: true,
        content: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col gap-1 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: format(date, "EEEE, MMM d") }),
          hit ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground", children: [
            hit.count,
            " ",
            hit.count === 1 ? "event" : "events"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: "No activity" })
        ] }),
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: cn(
              "group aspect-square w-full cursor-default overflow-hidden rounded hover:ring-1 hover:ring-foreground"
            ),
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: cn(
                  "size-full rounded group-hover:shadow-[inset_0_0_0_2px_var(--background)]",
                  isToday(date) ? "bg-highlight" : hit ? "bg-foreground" : "bg-def-200"
                ),
                style: hit && !isToday(date) ? { opacity } : void 0
              }
            )
          }
        )
      },
      date.toISOString()
    );
  }) })
] });
const ProfileActivity = ({ data }) => {
  const [startDate, setStartDate] = reactExports.useState(startOfMonth(/* @__PURE__ */ new Date()));
  const maxCount = Math.max(...data.map((item) => item.count), 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Widget, { className: "w-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(WidgetHead, { className: "row relative justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetTitle, { icon: Activity, children: "Activity" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(WidgetAbsoluteButtons, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: () => setStartDate(subMonths(startDate, 1)),
            size: "icon",
            variant: "outline",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { size: 14 })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            disabled: isSameMonth(startDate, /* @__PURE__ */ new Date()),
            onClick: () => setStartDate(addMonths(startDate, 1)),
            size: "icon",
            variant: "outline",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 14 })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetBody, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-4", children: VISIBLE_MONTH_OFFSETS.map((offset) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      MonthCalendar,
      {
        data,
        maxCount,
        month: subMonths(startDate, offset)
      },
      offset
    )) }) })
  ] });
};
export {
  ProfileActivity as P
};
//# sourceMappingURL=profile-activity-N0HlZRnj.js.map

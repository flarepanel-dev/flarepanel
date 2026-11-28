import { a as reactExports, o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { a as OverviewFilterButton, O as OverviewFiltersButtons } from "./overview-filters-buttons-C30tAgyS.js";
import { O as OverviewInterval } from "./overview-interval-cSBL6ZB5.js";
import { O as OverviewRange } from "./overview-range-DoapqOyi.js";
import { il as Route, c8 as useOverviewOptions, g as useEventQueryFilters, f as useEventQueryNamesFilter, fM as useEventNames, fP as ComboboxEvents } from "./router-gBnYxPzA.js";
import { R as ReportChartShortcut } from "./shortcut-BfH2y69x.js";
import { b as Widget, a as WidgetHead, W as WidgetBody } from "./widget-D7PGEeO1.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "./properties-B42zBES-.js";
import "./ReportInterval-zZuTI3j-.js";
import "./differenceInDays-liXHUvyd.js";
import "./time-window-picker-BUBj3ZWF.js";
import "./index-DxXk7QJj.js";
import "./addDays-BIiJOlUZ.js";
import "./endOfMonth-C3pRd8ne.js";
import "./startOfMonth-Bf6CczcY.js";
import "./pick-CfnSzKDx.js";
import "fs";
import "util";
import "stream";
import "zlib";
import "assert";
import "buffer";
const BREAKDOWN_BY_EVENT_NAME = [{
  id: "A",
  name: "name"
}];
const STACKED_HISTOGRAM = {
  type: "histogram",
  stacked: true
};
const breakdownChartOptions = {
  hideTable: true,
  renderSerieName(names) {
    return names.at(-1);
  }
};
function Component() {
  const {
    projectId
  } = Route.useParams();
  const {
    range,
    startDate,
    endDate,
    interval
  } = useOverviewOptions();
  const [filters] = useEventQueryFilters();
  const [eventNames, setEventNames] = useEventQueryNamesFilter();
  const availableEvents = useEventNames({
    projectId,
    anyEvents: false
  });
  const series = reactExports.useMemo(() => {
    const names = eventNames.length > 0 ? eventNames : ["*"];
    return names.map((name) => ({
      id: name,
      name,
      displayName: name === "*" ? "All events" : name,
      segment: "event",
      filters: filters ?? [],
      type: "event"
    }));
  }, [eventNames, filters]);
  const timeWindow = {
    range,
    startDate,
    endDate,
    interval
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col mb-2 gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewRange, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewInterval, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ComboboxEvents, { items: availableEvents, maxDisplayItems: 2, multiple: true, onChange: setEventNames, placeholder: "All events", searchable: true, value: eventNames }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewFilterButton, { enableEventsFilter: true })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewFiltersButtons, { className: "p-0", filterModal: {
        enableEventsFilter: true
      } })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-2 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Widget, { className: "w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "title", children: "Events over time" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetBody, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ReportChartShortcut, { breakdowns: BREAKDOWN_BY_EVENT_NAME, chartType: "histogram", options: breakdownChartOptions, projectId, reportOptions: STACKED_HISTOGRAM, series, ...timeWindow }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Widget, { className: "w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "title", children: "Share of events" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetBody, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ReportChartShortcut, { breakdowns: BREAKDOWN_BY_EVENT_NAME, chartType: "pie", options: breakdownChartOptions, projectId, series, ...timeWindow }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Widget, { className: "w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "title", children: "Events by name" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetBody, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ReportChartShortcut, { breakdowns: BREAKDOWN_BY_EVENT_NAME, chartType: "bar", options: breakdownChartOptions, projectId, series, ...timeWindow }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Widget, { className: "w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "title", children: "Trend by event" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetBody, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ReportChartShortcut, { breakdowns: BREAKDOWN_BY_EVENT_NAME, chartType: "linear", options: breakdownChartOptions, projectId, series, ...timeWindow }) })
      ] })
    ] })
  ] });
}
export {
  Component as component
};
//# sourceMappingURL=_app._organizationId._projectId.events._tabs.stats-Bb0YzNWX.js.map

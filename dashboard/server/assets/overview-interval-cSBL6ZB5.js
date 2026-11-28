import { o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { R as ReportInterval } from "./ReportInterval-zZuTI3j-.js";
import { c8 as useOverviewOptions } from "./router-gBnYxPzA.js";
function OverviewInterval() {
  const { interval, setInterval, range, startDate, endDate } = useOverviewOptions();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    ReportInterval,
    {
      chartType: "linear",
      endDate,
      interval,
      onChange: setInterval,
      range,
      startDate
    }
  );
}
export {
  OverviewInterval as O
};
//# sourceMappingURL=overview-interval-cSBL6ZB5.js.map

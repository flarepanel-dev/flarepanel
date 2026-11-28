import { o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { bt as ReportChart } from "./router-gBnYxPzA.js";
const ReportChartShortcut = ({
  projectId,
  range = "7d",
  startDate,
  endDate,
  previous = false,
  chartType = "linear",
  interval = "day",
  series,
  breakdowns,
  lineType = "monotone",
  reportOptions,
  options
}) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    ReportChart,
    {
      options: options ?? {},
      report: {
        projectId,
        range,
        startDate,
        endDate,
        breakdowns: breakdowns ?? [],
        previous,
        chartType,
        interval,
        series,
        lineType,
        metric: "sum",
        options: reportOptions
      }
    }
  );
};
export {
  ReportChartShortcut as R
};
//# sourceMappingURL=shortcut-BfH2y69x.js.map

import { o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { c8 as useOverviewOptions } from "./router-gBnYxPzA.js";
import { T as TimeWindowPicker } from "./time-window-picker-BUBj3ZWF.js";
function OverviewRange() {
  const {
    range,
    setRange,
    setStartDate,
    setEndDate,
    endDate,
    startDate,
    interval,
    setInterval
  } = useOverviewOptions();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    TimeWindowPicker,
    {
      endDate,
      interval,
      onChange: setRange,
      onEndDateChange: setEndDate,
      onIntervalChange: setInterval,
      onStartDateChange: setStartDate,
      startDate,
      value: range
    }
  );
}
export {
  OverviewRange as O
};
//# sourceMappingURL=overview-range-DoapqOyi.js.map

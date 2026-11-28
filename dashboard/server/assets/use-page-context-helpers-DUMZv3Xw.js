import { eq as usePageContext, c8 as useOverviewOptions } from "./router-gBnYxPzA.js";
function useRangePageContext(page) {
  const { range, startDate, endDate, interval } = useOverviewOptions();
  usePageContext({
    page,
    range,
    startDate: startDate ?? void 0,
    endDate: endDate ?? void 0,
    interval: interval ?? void 0
  });
}
function useEntityPageContext(page, ids) {
  usePageContext({ page, ...ids });
}
function useDashboardPageContext(dashboardId) {
  const { range, startDate, endDate, interval } = useOverviewOptions();
  usePageContext({
    page: "dashboard",
    dashboardId,
    range,
    startDate: startDate ?? void 0,
    endDate: endDate ?? void 0,
    interval: interval ?? void 0
  });
}
function useReportEditorContext(reportId) {
  usePageContext({ page: "report", reportId: reportId ?? void 0 });
}
export {
  useEntityPageContext as a,
  useReportEditorContext as b,
  useDashboardPageContext as c,
  useRangePageContext as u
};
//# sourceMappingURL=use-page-context-helpers-DUMZv3Xw.js.map

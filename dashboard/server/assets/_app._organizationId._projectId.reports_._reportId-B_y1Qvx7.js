import { o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { u as useSuspenseQuery } from "./useSuspenseQuery-BHKQGd6F.js";
import { R as ReportEditor } from "./report-editor-Bm84hMNg.js";
import { b as useReportEditorContext } from "./use-page-context-helpers-DUMZv3Xw.js";
import { hI as Route, a as useTRPC } from "./router-gBnYxPzA.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "./pencil-C1NQD0wZ.js";
import "./git-branch-Co2cjI3D.js";
import "./earth-Din9zDf9.js";
import "./gauge-BTL4uoFL.js";
import "./chart-bar-D8P8dBZk.js";
import "./chart-area-DUmaUMbJ.js";
import "./ReportInterval-zZuTI3j-.js";
import "./differenceInDays-liXHUvyd.js";
import "./useIsFetching-BWA9Maly.js";
import "./sortable.esm-CAMhO-vx.js";
import "./history-enL_n-ir.js";
import "./index-Dpi7uv2M.js";
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
function Component() {
  const {
    reportId
  } = Route.useParams();
  const trpc = useTRPC();
  const query = useSuspenseQuery(trpc.report.get.queryOptions({
    reportId
  }));
  useReportEditorContext(query.data?.id ?? null);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ReportEditor, { report: query.data });
}
export {
  Component as component
};
//# sourceMappingURL=_app._organizationId._projectId.reports_._reportId-B_y1Qvx7.js.map

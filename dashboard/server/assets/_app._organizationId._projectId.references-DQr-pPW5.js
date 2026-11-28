import { o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { gp as Route, a as useTRPC, j as useQuery, e$ as keepPreviousData, B as Button, H as pushModal, G as Plus, gq as columnDefs } from "./router-gBnYxPzA.js";
import { P as PageContainer } from "./page-container-CD7gVEyj.js";
import { P as PageHeader } from "./page-header-DbGieVLw.js";
import { D as DataTable } from "./data-table-WJSjaNsN.js";
import { b as DataTableToolbar } from "./data-table-toolbar-BJU_j2v8.js";
import { u as useTable } from "./use-table-D6HVqRzV.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "./pick-CfnSzKDx.js";
import "fs";
import "util";
import "stream";
import "zlib";
import "assert";
import "buffer";
import "./table-Bl3avL3P.js";
import "./pagination-Dj6_PitL.js";
import "./useIsFetching-BWA9Maly.js";
import "./sortable.esm-CAMhO-vx.js";
import "./settings-2-DrPzEv47.js";
import "./index-CHcXrYNT.js";
function Component() {
  const {
    projectId
  } = Route.useParams();
  const trpc = useTRPC();
  const query = useQuery(trpc.reference.getReferences.queryOptions({
    projectId
  }, {
    placeholderData: keepPreviousData
  }));
  const data = query.data ?? [];
  const {
    table,
    loading
  } = useTable({
    name: "references",
    columns: columnDefs,
    data,
    pageSize: 30,
    loading: query.isLoading
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(PageContainer, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { className: "mb-8", description: "References is a good way to keep track of important events. They will show up in your reports.", title: "References" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DataTableToolbar, { table, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { icon: Plus, onClick: () => pushModal("AddReference"), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "max-sm:hidden", children: "Create reference" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sm:hidden", children: "Reference" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DataTable, { error: query.isError, loading, table })
  ] });
}
export {
  Component as component
};
//# sourceMappingURL=_app._organizationId._projectId.references-DQr-pPW5.js.map

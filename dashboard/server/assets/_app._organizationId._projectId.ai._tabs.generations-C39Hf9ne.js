import { a as reactExports, o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { u as useInfiniteQuery } from "./useInfiniteQuery-149RJLhL.js";
import { a as useTRPC, c8 as useOverviewOptions, hQ as useAiFilters, eY as useReactTable, eZ as getCoreRowModel, B as Button, T as Bot, eW as ColumnCreatedAt, bp as AI_TYPE_LABELS, M as Badge, br as formatTokens, bs as formatLatency, bq as TriangleAlert, C as Check, it as Route } from "./router-gBnYxPzA.js";
import { A as AiCost, a as isUnpricedCall } from "./ai-cost-C8tzxtic.js";
import { P as ProfileCell } from "./ai-traces-table-CKNiytqr.js";
import { u as useEventDrawer } from "./use-event-drawer-DCAhkqzM.js";
import { D as DataTable } from "./data-table-WJSjaNsN.js";
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
const PAGE_SIZE = 50;
function previewText(value) {
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value)) {
    const last = value.at(-1);
    return previewText(last?.content);
  }
  if (typeof value === "object" && value !== null) {
    const record = value;
    if (typeof record.text === "string") {
      return record.text;
    }
    if (typeof record.content === "string") {
      return record.content;
    }
    return JSON.stringify(value);
  }
  return "";
}
function useColumns() {
  return reactExports.useMemo(
    () => [
      {
        accessorKey: "createdAt",
        header: "Time",
        size: ColumnCreatedAt.size,
        cell: ({ row }) => /* @__PURE__ */ jsxRuntimeExports.jsx(ColumnCreatedAt, { children: row.original.createdAt })
      },
      {
        accessorKey: "name",
        header: "Step",
        size: 200,
        cell: ({ row }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate font-medium", children: row.original.name || AI_TYPE_LABELS[row.original.type] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-2xs text-muted-foreground", children: previewText(row.original.input) || AI_TYPE_LABELS[row.original.type] })
        ] })
      },
      {
        accessorKey: "model",
        header: "Model",
        size: 180,
        cell: ({ row }) => row.original.model ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: row.original.model }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: AI_TYPE_LABELS[row.original.type] })
      },
      {
        accessorKey: "profileId",
        header: "Profile",
        size: 180,
        cell: ({ row }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          ProfileCell,
          {
            deviceId: row.original.deviceId,
            profile: row.original.profile,
            profileId: row.original.profileId
          }
        )
      },
      {
        accessorKey: "inputTokens",
        header: "Tokens",
        size: 120,
        cell: ({ row }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono tabular-nums", children: [
          formatTokens(row.original.inputTokens),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
            " ",
            "→ ",
            formatTokens(row.original.outputTokens)
          ] })
        ] })
      },
      {
        accessorKey: "totalCost",
        header: "Cost",
        size: 100,
        cell: ({ row }) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono tabular-nums", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          AiCost,
          {
            cost: row.original.totalCost,
            unpricedCalls: isUnpricedCall(row.original) ? 1 : 0
          }
        ) })
      },
      {
        accessorKey: "latencyMs",
        header: "Latency",
        size: 100,
        cell: ({ row }) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono tabular-nums", children: formatLatency(row.original.latencyMs) })
      },
      {
        accessorKey: "isError",
        header: "Status",
        size: 90,
        cell: ({ row }) => row.original.isError ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "destructive", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, {}),
          " ",
          row.original.httpStatus || "Error"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Check, {}),
          " OK"
        ] })
      }
    ],
    []
  );
}
function AiGenerationsTable({ projectId }) {
  const trpc = useTRPC();
  const { openEvent } = useEventDrawer();
  const { range, startDate, endDate } = useOverviewOptions();
  const { filters } = useAiFilters();
  const query = useInfiniteQuery(
    trpc.ai.events.infiniteQueryOptions(
      {
        projectId,
        range,
        startDate,
        endDate,
        filters: { ...filters, types: ["generation", "embedding"] },
        take: PAGE_SIZE
      },
      { getNextPageParam: (lastPage) => lastPage.meta.next }
    )
  );
  const data = reactExports.useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data]
  );
  const columns = useColumns();
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    // Pages come from the cursor query; one page keeps the floating pager away.
    pageCount: 1,
    filterFns: { isWithinRange: () => true },
    getRowId: (row) => row.id
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      DataTable,
      {
        empty: {
          title: "No calls",
          description: "Model calls appear here once your app sends AI events."
        },
        error: query.isError,
        loading: query.isLoading,
        onRowClick: (row) => openEvent({ id: row.original.id, createdAt: row.original.createdAt }),
        table
      }
    ),
    query.hasNextPage && /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        className: "self-center",
        icon: Bot,
        loading: query.isFetchingNextPage,
        onClick: () => query.fetchNextPage(),
        variant: "outline",
        children: "Load more"
      }
    )
  ] });
}
function Component() {
  const {
    projectId
  } = Route.useParams();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AiGenerationsTable, { projectId });
}
export {
  Component as component
};
//# sourceMappingURL=_app._organizationId._projectId.ai._tabs.generations-C39Hf9ne.js.map

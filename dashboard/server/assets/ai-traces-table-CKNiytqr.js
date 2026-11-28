import { a as reactExports, o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { u as useInfiniteQuery } from "./useInfiniteQuery-149RJLhL.js";
import { a as useTRPC, $ as useNavigate, e as useAppParams, c8 as useOverviewOptions, hQ as useAiFilters, eY as useReactTable, eZ as getCoreRowModel, B as Button, T as Bot, eW as ColumnCreatedAt, M as Badge, br as formatTokens, bs as formatLatency, bq as TriangleAlert, C as Check, P as ProjectLink, eX as ProfileAvatar, h as getProfileName } from "./router-gBnYxPzA.js";
import { A as AiCost } from "./ai-cost-C8tzxtic.js";
import { D as DataTable } from "./data-table-WJSjaNsN.js";
const PAGE_SIZE = 50;
const MODELS_SHOWN = 2;
function ProfileCell({
  profile,
  profileId,
  deviceId
}) {
  if (!profileId || profileId === deviceId) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Anonymous" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    ProjectLink,
    {
      className: "row min-w-0 items-center gap-2 font-medium hover:underline",
      onClick: (event) => event.stopPropagation(),
      params: { profileId },
      to: "/profiles/$profileId",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ProfileAvatar, { size: "xs", ...profile }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: profile ? getProfileName(profile, false) : profileId })
      ]
    }
  );
}
function useColumns() {
  return reactExports.useMemo(
    () => [
      {
        accessorKey: "startedAt",
        header: "Started",
        size: ColumnCreatedAt.size,
        cell: ({ row }) => /* @__PURE__ */ jsxRuntimeExports.jsx(ColumnCreatedAt, { children: row.original.startedAt })
      },
      {
        accessorKey: "name",
        header: "Trace",
        size: 220,
        cell: ({ row }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate font-medium", children: row.original.name || "trace" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate font-mono text-2xs text-muted-foreground", children: row.original.id })
        ] })
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
        accessorKey: "models",
        header: "Models",
        size: 220,
        cell: ({ row }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row flex-wrap gap-1", children: [
          row.original.models.slice(0, MODELS_SHOWN).map((model) => /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: model }, model)),
          row.original.models.length > MODELS_SHOWN && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", children: [
            "+",
            row.original.models.length - MODELS_SHOWN
          ] })
        ] })
      },
      {
        accessorKey: "generations",
        header: "Steps",
        size: 90,
        cell: ({ row }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono tabular-nums", children: [
          row.original.generations,
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
            " ",
            "/ ",
            row.original.events
          ] })
        ] })
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
        accessorKey: "cost",
        header: "Cost",
        size: 100,
        cell: ({ row }) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono tabular-nums", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          AiCost,
          {
            cost: row.original.cost,
            unpricedCalls: row.original.unpricedCalls
          }
        ) })
      },
      {
        accessorKey: "durationMs",
        header: "Duration",
        size: 100,
        cell: ({ row }) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono tabular-nums", children: formatLatency(row.original.durationMs) })
      },
      {
        accessorKey: "isError",
        header: "Status",
        size: 90,
        cell: ({ row }) => row.original.isError ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "destructive", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, {}),
          " Error"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Check, {}),
          " OK"
        ] })
      }
    ],
    []
  );
}
function AiTracesTable({ projectId }) {
  const trpc = useTRPC();
  const navigate = useNavigate();
  const { organizationId } = useAppParams();
  const { range, startDate, endDate } = useOverviewOptions();
  const { filters } = useAiFilters();
  const query = useInfiniteQuery(
    trpc.ai.traces.infiniteQueryOptions(
      { projectId, range, startDate, endDate, filters, take: PAGE_SIZE },
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
          title: "No traces",
          description: "Traces appear once your app sends AI events. Wrap a model with @flarepanel/ai or call op.ai()."
        },
        error: query.isError,
        loading: query.isLoading,
        onRowClick: (row) => navigate({
          to: "/$organizationId/$projectId/ai/traces/$traceId",
          params: { organizationId, projectId, traceId: row.original.id },
          search: { at: row.original.startedAt.toISOString() }
        }),
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
export {
  AiTracesTable as A,
  ProfileCell as P
};
//# sourceMappingURL=ai-traces-table-CKNiytqr.js.map

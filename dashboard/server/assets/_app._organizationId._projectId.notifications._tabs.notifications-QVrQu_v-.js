import { o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { h2 as createHeaderColumn, eW as ColumnCreatedAt, S as SerieIcon, P as ProjectLink, ii as Route, a as useTRPC, j as useQuery } from "./router-gBnYxPzA.js";
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
function getEventFromPayload(payload) {
  if (payload?.type === "event") {
    return payload.event;
  }
  if (payload?.type === "funnel") {
    return payload.funnel[0] || null;
  }
  return null;
}
function useColumns() {
  const columns = [
    {
      accessorKey: "title",
      header: "Title",
      cell({ row }) {
        const { title } = row.original;
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "row items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "max-w-md truncate font-medium", children: title }) });
      },
      meta: {
        variant: "text",
        placeholder: "Search",
        label: "Title"
      }
    },
    {
      accessorKey: "message",
      header: "Message",
      cell({ row }) {
        const { message } = row.original;
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-flex min-w-full flex-none items-center gap-2", children: message });
      },
      meta: {
        label: "Message",
        hidden: true
      }
    },
    {
      accessorKey: "integration",
      header: "Integration",
      cell({ row }) {
        const integration = row.original.integration;
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: integration?.name });
      },
      meta: {
        label: "Integration"
      }
    },
    {
      accessorKey: "notificationRule",
      header: "Rule",
      cell({ row }) {
        const rule = row.original.notificationRule;
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: rule?.name });
      },
      meta: {
        label: "Rule",
        hidden: true
      }
    },
    {
      accessorKey: "country",
      header: "Country",
      cell({ row }) {
        const { payload } = row.original;
        const event = getEventFromPayload(payload);
        if (!event) {
          return null;
        }
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex min-w-full flex-none items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SerieIcon, { name: event.country }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: event.city })
        ] });
      },
      meta: {
        label: "Country"
      }
    },
    {
      accessorKey: "os",
      header: "OS",
      cell({ row }) {
        const { payload } = row.original;
        const event = getEventFromPayload(payload);
        if (!event) {
          return null;
        }
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-full items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SerieIcon, { name: event.os }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: event.os })
        ] });
      },
      meta: {
        label: "OS"
      }
    },
    {
      accessorKey: "browser",
      header: "Browser",
      cell({ row }) {
        const { payload } = row.original;
        const event = getEventFromPayload(payload);
        if (!event) {
          return null;
        }
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex min-w-full flex-none items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SerieIcon, { name: event.browser }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: event.browser })
        ] });
      },
      meta: {
        label: "Browser"
      }
    },
    {
      accessorKey: "profile",
      header: createHeaderColumn("Profile"),
      cell({ row }) {
        const { payload } = row.original;
        const event = getEventFromPayload(payload);
        if (!event) {
          return null;
        }
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          ProjectLink,
          {
            className: "inline-flex min-w-full flex-none items-center gap-2",
            params: { profileId: event.profileId },
            to: "/profiles/$profileId",
            children: event.profileId
          }
        );
      },
      meta: {
        label: "Profile"
      }
    },
    {
      accessorKey: "createdAt",
      header: "Created at",
      size: ColumnCreatedAt.size,
      cell: ({ row }) => {
        const item = row.original;
        return /* @__PURE__ */ jsxRuntimeExports.jsx(ColumnCreatedAt, { children: item.createdAt });
      },
      filterFn: "isWithinRange",
      meta: {
        variant: "dateRange",
        placeholder: "Created at",
        label: "Created at"
      }
    }
  ];
  return columns;
}
const NotificationsTable = ({ query }) => {
  const columns = useColumns();
  const { data, isLoading, isError } = query;
  const { table } = useTable({
    name: "notifications",
    columns,
    data: data ?? [],
    loading: isLoading,
    pageSize: 50
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DataTableToolbar, { table }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      DataTable,
      {
        empty: {
          title: "No notifications yet",
          description: "Alerts from your rules land here, and in the channels they send to."
        },
        error: isError,
        loading: isLoading,
        table
      }
    )
  ] });
};
function Component() {
  const {
    projectId
  } = Route.useParams();
  const trpc = useTRPC();
  const query = useQuery(trpc.notification.list.queryOptions({
    projectId
  }));
  return /* @__PURE__ */ jsxRuntimeExports.jsx(NotificationsTable, { query });
}
export {
  Component as component
};
//# sourceMappingURL=_app._organizationId._projectId.notifications._tabs.notifications-QVrQu_v-.js.map

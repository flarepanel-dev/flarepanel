import { o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { e as useAppParams, dH as useTableFilters, cr as useCohorts, d as cn, B as Button, F as Funnel, M as Badge, cs as getCohortIds, cx as operators, X, H as pushModal } from "./router-gBnYxPzA.js";
import { g as getPropertyLabel } from "./properties-B42zBES-.js";
const SESSION_LABELS = {
  "session.is_bounce": "Bounced",
  "session.screen_view_count": "Screen views",
  "session.event_count": "Events",
  "session.duration": "Duration",
  "session.revenue": "Revenue",
  "session.performed_event": "Performed event"
};
function humanizeFilterName(name) {
  if (name === "cohort" || name.startsWith("cohort:")) {
    return "Cohort";
  }
  if (SESSION_LABELS[name]) {
    return SESSION_LABELS[name];
  }
  if (name.startsWith("profile.")) {
    const rest = name.replace(/^profile\./, "");
    return `Profile · ${rest.replace(/^properties\./, "")}`;
  }
  if (name.startsWith("group.")) {
    const rest = name.replace(/^group\./, "");
    return `Group · ${rest.replace(/^properties\./, "")}`;
  }
  return getPropertyLabel(name);
}
function formatFilterValue(filter) {
  if (filter.name === "session.is_bounce") {
    const v = filter.value[0];
    if (v === void 0) {
      return "";
    }
    const truthy = typeof v === "boolean" ? v : String(v).toLowerCase() === "true";
    return truthy ? "Yes" : "No";
  }
  return filter.value.filter((v) => v !== null && v !== void 0 && v !== "").map(String).join(", ");
}
function TableFilterPills({
  urlKey,
  categories,
  title,
  className,
  nuqsOptions
}) {
  const { projectId } = useAppParams();
  const [filters, setFilters] = useTableFilters(urlKey, nuqsOptions);
  const cohorts = useCohorts(
    { projectId, includeCount: false },
    { enabled: categories.includes("cohort") }
  );
  const cohortNames = new Map(cohorts.map((c) => [c.id, c.name]));
  const openSheet = () => {
    pushModal("TableFilters", {
      urlKey,
      categories,
      title
    });
  };
  const removeAt = (index) => {
    setFilters(filters.filter((_, i) => i !== index));
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("row flex-wrap items-center gap-2", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { icon: Funnel, onClick: openSheet, size: "sm", variant: "outline", children: [
      "Filters",
      filters.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "ml-2 rounded-full px-1.5 py-0 text-xs", children: filters.length })
    ] }),
    filters.map((filter, index) => {
      const isCohort = filter.operator === "inCohort" || filter.operator === "notInCohort";
      const cohortIds = isCohort ? getCohortIds(filter) : [];
      const valueText = isCohort ? cohortIds.map(
        (id) => cohortNames.get(id) ?? cohortNames.get(id.replace(/^cohort:/, ""))
      ).filter(Boolean).join(", ") || "pick cohort" : formatFilterValue(filter);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "flex h-8 items-stretch overflow-hidden rounded-md border bg-card text-sm",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                className: "cursor-pointer px-2 transition-colors hover:bg-accent",
                onClick: openSheet,
                type: "button",
                children: humanizeFilterName(filter.name)
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                className: "cursor-pointer border-l px-2 lowercase opacity-50 transition-colors hover:bg-accent hover:opacity-100",
                onClick: openSheet,
                type: "button",
                children: operators[filter.operator] ?? filter.operator
              }
            ),
            valueText && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                className: "max-w-40 cursor-pointer truncate border-l px-2 font-semibold transition-colors hover:bg-accent",
                onClick: openSheet,
                type: "button",
                children: valueText
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                "aria-label": "Remove filter",
                className: "cursor-pointer border-l px-2 transition-colors hover:bg-destructive hover:text-destructive-foreground",
                onClick: () => removeAt(index),
                type: "button",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-3" })
              }
            )
          ]
        },
        `${filter.name}-${index}`
      );
    })
  ] });
}
function ReadOnlyFilterPills({
  filters,
  cohortNames,
  className
}) {
  if (filters.length === 0) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("row flex-wrap items-center gap-2", className), children: filters.map((filter, index) => {
    const cohortText = getCohortIds(filter).flatMap((id) => cohortNames[id] ?? []).join(", ");
    const valueText = cohortText || formatFilterValue(filter);
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex h-8 items-center divide-x overflow-hidden rounded-md border bg-card text-sm",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2", children: humanizeFilterName(filter.name) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 lowercase opacity-50", children: operators[filter.operator] ?? filter.operator }),
          valueText && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "max-w-40 truncate px-2 font-semibold", children: valueText })
        ]
      },
      `${filter.name}-${index}`
    );
  }) });
}
export {
  ReadOnlyFilterPills as R,
  TableFilterPills as T
};
//# sourceMappingURL=TableFilterPills-CweHt97V.js.map

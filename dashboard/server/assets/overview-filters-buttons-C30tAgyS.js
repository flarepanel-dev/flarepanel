import { o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { B as Button, H as pushModal, F as Funnel, f as useEventQueryNamesFilter, g as useEventQueryFilters, d as cn, X, e as useAppParams, cr as useCohorts, cs as getCohortIds, ct as DropdownMenuComposed, cu as ComboboxAdvanced, cv as usePropertyValues, cw as FilterOperatorSelect, cx as operators } from "./router-gBnYxPzA.js";
import { g as getPropertyLabel } from "./properties-B42zBES-.js";
function OverviewFilterButton(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Button,
    {
      icon: Funnel,
      onClick: () => pushModal("OverviewFilters", {
        ...props
      }),
      responsive: true,
      variant: "outline",
      children: "Filters"
    }
  );
}
function CohortFilterPill({
  filter,
  nuqsOptions,
  filterModal,
  onRemove,
  onChangeOperator,
  onChangeCohorts
}) {
  const { projectId } = useAppParams();
  const cohorts = useCohorts({ projectId, includeCount: false });
  const selectedIds = getCohortIds(filter);
  const cohortItems = cohorts.map((c) => ({ value: c.id, label: c.name }));
  const valueLabel = selectedIds.map((id) => cohorts.find((c) => c.id === id)?.name).filter(Boolean).join(", ");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-8 items-stretch overflow-hidden rounded-md border text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        className: "cursor-pointer px-2 transition-colors hover:bg-accent",
        onClick: () => pushModal("OverviewFilters", { ...filterModal, nuqsOptions }),
        type: "button",
        children: "Cohort"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      DropdownMenuComposed,
      {
        items: [
          { value: "inCohort", label: "In cohort" },
          { value: "notInCohort", label: "Not in cohort" }
        ],
        label: "Operator",
        onChange: onChangeOperator,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "cursor-pointer border-l px-2 lowercase opacity-50 transition-colors hover:bg-accent hover:opacity-100",
            type: "button",
            children: filter.operator === "inCohort" ? "in cohort" : "not in cohort"
          }
        )
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ComboboxAdvanced,
      {
        items: cohortItems,
        onChange: (next) => onChangeCohorts(
          next.filter((id) => typeof id === "string")
        ),
        value: selectedIds,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "max-w-40 cursor-pointer truncate border-l px-2 font-semibold transition-colors hover:bg-accent",
            type: "button",
            children: valueLabel || /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-normal italic opacity-40", children: "pick cohort" })
          }
        )
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        "aria-label": "Remove filter",
        className: "cursor-pointer border-l px-2 transition-colors hover:bg-destructive hover:text-destructive-foreground",
        onClick: onRemove,
        type: "button",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-3" })
      }
    )
  ] });
}
function FilterPill({
  filter,
  nuqsOptions,
  filterModal,
  onRemove,
  onChangeOperator,
  onChangeValue
}) {
  const { projectId } = useAppParams();
  const potentialValues = usePropertyValues({
    event: "*",
    property: filter.name,
    projectId
  });
  const noValueNeeded = filter.operator === "isNull" || filter.operator === "isNotNull";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-8 items-stretch overflow-hidden rounded-md border text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        className: "cursor-pointer px-2 transition-colors hover:bg-accent",
        onClick: () => pushModal("OverviewFilters", { ...filterModal, nuqsOptions }),
        type: "button",
        children: getPropertyLabel(filter.name)
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(FilterOperatorSelect, { onChange: onChangeOperator, value: filter.operator, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        className: "cursor-pointer border-l px-2 lowercase opacity-50 transition-colors hover:bg-accent hover:opacity-100",
        type: "button",
        children: operators[filter.operator]
      }
    ) }),
    !noValueNeeded && /* @__PURE__ */ jsxRuntimeExports.jsx(
      ComboboxAdvanced,
      {
        items: potentialValues.map((v) => ({ value: v, label: v })),
        onChange: onChangeValue,
        value: filter.value,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "max-w-40 cursor-pointer truncate border-l px-2 font-semibold transition-colors hover:bg-accent",
            type: "button",
            children: filter.value.length > 0 ? filter.value.join(", ") : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-normal italic opacity-40", children: "pick value" })
          }
        )
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        "aria-label": "Remove filter",
        className: "cursor-pointer border-l px-2 transition-colors hover:bg-destructive hover:text-destructive-foreground",
        onClick: onRemove,
        type: "button",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-3" })
      }
    )
  ] });
}
function OverviewFiltersButtons({
  className,
  nuqsOptions,
  filterModal
}) {
  const [events, setEvents] = useEventQueryNamesFilter(nuqsOptions);
  const [filters, setFilter, setFilters, removeFilter] = useEventQueryFilters(nuqsOptions);
  if (filters.length === 0 && events.length === 0) {
    return null;
  }
  const updateCohortFilter = (updated) => {
    setFilters(
      (prev) => prev.map(
        (f) => f.name === updated.name ? {
          id: updated.id ?? updated.name,
          name: updated.name,
          operator: updated.operator,
          value: updated.value.map((v) => v == null ? "" : String(v)),
          ...updated.cohortIds ? { cohortIds: updated.cohortIds } : {},
          ...updated.cohortId ? { cohortId: updated.cohortId } : {}
        } : f
      )
    );
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("flex flex-wrap gap-2", className), children: [
    events.map((event) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        icon: X,
        onClick: () => setEvents((p) => p.filter((e) => e !== event)),
        size: "sm",
        variant: "outline",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "font-semibold", children: event })
      },
      event
    )),
    filters.map((filter) => {
      const isCohort = filter.operator === "inCohort" || filter.operator === "notInCohort";
      if (isCohort) {
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          CohortFilterPill,
          {
            filter,
            filterModal,
            nuqsOptions,
            onChangeCohorts: (cohortIds) => updateCohortFilter({
              ...filter,
              cohortId: cohortIds[0],
              cohortIds
            }),
            onChangeOperator: (operator) => updateCohortFilter({ ...filter, operator }),
            onRemove: () => removeFilter(filter.name)
          },
          filter.name
        );
      }
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        FilterPill,
        {
          filter,
          filterModal,
          nuqsOptions,
          onChangeOperator: (operator) => setFilter(filter.name, filter.value, operator),
          onChangeValue: (value) => setFilter(filter.name, value, filter.operator),
          onRemove: () => removeFilter(filter.name)
        },
        filter.name
      );
    })
  ] });
}
export {
  OverviewFiltersButtons as O,
  OverviewFilterButton as a
};
//# sourceMappingURL=overview-filters-buttons-C30tAgyS.js.map

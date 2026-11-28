import { o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { e as useAppParams, a as useTRPC, ak as useQueryClient, j as useQuery, b as useMutation, dM as handleError, B as Button, H as pushModal, hb as showConfirm, hi as Trash2, G as Plus, au as useForm, av as a, as as Ut, dQ as Controller, aS as WithLabel, dV as TagInput, fm as Save, fM as useEventNames, fP as ComboboxEvents, fw as PureFilterItem, fp as PropertiesCombobox, fB as shortId, d$ as FullPageLoadingState } from "./router-gBnYxPzA.js";
import { b as Widget, a as WidgetHead, W as WidgetBody } from "./widget-D7PGEeO1.js";
import { P as Pencil } from "./pencil-C1NQD0wZ.js";
import { z as zProjectFilterEvent } from "./project.constants-BD1UHdjH.js";
import { o as object, h as array, s as string } from "./pick-CfnSzKDx.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "fs";
import "util";
import "stream";
import "zlib";
import "assert";
import "buffer";
function CustomEvents() {
  const { projectId } = useAppParams();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const query = useQuery(trpc.customEvent.list.queryOptions({ projectId }));
  const deletion = useMutation(
    trpc.customEvent.delete.mutationOptions({
      onSuccess() {
        queryClient.invalidateQueries(trpc.customEvent.list.pathFilter());
        queryClient.invalidateQueries(trpc.chart.pathFilter());
      },
      onError: handleError
    })
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Widget, { className: "w-full max-w-screen-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(WidgetHead, { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "title", children: "Custom events" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: 'Name a group of events once, like "Used navigation", and pick it in any report. Each event can be narrowed with its own filters.' })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(WidgetBody, { className: "col gap-2", children: [
      query.data?.map((customEvent) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "row items-center gap-2 rounded-lg border bg-def-100 p-2 pl-4",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate font-medium", children: customEvent.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-muted-foreground text-sm", children: customEvent.items.map((item) => item.name).join(", ") })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                "aria-label": `Edit ${customEvent.name}`,
                icon: Pencil,
                onClick: () => pushModal("CustomEvent", { customEvent }),
                size: "icon",
                variant: "ghost"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                "aria-label": `Delete ${customEvent.name}`,
                icon: Trash2,
                onClick: () => showConfirm({
                  title: "Delete custom event",
                  text: `Reports using "${customEvent.name}" will stop loading until you pick another event.`,
                  onConfirm() {
                    deletion.mutate({ id: customEvent.id, projectId });
                  }
                }),
                size: "icon",
                variant: "ghost"
              }
            )
          ]
        },
        customEvent.id
      )),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          icon: Plus,
          onClick: () => pushModal("CustomEvent"),
          variant: "outline",
          children: "Add custom event"
        }
      ) })
    ] })
  ] });
}
const validator = object({
  ips: array(string()),
  profileIds: array(string()),
  eventRules: array(zProjectFilterEvent.omit({ type: true }))
});
function EventRuleItem({
  projectId,
  rule,
  onChange,
  onRemove
}) {
  const eventNames = useEventNames({ projectId, anyEvents: true });
  const addFilter = (action) => {
    onChange({
      ...rule,
      filters: [
        ...rule.filters,
        { id: shortId(), name: action.value, operator: "is", value: [] }
      ]
    });
  };
  const removeFilter = (filter) => {
    onChange({
      ...rule,
      filters: rule.filters.filter((f) => f.id !== filter.id)
    });
  };
  const changeFilterValue = (value, filter) => {
    onChange({
      ...rule,
      filters: rule.filters.map(
        (f) => f.id === filter.id ? { ...f, value } : f
      )
    });
  };
  const changeFilterOperator = (operator, filter) => {
    onChange({
      ...rule,
      filters: rule.filters.map(
        (f) => f.id === filter.id ? { ...f, operator, value: f.value.filter(Boolean).slice(0, 1) } : f
      )
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-def-100", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        ComboboxEvents,
        {
          className: "w-full",
          items: eventNames,
          onChange: (name) => onChange({ ...rule, name }),
          placeholder: "Select event name...",
          searchable: true,
          value: rule.name
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: onRemove, size: "icon", variant: "ghost", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 16 }) })
    ] }),
    rule.filters.map((filter) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      PureFilterItem,
      {
        className: "border-t border-l-2 border-l-emerald-500 p-2 px-4",
        eventName: rule.name,
        filter,
        immediateInput: true,
        onChangeOperator: changeFilterOperator,
        onChangeValue: changeFilterValue,
        onRemove: removeFilter
      },
      filter.id
    )),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PropertiesCombobox, { categories: ["event"], onSelect: addFilter, children: (setOpen) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        icon: Plus,
        onClick: () => setOpen(true),
        size: "sm",
        variant: "outline",
        children: "Add property filter"
      }
    ) }) })
  ] });
}
function EditProjectFilters({ project }) {
  const form = useForm({
    resolver: a(validator),
    defaultValues: {
      ips: project.filters.filter((item) => item.type === "ip").map((item) => item.ip),
      profileIds: project.filters.filter(
        (item) => item.type === "profile_id"
      ).map((item) => item.profileId),
      eventRules: project.filters.filter((item) => item.type === "event").map(({ name, filters, segment, property, displayName }) => ({
        name,
        filters,
        segment,
        property,
        displayName
      }))
    }
  });
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const mutation = useMutation(
    trpc.project.update.mutationOptions({
      onError: handleError,
      onSuccess: () => {
        Ut.success("Project filters updated");
        queryClient.invalidateQueries(
          trpc.project.getProjectWithClients.queryFilter({
            projectId: project.id
          })
        );
      }
    })
  );
  const onSubmit = (values) => {
    mutation.mutate({
      id: project.id,
      filters: [
        ...values.ips.map((ip) => ({ type: "ip", ip })),
        ...values.profileIds.map((profileId) => ({
          type: "profile_id",
          profileId
        })),
        ...values.eventRules.filter((rule) => rule.name).map((rule) => ({
          type: "event",
          ...rule
        }))
      ]
    });
  };
  const eventRules = form.watch("eventRules");
  const addEventRule = () => {
    form.setValue("eventRules", [
      ...eventRules,
      { name: "", filters: [], segment: "event" }
    ]);
  };
  const updateEventRule = (index, rule) => {
    const updated = [...eventRules];
    updated[index] = rule;
    form.setValue("eventRules", updated);
  };
  const removeEventRule = (index) => {
    form.setValue(
      "eventRules",
      eventRules.filter((_, i) => i !== index)
    );
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Widget, { className: "w-full max-w-screen-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(WidgetHead, { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "title", children: "Exclude events" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Exclude events from being tracked by adding filters." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetBody, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Controller,
        {
          control: form.control,
          name: "ips",
          render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsx(WithLabel, { label: "IP addresses", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            TagInput,
            {
              ...field,
              error: form.formState.errors.ips?.message,
              id: "IP addresses",
              onChange: field.onChange,
              placeholder: "Exclude IP addresses",
              value: field.value
            }
          ) })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Controller,
        {
          control: form.control,
          name: "profileIds",
          render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsx(WithLabel, { label: "Profile IDs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            TagInput,
            {
              ...field,
              error: form.formState.errors.profileIds?.message,
              id: "Profile IDs",
              onChange: field.onChange,
              placeholder: "Exclude Profile IDs",
              value: field.value
            }
          ) })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(WithLabel, { label: "Event rules", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        eventRules.map((rule, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          EventRuleItem,
          {
            onChange: (updated) => updateEventRule(index, updated),
            onRemove: () => removeEventRule(index),
            projectId: project.id,
            rule
          },
          index
        )),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            icon: Plus,
            onClick: addEventRule,
            size: "sm",
            type: "button",
            variant: "outline",
            children: "Add event rule"
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          className: "self-end",
          icon: Save,
          loading: mutation.isPending,
          onClick: form.handleSubmit(onSubmit),
          type: "button",
          children: "Save"
        }
      )
    ] }) })
  ] });
}
function Component() {
  const {
    projectId
  } = useAppParams();
  const trpc = useTRPC();
  const query = useQuery(trpc.project.getProjectWithClients.queryOptions({
    projectId
  }));
  if (query.isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(FullPageLoadingState, {});
  }
  if (!query.data) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Project not found" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col gap-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CustomEvents, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(EditProjectFilters, { project: query.data })
  ] });
}
export {
  Component as component
};
//# sourceMappingURL=_app._organizationId._projectId.settings._tabs.events-BwWPOb-J.js.map

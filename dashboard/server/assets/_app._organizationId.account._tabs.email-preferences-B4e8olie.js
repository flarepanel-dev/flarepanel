import { o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { e as emailCategories } from "./email.constants-BwQe1Y3f.js";
import { a as useTRPC, ak as useQueryClient, au as useForm, av as a, b as useMutation, dM as handleError, as as Ut, dQ as Controller, fU as Switch, B as Button, fm as Save } from "./router-gBnYxPzA.js";
import { u as useSuspenseQuery } from "./useSuspenseQuery-BHKQGd6F.js";
import { b as Widget, a as WidgetHead, W as WidgetBody } from "./widget-D7PGEeO1.js";
import { o as object, r as record, i as boolean, s as string } from "./pick-CfnSzKDx.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "fs";
import "util";
import "stream";
import "zlib";
import "assert";
import "buffer";
const validator = object({
  categories: record(string(), boolean())
});
function buildCategoryDefaults(savedPreferences) {
  return Object.keys(emailCategories).reduce((acc, category) => {
    acc[category] = savedPreferences?.[category] ?? true;
    return acc;
  }, {});
}
function Component() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const preferencesQuery = useSuspenseQuery(trpc.email.getPreferences.queryOptions());
  const {
    control,
    handleSubmit,
    formState,
    reset
  } = useForm({
    defaultValues: {
      categories: buildCategoryDefaults(preferencesQuery.data)
    },
    resolver: a(validator)
  });
  const mutation = useMutation(trpc.email.updatePreferences.mutationOptions({
    onSuccess: async () => {
      Ut("Email preferences updated", {
        description: "Your email preferences have been saved."
      });
      await queryClient.invalidateQueries(trpc.email.getPreferences.pathFilter());
      const freshData = await queryClient.fetchQuery(trpc.email.getPreferences.queryOptions());
      reset({
        categories: buildCategoryDefaults(freshData)
      });
    },
    onError: handleError
  }));
  return /* @__PURE__ */ jsxRuntimeExports.jsx("form", { onSubmit: handleSubmit((values) => {
    mutation.mutate(values);
  }), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Widget, { className: "w-full max-w-screen-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "title", children: "Email Preferences" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(WidgetBody, { className: "col gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-4 text-muted-foreground text-sm", children: "Choose which types of emails you want to receive. Uncheck a category to stop receiving those emails." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: Object.entries(emailCategories).map(([category, {
        label,
        description
      }]) => /* @__PURE__ */ jsxRuntimeExports.jsx(Controller, { control, name: `categories.${category}`, render: ({
        field
      }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4 rounded-md border border-border px-4 py-4 transition-colors hover:bg-def-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground text-sm", children: description })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: field.value, disabled: mutation.isPending, onCheckedChange: field.onChange })
      ] }) }, category)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "mt-4 self-end", disabled: !formState.isDirty || mutation.isPending, icon: Save, loading: mutation.isPending, size: "sm", type: "submit", children: "Save" })
    ] })
  ] }) });
}
export {
  Component as component
};
//# sourceMappingURL=_app._organizationId.account._tabs.email-preferences-B4e8olie.js.map

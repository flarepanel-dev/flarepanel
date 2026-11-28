import { b as useRouter, o as jsxRuntimeExports, a as reactExports } from "./worker-entry-C5kSRogq.js";
import { a as useTRPC, ak as useQueryClient, j as useQuery, b as useMutation, dM as handleError, as as Ut, aD as Alert, aE as AlertTitle, aF as AlertDescription, a_ as format, B as Button, dK as Trash, hb as showConfirm, au as useForm, av as a, ax as InputWithLabel, c2 as Label, fU as Switch, dP as AnimateHeight, aK as Input, dQ as Controller, aS as WithLabel, dV as TagInput, i8 as CheckboxInput, fm as Save, e as useAppParams, d$ as FullPageLoadingState } from "./router-gBnYxPzA.js";
import { b as Widget, a as WidgetHead, W as WidgetBody } from "./widget-D7PGEeO1.js";
import { s as startOfHour, a as addHours } from "./startOfHour-BQ1MZD7v.js";
import { a as zProject } from "./project.constants-BD1UHdjH.js";
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
function DeleteProject({ project }) {
  useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: organization } = useQuery(
    trpc.organization.get.queryOptions({
      organizationId: project.organizationId
    })
  );
  const isOrgScheduledForDeletion = !!organization?.deleteAt;
  const mutation = useMutation(
    trpc.project.delete.mutationOptions({
      onError: handleError,
      onSuccess: () => {
        Ut.success("Project is scheduled for deletion");
        queryClient.invalidateQueries(
          trpc.project.getProjectWithClients.queryFilter({
            projectId: project.id
          })
        );
      }
    })
  );
  const cancelDeletionMutation = useMutation(
    trpc.project.cancelDeletion.mutationOptions({
      onError: handleError,
      onSuccess: () => {
        Ut.success("Project deletion cancelled");
        queryClient.invalidateQueries(
          trpc.project.getProjectWithClients.queryFilter({
            projectId: project.id
          })
        );
      }
    })
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Widget, { className: "settings-danger w-full max-w-screen-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "title", children: "Delete Project" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(WidgetBody, { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Deleting your project will remove it from your organization and all of its data. It'll be permanently deleted after 24 hours." }),
      project?.deleteAt && /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { variant: "destructive", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTitle, { children: "Project scheduled for deletion" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDescription, { children: [
          "This project will be deleted on",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", {
            className: "font-medium",
            // add 1 hour and round to the nearest hour
            // Since we run cron once an hour
            children: format(
              startOfHour(addHours(project.deleteAt, 1)),
              "yyyy-MM-dd HH:mm:ss"
            )
          }),
          ". Any event associated with this project will be deleted.",
          isOrgScheduledForDeletion && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            " ",
            "The whole organization is scheduled for deletion. To keep this project, cancel the deletion from the organization settings."
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-start gap-4", children: [
        project?.deleteAt && /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            disabled: isOrgScheduledForDeletion,
            loading: cancelDeletionMutation.isPending,
            onClick: () => {
              cancelDeletionMutation.mutate({ projectId: project.id });
            },
            variant: "outline",
            children: "Cancel deletion"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            disabled: !!project?.deleteAt,
            icon: Trash,
            loading: mutation.isPending,
            onClick: () => {
              showConfirm({
                title: "Delete Project",
                text: "Are you sure you want to delete this project?",
                onConfirm: () => {
                  mutation.mutate({ projectId: project.id });
                }
              });
            },
            variant: "destructive",
            children: "Delete Project"
          }
        )
      ] })
    ] })
  ] });
}
const validator = zProject.pick({
  name: true,
  id: true,
  domain: true,
  cors: true,
  crossDomain: true,
  allowUnsafeRevenueTracking: true
});
function EditProjectDetails({ project }) {
  const [hasDomain, setHasDomain] = reactExports.useState(project.domain !== null);
  const form = useForm({
    resolver: a(validator),
    defaultValues: {
      id: project.id,
      name: project.name,
      domain: project.domain,
      cors: project.cors,
      crossDomain: project.crossDomain,
      allowUnsafeRevenueTracking: project.allowUnsafeRevenueTracking
    }
  });
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const mutation = useMutation(
    trpc.project.update.mutationOptions({
      onError: handleError,
      onSuccess: () => {
        Ut.success("Project updated");
        queryClient.invalidateQueries(
          trpc.project.list.queryFilter({
            organizationId: project.organizationId
          })
        );
        queryClient.invalidateQueries(
          trpc.project.getProjectWithClients.queryFilter({
            projectId: project.id
          })
        );
      }
    })
  );
  const onSubmit = (values) => {
    if (hasDomain) {
      let error = false;
      if (values.cors.length === 0) {
        form.setError("cors", {
          type: "required",
          message: "Please add at least one cors domain"
        });
        error = true;
      }
      if (!values.domain) {
        form.setError("domain", {
          type: "required",
          message: "Please add a domain"
        });
        error = true;
      }
      if (error) {
        return;
      }
    }
    mutation.mutate(hasDomain ? values : { ...values, cors: [], domain: null });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Widget, { className: "w-full max-w-screen-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "title", children: "Details" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetBody, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "col gap-4", onSubmit: form.handleSubmit(onSubmit), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        InputWithLabel,
        {
          label: "Name",
          ...form.register("name"),
          defaultValue: project.name
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "-mb-2 flex items-center justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "mb-0", children: "Domain" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: hasDomain, onCheckedChange: setHasDomain })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AnimateHeight, { open: hasDomain, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "https://example.com",
            ...form.register("domain"),
            className: "mb-4",
            defaultValue: project.domain ?? "",
            error: form.formState.errors.domain?.message
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            control: form.control,
            name: "cors",
            render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              WithLabel,
              {
                error: form.formState.errors.cors?.message,
                label: "Allowed domains",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TagInput,
                  {
                    ...field,
                    error: form.formState.errors.cors?.message,
                    onChange: (newValue) => {
                      field.onChange(
                        newValue.map((item) => {
                          const trimmed = item.trim();
                          if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed === "*") {
                            return trimmed;
                          }
                          return `https://${trimmed}`;
                        })
                      );
                    },
                    placeholder: "Add a domain",
                    renderTag: (tag) => tag === "*" ? "Allow all domains" : tag,
                    value: field.value ?? []
                  }
                )
              }
            )
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            control: form.control,
            name: "crossDomain",
            render: ({ field }) => {
              return /* @__PURE__ */ jsxRuntimeExports.jsx(WithLabel, { className: "mt-4", label: "Cross domain support", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                CheckboxInput,
                {
                  defaultChecked: field.value,
                  onBlur: field.onBlur,
                  onCheckedChange: field.onChange,
                  ref: field.ref,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Enable cross domain support" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-normal text-muted-foreground", children: "This will let you track users across multiple domains" })
                  ]
                }
              ) });
            }
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Controller,
        {
          control: form.control,
          name: "allowUnsafeRevenueTracking",
          render: ({ field }) => {
            return /* @__PURE__ */ jsxRuntimeExports.jsx(WithLabel, { label: "Revenue tracking", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              CheckboxInput,
              {
                defaultChecked: field.value,
                onBlur: field.onBlur,
                onCheckedChange: field.onChange,
                ref: field.ref,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: 'Allow "unsafe" revenue tracking' }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-normal text-muted-foreground", children: "With this enabled, you can track revenue from client code." })
                ]
              }
            ) });
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          className: "self-start",
          icon: Save,
          loading: mutation.isPending,
          type: "submit",
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(EditProjectDetails, { project: query.data }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteProject, { project: query.data })
  ] });
}
export {
  Component as component
};
//# sourceMappingURL=_app._organizationId._projectId.settings._tabs.details-Dc7t1q-m.js.map

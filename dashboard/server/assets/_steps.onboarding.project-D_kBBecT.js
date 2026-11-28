import { a as reactExports, o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { c as createLucideIcon, a as useTRPC, ak as useQueryClient, j as useQuery, $ as useNavigate, b as useMutation, dL as rememberOnboardingKeys, dM as handleError, au as useForm, av as a, dN as zOnboardingProject, dO as useWatch, c2 as Label, d as cn, dP as AnimateHeight, dQ as Controller, aS as WithLabel, dR as Combobox, aT as fieldMessageId, ax as InputWithLabel, dS as Monitor, dT as Smartphone, dU as Server, C as Check, dV as TagInput, B as Button, dW as readAttribution } from "./router-gBnYxPzA.js";
import { O as OnboardingHeading } from "./onboarding-heading-H3qQoDd5.js";
import { u as useSecondsOnStep, t as trackFunnel, f as failureReason } from "./funnel-tracking-CMJu0A5n.js";
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
const __iconNode = [
  ["path", { d: "M12 10h.01", key: "1nrarc" }],
  ["path", { d: "M12 14h.01", key: "1etili" }],
  ["path", { d: "M12 6h.01", key: "1vi96p" }],
  ["path", { d: "M16 10h.01", key: "1m94wz" }],
  ["path", { d: "M16 14h.01", key: "1gbofw" }],
  ["path", { d: "M16 6h.01", key: "1x0f13" }],
  ["path", { d: "M8 10h.01", key: "19clt8" }],
  ["path", { d: "M8 14h.01", key: "6423bh" }],
  ["path", { d: "M8 6h.01", key: "1dz90k" }],
  ["path", { d: "M9 22v-3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3", key: "cabbwy" }],
  ["rect", { x: "4", y: "2", width: "16", height: "20", rx: "2", key: "1uxh74" }]
];
const Building = createLucideIcon("building", __iconNode);
const PROJECT_TYPES = [{
  key: "website",
  label: "Website",
  description: "Pages, traffic sources, funnels",
  Icon: Monitor
}, {
  key: "app",
  label: "App",
  description: "iOS, Android, React Native",
  Icon: Smartphone
}, {
  key: "backend",
  label: "Backend / API",
  description: "Server-side events",
  Icon: Server
}];
const TIMEZONES = ["UTC", ...Intl.supportedValuesOf("timeZone")].map((zone) => ({
  value: zone,
  label: zone
}));
function toOrigin(value) {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "*" || /^https?:\/\//.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}
function Component() {
  const workspaceFieldId = reactExports.useId();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const {
    data: organizations
  } = useQuery(trpc.organization.list.queryOptions(void 0, {
    initialData: []
  }));
  const navigate = useNavigate();
  const secondsOnStep = useSecondsOnStep();
  const mutation = useMutation(trpc.onboarding.project.mutationOptions({
    onError(error) {
      trackFunnel("onboarding_project_create_failed", {
        reason: failureReason(error)
      });
      handleError(error);
    },
    onSuccess(res, input) {
      trackFunnel("onboarding_project_created", {
        projectId: res.projectId,
        types: [input.website && "website", input.app && "app", input.backend && "backend"].filter((type) => Boolean(type)),
        hasDomain: Boolean(input.domain),
        extraDomains: Math.max(0, (input.cors ?? []).length - 1),
        createdWorkspace: Boolean(input.organization),
        secondsOnStep: secondsOnStep()
      });
      queryClient.invalidateQueries(trpc.organization.list.queryFilter());
      if (res.projectId) {
        rememberOnboardingKeys(res.projectId, {
          clientSecret: res.secret,
          mcpToken: res.mcpToken
        });
      }
      navigate({
        to: "/onboarding/$projectId/connect",
        params: {
          projectId: res.projectId
        }
      });
    }
  }));
  const form = useForm({
    resolver: a(zOnboardingProject),
    defaultValues: {
      organization: "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      project: "",
      domain: "",
      cors: [],
      website: false,
      app: false,
      backend: false
    }
  });
  const [isWebsite, isApp, isBackend, projectName, domain, workspaceName] = useWatch({
    control: form.control,
    name: ["website", "app", "backend", "project", "domain", "organization"]
  });
  const selectedTypes = {
    website: isWebsite,
    app: isApp,
    backend: isBackend
  };
  const hasWorkspaces = organizations.length > 0;
  const [useExistingWorkspace, setUseExistingWorkspace] = reactExports.useState(true);
  const createsWorkspace = !(hasWorkspaces && useExistingWorkspace);
  const [workspaceEdited, setWorkspaceEdited] = reactExports.useState(false);
  const [showWorkspaceSettings, setShowWorkspaceSettings] = reactExports.useState(false);
  const [showCorsInput, setShowCorsInput] = reactExports.useState(false);
  const autoOrigin = reactExports.useRef(null);
  reactExports.useEffect(() => {
    trackFunnel("onboarding_project_viewed", {
      hasWorkspaces
    });
  }, [hasWorkspaces]);
  reactExports.useEffect(() => {
    if (!workspaceEdited) {
      form.setValue("organization", projectName);
    }
  }, [projectName, workspaceEdited, form]);
  reactExports.useEffect(() => {
    if (!isWebsite) {
      form.setValue("domain", null);
      form.setValue("cors", []);
      setShowCorsInput(false);
    }
  }, [isWebsite, form]);
  reactExports.useEffect(() => {
    form.clearErrors();
  }, [isWebsite, isApp, isBackend, form]);
  const onSubmit = ({
    organization,
    organizationId,
    ...values
  }) => {
    if (createsWorkspace) {
      mutation.mutate({
        ...values,
        organization,
        attribution: readAttribution()
      });
      return;
    }
    if (!organizationId) {
      form.setError("organizationId", {
        message: "Select a workspace"
      });
      return;
    }
    mutation.mutate({
      ...values,
      organizationId
    });
  };
  const onInvalid = (errors) => {
    trackFunnel("onboarding_project_invalid", {
      fields: Object.keys(errors)
    });
  };
  const typeError = form.formState.errors.website?.message ?? form.formState.errors.app?.message ?? form.formState.errors.backend?.message;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "col", onSubmit: form.handleSubmit(onSubmit, onInvalid), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(OnboardingHeading, { className: "mb-10", description: "A project is one website, app or service you want to track. You can add more later.", title: hasWorkspaces ? "Create a project" : "Create your first project" }),
    hasWorkspaces && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col mb-10 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "mb-0 text-base", children: "Workspace" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-1 rounded-xl bg-def-200 p-1 dark:bg-def-300", children: [{
        label: "Use existing workspace",
        existing: true
      }, {
        label: "Create new workspace",
        existing: false
      }].map((option) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { "aria-pressed": useExistingWorkspace === option.existing, className: cn("rounded-lg px-4 py-2.5 font-medium transition-colors", useExistingWorkspace === option.existing ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"), onClick: () => {
        trackFunnel("onboarding_workspace_mode_changed", {
          mode: option.existing ? "existing" : "new"
        });
        setUseExistingWorkspace(option.existing);
      }, type: "button", children: option.label }, option.label)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AnimateHeight, { open: !createsWorkspace, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Controller, { control: form.control, name: "organizationId", render: ({
        field,
        formState
      }) => /* @__PURE__ */ jsxRuntimeExports.jsx(WithLabel, { error: formState.errors.organizationId?.message, id: workspaceFieldId, label: "Which workspace?", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Combobox, { "aria-describedby": formState.errors.organizationId ? fieldMessageId(workspaceFieldId) : void 0, className: "w-full", error: formState.errors.organizationId?.message, icon: Building, id: workspaceFieldId, items: organizations.map((item) => ({
        label: item.name,
        value: item.id
      })), onChange: field.onChange, placeholder: "Select workspace", size: "xl", value: field.value, variant: "input" }) }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(InputWithLabel, { autoFocus: true, className: "mb-10", error: form.formState.errors.project?.message, label: "Project name", placeholder: "Acme", size: "xl", ...form.register("project") }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col mb-10 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "mb-0 text-base", children: "What are you tracking?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-3", children: PROJECT_TYPES.map(({
        key,
        label,
        description,
        Icon
      }) => {
        const active = selectedTypes[key];
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { "aria-pressed": active, className: cn("col relative items-start gap-3 rounded-xl p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", active ? "bg-foreground text-background" : "bg-def-200 hover:bg-def-300 dark:bg-def-300 dark:hover:bg-def-400/60"), onClick: () => {
          trackFunnel("onboarding_project_type_toggled", {
            type: key,
            selected: !active
          });
          form.setValue(key, !active, {
            shouldValidate: true
          });
        }, type: "button", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 22, strokeWidth: 1.75 }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "col gap-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("text-xs", active ? "text-background/70" : "text-muted-foreground"), children: description })
          ] }),
          active && /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "absolute top-4 right-4", size: 16 })
        ] }, key);
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "Pick everything that applies. It only decides which install guides we show first." }),
      typeError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-destructive text-sm", children: "Pick at least one thing to track" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimateHeight, { open: isWebsite, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col gap-3 pb-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(InputWithLabel, { error: form.formState.errors.domain?.message, hint: "Browser events are only accepted from this domain.", inputMode: "url", label: "Website URL", placeholder: "acme.com", size: "xl", ...form.register("domain"), onBlur: (event) => {
        const value = toOrigin(event.target.value);
        if (!value) {
          return;
        }
        form.setValue("domain", value, {
          shouldValidate: true
        });
        const cors = form.getValues().cors;
        const previous = autoOrigin.current;
        autoOrigin.current = value;
        if (previous && cors.includes(previous)) {
          form.setValue("cors", cors.map((origin) => origin === previous ? value : origin));
          return;
        }
        if (cors.length === 0) {
          form.setValue("cors", [value]);
        }
      } }),
      domain && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "self-start text-muted-foreground text-sm hover:text-foreground hover:underline", onClick: () => {
        trackFunnel("onboarding_extra_domains_toggled", {
          open: !showCorsInput
        });
        setShowCorsInput((open) => !open);
      }, type: "button", children: "Also track other domains (staging, localhost…)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AnimateHeight, { open: showCorsInput, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Controller, { control: form.control, name: "cors", render: ({
        field
      }) => /* @__PURE__ */ jsxRuntimeExports.jsx(WithLabel, { error: form.formState.errors.cors?.message, label: "Allowed domains", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TagInput, { ...field, error: form.formState.errors.cors?.message, onChange: (values) => field.onChange(values.map(toOrigin)), placeholder: "Add a domain and press Enter", renderTag: (tag) => tag === "*" ? "Any domain" : tag, value: field.value ?? [] }) }) }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimateHeight, { open: createsWorkspace, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col mb-10 gap-3 rounded-xl border p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground text-sm", children: [
          "Workspace",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: workspaceName || "named after the project" }),
          " ",
          "· ",
          form.getValues("timezone")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "shrink-0 text-sm underline-offset-4 hover:underline", onClick: () => {
          trackFunnel("onboarding_workspace_settings_toggled", {
            open: !showWorkspaceSettings
          });
          setShowWorkspaceSettings((open) => !open);
        }, type: "button", children: showWorkspaceSettings ? "Done" : "Change" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AnimateHeight, { open: showWorkspaceSettings, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 pt-3 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(InputWithLabel, { error: form.formState.errors.organization?.message, hint: "Your team and billing live here.", label: "Workspace name", placeholder: "Acme Inc", size: "xl", ...form.register("organization", {
          onChange: () => setWorkspaceEdited(true)
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Controller, { control: form.control, name: "timezone", render: ({
          field
        }) => /* @__PURE__ */ jsxRuntimeExports.jsx(WithLabel, { hint: "Used for daily and weekly reports.", label: "Timezone", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Combobox, { className: "w-full", items: TIMEZONES, onChange: field.onChange, placeholder: "Select timezone", searchable: true, size: "xl", value: field.value }) }) })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "row justify-end border-t pt-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "min-w-44", loading: mutation.isPending, size: "xl", type: "submit", children: "Create project" }) })
  ] });
}
export {
  Component as component
};
//# sourceMappingURL=_steps.onboarding.project-D_kBBecT.js.map

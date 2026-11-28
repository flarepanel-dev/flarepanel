import { o as jsxRuntimeExports, a as reactExports } from "./worker-entry-C5kSRogq.js";
import { a as useTRPC, ak as useQueryClient, j as useQuery, aY as isOrganizationAdminRole, b as useMutation, dM as handleError, as as Ut, dY as KeyRound, M as Badge, dZ as ExternalLink, bQ as formatDate, B as Button, aK as Input, aD as Alert, aE as AlertTitle, aF as AlertDescription, a_ as format, dK as Trash, H as pushModal, d_ as Route, d$ as FullPageLoadingState, E as EmptyState, w as Building2, au as useForm, ax as InputWithLabel, dQ as Controller, aS as WithLabel, dR as Combobox } from "./router-gBnYxPzA.js";
import { P as PageHeader } from "./page-header-DbGieVLw.js";
import { b as Widget, a as WidgetHead, W as WidgetBody } from "./widget-D7PGEeO1.js";
import { s as startOfHour, a as addHours } from "./startOfHour-BQ1MZD7v.js";
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
const PROVIDERS = [
  {
    id: "openai",
    label: "OpenAI",
    placeholder: "sk-...",
    keysUrl: "https://platform.openai.com/api-keys"
  },
  {
    id: "anthropic",
    label: "Anthropic",
    placeholder: "sk-ant-...",
    keysUrl: "https://console.anthropic.com/settings/keys"
  }
];
function AiKeys({ organizationId }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: myAccess } = useQuery(
    trpc.organization.myAccess.queryOptions({ organizationId })
  );
  const keys = useQuery(trpc.chat.aiKeys.queryOptions({ organizationId }));
  const isAdmin = Boolean(myAccess && isOrganizationAdminRole(myAccess.role));
  const refresh = () => {
    queryClient.invalidateQueries(trpc.chat.aiKeys.pathFilter());
    queryClient.invalidateQueries(trpc.chat.models.pathFilter());
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Widget, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetHead, { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "title", children: "AI provider key" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(WidgetBody, { className: "col gap-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "The AI assistant, report drafts, AI filters and insight summaries run on your own OpenAI or Anthropic key. Your provider bills you directly for what you use; FlarePanel adds no AI charges and no AI limits beyond a short per-minute burst limit. The key is stored encrypted and is never shown again after you save it." }),
      PROVIDERS.map((provider) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        ProviderKey,
        {
          isAdmin,
          onChange: refresh,
          organizationId,
          provider,
          saved: keys.data?.find((row) => row.provider === provider.id)
        },
        provider.id
      )),
      !isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "Only workspace admins can add or remove keys." })
    ] })
  ] });
}
function ProviderKey({
  provider,
  saved,
  isAdmin,
  organizationId,
  onChange
}) {
  const trpc = useTRPC();
  const [value, setValue] = reactExports.useState("");
  const [editing, setEditing] = reactExports.useState(false);
  const save = useMutation(
    trpc.chat.saveAiKey.mutationOptions({
      onSuccess() {
        Ut.success(`${provider.label} key saved`, {
          description: "It works: AI features now run on your key."
        });
        setValue("");
        setEditing(false);
        onChange();
      },
      onError: handleError
    })
  );
  const remove = useMutation(
    trpc.chat.removeAiKey.mutationOptions({
      onSuccess() {
        Ut.success(`${provider.label} key removed`);
        onChange();
      },
      onError: handleError
    })
  );
  const showForm = isAdmin && (!saved || editing);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col gap-3 rounded-md border p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(KeyRound, { className: "size-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: provider.label }),
        saved ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "success", children: [
          "Connected ····",
          saved.keyHint
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: "No key" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "a",
        {
          className: "row items-center gap-1 text-muted-foreground text-sm hover:text-foreground",
          href: provider.keysUrl,
          rel: "noopener noreferrer",
          target: "_blank",
          children: [
            "Get a key",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "size-3.5" })
          ]
        }
      )
    ] }),
    saved && !editing && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground text-sm", children: [
        "Added ",
        formatDate(new Date(saved.updatedAt))
      ] }),
      isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: () => setEditing(true),
            size: "sm",
            variant: "outline",
            children: "Replace"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            loading: remove.isPending,
            onClick: () => remove.mutate({ organizationId, provider: provider.id }),
            size: "sm",
            variant: "outline",
            children: "Remove"
          }
        )
      ] })
    ] }),
    showForm && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "form",
      {
        className: "row gap-2",
        onSubmit: (event) => {
          event.preventDefault();
          if (value.trim()) {
            save.mutate({
              organizationId,
              provider: provider.id,
              apiKey: value.trim()
            });
          }
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              "aria-label": `${provider.label} API key`,
              autoComplete: "off",
              className: "flex-1",
              onChange: (event) => setValue(event.target.value),
              placeholder: provider.placeholder,
              spellCheck: false,
              type: "password",
              value
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              disabled: !value.trim(),
              loading: save.isPending,
              type: "submit",
              children: "Check and save"
            }
          ),
          editing && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              onClick: () => {
                setEditing(false);
                setValue("");
              },
              type: "button",
              variant: "ghost",
              children: "Cancel"
            }
          )
        ]
      }
    )
  ] });
}
function DeleteOrganization({ organization }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: myAccess } = useQuery(
    trpc.organization.myAccess.queryOptions({
      organizationId: organization.id
    })
  );
  const cancelDeletionMutation = useMutation(
    trpc.organization.cancelDeletion.mutationOptions({
      onError: handleError,
      onSuccess: () => {
        Ut.success("Organization deletion cancelled");
        queryClient.invalidateQueries(
          trpc.organization.get.queryFilter({
            organizationId: organization.id
          })
        );
      }
    })
  );
  if (!(myAccess && isOrganizationAdminRole(myAccess.role))) {
    return null;
  }
  const blockDeletion = organization.hasSubscription && !organization.isWillBeCanceled;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Widget, { className: "w-full max-w-screen-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "title", children: "Delete Organization" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(WidgetBody, { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Deleting this organization will remove it and all of its projects and their data. It will be permanently deleted after 24 hours." }),
      organization.deleteAt && /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { variant: "destructive", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTitle, { children: "Organization scheduled for deletion" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDescription, { children: [
          "This organization will be deleted on",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: format(
            startOfHour(addHours(organization.deleteAt, 1)),
            "yyyy-MM-dd HH:mm:ss"
          ) }),
          ". All of its projects and their events will be deleted."
        ] })
      ] }),
      blockDeletion && !organization.deleteAt && /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { variant: "destructive", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTitle, { children: "Cancel your subscription first" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDescription, { children: "This organization has an active subscription. Cancel it from the billing settings before you delete the organization." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-start gap-4", children: [
        organization.deleteAt && /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            loading: cancelDeletionMutation.isPending,
            onClick: () => {
              cancelDeletionMutation.mutate({
                organizationId: organization.id
              });
            },
            variant: "outline",
            children: "Cancel deletion"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            disabled: blockDeletion || !!organization.deleteAt,
            icon: Trash,
            onClick: () => {
              pushModal("ConfirmDeleteOrganization", {
                organizationId: organization.id,
                organizationName: organization.name
              });
            },
            variant: "destructive",
            children: "Delete Organization"
          }
        )
      ] })
    ] })
  ] });
}
function Component() {
  const {
    organizationId
  } = Route.useParams();
  const trpc = useTRPC();
  const {
    data: organization,
    isLoading,
    refetch
  } = useQuery(trpc.organization.get.queryOptions({
    organizationId
  }));
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(FullPageLoadingState, {});
  }
  if (!organization) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { description: "This workspace doesn't exist or you don't have access to it.", icon: Building2, title: "Workspace not found", variant: "page" });
  }
  const {
    register,
    handleSubmit,
    formState,
    reset,
    control
  } = useForm({
    defaultValues: {
      id: organization.id,
      name: organization.name,
      timezone: organization.timezone ?? void 0
    }
  });
  const mutation = useMutation(trpc.organization.update.mutationOptions({
    onSuccess(res) {
      Ut("Organization updated", {
        description: "Your organization has been updated."
      });
      reset({
        ...res,
        timezone: res.timezone
      });
      refetch();
    },
    onError: handleError
  }));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container p-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { className: "mb-8", description: "Manage your workspace settings here", title: "Workspace settings" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("form", { onSubmit: handleSubmit((values) => {
      mutation.mutate(values);
    }), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Widget, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetHead, { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "title", children: "Details" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(WidgetBody, { className: "col gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(InputWithLabel, { className: "flex-1", label: "Name", ...register("name"), defaultValue: organization?.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Controller, { control, name: "timezone", render: ({
          field
        }) => /* @__PURE__ */ jsxRuntimeExports.jsx(WithLabel, { label: "Timezone", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Combobox, { className: "w-full", items: ["UTC", ...Intl.supportedValuesOf("timeZone")].map((item) => ({
          value: item,
          label: item
        })), onChange: field.onChange, placeholder: "Select timezone", value: field.value, variant: "input" }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "self-end", disabled: !formState.isDirty, size: "sm", type: "submit", children: "Save" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AiKeys, { organizationId: organization.id }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteOrganization, { organization }) })
  ] });
}
export {
  Component as component
};
//# sourceMappingURL=_app._organizationId.settings-tbYsz_gR.js.map

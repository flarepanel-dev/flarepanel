import { o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { u as useSuspenseQuery } from "./useSuspenseQuery-BHKQGd6F.js";
import { a as useTRPC, j as useQuery, aD as Alert, aE as AlertTitle, aF as AlertDescription, A as Link, B as Button, dK as Trash, H as pushModal, ak as useQueryClient, au as useForm, b as useMutation, dM as handleError, as as Ut, ax as InputWithLabel, fm as Save } from "./router-gBnYxPzA.js";
import { b as Widget, a as WidgetHead, W as WidgetBody } from "./widget-D7PGEeO1.js";
import { o as object, s as string } from "./pick-CfnSzKDx.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "fs";
import "util";
import "stream";
import "zlib";
import "assert";
import "buffer";
function DeleteAccount() {
  const trpc = useTRPC();
  const { data: blockers = [] } = useQuery(
    trpc.user.deletionBlockers.queryOptions()
  );
  const blocked = blockers.length > 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Widget, { className: "w-full max-w-screen-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "title", children: "Delete account" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(WidgetBody, { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Deleting your account will permanently remove your personal data. Organizations you created that have no other admin will also be deleted, along with their projects and events." }),
      blocked && /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { variant: "destructive", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTitle, { children: "Cancel your subscriptions first" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDescription, { children: [
          "These organizations you created have an active subscription. Cancel each one before deleting your account:",
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-2 list-disc pl-5", children: blockers.map((organization) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Link,
            {
              className: "underline",
              params: { organizationId: organization.id },
              to: "/$organizationId/billing",
              children: organization.name
            }
          ) }, organization.id)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-start gap-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          disabled: blocked,
          icon: Trash,
          onClick: () => {
            pushModal("ConfirmDeleteAccount");
          },
          variant: "destructive",
          children: "Delete account"
        }
      ) })
    ] })
  ] });
}
object({
  firstName: string(),
  lastName: string()
});
function Component() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const session = useSuspenseQuery(trpc.auth.session.queryOptions());
  const user = session.data?.user;
  const {
    register,
    handleSubmit,
    formState,
    reset
  } = useForm({
    defaultValues: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? ""
    }
  });
  const mutation = useMutation(trpc.user.update.mutationOptions({
    onSuccess: (data) => {
      Ut("Profile updated", {
        description: "Your profile has been updated."
      });
      queryClient.invalidateQueries(trpc.auth.session.pathFilter());
      reset({
        firstName: data.firstName ?? "",
        lastName: data.lastName ?? ""
      });
    },
    onError: handleError
  }));
  if (!user) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("form", { onSubmit: handleSubmit((values) => {
      mutation.mutate(values);
    }), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Widget, { className: "w-full max-w-screen-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "title", children: "Profile" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(WidgetBody, { className: "col gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(InputWithLabel, { disabled: true, label: "Email", readOnly: true, value: user.email }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(InputWithLabel, { label: "First name", ...register("firstName"), defaultValue: user.firstName ?? "" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(InputWithLabel, { label: "Last name", ...register("lastName"), defaultValue: user.lastName ?? "" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "self-end", disabled: !formState.isDirty || mutation.isPending, icon: Save, loading: mutation.isPending, size: "sm", type: "submit", children: "Save" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteAccount, {})
  ] });
}
export {
  Component as component
};
//# sourceMappingURL=_app._organizationId.account._tabs.index-D6umg76i.js.map

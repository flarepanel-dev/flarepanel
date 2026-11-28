import { o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { a as useTRPC, b as useMutation, as as Ut, au as useForm, av as a, c9 as zSignInShare, aK as Input, B as Button } from "./router-gBnYxPzA.js";
import { P as PublicPageCard } from "./public-page-card-Zyi9EoVv.js";
function ShareEnterPassword({
  shareId,
  shareType = "overview"
}) {
  const trpc = useTRPC();
  const mutation = useMutation(
    trpc.auth.signInShare.mutationOptions({
      onSuccess() {
        window.location.reload();
      },
      onError() {
        Ut.error("Incorrect password");
      }
    })
  );
  const form = useForm({
    resolver: a(zSignInShare),
    defaultValues: {
      password: "",
      shareId,
      shareType
    }
  });
  const onSubmit = form.handleSubmit((data) => {
    mutation.mutate({
      password: data.password,
      shareId,
      shareType
    });
  });
  const typeLabel = shareType === "dashboard" ? "Dashboard" : shareType === "report" ? "Report" : "Overview";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    PublicPageCard,
    {
      description: `Please enter correct password to access this ${typeLabel.toLowerCase()}`,
      title: `${typeLabel} is locked`,
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "col gap-4", method: "post", onSubmit, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            ...form.register("password"),
            placeholder: "Enter your password",
            size: "large",
            type: "password"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", children: "Get access" })
      ] })
    }
  );
}
export {
  ShareEnterPassword as S
};
//# sourceMappingURL=share-enter-password-BTYxurU6.js.map

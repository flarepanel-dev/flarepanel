import { a as reactExports, o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { e as emailCategories } from "./email.constants-BwQe1Y3f.js";
import { u as useSearch, a as useTRPC, b as useMutation, B as Button, L as LinkButton } from "./router-gBnYxPzA.js";
import { P as PublicPageCard } from "./public-page-card-Zyi9EoVv.js";
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
import "./logo-BXfRcVLd.js";
import "./menu-BDOsAmJe.js";
function RouteComponent() {
  const search = useSearch({
    from: "/unsubscribe"
  });
  const {
    email,
    category,
    token
  } = search;
  const trpc = useTRPC();
  const [isUnsubscribing, setIsUnsubscribing] = reactExports.useState(false);
  const [isSuccess, setIsSuccess] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const unsubscribeMutation = useMutation(trpc.email.unsubscribe.mutationOptions({
    onSuccess: () => {
      setIsSuccess(true);
      setIsUnsubscribing(false);
    },
    onError: (err) => {
      setError(err.message || "Failed to unsubscribe");
      setIsUnsubscribing(false);
    }
  }));
  const handleUnsubscribe = () => {
    setIsUnsubscribing(true);
    setError(null);
    unsubscribeMutation.mutate({
      email,
      category,
      token
    });
  };
  const categoryName = emailCategories[category]?.label ?? category;
  if (isSuccess) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(PublicPageCard, { description: `You've been unsubscribed from ${categoryName} emails. You won't receive any more ${categoryName.toLowerCase()} emails from
          us.`, title: "Unsubscribed" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(PublicPageCard, { description: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    "Unsubscribe from ",
    categoryName,
    " emails? You'll stop receiving",
    " ",
    categoryName.toLowerCase(),
    " emails sent to ",
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "", children: email })
  ] }), title: "Unsubscribe", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col gap-3", children: [
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md bg-destructive/10 px-4 py-3 text-destructive text-sm", children: error }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: isUnsubscribing, onClick: handleUnsubscribe, children: isUnsubscribing ? "Unsubscribing..." : "Confirm Unsubscribe" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(LinkButton, { href: "/", variant: "ghost", children: "Cancel" })
  ] }) });
}
export {
  RouteComponent as component
};
//# sourceMappingURL=unsubscribe-CZayPgRQ.js.map

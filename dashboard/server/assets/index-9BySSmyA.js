import { o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { u as useSuspenseQuery } from "./useSuspenseQuery-BHKQGd6F.js";
import { a as useTRPC, A as Link, a4 as useNumber, B as Button } from "./router-gBnYxPzA.js";
import { L as LogoSquare } from "./logo-BXfRcVLd.js";
import { P as PageHeader } from "./page-header-DbGieVLw.js";
import { u as useLogout } from "./use-logout-BdPNsaMJ.js";
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
function LandingPage() {
  const trpc = useTRPC();
  const logout = useLogout();
  const {
    data: organizations
  } = useSuspenseQuery(trpc.organization.list.queryOptions());
  const number = useNumber();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen flex-col items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col mx-auto max-w-2xl gap-12 px-4 py-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LogoSquare, { className: "w-full max-w-14 md:max-w-24" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { description: "The best web and product analytics tool out there (our honest opinion).", title: "Welcome to FlarePanel.dev" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col gap-2", children: organizations?.map((org) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { className: "row items-center justify-between rounded-lg border bg-card p-3 transition-all hover:translate-x-1 hover:border-primary hover:shadow-md", params: {
      organizationId: org.id
    }, to: "/$organizationId", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-lg", children: org.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground text-sm", children: [
          "(",
          org.id,
          ")"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        number.format(org.subscriptionPeriodEventsCount),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mx-1 opacity-50", children: "/" }),
        number.format(org.subscriptionPeriodEventsLimit)
      ] })
    ] }, org.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "row gap-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { loading: logout.isPending, onClick: () => logout.mutate(), children: "Log out" }) })
  ] }) });
}
export {
  LandingPage as component
};
//# sourceMappingURL=index-9BySSmyA.js.map

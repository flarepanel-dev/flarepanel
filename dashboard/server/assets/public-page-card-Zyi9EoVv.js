import { a as reactExports, o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { L as LogoSquare } from "./logo-BXfRcVLd.js";
import { I as useAppContext, d as cn, B as Button, X } from "./router-gBnYxPzA.js";
import { M as Menu } from "./menu-BDOsAmJe.js";
function LoginNavbar({ className }) {
  const { isSelfHosted } = useAppContext();
  const [mobileMenuOpen, setMobileMenuOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: cn(
        "row absolute top-0 left-0 z-10 w-full items-center justify-between p-8",
        className
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { className: "row items-center gap-2", href: "https://flarepanel.dev", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LogoSquare, { className: "size-8 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-muted-foreground text-sm", children: isSelfHosted ? "Self-hosted analytics" : "FlarePanel.dev" })
        ] }),
        isSelfHosted && /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "max-md:hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "row items-center gap-4 [&>li>a]:text-muted-foreground [&>li>a]:text-sm [&>li>a]:hover:underline", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "https://flarepanel.dev", children: "FlarePanel Cloud" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "https://flarepanel.dev/compare/mixpanel-alternative", children: "Mixpanel alternative" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "https://flarepanel.dev/compare/posthog-alternative", children: "Posthog alternative" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "https://flarepanel.dev/articles/open-source-web-analytics", children: "Open source analytics" }) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative md:hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              onClick: () => setMobileMenuOpen((prev) => !prev),
              size: "icon",
              variant: "ghost",
              children: mobileMenuOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 20 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Menu, { size: 20 })
            }
          ),
          mobileMenuOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                className: "fixed inset-0 z-40 bg-black/20 backdrop-blur-sm",
                onClick: () => setMobileMenuOpen(false),
                type: "button"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "absolute top-full right-0 z-50 mt-2 min-w-48 rounded-md border border-border bg-card py-2 shadow-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "flex flex-col *:text-muted-foreground *:text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "a",
                {
                  className: "block px-4 py-2 hover:bg-accent hover:text-accent-foreground",
                  href: "https://flarepanel.dev",
                  onClick: () => setMobileMenuOpen(false),
                  children: "FlarePanel Cloud"
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "a",
                {
                  className: "block px-4 py-2 hover:bg-accent hover:text-accent-foreground",
                  href: "https://flarepanel.dev/compare/mixpanel-alternative",
                  onClick: () => setMobileMenuOpen(false),
                  children: "Posthog alternative"
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "a",
                {
                  className: "block px-4 py-2 hover:bg-accent hover:text-accent-foreground",
                  href: "https://flarepanel.dev/compare/mixpanel-alternative",
                  onClick: () => setMobileMenuOpen(false),
                  children: "Mixpanel alternative"
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "a",
                {
                  className: "block px-4 py-2 hover:bg-accent hover:text-accent-foreground",
                  href: "https://flarepanel.dev/articles/open-source-web-analytics",
                  onClick: () => setMobileMenuOpen(false),
                  children: "Open source analytics"
                }
              ) })
            ] }) })
          ] })
        ] })
      ]
    }
  );
}
function PublicPageCard({
  title,
  description,
  children,
  showFooter = true
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(LoginNavbar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "center-center col h-screen w-screen p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md rounded-lg bg-background p-6 text-left", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col mt-1 flex-1 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LogoSquare, { className: "mb-4 size-12" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-xl", children: title }),
          description && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: description })
        ] }),
        !!children && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children })
      ] }),
      showFooter && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col max-w-sm gap-1 p-6 text-muted-foreground text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        "Powered by",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { className: "font-medium", href: "https://flarepanel.dev", children: "FlarePanel.dev" }),
        " · ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "https://dashboard.flarepanel.dev/onboarding", children: "Try it for free today!" })
      ] }) })
    ] })
  ] });
}
export {
  LoginNavbar as L,
  PublicPageCard as P
};
//# sourceMappingURL=public-page-card-Zyi9EoVv.js.map

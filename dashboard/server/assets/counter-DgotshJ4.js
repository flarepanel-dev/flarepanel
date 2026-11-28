import { o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { am as Route, a6 as useEmbedTheme, a7 as MissingWidgetLink, a8 as useMounted, an as SAMPLE_COUNTER, a as useTRPC, j as useQuery, ak as useQueryClient, al as useWS } from "./router-gBnYxPzA.js";
import { A as AnimatedNumber } from "./animated-number-DKHgshrj.js";
import { P as Ping } from "./ping-B_apCr-3.js";
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
function RouteComponent() {
  const {
    shareId,
    demo,
    theme
  } = Route.useSearch();
  useEmbedTheme(theme);
  if (demo) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(DemoCounter, {});
  }
  if (!shareId) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(MissingWidgetLink, {});
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(LiveCounter, { shareId });
}
function DemoCounter() {
  const mounted = useMounted();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(CounterView, { value: mounted ? SAMPLE_COUNTER.counter : 0 });
}
function LiveCounter({
  shareId
}) {
  const trpc = useTRPC();
  const {
    data,
    isLoading
  } = useQuery(trpc.widget.counter.queryOptions({
    shareId
  }));
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(CounterView, { value: 0 });
  }
  if (!data) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(CounterView, { pingClassName: "bg-orange-500", value: 0 });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(CounterUpdates, { projectId: data.projectId, shareId, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CounterView, { value: data.counter }) });
}
function CounterUpdates({
  projectId,
  shareId,
  children
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  useWS(`/live/visitors/${projectId}?shareId=${shareId}`, () => {
    if (!document.hidden) {
      queryClient.refetchQueries(trpc.widget.counter.queryFilter({
        shareId
      }));
    }
  }, {
    debounce: {
      delay: 1e3,
      maxWait: 6e4
    }
  });
  return children;
}
function CounterView({
  value,
  pingClassName
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-8 items-center gap-2 px-2 text-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Ping, { className: pingClassName }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatedNumber, { suffix: value === 1 ? " visitor now" : " visitors now", value })
  ] });
}
export {
  RouteComponent as component
};
//# sourceMappingURL=counter-DgotshJ4.js.map

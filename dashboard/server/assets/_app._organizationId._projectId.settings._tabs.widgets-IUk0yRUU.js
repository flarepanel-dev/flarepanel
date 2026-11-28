import { a as reactExports, o as jsxRuntimeExports, R as React } from "./worker-entry-C5kSRogq.js";
import { e9 as useControllableState, bJ as Primitive, eb as composeEventHandlers, bI as createContextScope, eP as createRovingFocusGroupScope, eR as Item, eg as useDirection, eQ as Root$1, hU as cva, d as cn, e as useAppParams, I as useAppContext, a as useTRPC, ak as useQueryClient, j as useQuery, b as useMutation, as as Ut, d$ as FullPageLoadingState, hV as Award, fE as Activity, hW as Radio, fU as Switch, B as Button, N as Users, c2 as Label, es as CopyInput, dZ as ExternalLink } from "./router-gBnYxPzA.js";
import { L as LogoSquare } from "./logo-BXfRcVLd.js";
import { P as Ping } from "./ping-B_apCr-3.js";
import { S as Syntax } from "./syntax-CwZKbcAR.js";
import { b as Widget, a as WidgetHead, W as WidgetBody } from "./widget-D7PGEeO1.js";
import { C as ChartArea } from "./chart-area-DUmaUMbJ.js";
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
var NAME = "Toggle";
var Toggle$1 = reactExports.forwardRef((props, forwardedRef) => {
  const { pressed: pressedProp, defaultPressed, onPressedChange, ...buttonProps } = props;
  const [pressed, setPressed] = useControllableState({
    prop: pressedProp,
    onChange: onPressedChange,
    defaultProp: defaultPressed ?? false,
    caller: NAME
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Primitive.button,
    {
      type: "button",
      "aria-pressed": pressed,
      "data-state": pressed ? "on" : "off",
      "data-disabled": props.disabled ? "" : void 0,
      ...buttonProps,
      ref: forwardedRef,
      onClick: composeEventHandlers(props.onClick, () => {
        if (!props.disabled) {
          setPressed(!pressed);
        }
      })
    }
  );
});
Toggle$1.displayName = NAME;
var Root = Toggle$1;
var TOGGLE_GROUP_NAME = "ToggleGroup";
var [createToggleGroupContext] = createContextScope(TOGGLE_GROUP_NAME, [
  createRovingFocusGroupScope
]);
var useRovingFocusGroupScope = createRovingFocusGroupScope();
var ToggleGroup$1 = React.forwardRef((props, forwardedRef) => {
  const { type, ...toggleGroupProps } = props;
  if (type === "single") {
    const singleProps = toggleGroupProps;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleGroupImplSingle, { ...singleProps, ref: forwardedRef });
  }
  if (type === "multiple") {
    const multipleProps = toggleGroupProps;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleGroupImplMultiple, { ...multipleProps, ref: forwardedRef });
  }
  throw new Error(`Missing prop \`type\` expected on \`${TOGGLE_GROUP_NAME}\``);
});
ToggleGroup$1.displayName = TOGGLE_GROUP_NAME;
var [ToggleGroupValueProvider, useToggleGroupValueContext] = createToggleGroupContext(TOGGLE_GROUP_NAME);
var ToggleGroupImplSingle = React.forwardRef((props, forwardedRef) => {
  const {
    value: valueProp,
    defaultValue,
    onValueChange = () => {
    },
    ...toggleGroupSingleProps
  } = props;
  const [value, setValue] = useControllableState({
    prop: valueProp,
    defaultProp: defaultValue ?? "",
    onChange: onValueChange,
    caller: TOGGLE_GROUP_NAME
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    ToggleGroupValueProvider,
    {
      scope: props.__scopeToggleGroup,
      type: "single",
      value: React.useMemo(() => value ? [value] : [], [value]),
      onItemActivate: setValue,
      onItemDeactivate: React.useCallback(() => setValue(""), [setValue]),
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleGroupImpl, { ...toggleGroupSingleProps, ref: forwardedRef })
    }
  );
});
var ToggleGroupImplMultiple = React.forwardRef((props, forwardedRef) => {
  const {
    value: valueProp,
    defaultValue,
    onValueChange = () => {
    },
    ...toggleGroupMultipleProps
  } = props;
  const [value, setValue] = useControllableState({
    prop: valueProp,
    defaultProp: defaultValue ?? [],
    onChange: onValueChange,
    caller: TOGGLE_GROUP_NAME
  });
  const handleButtonActivate = React.useCallback(
    (itemValue) => setValue((prevValue = []) => [...prevValue, itemValue]),
    [setValue]
  );
  const handleButtonDeactivate = React.useCallback(
    (itemValue) => setValue((prevValue = []) => prevValue.filter((value2) => value2 !== itemValue)),
    [setValue]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    ToggleGroupValueProvider,
    {
      scope: props.__scopeToggleGroup,
      type: "multiple",
      value,
      onItemActivate: handleButtonActivate,
      onItemDeactivate: handleButtonDeactivate,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleGroupImpl, { ...toggleGroupMultipleProps, ref: forwardedRef })
    }
  );
});
ToggleGroup$1.displayName = TOGGLE_GROUP_NAME;
var [ToggleGroupContext$1, useToggleGroupContext] = createToggleGroupContext(TOGGLE_GROUP_NAME);
var ToggleGroupImpl = React.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeToggleGroup,
      disabled = false,
      rovingFocus = true,
      orientation,
      dir,
      loop = true,
      ...toggleGroupProps
    } = props;
    const rovingFocusGroupScope = useRovingFocusGroupScope(__scopeToggleGroup);
    const direction = useDirection(dir);
    const commonProps = { role: "group", dir: direction, ...toggleGroupProps };
    return /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleGroupContext$1, { scope: __scopeToggleGroup, rovingFocus, disabled, children: rovingFocus ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      Root$1,
      {
        asChild: true,
        ...rovingFocusGroupScope,
        orientation,
        dir: direction,
        loop,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Primitive.div, { ...commonProps, ref: forwardedRef })
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx(Primitive.div, { ...commonProps, ref: forwardedRef }) });
  }
);
var ITEM_NAME = "ToggleGroupItem";
var ToggleGroupItem$1 = React.forwardRef(
  (props, forwardedRef) => {
    const valueContext = useToggleGroupValueContext(ITEM_NAME, props.__scopeToggleGroup);
    const context = useToggleGroupContext(ITEM_NAME, props.__scopeToggleGroup);
    const rovingFocusGroupScope = useRovingFocusGroupScope(props.__scopeToggleGroup);
    const pressed = valueContext.value.includes(props.value);
    const disabled = context.disabled || props.disabled;
    const commonProps = { ...props, pressed, disabled };
    const ref = React.useRef(null);
    return context.rovingFocus ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      Item,
      {
        asChild: true,
        ...rovingFocusGroupScope,
        focusable: !disabled,
        active: pressed,
        ref,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleGroupItemImpl, { ...commonProps, ref: forwardedRef })
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleGroupItemImpl, { ...commonProps, ref: forwardedRef });
  }
);
ToggleGroupItem$1.displayName = ITEM_NAME;
var ToggleGroupItemImpl = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeToggleGroup, value, ...itemProps } = props;
    const valueContext = useToggleGroupValueContext(ITEM_NAME, __scopeToggleGroup);
    const singleProps = { role: "radio", "aria-checked": props.pressed, "aria-pressed": void 0 };
    const typeProps = valueContext.type === "single" ? singleProps : void 0;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Toggle$1,
      {
        ...typeProps,
        ...itemProps,
        ref: forwardedRef,
        onPressedChange: (pressed) => {
          if (pressed) {
            valueContext.onItemActivate(value);
          } else {
            valueContext.onItemDeactivate(value);
          }
        }
      }
    );
  }
);
var Root2 = ToggleGroup$1;
var Item2 = ToggleGroupItem$1;
const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground"
      },
      size: {
        default: "h-10 px-3",
        sm: "h-9 px-2.5",
        lg: "h-11 px-5"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Toggle = reactExports.forwardRef(({ className, variant, size, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Root,
  {
    className: cn(toggleVariants({ variant, size, className })),
    ref,
    ...props
  }
));
Toggle.displayName = Root.displayName;
const ToggleGroupContext = reactExports.createContext({
  size: "default",
  variant: "default"
});
const ToggleGroup = reactExports.forwardRef(({ className, variant, size, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Root2,
  {
    className: cn("flex items-center justify-center gap-1", className),
    ref,
    ...props,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleGroupContext.Provider, { value: { variant, size }, children })
  }
));
ToggleGroup.displayName = Root2.displayName;
const ToggleGroupItem = reactExports.forwardRef(({ className, children, variant, size, ...props }, ref) => {
  const context = reactExports.useContext(ToggleGroupContext);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Item2,
    {
      className: cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size
        }),
        className
      ),
      ref,
      ...props,
      children
    }
  );
});
ToggleGroupItem.displayName = Item2.displayName;
const DEFAULT_REALTIME = {
  type: "realtime",
  referrers: true,
  countries: true,
  paths: false
};
const DEFAULT_TRAFFIC = {
  type: "traffic",
  range: "30d",
  pages: true,
  referrers: true
};
const KINDS = {
  realtime: {
    title: "Realtime",
    summary: "Visitors right now, live",
    description: "Visitors in the last 30 minutes with a per-minute chart, plus where they come from and what they read. Updates live.",
    icon: Radio,
    store: "realtime",
    preview: {
      height: 420
    }
  },
  traffic: {
    title: "Traffic",
    summary: "7 or 30 days, top pages",
    description: "Visitors and pageviews over the last 7 or 30 days on a chart, with your top pages and sources. A public stats page in one embed.",
    icon: ChartArea,
    store: "traffic",
    badge: "New",
    preview: {
      height: 440
    }
  },
  counter: {
    title: "Live counter",
    summary: "One line for a header",
    description: "One line with a live dot and the number of people on your site right now. Fits in a header, a footer or a sidebar.",
    icon: Activity,
    store: "counter",
    preview: {
      height: 32,
      width: 220
    }
  },
  badge: {
    title: "Visitors badge",
    summary: "30-day visitors badge",
    description: "A badge with your visitors over the last 30 days. It shares its link with the live counter, so the two turn on and off together.",
    icon: Award,
    store: "counter",
    preview: {
      height: 48,
      width: 250
    }
  }
};
const KIND_ORDER = ["realtime", "traffic", "counter", "badge"];
function widgetPath(dashboardUrl, kind, params) {
  const search = Object.entries(params).filter(([, value]) => value !== void 0 && value !== "").map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`).join("&");
  return `${dashboardUrl}/widget/${kind}${search ? `?${search}` : ""}`;
}
function embedCode(kind, url) {
  switch (kind) {
    case "realtime":
      return `<iframe src="${url}" width="100%" height="420" frameborder="0" style="border-radius: 12px;" title="Live visitors"></iframe>`;
    case "traffic":
      return `<iframe src="${url}" width="100%" height="440" frameborder="0" style="border-radius: 12px;" title="Site traffic"></iframe>`;
    case "counter":
      return `<iframe src="${url}" height="32" width="220" style="border: none; overflow: hidden;" title="Visitors right now"></iframe>`;
    case "badge":
      return `<a href="https://flarepanel.dev" style="display: inline-block; overflow: hidden; border-radius: 8px;">
  <iframe src="${url}" height="48" width="250" style="border: none; overflow: hidden; pointer-events: none;" title="Visitors badge"></iframe>
</a>`;
    default:
      return "";
  }
}
function Component() {
  const {
    projectId,
    organizationId
  } = useAppParams();
  const {
    dashboardUrl
  } = useAppContext();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [selected, setSelected] = reactExports.useState("realtime");
  const [themes, setThemes] = reactExports.useState({
    realtime: "auto",
    traffic: "auto",
    counter: "auto",
    badge: "auto"
  });
  const realtimeQuery = useQuery(trpc.widget.get.queryOptions({
    projectId,
    type: "realtime"
  }));
  const trafficQuery = useQuery(trpc.widget.get.queryOptions({
    projectId,
    type: "traffic"
  }));
  const counterQuery = useQuery(trpc.widget.get.queryOptions({
    projectId,
    type: "counter"
  }));
  const toggleMutation = useMutation(trpc.widget.toggle.mutationOptions({
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(trpc.widget.get.queryFilter({
        projectId,
        type: variables.type
      }));
      Ut.success(variables.enabled ? "Widget on: its public link works now" : "Widget off: its public link stopped working");
    },
    onError: (error) => {
      Ut.error(error.message || "Could not update the widget");
    }
  }));
  const optionsMutation = useMutation(trpc.widget.updateOptions.mutationOptions({
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(trpc.widget.get.queryFilter({
        projectId,
        type: variables.options.type
      }));
    },
    onError: (error) => {
      Ut.error(error.message || "Could not save the options");
    }
  }));
  if (realtimeQuery.isLoading || trafficQuery.isLoading || counterQuery.isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(FullPageLoadingState, {});
  }
  const stored = {
    realtime: realtimeQuery.data,
    traffic: trafficQuery.data,
    counter: counterQuery.data
  };
  const widgetOf = (kind) => stored[KINDS[kind].store];
  const isOn = (kind) => widgetOf(kind)?.public === true;
  const isBusy = (kind) => toggleMutation.isPending && toggleMutation.variables?.type === KINDS[kind].store;
  const toggle = (kind, enabled) => {
    setSelected(kind);
    toggleMutation.mutate({
      projectId,
      organizationId,
      type: KINDS[kind].store,
      enabled
    });
  };
  const saveOptions = (options) => optionsMutation.mutate({
    projectId,
    organizationId,
    options
  });
  const onCount = KIND_ORDER.filter(isOn).length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-screen-lg space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-end justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold text-lg", children: "Widgets" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "max-w-prose text-muted-foreground", children: "Show your numbers on your own site. Switch a widget on to get its public link; switch it off and the link stops working." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground text-sm tabular-nums", children: [
        onCount,
        " of ",
        KIND_ORDER.length,
        " on"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4", children: KIND_ORDER.map((kind) => /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetTile, { busy: isBusy(kind), kind, on: isOn(kind), onSelect: () => setSelected(kind), onToggle: (enabled) => toggle(kind, enabled), selected: selected === kind }, kind)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetDetails, { busy: isBusy(selected), dashboardUrl, kind: selected, onOptions: saveOptions, onTheme: (theme) => setThemes((current) => ({
      ...current,
      [selected]: theme
    })), onToggle: (enabled) => toggle(selected, enabled), savingOptions: optionsMutation.isPending, theme: themes[selected], widget: widgetOf(selected) })
  ] });
}
function WidgetTile({
  kind,
  on,
  busy,
  selected,
  onSelect,
  onToggle
}) {
  const meta = KINDS[kind];
  const Icon = meta.icon;
  const switchId = `widget-${kind}`;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("group flex flex-col overflow-hidden rounded-xl border bg-card transition-[border-color,box-shadow]", selected ? "border-foreground/40 shadow-sm ring-1 ring-foreground/15" : "hover:border-foreground/25"), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { "aria-label": `Show ${meta.title} settings`, "aria-pressed": selected, className: "relative block h-32 w-full overflow-hidden border-b bg-def-100 text-left", onClick: onSelect, type: "button", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("absolute inset-0 transition-opacity", on ? "opacity-100" : "opacity-60 group-hover:opacity-80"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Thumbnail, { kind }) }),
      meta.badge && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-2 right-2 rounded-full bg-chart-0 px-2 py-px font-medium text-[11px] text-white", children: meta.badge })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "size-4 shrink-0 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "min-w-0 flex-1 text-left", onClick: onSelect, type: "button", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block truncate font-medium text-sm", children: meta.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex items-center gap-1.5 text-muted-foreground text-xs", children: on ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-1.5 rounded-full bg-emerald-500" }),
          "On"
        ] }) : meta.summary })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { "aria-label": `${meta.title} ${on ? "on" : "off"}`, checked: on, disabled: busy, id: switchId, onCheckedChange: onToggle })
    ] })
  ] });
}
const THUMB_BARS = [5, 8, 6, 9, 7, 4, 10, 12, 8, 11, 9, 14, 12, 16, 13, 18, 15, 20];
const THUMB_AREA = "M0 34 C10 30 18 31 26 28 S42 22 52 25 S70 18 80 20 S96 12 106 15 S124 8 132 10 L140 6 L140 44 L0 44 Z";
function Thumbnail({
  kind
}) {
  if (kind === "realtime") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full flex-col justify-between p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 font-medium text-[10px] text-muted-foreground uppercase tracking-wide", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Ping, {}),
        "Users now"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-3xl tabular-nums leading-none", children: "42" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-8 items-end gap-[3px]", children: THUMB_BARS.map((height, index) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 rounded-[2px] bg-chart-0", style: {
        height: `${height / 20 * 100}%`
      } }, index.toString())) })
    ] });
  }
  if (kind === "traffic") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full flex-col justify-between p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-2xl tabular-nums leading-none", children: "7.3K" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-[10px] text-muted-foreground", children: "Visitors" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-2xl tabular-nums leading-none", children: "21K" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-[10px] text-muted-foreground", children: "Pageviews" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { "aria-hidden": true, className: "h-11 w-full text-chart-0", preserveAspectRatio: "none", viewBox: "0 0 140 44", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: THUMB_AREA, fill: "currentColor", fillOpacity: "0.2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: THUMB_AREA.replace(/ L140 44 L0 44 Z$/, ""), fill: "none", stroke: "currentColor", strokeWidth: "1.6", vectorEffect: "non-scaling-stroke" })
      ] })
    ] });
  }
  if (kind === "counter") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-full border bg-card px-3.5 py-2 text-sm shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Ping, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold tabular-nums", children: "42" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "unique visitors" })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full max-w-[210px] items-center gap-2.5 rounded-lg bg-[#16171c] px-2.5 py-2 text-white shadow-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(LogoSquare, { className: "size-7" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1 leading-tight", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[8px] text-white/70 uppercase tracking-wide", children: "Analytics from" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-sm", children: "FlarePanel" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-0.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "size-3.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-xs tabular-nums", children: "8.6K" })
    ] })
  ] }) });
}
function WidgetDetails({
  kind,
  widget,
  dashboardUrl,
  busy,
  theme,
  onTheme,
  onToggle,
  onOptions,
  savingOptions
}) {
  const meta = KINDS[kind];
  const Icon = meta.icon;
  const themeParam = theme === "auto" || kind === "badge" ? void 0 : theme;
  const live = widget?.public === true ? widgetPath(dashboardUrl, kind, {
    shareId: widget.id,
    theme: themeParam
  }) : null;
  const preview = live ?? widgetPath(dashboardUrl, kind, {
    demo: true,
    theme: themeParam
  });
  const realtime = widget?.options.type === "realtime" ? widget.options : DEFAULT_REALTIME;
  const traffic = widget?.options.type === "traffic" ? widget.options : DEFAULT_TRAFFIC;
  const frameKey = kind === "realtime" ? `${realtime.countries}${realtime.referrers}${realtime.paths}` : kind === "traffic" ? `${traffic.range}${traffic.pages}${traffic.referrers}` : kind;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Widget, { className: "w-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(WidgetHead, { className: "row items-start justify-between gap-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shrink-0 self-start rounded-lg bg-def-200 p-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 18 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "title", children: meta.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { on: !!live })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "max-w-prose text-muted-foreground text-sm", children: meta.description })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(WidgetBody, { className: "grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-w-0 space-y-5", children: live ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        kind === "realtime" && /* @__PURE__ */ jsxRuntimeExports.jsxs(OptionGroup, { title: "Show", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(OptionSwitch, { checked: realtime.countries, disabled: savingOptions, id: "realtime-countries", label: "Countries", onChange: (countries) => onOptions({
            ...realtime,
            countries
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(OptionSwitch, { checked: realtime.referrers, disabled: savingOptions, id: "realtime-referrers", label: "Sources", onChange: (referrers) => onOptions({
            ...realtime,
            referrers
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(OptionSwitch, { checked: realtime.paths, disabled: savingOptions, id: "realtime-paths", label: "Pages", onChange: (paths) => onOptions({
            ...realtime,
            paths
          }) })
        ] }),
        kind === "traffic" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(OptionGroup, { title: "Period", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ToggleGroup, { className: "justify-start", disabled: savingOptions, onValueChange: (range) => {
            if (range === "7d" || range === "30d") {
              onOptions({
                ...traffic,
                range
              });
            }
          }, type: "single", value: traffic.range, variant: "outline", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleGroupItem, { value: "7d", children: "7 days" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleGroupItem, { value: "30d", children: "30 days" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(OptionGroup, { title: "Show", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(OptionSwitch, { checked: traffic.pages, disabled: savingOptions, id: "traffic-pages", label: "Top pages", onChange: (pages) => onOptions({
              ...traffic,
              pages
            }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(OptionSwitch, { checked: traffic.referrers, disabled: savingOptions, id: "traffic-referrers", label: "Top sources", onChange: (referrers) => onOptions({
              ...traffic,
              referrers
            }) })
          ] })
        ] }),
        kind !== "badge" && /* @__PURE__ */ jsxRuntimeExports.jsx(ThemePicker, { onChange: onTheme, value: theme }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(EmbedCode, { code: embedCode(kind, live), note: kind === "traffic" ? "Numbers refresh every 5 minutes." : void 0, url: live })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-start gap-4 rounded-lg border border-dashed p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: "This widget is off" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "The preview shows sample data. Switch it on to see your own numbers and get the link and embed code." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { disabled: busy, onClick: () => onToggle(true), children: [
          "Turn on ",
          meta.title.toLowerCase()
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(PreviewFrame, { height: meta.preview.height, live: !!live, pointerEvents: kind !== "badge", src: preview, title: `${meta.title} preview`, width: meta.preview.width }, frameKey)
    ] })
  ] });
}
function StatusPill({
  on
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: cn("inline-flex items-center gap-1.5 rounded-full px-2 py-px font-medium text-xs", on ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-def-200 text-muted-foreground"), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("size-1.5 rounded-full", on ? "bg-emerald-500" : "bg-muted-foreground/60") }),
    on ? "On" : "Off"
  ] });
}
function PreviewFrame({
  src,
  title,
  height,
  width,
  live,
  pointerEvents
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 self-start overflow-hidden rounded-lg border bg-def-100", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-10 items-center justify-between gap-3 border-b px-3 text-muted-foreground text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex items-center gap-2", children: live ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Ping, {}),
        "Live"
      ] }) : "Sample data" }),
      live && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { icon: ExternalLink, onClick: () => window.open(src, "_blank", "noopener,noreferrer"), size: "sm", variant: "ghost", children: "Open" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex justify-center", width && "px-6 py-10"), children: /* @__PURE__ */ jsxRuntimeExports.jsx("iframe", { className: cn("block border-0", !pointerEvents && "pointer-events-none"), height, loading: "lazy", src, title, width: width ?? "100%" }) })
  ] });
}
function OptionGroup({
  title,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium text-sm", children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children })
  ] });
}
function OptionSwitch({
  id,
  label,
  checked,
  disabled,
  onChange
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", htmlFor: id, children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked, disabled, id, onCheckedChange: onChange })
  ] });
}
function ThemePicker({
  value,
  onChange
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(OptionGroup, { title: "Theme", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ToggleGroup, { className: "justify-start", onValueChange: (next) => {
    if (next === "auto" || next === "light" || next === "dark") {
      onChange(next);
    }
  }, type: "single", value, variant: "outline", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleGroupItem, { value: "auto", children: "Match visitor" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleGroupItem, { value: "light", children: "Light" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleGroupItem, { value: "dark", children: "Dark" })
  ] }) });
}
function EmbedCode({
  url,
  code,
  note
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium text-sm", children: "Link" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CopyInput, { className: "w-full", label: "", onCopy: () => Ut.success("Link copied"), value: url })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium text-sm", children: "Embed code" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Syntax, { code, language: "bash", onCopy: () => Ut.success("Embed code copied"), wrapLines: true }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground text-xs", children: [
        "Paste it into your site's HTML where the widget should appear.",
        note ? ` ${note}` : ""
      ] })
    ] })
  ] });
}
export {
  Component as component
};
//# sourceMappingURL=_app._organizationId._projectId.settings._tabs.widgets-IUk0yRUU.js.map

import { a as reactExports, o as jsxRuntimeExports, R as React } from "./worker-entry-C5kSRogq.js";
import { c as createLucideIcon, bJ as Primitive$1, d as cn, bQ as formatDate, bR as Popover, bS as PopoverTrigger, B as Button, bT as CircleX, bU as Calendar, bV as PopoverContent, bW as Calendar$1, M as Badge, bX as Command, bY as CommandInput, bZ as CommandList, b_ as CommandEmpty, b$ as CommandGroup, c0 as CommandItem, C as Check, c1 as CommandSeparator, c2 as Label, aK as Input, c3 as RotateCcw, c4 as useQueryState, c5 as parseAsInteger, W as Search, X } from "./router-gBnYxPzA.js";
import { u as useSensors, a as useSensor, D as DndContext, c as closestCenter, S as SortableContext, v as verticalListSortingStrategy, s as sortableKeyboardCoordinates, K as KeyboardSensor, P as PointerSensor, b as useSortable, C as CSS } from "./sortable.esm-CAMhO-vx.js";
import { S as Settings2 } from "./settings-2-DrPzEv47.js";
import { u as useLocalStorage, a as useReadLocalStorage } from "./index-CHcXrYNT.js";
const __iconNode$1 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M8 12h8", key: "1wcyev" }],
  ["path", { d: "M12 8v8", key: "napkw2" }]
];
const CirclePlus = createLucideIcon("circle-plus", __iconNode$1);
const __iconNode = [
  ["circle", { cx: "9", cy: "12", r: "1", key: "1vctgf" }],
  ["circle", { cx: "9", cy: "5", r: "1", key: "hp0tcf" }],
  ["circle", { cx: "9", cy: "19", r: "1", key: "fkjjf6" }],
  ["circle", { cx: "15", cy: "12", r: "1", key: "1tmaij" }],
  ["circle", { cx: "15", cy: "5", r: "1", key: "19l28e" }],
  ["circle", { cx: "15", cy: "19", r: "1", key: "f4zoj3" }]
];
const GripVertical = createLucideIcon("grip-vertical", __iconNode);
var NAME = "Separator";
var DEFAULT_ORIENTATION = "horizontal";
var ORIENTATIONS = ["horizontal", "vertical"];
var Separator$1 = reactExports.forwardRef((props, forwardedRef) => {
  const { decorative, orientation: orientationProp = DEFAULT_ORIENTATION, ...domProps } = props;
  const orientation = isValidOrientation(orientationProp) ? orientationProp : DEFAULT_ORIENTATION;
  const ariaOrientation = orientation === "vertical" ? orientation : void 0;
  const semanticProps = decorative ? { role: "none" } : { "aria-orientation": ariaOrientation, role: "separator" };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Primitive$1.div,
    {
      "data-orientation": orientation,
      ...semanticProps,
      ...domProps,
      ref: forwardedRef
    }
  );
});
Separator$1.displayName = NAME;
function isValidOrientation(orientation) {
  return ORIENTATIONS.includes(orientation);
}
var Root$1 = Separator$1;
function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Root$1,
    {
      className: cn(
        "shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=vertical]:h-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px",
        className
      ),
      "data-slot": "separator",
      decorative,
      orientation,
      ...props
    }
  );
}
function getIsDateRange(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}
function parseAsDate(timestamp) {
  if (!timestamp) {
    return void 0;
  }
  const numericTimestamp = typeof timestamp === "string" ? Number(timestamp) : timestamp;
  const date = new Date(numericTimestamp);
  return Number.isNaN(date.getTime()) ? void 0 : date;
}
function parseColumnFilterValue(value) {
  if (value === null || value === void 0) {
    return [];
  }
  if (Array.isArray(value)) {
    return value.map((item) => {
      if (typeof item === "number" || typeof item === "string") {
        return item;
      }
      return void 0;
    });
  }
  if (typeof value === "string" || typeof value === "number") {
    return [value];
  }
  return [];
}
function DataTableDateFilter({
  column,
  title,
  multiple
}) {
  const columnFilterValue = column.getFilterValue();
  const selectedDates = reactExports.useMemo(() => {
    if (!columnFilterValue) {
      return multiple ? { from: void 0, to: void 0 } : [];
    }
    if (multiple) {
      const timestamps2 = parseColumnFilterValue(columnFilterValue);
      return {
        from: parseAsDate(timestamps2[0]),
        to: parseAsDate(timestamps2[1])
      };
    }
    const timestamps = parseColumnFilterValue(columnFilterValue);
    const date = parseAsDate(timestamps[0]);
    return date ? [date] : [];
  }, [columnFilterValue, multiple]);
  const onSelect = reactExports.useCallback(
    (date) => {
      if (!date) {
        column.setFilterValue(void 0);
        return;
      }
      if (multiple && !("getTime" in date)) {
        const from = date.from?.getTime();
        const to = date.to?.getTime();
        column.setFilterValue(from || to ? [from, to] : void 0);
      } else if (!multiple && "getTime" in date) {
        column.setFilterValue(date.getTime());
      }
    },
    [column, multiple]
  );
  const onReset = reactExports.useCallback(
    (event) => {
      event.stopPropagation();
      column.setFilterValue(void 0);
    },
    [column]
  );
  const hasValue = reactExports.useMemo(() => {
    if (multiple) {
      if (!getIsDateRange(selectedDates)) {
        return false;
      }
      return selectedDates.from || selectedDates.to;
    }
    if (!Array.isArray(selectedDates)) {
      return false;
    }
    return selectedDates.length > 0;
  }, [multiple, selectedDates]);
  const formatDateRange = reactExports.useCallback((range) => {
    if (!(range.from || range.to)) {
      return "";
    }
    if (range.from && range.to) {
      return `${formatDate(range.from)} - ${formatDate(range.to)}`;
    }
    return formatDate(range.from ?? range.to ?? /* @__PURE__ */ new Date());
  }, []);
  const label = reactExports.useMemo(() => {
    if (multiple) {
      if (!getIsDateRange(selectedDates)) {
        return null;
      }
      const hasSelectedDates = selectedDates.from || selectedDates.to;
      const dateText2 = hasSelectedDates ? formatDateRange(selectedDates) : "Select date range";
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: title }),
        hasSelectedDates && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Separator,
            {
              className: "mx-0.5 data-[orientation=vertical]:h-4",
              orientation: "vertical"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: dateText2 })
        ] })
      ] });
    }
    if (getIsDateRange(selectedDates)) {
      return null;
    }
    const hasSelectedDate = selectedDates.length > 0;
    const dateText = hasSelectedDate ? formatDate(selectedDates[0]) : "Select date";
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: title }),
      hasSelectedDate && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Separator,
          {
            className: "mx-0.5 data-[orientation=vertical]:h-4",
            orientation: "vertical"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: dateText })
      ] })
    ] });
  }, [selectedDates, multiple, formatDateRange, title]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "border-dashed", variant: "outline", children: [
      hasValue ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          "aria-label": `Clear ${title} filter`,
          className: "rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          onClick: onReset,
          onKeyDown: onReset,
          role: "button",
          tabIndex: 0,
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "mr-2 size-4" })
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "mr-2 size-4" }),
      label
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      PopoverContent,
      {
        align: "start",
        className: "w-auto overflow-hidden rounded-lg p-0",
        children: multiple ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          Calendar$1,
          {
            initialFocus: true,
            mode: "range",
            onSelect,
            selected: getIsDateRange(selectedDates) ? selectedDates : { from: void 0, to: void 0 }
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
          Calendar$1,
          {
            initialFocus: true,
            mode: "single",
            onSelect,
            selected: getIsDateRange(selectedDates) ? void 0 : selectedDates[0]
          }
        )
      }
    )
  ] });
}
function DataTableFacetedFilter({
  column,
  title,
  options,
  multiple
}) {
  const [open, setOpen] = reactExports.useState(false);
  const columnFilterValue = column?.getFilterValue();
  const selectedValues = new Set(
    Array.isArray(columnFilterValue) ? columnFilterValue : []
  );
  const onItemSelect = reactExports.useCallback(
    (option, isSelected) => {
      if (!column) {
        return;
      }
      if (multiple) {
        const newSelectedValues = new Set(selectedValues);
        if (isSelected) {
          newSelectedValues.delete(option.value);
        } else {
          newSelectedValues.add(option.value);
        }
        const filterValues = Array.from(newSelectedValues);
        column.setFilterValue(filterValues.length ? filterValues : void 0);
      } else {
        column.setFilterValue(isSelected ? void 0 : [option.value]);
        setOpen(false);
      }
    },
    [column, multiple, selectedValues]
  );
  const onReset = reactExports.useCallback(
    (event) => {
      event?.stopPropagation();
      column?.setFilterValue(void 0);
    },
    [column]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { onOpenChange: setOpen, open, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "border-dashed", variant: "outline", children: [
      selectedValues?.size > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          "aria-label": `Clear ${title} filter`,
          className: "rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          onClick: onReset,
          onKeyDown: onReset,
          role: "button",
          tabIndex: 0,
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "mr-2 size-4" })
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx(CirclePlus, { className: "mr-2 size-4" }),
      title,
      selectedValues?.size > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Separator,
          {
            className: "mx-0.5 data-[orientation=vertical]:h-4",
            orientation: "vertical"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Badge,
          {
            className: "rounded-sm px-1 font-normal lg:hidden",
            variant: "secondary",
            children: selectedValues.size
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden items-center gap-1 lg:flex", children: selectedValues.size > 2 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Badge,
          {
            className: "rounded-sm px-1 font-normal",
            variant: "secondary",
            children: [
              selectedValues.size,
              " selected"
            ]
          }
        ) : options.filter((option) => selectedValues.has(option.value)).map((option) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          Badge,
          {
            className: "rounded-sm px-1 font-normal",
            variant: "secondary",
            children: option.label
          },
          option.value
        )) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverContent, { align: "start", className: "w-[12.5rem] p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Command, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CommandInput, { placeholder: title }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CommandList, { className: "max-h-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CommandEmpty, { children: "No results found." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CommandGroup, { className: "max-h-[18.75rem] overflow-y-auto overflow-x-hidden", children: options.map((option) => {
          const isSelected = selectedValues.has(option.value);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            CommandItem,
            {
              onSelect: () => onItemSelect(option, isSelected),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: cn(
                      "flex size-4 items-center justify-center rounded-sm border border-primary",
                      isSelected ? "bg-primary" : "opacity-50 [&_svg]:invisible"
                    ),
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-4" })
                  }
                ),
                option.icon && /* @__PURE__ */ jsxRuntimeExports.jsx(option.icon, { className: "mr-2 size-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: option.label }),
                option.count && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto text-xs tabular-nums", children: option.count })
              ]
            },
            option.value
          );
        }) }),
        selectedValues.size > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CommandSeparator, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CommandGroup, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            CommandItem,
            {
              className: "justify-center text-center",
              onSelect: () => onReset(),
              children: "Clear filters"
            }
          ) })
        ] })
      ] })
    ] }) })
  ] });
}
function clamp(value, [min, max]) {
  return Math.min(max, Math.max(min, value));
}
function composeEventHandlers(originalEventHandler, ourEventHandler, { checkForDefaultPrevented = true } = {}) {
  return function handleEvent(event) {
    originalEventHandler?.(event);
    if (checkForDefaultPrevented === false || !event.defaultPrevented) {
      return ourEventHandler?.(event);
    }
  };
}
function setRef(ref, value) {
  if (typeof ref === "function") {
    return ref(value);
  } else if (ref !== null && ref !== void 0) {
    ref.current = value;
  }
}
function composeRefs(...refs) {
  return (node) => {
    let hasCleanup = false;
    const cleanups = refs.map((ref) => {
      const cleanup = setRef(ref, node);
      if (!hasCleanup && typeof cleanup == "function") {
        hasCleanup = true;
      }
      return cleanup;
    });
    if (hasCleanup) {
      return () => {
        for (let i = 0; i < cleanups.length; i++) {
          const cleanup = cleanups[i];
          if (typeof cleanup == "function") {
            cleanup();
          } else {
            setRef(refs[i], null);
          }
        }
      };
    }
  };
}
function useComposedRefs(...refs) {
  return reactExports.useCallback(composeRefs(...refs), refs);
}
function createContextScope(scopeName, createContextScopeDeps = []) {
  let defaultContexts = [];
  function createContext3(rootComponentName, defaultContext) {
    const BaseContext = reactExports.createContext(defaultContext);
    const index = defaultContexts.length;
    defaultContexts = [...defaultContexts, defaultContext];
    const Provider = (props) => {
      const { scope, children, ...context } = props;
      const Context = scope?.[scopeName]?.[index] || BaseContext;
      const value = reactExports.useMemo(() => context, Object.values(context));
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Context.Provider, { value, children });
    };
    Provider.displayName = rootComponentName + "Provider";
    function useContext2(consumerName, scope) {
      const Context = scope?.[scopeName]?.[index] || BaseContext;
      const context = reactExports.useContext(Context);
      if (context) return context;
      if (defaultContext !== void 0) return defaultContext;
      throw new Error(`\`${consumerName}\` must be used within \`${rootComponentName}\``);
    }
    return [Provider, useContext2];
  }
  const createScope = () => {
    const scopeContexts = defaultContexts.map((defaultContext) => {
      return reactExports.createContext(defaultContext);
    });
    return function useScope(scope) {
      const contexts = scope?.[scopeName] || scopeContexts;
      return reactExports.useMemo(
        () => ({ [`__scope${scopeName}`]: { ...scope, [scopeName]: contexts } }),
        [scope, contexts]
      );
    };
  };
  createScope.scopeName = scopeName;
  return [createContext3, composeContextScopes(createScope, ...createContextScopeDeps)];
}
function composeContextScopes(...scopes) {
  const baseScope = scopes[0];
  if (scopes.length === 1) return baseScope;
  const createScope = () => {
    const scopeHooks = scopes.map((createScope2) => ({
      useScope: createScope2(),
      scopeName: createScope2.scopeName
    }));
    return function useComposedScopes(overrideScopes) {
      const nextScopes = scopeHooks.reduce((nextScopes2, { useScope, scopeName }) => {
        const scopeProps = useScope(overrideScopes);
        const currentScope = scopeProps[`__scope${scopeName}`];
        return { ...nextScopes2, ...currentScope };
      }, {});
      return reactExports.useMemo(() => ({ [`__scope${baseScope.scopeName}`]: nextScopes }), [nextScopes]);
    };
  };
  createScope.scopeName = baseScope.scopeName;
  return createScope;
}
function useCallbackRef(callback) {
  const callbackRef = reactExports.useRef(callback);
  reactExports.useEffect(() => {
    callbackRef.current = callback;
  });
  return reactExports.useMemo(() => (...args) => callbackRef.current?.(...args), []);
}
function useControllableState({
  prop,
  defaultProp,
  onChange = () => {
  }
}) {
  const [uncontrolledProp, setUncontrolledProp] = useUncontrolledState({ defaultProp, onChange });
  const isControlled = prop !== void 0;
  const value = isControlled ? prop : uncontrolledProp;
  const handleChange = useCallbackRef(onChange);
  const setValue = reactExports.useCallback(
    (nextValue) => {
      if (isControlled) {
        const setter = nextValue;
        const value2 = typeof nextValue === "function" ? setter(prop) : nextValue;
        if (value2 !== prop) handleChange(value2);
      } else {
        setUncontrolledProp(nextValue);
      }
    },
    [isControlled, prop, setUncontrolledProp, handleChange]
  );
  return [value, setValue];
}
function useUncontrolledState({
  defaultProp,
  onChange
}) {
  const uncontrolledState = reactExports.useState(defaultProp);
  const [value] = uncontrolledState;
  const prevValueRef = reactExports.useRef(value);
  const handleChange = useCallbackRef(onChange);
  reactExports.useEffect(() => {
    if (prevValueRef.current !== value) {
      handleChange(value);
      prevValueRef.current = value;
    }
  }, [value, prevValueRef, handleChange]);
  return uncontrolledState;
}
var DirectionContext = reactExports.createContext(void 0);
function useDirection(localDir) {
  const globalDir = reactExports.useContext(DirectionContext);
  return localDir || globalDir || "ltr";
}
function usePrevious(value) {
  const ref = reactExports.useRef({ value, previous: value });
  return reactExports.useMemo(() => {
    if (ref.current.value !== value) {
      ref.current.previous = ref.current.value;
      ref.current.value = value;
    }
    return ref.current.previous;
  }, [value]);
}
var useLayoutEffect2 = Boolean(globalThis?.document) ? reactExports.useLayoutEffect : () => {
};
function useSize(element) {
  const [size, setSize] = reactExports.useState(void 0);
  useLayoutEffect2(() => {
    if (element) {
      setSize({ width: element.offsetWidth, height: element.offsetHeight });
      const resizeObserver = new ResizeObserver((entries) => {
        if (!Array.isArray(entries)) {
          return;
        }
        if (!entries.length) {
          return;
        }
        const entry = entries[0];
        let width;
        let height;
        if ("borderBoxSize" in entry) {
          const borderSizeEntry = entry["borderBoxSize"];
          const borderSize = Array.isArray(borderSizeEntry) ? borderSizeEntry[0] : borderSizeEntry;
          width = borderSize["inlineSize"];
          height = borderSize["blockSize"];
        } else {
          width = element.offsetWidth;
          height = element.offsetHeight;
        }
        setSize({ width, height });
      });
      resizeObserver.observe(element, { box: "border-box" });
      return () => resizeObserver.unobserve(element);
    } else {
      setSize(void 0);
    }
  }, [element]);
  return size;
}
var Slot = reactExports.forwardRef((props, forwardedRef) => {
  const { children, ...slotProps } = props;
  const childrenArray = reactExports.Children.toArray(children);
  const slottable = childrenArray.find(isSlottable);
  if (slottable) {
    const newElement = slottable.props.children;
    const newChildren = childrenArray.map((child) => {
      if (child === slottable) {
        if (reactExports.Children.count(newElement) > 1) return reactExports.Children.only(null);
        return reactExports.isValidElement(newElement) ? newElement.props.children : null;
      } else {
        return child;
      }
    });
    return /* @__PURE__ */ jsxRuntimeExports.jsx(SlotClone, { ...slotProps, ref: forwardedRef, children: reactExports.isValidElement(newElement) ? reactExports.cloneElement(newElement, void 0, newChildren) : null });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SlotClone, { ...slotProps, ref: forwardedRef, children });
});
Slot.displayName = "Slot";
var SlotClone = reactExports.forwardRef((props, forwardedRef) => {
  const { children, ...slotProps } = props;
  if (reactExports.isValidElement(children)) {
    const childrenRef = getElementRef(children);
    const props2 = mergeProps(slotProps, children.props);
    if (children.type !== reactExports.Fragment) {
      props2.ref = forwardedRef ? composeRefs(forwardedRef, childrenRef) : childrenRef;
    }
    return reactExports.cloneElement(children, props2);
  }
  return reactExports.Children.count(children) > 1 ? reactExports.Children.only(null) : null;
});
SlotClone.displayName = "SlotClone";
var Slottable = ({ children }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children });
};
function isSlottable(child) {
  return reactExports.isValidElement(child) && child.type === Slottable;
}
function mergeProps(slotProps, childProps) {
  const overrideProps = { ...childProps };
  for (const propName in childProps) {
    const slotPropValue = slotProps[propName];
    const childPropValue = childProps[propName];
    const isHandler = /^on[A-Z]/.test(propName);
    if (isHandler) {
      if (slotPropValue && childPropValue) {
        overrideProps[propName] = (...args) => {
          childPropValue(...args);
          slotPropValue(...args);
        };
      } else if (slotPropValue) {
        overrideProps[propName] = slotPropValue;
      }
    } else if (propName === "style") {
      overrideProps[propName] = { ...slotPropValue, ...childPropValue };
    } else if (propName === "className") {
      overrideProps[propName] = [slotPropValue, childPropValue].filter(Boolean).join(" ");
    }
  }
  return { ...slotProps, ...overrideProps };
}
function getElementRef(element) {
  let getter = Object.getOwnPropertyDescriptor(element.props, "ref")?.get;
  let mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
  if (mayWarn) {
    return element.ref;
  }
  getter = Object.getOwnPropertyDescriptor(element, "ref")?.get;
  mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
  if (mayWarn) {
    return element.props.ref;
  }
  return element.props.ref || element.ref;
}
var NODES = [
  "a",
  "button",
  "div",
  "form",
  "h2",
  "h3",
  "img",
  "input",
  "label",
  "li",
  "nav",
  "ol",
  "p",
  "span",
  "svg",
  "ul"
];
var Primitive = NODES.reduce((primitive, node) => {
  const Node = reactExports.forwardRef((props, forwardedRef) => {
    const { asChild, ...primitiveProps } = props;
    const Comp = asChild ? Slot : node;
    if (typeof window !== "undefined") {
      window[/* @__PURE__ */ Symbol.for("radix-ui")] = true;
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Comp, { ...primitiveProps, ref: forwardedRef });
  });
  Node.displayName = `Primitive.${node}`;
  return { ...primitive, [node]: Node };
}, {});
function createCollection(name) {
  const PROVIDER_NAME = name + "CollectionProvider";
  const [createCollectionContext, createCollectionScope2] = createContextScope(PROVIDER_NAME);
  const [CollectionProviderImpl, useCollectionContext] = createCollectionContext(
    PROVIDER_NAME,
    { collectionRef: { current: null }, itemMap: /* @__PURE__ */ new Map() }
  );
  const CollectionProvider = (props) => {
    const { scope, children } = props;
    const ref = React.useRef(null);
    const itemMap = React.useRef(/* @__PURE__ */ new Map()).current;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(CollectionProviderImpl, { scope, itemMap, collectionRef: ref, children });
  };
  CollectionProvider.displayName = PROVIDER_NAME;
  const COLLECTION_SLOT_NAME = name + "CollectionSlot";
  const CollectionSlot = React.forwardRef(
    (props, forwardedRef) => {
      const { scope, children } = props;
      const context = useCollectionContext(COLLECTION_SLOT_NAME, scope);
      const composedRefs = useComposedRefs(forwardedRef, context.collectionRef);
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Slot, { ref: composedRefs, children });
    }
  );
  CollectionSlot.displayName = COLLECTION_SLOT_NAME;
  const ITEM_SLOT_NAME = name + "CollectionItemSlot";
  const ITEM_DATA_ATTR = "data-radix-collection-item";
  const CollectionItemSlot = React.forwardRef(
    (props, forwardedRef) => {
      const { scope, children, ...itemData } = props;
      const ref = React.useRef(null);
      const composedRefs = useComposedRefs(forwardedRef, ref);
      const context = useCollectionContext(ITEM_SLOT_NAME, scope);
      React.useEffect(() => {
        context.itemMap.set(ref, { ref, ...itemData });
        return () => void context.itemMap.delete(ref);
      });
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Slot, { ...{ [ITEM_DATA_ATTR]: "" }, ref: composedRefs, children });
    }
  );
  CollectionItemSlot.displayName = ITEM_SLOT_NAME;
  function useCollection2(scope) {
    const context = useCollectionContext(name + "CollectionConsumer", scope);
    const getItems = React.useCallback(() => {
      const collectionNode = context.collectionRef.current;
      if (!collectionNode) return [];
      const orderedNodes = Array.from(collectionNode.querySelectorAll(`[${ITEM_DATA_ATTR}]`));
      const items = Array.from(context.itemMap.values());
      const orderedItems = items.sort(
        (a, b) => orderedNodes.indexOf(a.ref.current) - orderedNodes.indexOf(b.ref.current)
      );
      return orderedItems;
    }, [context.collectionRef, context.itemMap]);
    return getItems;
  }
  return [
    { Provider: CollectionProvider, Slot: CollectionSlot, ItemSlot: CollectionItemSlot },
    useCollection2,
    createCollectionScope2
  ];
}
var PAGE_KEYS = ["PageUp", "PageDown"];
var ARROW_KEYS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
var BACK_KEYS = {
  "from-left": ["Home", "PageDown", "ArrowDown", "ArrowLeft"],
  "from-right": ["Home", "PageDown", "ArrowDown", "ArrowRight"],
  "from-bottom": ["Home", "PageDown", "ArrowDown", "ArrowLeft"],
  "from-top": ["Home", "PageDown", "ArrowUp", "ArrowLeft"]
};
var SLIDER_NAME = "Slider";
var [Collection, useCollection, createCollectionScope] = createCollection(SLIDER_NAME);
var [createSliderContext] = createContextScope(SLIDER_NAME, [
  createCollectionScope
]);
var [SliderProvider, useSliderContext] = createSliderContext(SLIDER_NAME);
var Slider$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      name,
      min = 0,
      max = 100,
      step = 1,
      orientation = "horizontal",
      disabled = false,
      minStepsBetweenThumbs = 0,
      defaultValue = [min],
      value,
      onValueChange = () => {
      },
      onValueCommit = () => {
      },
      inverted = false,
      form,
      ...sliderProps
    } = props;
    const thumbRefs = reactExports.useRef(/* @__PURE__ */ new Set());
    const valueIndexToChangeRef = reactExports.useRef(0);
    const isHorizontal = orientation === "horizontal";
    const SliderOrientation = isHorizontal ? SliderHorizontal : SliderVertical;
    const [values = [], setValues] = useControllableState({
      prop: value,
      defaultProp: defaultValue,
      onChange: (value2) => {
        const thumbs = [...thumbRefs.current];
        thumbs[valueIndexToChangeRef.current]?.focus();
        onValueChange(value2);
      }
    });
    const valuesBeforeSlideStartRef = reactExports.useRef(values);
    function handleSlideStart(value2) {
      const closestIndex = getClosestValueIndex(values, value2);
      updateValues(value2, closestIndex);
    }
    function handleSlideMove(value2) {
      updateValues(value2, valueIndexToChangeRef.current);
    }
    function handleSlideEnd() {
      const prevValue = valuesBeforeSlideStartRef.current[valueIndexToChangeRef.current];
      const nextValue = values[valueIndexToChangeRef.current];
      const hasChanged = nextValue !== prevValue;
      if (hasChanged) onValueCommit(values);
    }
    function updateValues(value2, atIndex, { commit } = { commit: false }) {
      const decimalCount = getDecimalCount(step);
      const snapToStep = roundValue(Math.round((value2 - min) / step) * step + min, decimalCount);
      const nextValue = clamp(snapToStep, [min, max]);
      setValues((prevValues = []) => {
        const nextValues = getNextSortedValues(prevValues, nextValue, atIndex);
        if (hasMinStepsBetweenValues(nextValues, minStepsBetweenThumbs * step)) {
          valueIndexToChangeRef.current = nextValues.indexOf(nextValue);
          const hasChanged = String(nextValues) !== String(prevValues);
          if (hasChanged && commit) onValueCommit(nextValues);
          return hasChanged ? nextValues : prevValues;
        } else {
          return prevValues;
        }
      });
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      SliderProvider,
      {
        scope: props.__scopeSlider,
        name,
        disabled,
        min,
        max,
        valueIndexToChangeRef,
        thumbs: thumbRefs.current,
        values,
        orientation,
        form,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Collection.Provider, { scope: props.__scopeSlider, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Collection.Slot, { scope: props.__scopeSlider, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          SliderOrientation,
          {
            "aria-disabled": disabled,
            "data-disabled": disabled ? "" : void 0,
            ...sliderProps,
            ref: forwardedRef,
            onPointerDown: composeEventHandlers(sliderProps.onPointerDown, () => {
              if (!disabled) valuesBeforeSlideStartRef.current = values;
            }),
            min,
            max,
            inverted,
            onSlideStart: disabled ? void 0 : handleSlideStart,
            onSlideMove: disabled ? void 0 : handleSlideMove,
            onSlideEnd: disabled ? void 0 : handleSlideEnd,
            onHomeKeyDown: () => !disabled && updateValues(min, 0, { commit: true }),
            onEndKeyDown: () => !disabled && updateValues(max, values.length - 1, { commit: true }),
            onStepKeyDown: ({ event, direction: stepDirection }) => {
              if (!disabled) {
                const isPageKey = PAGE_KEYS.includes(event.key);
                const isSkipKey = isPageKey || event.shiftKey && ARROW_KEYS.includes(event.key);
                const multiplier = isSkipKey ? 10 : 1;
                const atIndex = valueIndexToChangeRef.current;
                const value2 = values[atIndex];
                const stepInDirection = step * multiplier * stepDirection;
                updateValues(value2 + stepInDirection, atIndex, { commit: true });
              }
            }
          }
        ) }) })
      }
    );
  }
);
Slider$1.displayName = SLIDER_NAME;
var [SliderOrientationProvider, useSliderOrientationContext] = createSliderContext(SLIDER_NAME, {
  startEdge: "left",
  endEdge: "right",
  size: "width",
  direction: 1
});
var SliderHorizontal = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      min,
      max,
      dir,
      inverted,
      onSlideStart,
      onSlideMove,
      onSlideEnd,
      onStepKeyDown,
      ...sliderProps
    } = props;
    const [slider, setSlider] = reactExports.useState(null);
    const composedRefs = useComposedRefs(forwardedRef, (node) => setSlider(node));
    const rectRef = reactExports.useRef(void 0);
    const direction = useDirection(dir);
    const isDirectionLTR = direction === "ltr";
    const isSlidingFromLeft = isDirectionLTR && !inverted || !isDirectionLTR && inverted;
    function getValueFromPointer(pointerPosition) {
      const rect = rectRef.current || slider.getBoundingClientRect();
      const input = [0, rect.width];
      const output = isSlidingFromLeft ? [min, max] : [max, min];
      const value = linearScale(input, output);
      rectRef.current = rect;
      return value(pointerPosition - rect.left);
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      SliderOrientationProvider,
      {
        scope: props.__scopeSlider,
        startEdge: isSlidingFromLeft ? "left" : "right",
        endEdge: isSlidingFromLeft ? "right" : "left",
        direction: isSlidingFromLeft ? 1 : -1,
        size: "width",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          SliderImpl,
          {
            dir: direction,
            "data-orientation": "horizontal",
            ...sliderProps,
            ref: composedRefs,
            style: {
              ...sliderProps.style,
              ["--radix-slider-thumb-transform"]: "translateX(-50%)"
            },
            onSlideStart: (event) => {
              const value = getValueFromPointer(event.clientX);
              onSlideStart?.(value);
            },
            onSlideMove: (event) => {
              const value = getValueFromPointer(event.clientX);
              onSlideMove?.(value);
            },
            onSlideEnd: () => {
              rectRef.current = void 0;
              onSlideEnd?.();
            },
            onStepKeyDown: (event) => {
              const slideDirection = isSlidingFromLeft ? "from-left" : "from-right";
              const isBackKey = BACK_KEYS[slideDirection].includes(event.key);
              onStepKeyDown?.({ event, direction: isBackKey ? -1 : 1 });
            }
          }
        )
      }
    );
  }
);
var SliderVertical = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      min,
      max,
      inverted,
      onSlideStart,
      onSlideMove,
      onSlideEnd,
      onStepKeyDown,
      ...sliderProps
    } = props;
    const sliderRef = reactExports.useRef(null);
    const ref = useComposedRefs(forwardedRef, sliderRef);
    const rectRef = reactExports.useRef(void 0);
    const isSlidingFromBottom = !inverted;
    function getValueFromPointer(pointerPosition) {
      const rect = rectRef.current || sliderRef.current.getBoundingClientRect();
      const input = [0, rect.height];
      const output = isSlidingFromBottom ? [max, min] : [min, max];
      const value = linearScale(input, output);
      rectRef.current = rect;
      return value(pointerPosition - rect.top);
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      SliderOrientationProvider,
      {
        scope: props.__scopeSlider,
        startEdge: isSlidingFromBottom ? "bottom" : "top",
        endEdge: isSlidingFromBottom ? "top" : "bottom",
        size: "height",
        direction: isSlidingFromBottom ? 1 : -1,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          SliderImpl,
          {
            "data-orientation": "vertical",
            ...sliderProps,
            ref,
            style: {
              ...sliderProps.style,
              ["--radix-slider-thumb-transform"]: "translateY(50%)"
            },
            onSlideStart: (event) => {
              const value = getValueFromPointer(event.clientY);
              onSlideStart?.(value);
            },
            onSlideMove: (event) => {
              const value = getValueFromPointer(event.clientY);
              onSlideMove?.(value);
            },
            onSlideEnd: () => {
              rectRef.current = void 0;
              onSlideEnd?.();
            },
            onStepKeyDown: (event) => {
              const slideDirection = isSlidingFromBottom ? "from-bottom" : "from-top";
              const isBackKey = BACK_KEYS[slideDirection].includes(event.key);
              onStepKeyDown?.({ event, direction: isBackKey ? -1 : 1 });
            }
          }
        )
      }
    );
  }
);
var SliderImpl = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeSlider,
      onSlideStart,
      onSlideMove,
      onSlideEnd,
      onHomeKeyDown,
      onEndKeyDown,
      onStepKeyDown,
      ...sliderProps
    } = props;
    const context = useSliderContext(SLIDER_NAME, __scopeSlider);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.span,
      {
        ...sliderProps,
        ref: forwardedRef,
        onKeyDown: composeEventHandlers(props.onKeyDown, (event) => {
          if (event.key === "Home") {
            onHomeKeyDown(event);
            event.preventDefault();
          } else if (event.key === "End") {
            onEndKeyDown(event);
            event.preventDefault();
          } else if (PAGE_KEYS.concat(ARROW_KEYS).includes(event.key)) {
            onStepKeyDown(event);
            event.preventDefault();
          }
        }),
        onPointerDown: composeEventHandlers(props.onPointerDown, (event) => {
          const target = event.target;
          target.setPointerCapture(event.pointerId);
          event.preventDefault();
          if (context.thumbs.has(target)) {
            target.focus();
          } else {
            onSlideStart(event);
          }
        }),
        onPointerMove: composeEventHandlers(props.onPointerMove, (event) => {
          const target = event.target;
          if (target.hasPointerCapture(event.pointerId)) onSlideMove(event);
        }),
        onPointerUp: composeEventHandlers(props.onPointerUp, (event) => {
          const target = event.target;
          if (target.hasPointerCapture(event.pointerId)) {
            target.releasePointerCapture(event.pointerId);
            onSlideEnd(event);
          }
        })
      }
    );
  }
);
var TRACK_NAME = "SliderTrack";
var SliderTrack = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeSlider, ...trackProps } = props;
    const context = useSliderContext(TRACK_NAME, __scopeSlider);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.span,
      {
        "data-disabled": context.disabled ? "" : void 0,
        "data-orientation": context.orientation,
        ...trackProps,
        ref: forwardedRef
      }
    );
  }
);
SliderTrack.displayName = TRACK_NAME;
var RANGE_NAME = "SliderRange";
var SliderRange = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeSlider, ...rangeProps } = props;
    const context = useSliderContext(RANGE_NAME, __scopeSlider);
    const orientation = useSliderOrientationContext(RANGE_NAME, __scopeSlider);
    const ref = reactExports.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, ref);
    const valuesCount = context.values.length;
    const percentages = context.values.map(
      (value) => convertValueToPercentage(value, context.min, context.max)
    );
    const offsetStart = valuesCount > 1 ? Math.min(...percentages) : 0;
    const offsetEnd = 100 - Math.max(...percentages);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.span,
      {
        "data-orientation": context.orientation,
        "data-disabled": context.disabled ? "" : void 0,
        ...rangeProps,
        ref: composedRefs,
        style: {
          ...props.style,
          [orientation.startEdge]: offsetStart + "%",
          [orientation.endEdge]: offsetEnd + "%"
        }
      }
    );
  }
);
SliderRange.displayName = RANGE_NAME;
var THUMB_NAME = "SliderThumb";
var SliderThumb = reactExports.forwardRef(
  (props, forwardedRef) => {
    const getItems = useCollection(props.__scopeSlider);
    const [thumb, setThumb] = reactExports.useState(null);
    const composedRefs = useComposedRefs(forwardedRef, (node) => setThumb(node));
    const index = reactExports.useMemo(
      () => thumb ? getItems().findIndex((item) => item.ref.current === thumb) : -1,
      [getItems, thumb]
    );
    return /* @__PURE__ */ jsxRuntimeExports.jsx(SliderThumbImpl, { ...props, ref: composedRefs, index });
  }
);
var SliderThumbImpl = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeSlider, index, name, ...thumbProps } = props;
    const context = useSliderContext(THUMB_NAME, __scopeSlider);
    const orientation = useSliderOrientationContext(THUMB_NAME, __scopeSlider);
    const [thumb, setThumb] = reactExports.useState(null);
    const composedRefs = useComposedRefs(forwardedRef, (node) => setThumb(node));
    const isFormControl = thumb ? context.form || !!thumb.closest("form") : true;
    const size = useSize(thumb);
    const value = context.values[index];
    const percent = value === void 0 ? 0 : convertValueToPercentage(value, context.min, context.max);
    const label = getLabel(index, context.values.length);
    const orientationSize = size?.[orientation.size];
    const thumbInBoundsOffset = orientationSize ? getThumbInBoundsOffset(orientationSize, percent, orientation.direction) : 0;
    reactExports.useEffect(() => {
      if (thumb) {
        context.thumbs.add(thumb);
        return () => {
          context.thumbs.delete(thumb);
        };
      }
    }, [thumb, context.thumbs]);
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "span",
      {
        style: {
          transform: "var(--radix-slider-thumb-transform)",
          position: "absolute",
          [orientation.startEdge]: `calc(${percent}% + ${thumbInBoundsOffset}px)`
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Collection.ItemSlot, { scope: props.__scopeSlider, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Primitive.span,
            {
              role: "slider",
              "aria-label": props["aria-label"] || label,
              "aria-valuemin": context.min,
              "aria-valuenow": value,
              "aria-valuemax": context.max,
              "aria-orientation": context.orientation,
              "data-orientation": context.orientation,
              "data-disabled": context.disabled ? "" : void 0,
              tabIndex: context.disabled ? void 0 : 0,
              ...thumbProps,
              ref: composedRefs,
              style: value === void 0 ? { display: "none" } : props.style,
              onFocus: composeEventHandlers(props.onFocus, () => {
                context.valueIndexToChangeRef.current = index;
              })
            }
          ) }),
          isFormControl && /* @__PURE__ */ jsxRuntimeExports.jsx(
            BubbleInput,
            {
              name: name ?? (context.name ? context.name + (context.values.length > 1 ? "[]" : "") : void 0),
              form: context.form,
              value
            },
            index
          )
        ]
      }
    );
  }
);
SliderThumb.displayName = THUMB_NAME;
var BubbleInput = (props) => {
  const { value, ...inputProps } = props;
  const ref = reactExports.useRef(null);
  const prevValue = usePrevious(value);
  reactExports.useEffect(() => {
    const input = ref.current;
    const inputProto = window.HTMLInputElement.prototype;
    const descriptor = Object.getOwnPropertyDescriptor(inputProto, "value");
    const setValue = descriptor.set;
    if (prevValue !== value && setValue) {
      const event = new Event("input", { bubbles: true });
      setValue.call(input, value);
      input.dispatchEvent(event);
    }
  }, [prevValue, value]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("input", { style: { display: "none" }, ...inputProps, ref, defaultValue: value });
};
function getNextSortedValues(prevValues = [], nextValue, atIndex) {
  const nextValues = [...prevValues];
  nextValues[atIndex] = nextValue;
  return nextValues.sort((a, b) => a - b);
}
function convertValueToPercentage(value, min, max) {
  const maxSteps = max - min;
  const percentPerStep = 100 / maxSteps;
  const percentage = percentPerStep * (value - min);
  return clamp(percentage, [0, 100]);
}
function getLabel(index, totalValues) {
  if (totalValues > 2) {
    return `Value ${index + 1} of ${totalValues}`;
  } else if (totalValues === 2) {
    return ["Minimum", "Maximum"][index];
  } else {
    return void 0;
  }
}
function getClosestValueIndex(values, nextValue) {
  if (values.length === 1) return 0;
  const distances = values.map((value) => Math.abs(value - nextValue));
  const closestDistance = Math.min(...distances);
  return distances.indexOf(closestDistance);
}
function getThumbInBoundsOffset(width, left, direction) {
  const halfWidth = width / 2;
  const halfPercent = 50;
  const offset = linearScale([0, halfPercent], [0, halfWidth]);
  return (halfWidth - offset(left) * direction) * direction;
}
function getStepsBetweenValues(values) {
  return values.slice(0, -1).map((value, index) => values[index + 1] - value);
}
function hasMinStepsBetweenValues(values, minStepsBetweenValues) {
  if (minStepsBetweenValues > 0) {
    const stepsBetweenValues = getStepsBetweenValues(values);
    const actualMinStepsBetweenValues = Math.min(...stepsBetweenValues);
    return actualMinStepsBetweenValues >= minStepsBetweenValues;
  }
  return true;
}
function linearScale(input, output) {
  return (value) => {
    if (input[0] === input[1] || output[0] === output[1]) return output[0];
    const ratio = (output[1] - output[0]) / (input[1] - input[0]);
    return output[0] + ratio * (value - input[0]);
  };
}
function getDecimalCount(value) {
  return (String(value).split(".")[1] || "").length;
}
function roundValue(value, decimalCount) {
  const rounder = Math.pow(10, decimalCount);
  return Math.round(value * rounder) / rounder;
}
var Root = Slider$1;
var Track = SliderTrack;
var Range = SliderRange;
var Thumb = SliderThumb;
function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}) {
  const _values = reactExports.useMemo(
    () => Array.isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [min, max],
    [value, defaultValue, min, max]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Root,
    {
      className: cn(
        "relative flex w-full touch-none select-none items-center data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col data-[disabled]:opacity-50",
        className
      ),
      "data-slot": "slider",
      defaultValue,
      max,
      min,
      value,
      ...props,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Track,
          {
            className: cn(
              "relative grow overflow-hidden rounded-full bg-muted data-[orientation=horizontal]:h-1.5 data-[orientation=vertical]:h-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-1.5"
            ),
            "data-slot": "slider-track",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Range,
              {
                className: cn(
                  "absolute bg-primary data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
                ),
                "data-slot": "slider-range"
              }
            )
          }
        ),
        Array.from({ length: _values.length }, (_, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          Thumb,
          {
            className: "block size-4 shrink-0 rounded-full border border-primary bg-background shadow-sm ring-ring/50 transition-[color,box-shadow] hover:ring-4 focus-visible:outline-hidden focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-50",
            "data-slot": "slider-thumb"
          },
          index
        ))
      ]
    }
  );
}
function getIsValidRange(value) {
  return Array.isArray(value) && value.length === 2 && typeof value[0] === "number" && typeof value[1] === "number";
}
function DataTableSliderFilter({
  column,
  title
}) {
  const id = reactExports.useId();
  const columnFilterValue = getIsValidRange(column.getFilterValue()) ? column.getFilterValue() : void 0;
  const defaultRange = column.columnDef.meta?.range;
  const unit = column.columnDef.meta?.unit;
  const { min, max, step } = reactExports.useMemo(() => {
    let minValue = 0;
    let maxValue = 100;
    if (defaultRange && getIsValidRange(defaultRange)) {
      [minValue, maxValue] = defaultRange;
    } else {
      const values = column.getFacetedMinMaxValues();
      if (values && Array.isArray(values) && values.length === 2) {
        const [facetMinValue, facetMaxValue] = values;
        if (typeof facetMinValue === "number" && typeof facetMaxValue === "number") {
          minValue = facetMinValue;
          maxValue = facetMaxValue;
        }
      }
    }
    const rangeSize = maxValue - minValue;
    const step2 = rangeSize <= 20 ? 1 : rangeSize <= 100 ? Math.ceil(rangeSize / 20) : Math.ceil(rangeSize / 50);
    return { min: minValue, max: maxValue, step: step2 };
  }, [column, defaultRange]);
  const range = reactExports.useMemo(() => {
    return columnFilterValue ?? [min, max];
  }, [columnFilterValue, min, max]);
  const formatValue = reactExports.useCallback((value) => {
    return value.toLocaleString(void 0, { maximumFractionDigits: 0 });
  }, []);
  const onFromInputChange = reactExports.useCallback(
    (event) => {
      const numValue = Number(event.target.value);
      if (!Number.isNaN(numValue) && numValue >= min && numValue <= range[1]) {
        column.setFilterValue([numValue, range[1]]);
      }
    },
    [column, min, range]
  );
  const onToInputChange = reactExports.useCallback(
    (event) => {
      const numValue = Number(event.target.value);
      if (!Number.isNaN(numValue) && numValue <= max && numValue >= range[0]) {
        column.setFilterValue([range[0], numValue]);
      }
    },
    [column, max, range]
  );
  const onSliderValueChange = reactExports.useCallback(
    (value) => {
      if (Array.isArray(value) && value.length === 2) {
        column.setFilterValue(value);
      }
    },
    [column]
  );
  const onReset = reactExports.useCallback(
    (event) => {
      if (event.target instanceof HTMLDivElement) {
        event.stopPropagation();
      }
      column.setFilterValue(void 0);
    },
    [column]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "border-dashed", variant: "outline", children: [
      columnFilterValue ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          "aria-label": `Clear ${title} filter`,
          className: "rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          onClick: onReset,
          role: "button",
          tabIndex: 0,
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, {})
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx(CirclePlus, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: title }),
      columnFilterValue ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Separator,
          {
            className: "mx-0.5 data-[orientation=vertical]:h-4",
            orientation: "vertical"
          }
        ),
        formatValue(columnFilterValue[0]),
        " -",
        " ",
        formatValue(columnFilterValue[1]),
        unit ? ` ${unit}` : ""
      ] }) : null
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(PopoverContent, { align: "start", className: "flex w-auto flex-col gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70", children: title }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "sr-only", htmlFor: `${id}-from`, children: "From" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                "aria-valuemax": max,
                "aria-valuemin": min,
                className: cn("h-8 w-24", unit && "pr-8"),
                id: `${id}-from`,
                inputMode: "numeric",
                max,
                min,
                onChange: onFromInputChange,
                pattern: "[0-9]*",
                placeholder: min.toString(),
                size: "sm",
                type: "number",
                value: range[0]?.toString()
              }
            ),
            unit && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-0 right-0 bottom-0 flex items-center rounded-r-md bg-accent px-2 text-muted-foreground text-sm", children: unit })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "sr-only", htmlFor: `${id}-to`, children: "to" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                "aria-valuemax": max,
                "aria-valuemin": min,
                className: cn("h-8 w-24", unit && "pr-8"),
                id: `${id}-to`,
                inputMode: "numeric",
                max,
                min,
                onChange: onToInputChange,
                pattern: "[0-9]*",
                placeholder: max.toString(),
                size: "sm",
                type: "number",
                value: range[1]?.toString()
              }
            ),
            unit && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-0 right-0 bottom-0 flex items-center rounded-r-md bg-accent px-2 text-muted-foreground text-sm", children: unit })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "sr-only", htmlFor: `${id}-slider`, children: [
          title,
          " slider"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Slider,
          {
            id: `${id}-slider`,
            max,
            min,
            onValueChange: onSliderValueChange,
            step,
            value: range
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          "aria-label": `Clear ${title} filter`,
          onClick: onReset,
          size: "sm",
          variant: "outline",
          children: "Clear"
        }
      )
    ] })
  ] });
}
function SortableColumnItem({
  column,
  onToggleVisibility
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: column.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    CommandItem,
    {
      className: cn("flex items-center gap-2", isDragging && "opacity-50"),
      onSelect: onToggleVisibility,
      ref: setNodeRef,
      style,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            ...attributes,
            ...listeners,
            className: "cursor-grab rounded p-1 hover:bg-muted active:cursor-grabbing",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(GripVertical, { className: "size-3 text-muted-foreground" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 truncate", children: typeof column.columnDef.header === "string" ? column.columnDef.header : column.columnDef.meta?.label ?? column.id }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Check,
          {
            className: cn(
              "ml-auto size-4 shrink-0",
              column.getIsVisible() ? "opacity-100" : "opacity-0"
            )
          }
        )
      ]
    }
  );
}
function DataTableViewOptions({
  table
}) {
  const allColumns = table.getAllColumns();
  const filterableColumns = allColumns.filter(
    (column) => typeof column.accessorFn !== "undefined" && column.getCanHide()
  );
  const columns = reactExports.useMemo(() => {
    const columnMap = new Map(filterableColumns.map((col) => [col.id, col]));
    const orderedColumns = [];
    const currentColumnOrder = table.getState().columnOrder;
    currentColumnOrder.forEach((columnId) => {
      const column = columnMap.get(columnId);
      if (column) {
        orderedColumns.push(column);
        columnMap.delete(columnId);
      }
    });
    columnMap.forEach((column) => {
      orderedColumns.push(column);
    });
    return orderedColumns;
  }, [filterableColumns, table]);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = columns.findIndex((column) => column.id === active.id);
      const newIndex = columns.findIndex((column) => column.id === over?.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newColumns = [...columns];
        const [removed] = newColumns.splice(oldIndex, 1);
        newColumns.splice(newIndex, 0, removed);
        table.setColumnOrder(newColumns.map((col) => col.id));
      }
    }
  };
  const handleReset = () => {
    allColumns.forEach((column) => {
      if (column.getCanHide()) {
        column.toggleVisibility(
          typeof column.columnDef.meta?.hidden === "boolean" ? !column.columnDef.meta?.hidden : true
        );
      }
    });
    const defaultOrder = filterableColumns.map((col) => col.id);
    table.setColumnOrder(defaultOrder);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        "aria-label": "Toggle columns",
        className: "ml-auto hidden lg:flex",
        icon: Settings2,
        role: "combobox",
        variant: "outline",
        children: "View"
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverContent, { align: "end", className: "w-52 p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Command, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CommandInput, { placeholder: "Search columns..." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CommandList, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CommandEmpty, { children: "No columns found." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CommandGroup, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          DndContext,
          {
            collisionDetection: closestCenter,
            onDragEnd: handleDragEnd,
            sensors,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              SortableContext,
              {
                items: columns.map((col) => col.id),
                strategy: verticalListSortingStrategy,
                children: columns.map((column) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  SortableColumnItem,
                  {
                    column,
                    onToggleVisibility: () => column.toggleVisibility(!column.getIsVisible())
                  },
                  column.id
                ))
              }
            )
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CommandGroup, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          CommandItem,
          {
            className: "text-muted-foreground",
            onSelect: handleReset,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "mr-2 size-4" }),
              "Reset to default"
            ]
          }
        ) })
      ] })
    ] }) })
  ] });
}
const useDebounceValue = (value, delay) => {
  const [state, setState] = reactExports.useState(value);
  reactExports.useEffect(() => {
    const handler = setTimeout(() => setState(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return state;
};
const useDataTablePagination = (pageSize = 10) => {
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({
      clearOnDefault: true,
      history: "push"
    })
  );
  const state = {
    pageIndex: page - 1,
    pageSize
  };
  return { page, setPage, state };
};
const useReadColumnVisibility = (persistentKey) => {
  return useReadLocalStorage(
    `@op:${persistentKey}-column-visibility`
  );
};
const useDataTableColumnVisibility = (columns, persistentKey) => {
  const [columnVisibility, setColumnVisibility] = useLocalStorage(
    `@op:${persistentKey}-column-visibility`,
    columns.reduce((acc, column) => {
      const columnId = column.id || column.accessorKey;
      if (columnId) {
        acc[columnId] = typeof column.meta?.hidden === "boolean" ? !column.meta?.hidden : true;
      }
      return acc;
    }, {})
  );
  reactExports.useEffect(() => {
    setColumnVisibility(columnVisibility);
  }, []);
  const [columnOrder, setColumnOrder] = useLocalStorage(
    `@op:${persistentKey}-column-order`,
    columns.map((column) => column.id)
  );
  return { columnVisibility, setColumnVisibility, columnOrder, setColumnOrder };
};
function useSearchQueryState(props) {
  const searchKey = props?.searchKey ?? "search";
  const debounceMs = props?.debounceMs ?? 500;
  const { page, setPage } = useDataTablePagination();
  const [search, setSearch] = useQueryState(searchKey, {
    defaultValue: "",
    clearOnDefault: true,
    limitUrlUpdates: {
      method: "debounce",
      timeMs: debounceMs
    }
  });
  const debouncedSearch = useDebounceValue(search, debounceMs);
  return {
    search,
    debouncedSearch,
    setSearch: (value) => {
      if (page !== 1) {
        void setPage(1);
      }
      setSearch(value);
    }
  };
}
function DataTableToolbarContainer({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "aria-orientation": "horizontal",
      className: cn(
        "mb-2 flex flex-1 items-start justify-between gap-2",
        className
      ),
      role: "toolbar",
      ...props
    }
  );
}
function DataTableToolbar({
  table,
  children,
  className,
  globalSearchKey,
  globalSearchPlaceholder,
  ...props
}) {
  const { search, setSearch } = useSearchQueryState({
    searchKey: globalSearchKey
  });
  const isFiltered = table.getState().columnFilters.length > 0;
  const columns = reactExports.useMemo(
    () => table.getAllColumns().filter((column) => column.getCanFilter()),
    [table]
  );
  const onReset = reactExports.useCallback(() => {
    table.resetColumnFilters();
  }, [table]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(DataTableToolbarContainer, { className, ...props, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-wrap items-center gap-2", children: [
      globalSearchKey && /* @__PURE__ */ jsxRuntimeExports.jsx(
        AnimatedSearchInput,
        {
          onChange: setSearch,
          placeholder: globalSearchPlaceholder ?? "Search",
          value: search
        }
      ),
      columns.map((column) => /* @__PURE__ */ jsxRuntimeExports.jsx(DataTableToolbarFilter, { column }, column.id)),
      isFiltered && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          "aria-label": "Reset filters",
          className: "border-dashed",
          onClick: onReset,
          variant: "outline",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "mr-2 size-4" }),
            "Reset"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(DataTableViewOptions, { table })
    ] })
  ] });
}
function DataTableToolbarFilter({
  column
}) {
  {
    const columnMeta = column.columnDef.meta;
    const getTitle = reactExports.useCallback(() => {
      return columnMeta?.label ?? columnMeta?.placeholder ?? column.id;
    }, [columnMeta, column]);
    const onFilterRender = reactExports.useCallback(() => {
      if (!columnMeta?.variant) {
        return null;
      }
      switch (columnMeta.variant) {
        case "text":
          return /* @__PURE__ */ jsxRuntimeExports.jsx(
            AnimatedSearchInput,
            {
              onChange: (value) => column.setFilterValue(value),
              placeholder: columnMeta.placeholder ?? columnMeta.label,
              value: column.getFilterValue() ?? ""
            }
          );
        case "number":
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                className: cn("w-[120px]", columnMeta.unit && "pr-8"),
                inputMode: "numeric",
                onChange: (event) => column.setFilterValue(event.target.value),
                placeholder: getTitle(),
                type: "number",
                value: column.getFilterValue() ?? ""
              }
            ),
            columnMeta.unit && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-0 right-0 bottom-0 flex items-center rounded-r-md bg-accent px-2 text-muted-foreground text-sm", children: columnMeta.unit })
          ] });
        case "range":
          return /* @__PURE__ */ jsxRuntimeExports.jsx(DataTableSliderFilter, { column, title: getTitle() });
        case "date":
        case "dateRange":
          return /* @__PURE__ */ jsxRuntimeExports.jsx(
            DataTableDateFilter,
            {
              column,
              multiple: columnMeta.variant === "dateRange",
              title: getTitle()
            }
          );
        case "select":
        case "multiSelect":
          return /* @__PURE__ */ jsxRuntimeExports.jsx(
            DataTableFacetedFilter,
            {
              column,
              multiple: columnMeta.variant === "multiSelect",
              options: columnMeta.options ?? [],
              title: getTitle()
            }
          );
        default:
          return null;
      }
    }, [column, columnMeta]);
    return onFilterRender();
  }
}
function AnimatedSearchInput({
  placeholder,
  value,
  onChange
}) {
  const [isFocused, setIsFocused] = reactExports.useState(false);
  const inputRef = reactExports.useRef(null);
  const isExpanded = isFocused || (value?.length ?? 0) > 0;
  const handleClear = reactExports.useCallback(() => {
    onChange("");
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [onChange]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "aria-label": placeholder ?? "Search",
      className: cn(
        "relative flex items-center rounded-md border border-input bg-background text-sm transition-[width] duration-300 ease-out",
        "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
        "h-9 min-h-9",
        isExpanded ? "w-56 lg:w-72" : "w-32"
      ),
      role: "search",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "ml-2 size-4 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            className: cn(
              "absolute inset-0 h-full w-full rounded-md border-0 bg-transparent py-2 pr-7 pl-7 shadow-none",
              "focus-visible:ring-0 focus-visible:ring-offset-0",
              "transition-opacity duration-200",
              "truncate align-baseline font-medium text-sm"
            ),
            onBlur: () => setIsFocused(false),
            onChange: (e) => onChange(e.target.value),
            onFocus: () => setIsFocused(true),
            placeholder,
            ref: inputRef,
            size: "sm",
            value
          }
        ),
        isExpanded && value && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            "aria-label": "Clear search",
            className: "absolute right-1 flex size-6 items-center justify-center rounded-sm text-muted-foreground hover:bg-accent hover:text-foreground",
            onClick: (e) => {
              e.preventDefault();
              e.stopPropagation();
              handleClear();
            },
            type: "button",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-4" })
          }
        )
      ]
    }
  );
}
export {
  AnimatedSearchInput as A,
  DataTableToolbarContainer as D,
  DataTableViewOptions as a,
  DataTableToolbar as b,
  useDataTableColumnVisibility as c,
  useDataTablePagination as d,
  useReadColumnVisibility as e,
  useSearchQueryState as u
};
//# sourceMappingURL=data-table-toolbar-BJU_j2v8.js.map

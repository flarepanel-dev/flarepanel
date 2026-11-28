import { E as commonjsGlobal, g as getDefaultExportFromCjs, a as reactExports, o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { d as cn, W as Search, aK as Input, D as DropdownMenu, m as DropdownMenuTrigger, x as ChevronsUpDown, n as DropdownMenuContent, z as DropdownMenuGroup, o as DropdownMenuItem } from "./router-gBnYxPzA.js";
import { a as WidgetHead$1 } from "./widget-D7PGEeO1.js";
import { l as last } from "./last-C7omGuiv.js";
var lodash_throttle;
var hasRequiredLodash_throttle;
function requireLodash_throttle() {
  if (hasRequiredLodash_throttle) return lodash_throttle;
  hasRequiredLodash_throttle = 1;
  var FUNC_ERROR_TEXT = "Expected a function";
  var NAN = 0 / 0;
  var symbolTag = "[object Symbol]";
  var reTrim = /^\s+|\s+$/g;
  var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
  var reIsBinary = /^0b[01]+$/i;
  var reIsOctal = /^0o[0-7]+$/i;
  var freeParseInt = parseInt;
  var freeGlobal = typeof commonjsGlobal == "object" && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;
  var freeSelf = typeof self == "object" && self && self.Object === Object && self;
  var root = freeGlobal || freeSelf || Function("return this")();
  var objectProto = Object.prototype;
  var objectToString = objectProto.toString;
  var nativeMax = Math.max, nativeMin = Math.min;
  var now = function() {
    return root.Date.now();
  };
  function debounce(func, wait, options) {
    var lastArgs, lastThis, maxWait, result, timerId, lastCallTime, lastInvokeTime = 0, leading = false, maxing = false, trailing = true;
    if (typeof func != "function") {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    wait = toNumber(wait) || 0;
    if (isObject(options)) {
      leading = !!options.leading;
      maxing = "maxWait" in options;
      maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
      trailing = "trailing" in options ? !!options.trailing : trailing;
    }
    function invokeFunc(time) {
      var args = lastArgs, thisArg = lastThis;
      lastArgs = lastThis = void 0;
      lastInvokeTime = time;
      result = func.apply(thisArg, args);
      return result;
    }
    function leadingEdge(time) {
      lastInvokeTime = time;
      timerId = setTimeout(timerExpired, wait);
      return leading ? invokeFunc(time) : result;
    }
    function remainingWait(time) {
      var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime, result2 = wait - timeSinceLastCall;
      return maxing ? nativeMin(result2, maxWait - timeSinceLastInvoke) : result2;
    }
    function shouldInvoke(time) {
      var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime;
      return lastCallTime === void 0 || timeSinceLastCall >= wait || timeSinceLastCall < 0 || maxing && timeSinceLastInvoke >= maxWait;
    }
    function timerExpired() {
      var time = now();
      if (shouldInvoke(time)) {
        return trailingEdge(time);
      }
      timerId = setTimeout(timerExpired, remainingWait(time));
    }
    function trailingEdge(time) {
      timerId = void 0;
      if (trailing && lastArgs) {
        return invokeFunc(time);
      }
      lastArgs = lastThis = void 0;
      return result;
    }
    function cancel() {
      if (timerId !== void 0) {
        clearTimeout(timerId);
      }
      lastInvokeTime = 0;
      lastArgs = lastCallTime = lastThis = timerId = void 0;
    }
    function flush() {
      return timerId === void 0 ? result : trailingEdge(now());
    }
    function debounced() {
      var time = now(), isInvoking = shouldInvoke(time);
      lastArgs = arguments;
      lastThis = this;
      lastCallTime = time;
      if (isInvoking) {
        if (timerId === void 0) {
          return leadingEdge(lastCallTime);
        }
        if (maxing) {
          timerId = setTimeout(timerExpired, wait);
          return invokeFunc(lastCallTime);
        }
      }
      if (timerId === void 0) {
        timerId = setTimeout(timerExpired, wait);
      }
      return result;
    }
    debounced.cancel = cancel;
    debounced.flush = flush;
    return debounced;
  }
  function throttle2(func, wait, options) {
    var leading = true, trailing = true;
    if (typeof func != "function") {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    if (isObject(options)) {
      leading = "leading" in options ? !!options.leading : leading;
      trailing = "trailing" in options ? !!options.trailing : trailing;
    }
    return debounce(func, wait, {
      "leading": leading,
      "maxWait": wait,
      "trailing": trailing
    });
  }
  function isObject(value) {
    var type = typeof value;
    return !!value && (type == "object" || type == "function");
  }
  function isObjectLike(value) {
    return !!value && typeof value == "object";
  }
  function isSymbol(value) {
    return typeof value == "symbol" || isObjectLike(value) && objectToString.call(value) == symbolTag;
  }
  function toNumber(value) {
    if (typeof value == "number") {
      return value;
    }
    if (isSymbol(value)) {
      return NAN;
    }
    if (isObject(value)) {
      var other = typeof value.valueOf == "function" ? value.valueOf() : value;
      value = isObject(other) ? other + "" : other;
    }
    if (typeof value != "string") {
      return value === 0 ? value : +value;
    }
    value = value.replace(reTrim, "");
    var isBinary = reIsBinary.test(value);
    return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
  }
  lodash_throttle = throttle2;
  return lodash_throttle;
}
var lodash_throttleExports = requireLodash_throttle();
const throttle = /* @__PURE__ */ getDefaultExportFromCjs(lodash_throttleExports);
function useThrottle(cb, delay) {
  const options = { leading: true, trailing: false };
  const cbRef = reactExports.useRef(cb);
  reactExports.useEffect(() => {
    cbRef.current = cb;
  });
  return reactExports.useCallback(
    throttle(() => cbRef.current(), delay, options),
    [delay]
  );
}
function WidgetHead({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    WidgetHead$1,
    {
      className: cn(
        "relative flex flex-col rounded-t-xl p-0 [&_.title]:flex [&_.title]:items-center [&_.title]:p-4 [&_.title]:font-semibold",
        className
      ),
      ...props
    }
  );
}
function WidgetTitle({
  children,
  className,
  icon: Icon,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: cn("title row justify-start text-left", className),
      ...props,
      children: [
        Icon && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mr-2 rounded-lg bg-def-200 p-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 16 }) }),
        children
      ]
    }
  );
}
function WidgetAbsoluteButtons({
  className,
  children,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: cn(
        "row absolute top-1/2 right-4 -translate-y-1/2 gap-1",
        className
      ),
      ...props,
      children
    }
  );
}
function WidgetButtons({
  className,
  children,
  ...props
}) {
  const container = reactExports.useRef(null);
  const sizes = reactExports.useRef([]);
  const [slice, setSlice] = reactExports.useState(3);
  const gap = 16;
  const handleResize = useThrottle(() => {
    if (container.current) {
      if (sizes.current.length === 0) {
        const buttons = Array.from(
          container.current.querySelectorAll("button")
        );
        sizes.current = buttons.map(
          (button) => Math.ceil(button.offsetWidth) + gap
        );
      }
      const containerWidth = container.current.offsetWidth;
      const buttonsWidth = sizes.current.reduce((acc, size) => acc + size, 0);
      const moreWidth = (last(sizes.current) ?? 0) + gap;
      if (buttonsWidth > containerWidth) {
        const res = sizes.current.reduce(
          (acc, size, index) => {
            if (acc.size + size + moreWidth > containerWidth) {
              return { index: acc.index, size: acc.size + size };
            }
            return { index, size: acc.size + size };
          },
          { index: 0, size: 0 }
        );
        setSlice(res.index);
      } else {
        setSlice(sizes.current.length - 1);
      }
    }
  }, 30);
  reactExports.useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize, children]);
  const hidden = "!opacity-0 absolute pointer-events-none";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: cn(
        "-mt-2 -mb-px flex flex-wrap justify-start self-stretch px-4 transition-opacity [&_button.active]:border-black [&_button.active]:border-b-2 [&_button.active]:opacity-100 dark:[&_button.active]:border-white [&_button]:whitespace-nowrap [&_button]:py-1 [&_button]:text-xs [&_button]:opacity-50",
        className
      ),
      ref: container,
      style: { gap },
      ...props,
      children: [
        reactExports.Children.map(children, (child, index) => {
          return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex", slice < index ? hidden : "opacity-100"), children: child });
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              className: cn(
                "flex select-none items-center gap-1",
                sizes.current.length - 1 === slice ? hidden : "opacity-50"
              ),
              type: "button",
              children: [
                "More ",
                /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronsUpDown, { size: 12 })
              ]
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuContent, { align: "end", className: "[&_button]:w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuGroup, { children: reactExports.Children.map(children, (child, index) => {
            if (index <= slice) {
              return null;
            }
            return /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuItem, { asChild: true, children: child });
          }) }) })
        ] })
      ]
    }
  );
}
function WidgetHeadSearchable({
  tabs,
  className,
  activeTab,
  onTabChange,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search"
}) {
  const scrollRef = reactExports.useRef(null);
  const [showLeftGradient, setShowLeftGradient] = reactExports.useState(false);
  const [showRightGradient, setShowRightGradient] = reactExports.useState(false);
  const updateGradients = reactExports.useCallback(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const hasOverflow = scrollWidth > clientWidth;
    setShowLeftGradient(hasOverflow && scrollLeft > 0);
    setShowRightGradient(
      hasOverflow && scrollLeft < scrollWidth - clientWidth - 1
    );
  }, []);
  reactExports.useEffect(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    updateGradients();
    el.addEventListener("scroll", updateGradients);
    window.addEventListener("resize", updateGradients);
    return () => {
      el.removeEventListener("scroll", updateGradients);
      window.removeEventListener("resize", updateGradients);
    };
  }, [updateGradients]);
  reactExports.useEffect(() => {
    requestAnimationFrame(updateGradients);
  }, [tabs, updateGradients]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("border-border border-b", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: cn(
            "pointer-events-none absolute top-0 left-0 z-10 h-full w-8 bg-gradient-to-r from-card to-transparent transition-opacity duration-200",
            showLeftGradient ? "opacity-100" : "opacity-0"
          )
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "hide-scrollbar flex gap-1 overflow-x-auto px-2 py-3",
          ref: scrollRef,
          children: tabs.map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: cn(
                "shrink-0 rounded-md px-2 py-1.5 font-medium text-xs transition-colors",
                activeTab === tab.key ? "text-foreground" : "text-muted-foreground hover:bg-def-100 hover:text-foreground"
              ),
              onClick: () => onTabChange(tab.key),
              type: "button",
              children: tab.label
            },
            tab.key
          ))
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: cn(
            "pointer-events-none absolute top-0 right-0 bottom-px z-10 w-8 bg-gradient-to-l from-card to-transparent transition-opacity duration-200",
            showRightGradient ? "opacity-100" : "opacity-0"
          )
        }
      )
    ] }),
    onSearchChange && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          className: "rounded-none border-0 border-y bg-transparent pl-9 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground focus-visible:ring-offset-0",
          onChange: (e) => onSearchChange(e.target.value),
          placeholder: searchPlaceholder,
          size: "sm",
          type: "search",
          value: searchValue ?? ""
        }
      )
    ] })
  ] });
}
function WidgetFooter({
  className,
  children,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: cn(
        "flex rounded-b-md border-t bg-def-100 p-2 py-1",
        className
      ),
      ...props,
      children
    }
  );
}
export {
  WidgetHead as W,
  WidgetButtons as a,
  WidgetHeadSearchable as b,
  WidgetFooter as c,
  WidgetTitle as d,
  WidgetAbsoluteButtons as e
};
//# sourceMappingURL=overview-widget-q0VDaTtp.js.map

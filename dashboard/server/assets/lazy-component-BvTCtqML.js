import { a as reactExports, o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { bP as esExports } from "./router-gBnYxPzA.js";
const LazyComponent = ({
  lazy = true,
  children,
  fallback = null,
  className,
  viewportOptions,
  disconnectOnLeave = true
}) => {
  const ref = reactExports.useRef(null);
  const once = reactExports.useRef(false);
  const { inViewport } = esExports.useInViewport(
    ref,
    viewportOptions,
    {
      disconnectOnLeave
    }
  );
  reactExports.useEffect(() => {
    if (inViewport) {
      once.current = true;
    }
  }, [inViewport]);
  const shouldRender = lazy ? once.current || inViewport : true;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className, ref, children: shouldRender ? children : fallback ?? /* @__PURE__ */ jsxRuntimeExports.jsx("div", {}) });
};
export {
  LazyComponent as L
};
//# sourceMappingURL=lazy-component-BvTCtqML.js.map

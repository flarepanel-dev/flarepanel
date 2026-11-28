import { a as reactExports, o as jsxRuntimeExports } from "./worker-entry-C5kSRogq.js";
import { aS as WithLabel, aK as Input, aT as fieldMessageId, aU as EyeOff, aV as Eye } from "./router-gBnYxPzA.js";
const PasswordInput = reactExports.forwardRef(
  ({ label, error, hint, action, className, size, ...inputProps }, ref) => {
    const [visible, setVisible] = reactExports.useState(false);
    const generatedId = reactExports.useId();
    const fieldId = inputProps.id ?? generatedId;
    const hasMessage = Boolean(error ?? hint);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      WithLabel,
      {
        action,
        className,
        error,
        hint,
        id: fieldId,
        label,
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              error,
              ref,
              size,
              ...inputProps,
              "aria-describedby": hasMessage ? fieldMessageId(fieldId) : void 0,
              autoComplete: inputProps.autoComplete ?? "current-password",
              className: "pr-11",
              id: fieldId,
              type: visible ? "text" : "password"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              "aria-label": visible ? "Hide password" : "Show password",
              "aria-pressed": visible,
              className: "absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              onClick: () => setVisible((current) => !current),
              type: "button",
              children: visible ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { size: 18 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 18 })
            }
          )
        ] })
      }
    );
  }
);
PasswordInput.displayName = "PasswordInput";
export {
  PasswordInput as P
};
//# sourceMappingURL=password-input-X7xJVkt1.js.map

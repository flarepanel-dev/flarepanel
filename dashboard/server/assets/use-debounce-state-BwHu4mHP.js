import { d as debounce } from "./index-Dpi7uv2M.js";
import { a as reactExports } from "./worker-entry-C5kSRogq.js";
function useDebounceState(initialValue, delay = 500, options) {
  const [value, setValue] = reactExports.useState(initialValue);
  const [debouncedValue, _setDebouncedValue] = reactExports.useState(initialValue);
  const setDebouncedValue = reactExports.useMemo(
    () => debounce(_setDebouncedValue, delay, options),
    []
  );
  reactExports.useEffect(() => {
    setDebouncedValue(value);
  }, [value]);
  return {
    value,
    debounced: debouncedValue,
    set: setValue
  };
}
export {
  useDebounceState as u
};
//# sourceMappingURL=use-debounce-state-BwHu4mHP.js.map

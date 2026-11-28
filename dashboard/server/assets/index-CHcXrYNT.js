import { a as reactExports } from "./worker-entry-C5kSRogq.js";
import "./router-gBnYxPzA.js";
var useIsomorphicLayoutEffect = typeof window !== "undefined" ? reactExports.useLayoutEffect : reactExports.useEffect;
function useEventListener(eventName, handler, element, options) {
  const savedHandler = reactExports.useRef(handler);
  useIsomorphicLayoutEffect(() => {
    savedHandler.current = handler;
  }, [handler]);
  reactExports.useEffect(() => {
    const targetElement = window;
    if (!(targetElement && targetElement.addEventListener))
      return;
    const listener = (event) => {
      savedHandler.current(event);
    };
    targetElement.addEventListener(eventName, listener, options);
    return () => {
      targetElement.removeEventListener(eventName, listener, options);
    };
  }, [eventName, element, options]);
}
function useEventCallback(fn) {
  const ref = reactExports.useRef(() => {
    throw new Error("Cannot call an event handler while rendering.");
  });
  useIsomorphicLayoutEffect(() => {
    ref.current = fn;
  }, [fn]);
  return reactExports.useCallback((...args) => ref.current(...args), [ref]);
}
var IS_SERVER = typeof window === "undefined";
function useLocalStorage(key, initialValue, options = {}) {
  const { initializeWithValue = true } = options;
  const serializer = reactExports.useCallback(
    (value) => {
      if (options.serializer) {
        return options.serializer(value);
      }
      return JSON.stringify(value);
    },
    [options]
  );
  const deserializer = reactExports.useCallback(
    (value) => {
      if (options.deserializer) {
        return options.deserializer(value);
      }
      if (value === "undefined") {
        return void 0;
      }
      const defaultValue = initialValue instanceof Function ? initialValue() : initialValue;
      let parsed;
      try {
        parsed = JSON.parse(value);
      } catch (error) {
        console.error("Error parsing JSON:", error);
        return defaultValue;
      }
      return parsed;
    },
    [options, initialValue]
  );
  const readValue = reactExports.useCallback(() => {
    const initialValueToUse = initialValue instanceof Function ? initialValue() : initialValue;
    if (IS_SERVER) {
      return initialValueToUse;
    }
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? deserializer(raw) : initialValueToUse;
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      return initialValueToUse;
    }
  }, [initialValue, key, deserializer]);
  const [storedValue, setStoredValue] = reactExports.useState(() => {
    if (initializeWithValue) {
      return readValue();
    }
    return initialValue instanceof Function ? initialValue() : initialValue;
  });
  const setValue = useEventCallback((value) => {
    if (IS_SERVER) {
      console.warn(
        `Tried setting localStorage key “${key}” even though environment is not a client`
      );
    }
    try {
      const newValue = value instanceof Function ? value(readValue()) : value;
      window.localStorage.setItem(key, serializer(newValue));
      setStoredValue(newValue);
      window.dispatchEvent(new StorageEvent("local-storage", { key }));
    } catch (error) {
      console.warn(`Error setting localStorage key “${key}”:`, error);
    }
  });
  reactExports.useEffect(() => {
    setStoredValue(readValue());
  }, [key]);
  const handleStorageChange = reactExports.useCallback(
    (event) => {
      if ((event == null ? void 0 : event.key) && event.key !== key) {
        return;
      }
      setStoredValue(readValue());
    },
    [key, readValue]
  );
  useEventListener("storage", handleStorageChange);
  useEventListener("local-storage", handleStorageChange);
  return [storedValue, setValue];
}
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = reactExports.useState(value);
  reactExports.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);
  return debouncedValue;
}
var IS_SERVER3 = typeof window === "undefined";
function useReadLocalStorage(key, options = {}) {
  let { initializeWithValue = true } = options;
  if (IS_SERVER3) {
    initializeWithValue = false;
  }
  const deserializer = reactExports.useCallback(
    (value) => {
      if (options.deserializer) {
        return options.deserializer(value);
      }
      if (value === "undefined") {
        return void 0;
      }
      let parsed;
      try {
        parsed = JSON.parse(value);
      } catch (error) {
        console.error("Error parsing JSON:", error);
        return null;
      }
      return parsed;
    },
    [options]
  );
  const readValue = reactExports.useCallback(() => {
    if (IS_SERVER3) {
      return null;
    }
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? deserializer(raw) : null;
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      return null;
    }
  }, [key, deserializer]);
  const [storedValue, setStoredValue] = reactExports.useState(() => {
    if (initializeWithValue) {
      return readValue();
    }
    return void 0;
  });
  reactExports.useEffect(() => {
    setStoredValue(readValue());
  }, [key]);
  const handleStorageChange = reactExports.useCallback(
    (event) => {
      if ((event == null ? void 0 : event.key) && event.key !== key) {
        return;
      }
      setStoredValue(readValue());
    },
    [key, readValue]
  );
  useEventListener("storage", handleStorageChange);
  useEventListener("local-storage", handleStorageChange);
  return storedValue;
}
export {
  useReadLocalStorage as a,
  useDebounce as b,
  useLocalStorage as u
};
//# sourceMappingURL=index-CHcXrYNT.js.map

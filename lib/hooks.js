import { useCallback, useMemo, useRef, useState } from "preact/hooks";

export function isEqual(value1, value2) {
  // Handle circular references using WeakMap
  const seenA = new WeakMap();
  const seenB = new WeakMap();

  function deepCompare(a, b) {
    // Handle primitives
    if (Object.is(a, b)) return true;
    if (a === null || b === null || typeof a !== "object" || typeof b !== "object") {
      return a === b;
    }

    // Handle React/JSX elements - direct reference comparison since they're immutable
    // This prevents unnecessary deep comparisons
    if (a.$$typeof === Symbol.for("react.element") || b.$$typeof === Symbol.for("react.element")) {
      return a === b;
    }

    // Handle different types
    if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) {
      return false;
    }

    // Check for circular references
    if (seenA.has(a)) return seenA.get(a) === b;
    if (seenB.has(b)) return seenB.get(b) === a;
    // detect cross object circular references
    if (seenA.has(b) || seenB.has(a)) return false;
    seenA.set(a, b);
    seenB.set(b, a);

    // Handle Arrays
    if (Array.isArray(a)) {
      if (a.length !== b.length) {
        return false;
      }
      return a.every((item, index) => deepCompare(item, b[index]));
    }

    // Handle Dates
    if (a instanceof Date) {
      return a.getTime() === b.getTime();
    }

    // Handle RegExp
    if (a instanceof RegExp) {
      return a.toString() === b.toString();
    }

    // Handle Objects
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    return keysA.every((key) => keysB.includes(key) && deepCompare(a[key], b[key]));
  }

  return deepCompare(value1, value2);
}

/**
 * Both dependencies and state are compared using a deep equality function.
 * @template T
 * @param {T} newState
 * @returns {T}
 */
export function useDeepMemo(newState) {
  const state = useRef(/** @type {T} */ (null));
  if (!isEqual(newState, state.current)) {
    state.current = newState;
  }
  return state.current;
}

/**
 * @template T
 * @param {T} initialValue
 * @returns {[() => T, (value: T) => void, boolean]}
 */
export function useLive(initialValue) {
  const [refreshValue, forceRefresh] = useState(0);
  const ref = useRef(initialValue);

  // refreshValue is used to create a new getter so that any useEffect etc that depends on it will be re-run
  // In addition, provide `hasValueChanged` to help detect in a multi-dependency useEffect whether this specific
  // state has changed.
  let hasValueChanged = false;
  // biome-ignore lint/correctness/useExhaustiveDependencies: explanation above
  const getValue = useMemo(() => {
    hasValueChanged = true;
    return () => ref.current;
  }, [refreshValue]);

  // setter doesn't need to be created on every render
  const setValue = useCallback((value) => {
    if (value !== ref.current) {
      ref.current = value;
      forceRefresh((x) => x + 1);
    }
  }, []);

  return [getValue, setValue, hasValueChanged];
}

import { useCallback, useEffect, useMemo, useRef, useState } from "preact/hooks";
import { getMatchScore, sortValuesToTop } from "./utils.jsx";

/**
 * Returns a ref that always holds the latest value.
 * Useful for accessing current values in effects without adding them to deps.
 * Similar to React's experimental useEffectEvent.
 * @template {any[] | ((...args: any[]) => any)} T
 * @param {T} value
 * @returns {T}
 */
// function useEffectEvent(value) {
//   const ref = useRef(value);
//   ref.current = value;
//   /** @type {{ current: T }} */
//   // @ts-ignore
//   // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
//   const stableRef = useMemo(() => {
//     // @ts-ignore
//     return typeof ref.current === 'function' ? { current: (...args) => ref.current(...args) } : ref;
//   }, [typeof ref.current]);
//   return stableRef.current;
// }

/**
 * @param {any} value1
 * @param {any} value2
 * @returns {boolean}
 */
export function isEqual(value1, value2) {
  // Handle circular references using WeakMap
  const seenA = new WeakMap();
  const seenB = new WeakMap();

  /**
   * @param {any} a
   * @param {any} b
   * @returns {boolean}
   */
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
  const setValue = useCallback(
    /** @param {T} value */
    (value) => {
      if (value !== ref.current) {
        ref.current = value;
        forceRefresh((x) => x + 1);
      }
    },
    [],
  );

  return [getValue, setValue, hasValueChanged];
}

const isTouchDevice =
  typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)")?.matches;
// Since page hasn't potentially fully loaded yet we get only an approximate height
const visualViewportInitialHeight = window.visualViewport?.height ?? 0;

/**
 * Subscribe to virtual keyboard visibility changes (touch devices only)
 * @param {Object} params - Parameters for subscribing to virtual keyboard
 * @param {function(boolean): void} [params.visibleCallback] - Called with boolean when keyboard visibility changes
 * @param {function(number, boolean): void} [params.heightCallback] - Called with keyboard height when keyboard height changes
 * @returns {function | null} - Unsubscribe function
 */
export function subscribeToVirtualKeyboard({ visibleCallback, heightCallback }) {
  if (!isTouchDevice || typeof window === "undefined" || !window.visualViewport) return null;

  let isVisible = false;
  const handleViewportResize = () => {
    if (!window.visualViewport) return;
    const heightDiff = visualViewportInitialHeight - window.visualViewport.height;
    const isVisibleNow = heightDiff > 150;
    if (isVisible !== isVisibleNow) {
      isVisible = isVisibleNow;
      visibleCallback?.(isVisible);
    }
    heightCallback?.(heightDiff, isVisible);
  };
  window.visualViewport.addEventListener("resize", handleViewportResize, { passive: true });
  return () => {
    window.visualViewport?.removeEventListener("resize", handleViewportResize);
  };
}

/**
 * @typedef {import("./PreactCombobox.jsx").Option} Option
 * @typedef {import("./PreactCombobox.jsx").OptionMatch} OptionMatch
 */

/**
 * @typedef {Object} UseAsyncOptionsParams
 * @property {Option[] | ((queryOrValues: string[] | string, limit: number, currentSelections: string[], abortControllerSignal: AbortSignal) => Promise<Option[]>)} allowedOptions
 * @property {string[]} selectedValues - Currently selected values that need labels resolved
 * @property {string} searchText - Current search query
 * @property {boolean} isOpen - Whether the dropdown is open (triggers search fetching)
 * @property {string} language - Language code for matching
 * @property {number} maxNumberOfPresentedOptions - Max options to fetch/display
 */

/**
 * @typedef {Object} UseAsyncOptionsResult
 * @property {OptionMatch[]} filteredOptions - Options to display (filtered/searched)
 * @property {{ [value: string]: Option }} resolvedOptionsLookup - Lookup for all resolved options (for labels)
 * @property {boolean} isLoading - Whether options are currently being fetched
 */

// @ts-ignore
const isPlaywright = typeof navigator !== "undefined" && navigator.webdriver === true;

/**
 * Hook that handles async option fetching, caching, and filtering.
 * - Resolves labels for selected values even when dropdown is closed
 * - Handles search/filtering when dropdown is open
 * - Supports both array-based (local filtering) and function-based (remote filtering)
 *
 * @param {UseAsyncOptionsParams} params
 * @returns {UseAsyncOptionsResult}
 */
export function useAsyncOptions({
  allowedOptions: allowedOptionsOriginal,
  selectedValues: selectedValuesOriginal,
  searchText,
  isOpen,
  language,
  maxNumberOfPresentedOptions,
}) {
  const [filteredOptions, setFilteredOptions] = useState(/** @type {OptionMatch[]} */ ([]));
  const [isLoading, setIsLoading] = useState(false);
  const [cacheVersion, setCacheVersion] = useState(0);
  const cachedOptions = useRef(/** @type {{ [value: string]: Option }} */ ({}));
  const abortControllerRef = useRef(/** @type {AbortController | null} */ (null));
  const debounceTimerRef = useRef(/** @type {ReturnType<typeof setTimeout> | null} */ (null));
  // Track if this is the first time isOpen became true (to skip debounce on first open)
  const wasOpenRef = useRef(false);

  const searchTextTrimmed = searchText.trim();
  const isFunction = typeof allowedOptionsOriginal === "function";
  // For functions: use the ref (stable); for arrays: deep-memoize
  const allowedOptions = useDeepMemo(allowedOptionsOriginal);
  // selectedValues is always an array, deep-memoize for stable reference
  const selectedValues = useDeepMemo(selectedValuesOriginal);

  const updateCachedOptions = useCallback(
    /** @param {Option[]} update */
    (update) => {
      let hasChanged = false;
      for (const item of update) {
        if (
          !cachedOptions.current[item.value] ||
          !isEqual(cachedOptions.current[item.value], item)
        ) {
          hasChanged = true;
          cachedOptions.current[item.value] = item;
        }
      }
      if (hasChanged) {
        setCacheVersion((v) => v + 1);
      }
    },
    [],
  );

  // useExhaustiveDependencies rule: cacheVersion is reliable way to figure out of cache changed
  // biome-ignore lint/correctness/useExhaustiveDependencies: explained above
  const resolvedOptionsLookup = useMemo(() => {
    if (Array.isArray(allowedOptions)) {
      return allowedOptions.reduce(
        (acc, o) => {
          acc[o.value] = o;
          return acc;
        },
        /** @type {{ [value: string]: Option }} */ ({}),
      );
    }
    return { ...cachedOptions.current };
  }, [allowedOptions, cacheVersion]);

  // useExhaustiveDependencies rule: cacheVersion is reliable way to figure out of cache changed
  // biome-ignore lint/correctness/useExhaustiveDependencies: explained above
  const unresolvedValues = useMemo(
    () => selectedValues.filter((v) => !resolvedOptionsLookup[v]),
    [selectedValues, cacheVersion],
  );

  // useExhaustiveDependencies rule is wrong here. fetch() should only be called
  // if there is a selected value with unknown label. Especially assume selected
  // values shows up in the parent combobox's text field, and that's why we need
  // to find the label for them.
  // biome-ignore lint/correctness/useExhaustiveDependencies: explained above
  useEffect(() => {
    if (!isFunction) return;
    if (unresolvedValues.length === 0) return;

    const fetchOptions = /**
     * @type {(
     *  queryOrValues: string[]
     *  | string, limit: number, currentSelections: string[], signal: AbortSignal
     * ) => Promise<Option[]>}
     */ (allowedOptions);
    const currentSelectedValues = selectedValues;
    const abortController = new AbortController();

    fetchOptions(
      unresolvedValues,
      unresolvedValues.length,
      currentSelectedValues,
      abortController.signal,
    )
      .then((results) => {
        if (abortController.signal.aborted) return;
        if (results?.length) {
          updateCachedOptions(results);
        }
        const stillUnresolved = unresolvedValues.filter(
          (v) => !results?.find((r) => r.value === v),
        );
        if (stillUnresolved.length > 0) {
          updateCachedOptions(stillUnresolved.map((v) => ({ label: v, value: v })));
        }
      })
      .catch((error) => {
        if (abortController.signal.aborted) return;
        console.error("Failed to resolve option labels:", error);
        updateCachedOptions(unresolvedValues.map((v) => ({ label: v, value: v })));
      });

    return () => abortController.abort();
  }, [
    // effect should only run when there is selected values with unknown labels
    unresolvedValues.length > 0, // selectValues doesn't need to be a dependency
    // this effect only applies to remote fetches, i.e. only when allowedOptions is a function.
    isFunction ? allowedOptions : null,
    updateCachedOptions,
  ]);

  // About useExhaustiveDependencies: selectedValues doesn't need to be dependency
  // as explained in the useEffect above. Furthermore you don't want to be
  // re-ordering the dropdown list when user is selecting things. Re-ordering can
  // be done the next time user opens up the dropdown.
  //
  // resolvedOptionsLookup doesn't need to be dependency because when allowedOptions is:
  // 1. array: then it is computed correctly and immediately. It's already tied
  // to allowedOptions, which is already a dependency.
  // 2. function: then resolvedOptionsLookup is not evn used and cachedOption.current
  // is used instead.
  // biome-ignore lint/correctness/useExhaustiveDependencies: explained above
  useEffect(() => {
    abortControllerRef.current?.abort();
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    if (!isOpen) {
      setFilteredOptions([]);
      setIsLoading(false);
      wasOpenRef.current = false;
      return;
    }

    // Track if this is the first time dropdown opened (to skip debounce)
    const isFirstOpen = !wasOpenRef.current;
    wasOpenRef.current = true;

    if (isFunction) {
      const fetchFn =
        /** @type {(queryOrValues: string[] | string, limit: number, currentSelections: string[], signal: AbortSignal) => Promise<Option[]>} */ (
          allowedOptions
        );
      const currentSelectedValues = selectedValues;
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // Lower debounce time for playwright to speed up tests
      let debounceTime = isPlaywright ? 5 : 250;
      // Skip debounce on first open
      if (isFirstOpen) debounceTime = 0;

      setIsLoading(true);

      const fetchOptions = async () => {
        try {
          const results = await fetchFn(
            searchTextTrimmed,
            maxNumberOfPresentedOptions,
            currentSelectedValues,
            abortController.signal,
          );

          if (abortController.signal.aborted) return;

          if (results?.length) {
            updateCachedOptions(results);
          }

          let updatedOptions = results || [];
          if (!searchTextTrimmed) {
            const unreturnedSelectedValues = currentSelectedValues
              .filter((v) => !results?.find((r) => r.value === v))
              .filter((v) => !cachedOptions.current[v])
              .map((v) => ({ label: v, value: v }));
            if (unreturnedSelectedValues.length > 0) {
              updateCachedOptions(unreturnedSelectedValues);
              updatedOptions = unreturnedSelectedValues.concat(results || []);
            }
          }

          const options = searchTextTrimmed
            ? updatedOptions
            : sortValuesToTop(updatedOptions, currentSelectedValues);

          setFilteredOptions(getMatchScore(searchTextTrimmed, options, language, false));
          setIsLoading(false);
        } catch (error) {
          if (abortController.signal.aborted) return;
          setIsLoading(false);
          throw error;
        }
      };

      if (debounceTime > 0) {
        debounceTimerRef.current = setTimeout(fetchOptions, debounceTime);
      } else {
        fetchOptions();
      }

      return () => {
        abortController.abort();
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
      };
      // biome-ignore lint/style/noUselessElse: I want it that way!
    } else {
      // Array-based options: filter locally
      const arrayOptions = /** @type {Option[]} */ (allowedOptions);
      const currentSelectedValues = selectedValues;
      const mergedOptions = currentSelectedValues
        .filter((v) => !resolvedOptionsLookup[v])
        .map((v) => ({ label: v, value: v }))
        .concat(arrayOptions);

      const options = searchText
        ? mergedOptions
        : sortValuesToTop(mergedOptions, currentSelectedValues);

      setFilteredOptions(getMatchScore(searchText, options, language, true));
    }
  }, [
    isOpen,
    searchTextTrimmed,
    searchText,
    language,
    unresolvedValues.length > 0, // selectValues doesn't need to be a dependency as explained above
    isFunction,
    allowedOptions,
    // resolvedOptionsLookup doesn't need to be dependency as explained above
    maxNumberOfPresentedOptions,
    updateCachedOptions,
  ]);

  return {
    filteredOptions,
    resolvedOptionsLookup,
    isLoading,
  };
}

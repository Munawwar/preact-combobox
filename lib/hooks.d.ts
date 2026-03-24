/**
 * Returns a ref that always holds the latest value.
 * Useful for accessing current values in effects without adding them to deps.
 * Similar to React's experimental useEffectEvent.
 * @template {any[] | ((...args: any[]) => any)} T
 * @param {T} value
 * @returns {T}
 */
/**
 * @param {any} value1
 * @param {any} value2
 * @returns {boolean}
 */
export function isEqual(value1: any, value2: any): boolean;
/**
 * Both dependencies and state are compared using a deep equality function.
 * @template T
 * @param {T} newState
 * @returns {T}
 */
export function useDeepMemo<T>(newState: T): T;
/**
 * @template T
 * @param {T} initialValue
 * @returns {[() => T, (value: T) => void, boolean]}
 */
export function useLive<T>(initialValue: T): [() => T, (value: T) => void, boolean];
/**
 * Subscribe to virtual keyboard visibility changes (touch devices only)
 * @param {Object} params - Parameters for subscribing to virtual keyboard
 * @param {function(boolean): void} [params.visibleCallback] - Called with boolean when keyboard visibility changes
 * @param {function(number, boolean): void} [params.heightCallback] - Called with keyboard height when keyboard height changes
 * @returns {function | null} - Unsubscribe function
 */
export function subscribeToVirtualKeyboard({ visibleCallback, heightCallback }: {
    visibleCallback?: ((arg0: boolean) => void) | undefined;
    heightCallback?: ((arg0: number, arg1: boolean) => void) | undefined;
}): Function | null;
/**
 * Hook that handles async option fetching, caching, and filtering.
 * - Resolves labels for selected values even when dropdown is closed
 * - Handles search/filtering when dropdown is open
 * - Supports both array-based (local filtering) and function-based (remote filtering)
 *
 * @param {UseAsyncOptionsParams} params
 * @returns {UseAsyncOptionsResult}
 */
export function useAsyncOptions({ allowedOptions: allowedOptionsOriginal, selectedValues: selectedValuesOriginal, searchText, isOpen, language, maxNumberOfPresentedOptions, }: UseAsyncOptionsParams): UseAsyncOptionsResult;
export type Option = import("./PreactCombobox.jsx").Option;
export type OptionMatch = import("./PreactCombobox.jsx").OptionMatch;
export type UseAsyncOptionsParams = {
    allowedOptions: Option[] | ((queryOrValues: string[] | string, limit: number, currentSelections: string[], abortControllerSignal: AbortSignal) => Promise<Option[]>);
    /**
     * - Currently selected values that need labels resolved
     */
    selectedValues: string[];
    /**
     * - Current search query
     */
    searchText: string;
    /**
     * - Whether the dropdown is open (triggers search fetching)
     */
    isOpen: boolean;
    /**
     * - Language code for matching
     */
    language: string;
    /**
     * - Max options to fetch/display
     */
    maxNumberOfPresentedOptions: number;
};
export type UseAsyncOptionsResult = {
    /**
     * - Options to display (filtered/searched)
     */
    filteredOptions: OptionMatch[];
    /**
     * - Lookup for all resolved options (for labels)
     */
    resolvedOptionsLookup: {
        [value: string]: Option;
    };
    /**
     * - Whether options are currently being fetched
     */
    isLoading: boolean;
};

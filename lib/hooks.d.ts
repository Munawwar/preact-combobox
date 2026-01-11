export function isEqual(value1: any, value2: any): any;
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

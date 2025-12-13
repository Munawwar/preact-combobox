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
 */
export function subscribeToVirtualKeyboard(params: {
  visibleCallback?: (isVisible: boolean) => void;
  heightCallback?: (height: number, isVisible: boolean) => void;
}): (() => void) | null;

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

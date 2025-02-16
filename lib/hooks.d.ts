export function isEqual(value1: any, value2: any): any;
/**
 * Both dependencies and state are compared using a deep equality function.
 * @template T
 * @param {() => T} getNewState
 * @param {any[]} dependencies
 * @returns {T}
 */
export function useDeepMemo<T>(getNewState: () => T, dependencies?: any[]): T;
/**
 * @template T
 * @param {T} initialValue
 * @returns {[() => T, (value: T) => void]}
 */
export function useLive<T>(initialValue: T): [() => T, (value: T) => void];

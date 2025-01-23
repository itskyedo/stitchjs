/**
 * Typeguard to check if a value is a number.
 *
 * @param value - The value to check.
 * @returns - `true` if the value is a number, `false` otherwise.
 */
export function isNumber(value: any): value is number {
  return typeof value === 'number';
}

/**
 * Checks if the value has a function signature.
 *
 * @param value - The value to check.
 * @returns - `true` if the value is a function, `false` otherwise.
 */
export function isFunction<T extends (...args: any[]) => any>(
  value: unknown,
): value is T {
  return typeof value === 'function';
}

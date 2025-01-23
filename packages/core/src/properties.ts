import { type Accessor, isAccessor } from './signal';

export type WithAccessor<T> = Accessor<T> | T;

export type UnwrapValue<T> =
  T extends Accessor<infer V> ? Exclude<T, Accessor<V>> | V : T;

export type UnwrapArray<T extends [any, ...any[]]> = {
  [Key in keyof T]: UnwrapValue<T[Key]>;
};

export type UnwrapObject<
  T extends Record<string, any>,
  P extends Partial<Record<keyof T, true>>,
> = {
  [Key in keyof P as Key extends keyof Required<T>
    ? P[Key] extends true
      ? Key
      : never
    : never]: Key extends keyof T ? UnwrapValue<T[Key]> : never;
};

/**
 * Gets the underlying value.
 *
 * @param value - The value to unwrap.
 * @returns - The passed in value or the underlying value if it is an accessor.
 */
export function unwrap<T>(value: T): UnwrapValue<T> {
  return (isAccessor(value) ? value() : value) as UnwrapValue<T>;
}

/**
 * Unwraps all values in an array.
 *
 * @param values - The values to unwrap.
 * @returns - An ordered array of unwrapped values.
 */
export function unwrapArray<T extends [any, ...any[]]>(
  ...values: T
): UnwrapArray<T> {
  const unwrapped: any[] = [];

  for (const value of values) {
    unwrapped.push(unwrap(value));
  }

  return unwrapped as UnwrapArray<T>;
}

/**
 * Unwraps the properties of an object.
 *
 * @param value - The object to unwrap.
 * @param properties - The properties of the object to unwrap.
 * @returns - The object with its values shallowly unwrapped.
 */
export function unwrapObject<
  T extends Record<string, any>,
  P extends Partial<Record<keyof T, true>>,
>(value: T, properties: P): UnwrapObject<T, P> {
  const newObject: Record<string, any> = {};

  for (const key of Object.keys(properties)) {
    if (properties[key] === true) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      newObject[key] = unwrap(value[key]);
    }
  }

  return newObject as UnwrapObject<T, P>;
}

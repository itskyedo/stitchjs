export interface Ref<T = any> {
  (value: T): void;
  current: T | undefined;
}

/**
 * Creates a ref.
 *
 * @returns - A ref.
 */
export function createRef<T>(): Ref<T> {
  const ref: Ref<T> = Object.assign(
    (value: T): void => {
      ref.current = value;
    },
    { current: undefined },
  );

  return ref;
}

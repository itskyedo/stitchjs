import { type Computation, isComputation } from './computation';
import { getCurrentScope } from './globals';
import { isFunction } from './utils/types';

export type Accessor<T> = () => T;

export type Setter<T> = (value: T | ((prev: T) => T)) => T;

export type Signal<T> = [Accessor<T>, Setter<T>];

export class PrivateSignal<T = any> {
  value: T;
  subscribers: Set<Computation>;

  constructor(value: T) {
    this.value = value;
    this.subscribers = new Set();
  }

  read(): T {
    const currentScope = getCurrentScope();
    if (isComputation(currentScope)) {
      this.subscribers.add(currentScope);
    }

    return this.value;
  }

  write(value: T | ((prev: T) => T)): T {
    const previousValue = this.value;
    const nextValue = isFunction(value) ? value(previousValue) : value;

    if (nextValue !== previousValue) {
      this.value = nextValue;
      for (const subscriber of this.subscribers.values()) {
        subscriber.run(true);
      }
    }

    return this.value;
  }
}

/**
 * Creates a signal.
 *
 * @param initialValue - The initial value.
 * @returns - The signal.
 */
export function createSignal<T>(initialValue: T): Signal<T> {
  const signal: PrivateSignal<T> = new PrivateSignal(initialValue);
  const accessor: Accessor<T> = () => signal.read();
  const setter: Setter<T> = (value) => signal.write(value);

  return [accessor, setter];
}

/**
 * Checks if the value is an accessor.
 *
 * @param accessor - The value to check.
 * @returns - `true` If the value is an accessor, `false` otherwise.
 */
export function isAccessor<T>(accessor: unknown): accessor is Accessor<T> {
  return isFunction(accessor) && accessor.length === 0;
}

/**
 * Checks if the value is a setter.
 *
 * @param setter - The value to check.
 * @returns - `true` If the value is a setter, `false` otherwise.
 */
export function isSetter<T>(setter: unknown): setter is Setter<T> {
  return isFunction(setter) && setter.length === 1;
}

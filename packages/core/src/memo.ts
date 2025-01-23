import { Computation, ComputationType } from './computation';
import { getCurrentScope, withScope } from './globals';
import { isInternalNode } from './node';
import { type Accessor, createSignal } from './signal';
import { untrack } from './untrack';

export interface MemoOptions<T> {
  isEqual: (prev: T, next: T) => boolean;
}

/**
 * Creates a reactive and memoized signal.
 *
 * @param fn - A function that returns a value.
 * @param initialValue - The initial value.
 * @param options - The options.
 * @returns - A signal.
 */
export function createMemo<T>(
  fn: (prev: T | undefined) => T,
  initialValue?: T,
  options?: MemoOptions<T>,
): Accessor<T> {
  const isEqual = options?.isEqual ?? ((prev, next) => prev === next);

  const currentScope = getCurrentScope();

  const computation = new Computation({
    type: ComputationType.Memo,
    callback: () => {
      const prev = untrack(value);
      const next = withScope(computation, () => fn(prev));
      if (!isEqual(prev, next)) {
        setValue(next);
      }
    },
    cleanups: [],
  });

  if (isInternalNode(currentScope)) {
    if (!currentScope.computations) {
      currentScope.computations = new Set();
    }

    currentScope.computations.add(computation);
  }

  const [value, setValue] = createSignal(
    withScope(computation, () => fn(initialValue)),
  );

  return value;
}

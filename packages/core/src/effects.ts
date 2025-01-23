import { Computation, ComputationType, isComputation } from './computation';
import { getCurrentScope } from './globals';
import { isInternalNode } from './node';
import { isUntrackedScope, untrack } from './untrack';

/**
 * Creates a reactive computation.
 *
 * @param fn - An effect that is run when its reactive dependencies change.
 */
export function createEffect(fn: () => void): void {
  const currentScope = getCurrentScope();
  if (isInternalNode(currentScope)) {
    if (!currentScope.computations) {
      currentScope.computations = new Set();
    }

    currentScope.computations.add(
      new Computation({
        type: ComputationType.Effect,
        callback: fn,
        cleanups: [],
      }),
    );
  } else {
    console.warn(
      "Effects created outside of a component's mount lifecycle are ignored.",
    );
  }
}

/**
 * Creates a reactive computation that is run instantly and before rendering.
 *
 * @param fn - An effect that is run instantly and before rendering.
 */
export function createComputed(fn: () => void): void {
  const currentScope = getCurrentScope();
  if (isInternalNode(currentScope)) {
    const computation = new Computation({
      type: ComputationType.Computed,
      callback: fn,
      cleanups: [],
    });

    if (!currentScope.computations) {
      currentScope.computations = new Set();
    }

    currentScope.computations.add(computation);
    computation.run();
  } else {
    console.warn(
      "Computed effects created outside of a component's mount lifecycle are ignored.",
    );
  }
}

/**
 * Creates an effect that is only run once on mount.
 *
 * @param fn - An effect that runs once on mount.
 */
export function onMount(fn: () => void): void {
  createEffect(() => untrack(fn));
}

/**
 * Creates an effect that runs once before the reactive scope is disposed.
 *
 * @param fn - An effect that runs once on cleanup.
 */
export function onCleanup(fn: () => void): void {
  let currentScope = getCurrentScope();
  if (isUntrackedScope(currentScope)) {
    currentScope = currentScope.value;
  }

  if (isComputation(currentScope)) {
    currentScope.cleanups.push(fn);
  } else if (isInternalNode(currentScope)) {
    if (!currentScope.computations) {
      currentScope.computations = new Set();
    }

    currentScope.computations.add(
      new Computation({
        type: ComputationType.Effect,
        callback: () => {},
        cleanups: [fn],
      }),
    );
  } else {
    console.warn(
      "Cleanups created outside of a component's mount lifecycle are ignored.",
    );
  }
}

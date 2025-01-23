import { type Scope, getCurrentScope, withScope } from './globals';

export class UntrackedScope {
  value: Scope;

  constructor(scope: Scope) {
    this.value = scope;
  }
}

/**
 * Runs logic that ignores its tracking scope and returns the value.
 *
 * @param fn - The logic to run.
 * @returns - The returned value from `fn`.
 */
export function untrack<T>(fn: () => T): T {
  return withScope(new UntrackedScope(getCurrentScope()), fn);
}

/**
 * Checks if the value is an untracked scope.
 *
 * @param scope - The value to check.
 * @returns - `true` if the value is an untrack scope, `false` otherwise.
 */
export function isUntrackedScope(scope: unknown): scope is UntrackedScope {
  return scope instanceof UntrackedScope;
}

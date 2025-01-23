import { withScope } from './globals';
import { type PrivateSignal } from './signal';
import { untrack } from './untrack';

export enum ComputationType {
  Effect,
  Computed,
  Memo,
}

export interface ComputationProps {
  type: ComputationType;
  callback: () => void;
  cleanups: (() => void)[];
}

export class Computation {
  type: ComputationType;
  callback: () => void;
  cleanups: (() => void)[];
  dependencies: Set<PrivateSignal>;

  constructor(props: ComputationProps) {
    this.type = props.type;
    this.callback = props.callback;
    this.cleanups = props.cleanups;
    this.dependencies = new Set();
  }

  run(cleanup?: boolean): void {
    withScope(this, () => {
      if (cleanup) {
        this.cleanup();
      }

      this.callback();
    });
  }

  cleanup(): void {
    withScope(this, () => {
      for (const fn of this.cleanups) {
        untrack(fn);
      }

      this.cleanups = [];
    });
  }

  detach(): void {
    for (const dependency of this.dependencies) {
      dependency.subscribers.delete(this);
    }

    this.callback = detachedCallback;
    this.cleanups = [];
    this.dependencies.clear();
  }
}

/**
 * Checks if a value is a computation.
 *
 * @param computation - The value to check.
 * @returns - `true` if the value is a computation, `false` otherwise.
 */
export function isComputation(
  computation: unknown,
): computation is Computation {
  return computation instanceof Computation;
}

const detachedCallback = (): void => {
  console.warn('Computation was not properly detached.');
};

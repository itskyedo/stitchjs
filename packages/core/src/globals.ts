import { type Computation } from './computation';
import { type InternalNode, type Node } from './node';
import { type Stitch } from './stitch';
import { type UntrackedScope } from './untrack';

export type Scope = UntrackedScope | InternalNode | Computation | null;

const nodesRegistry: WeakMap<NonNullable<Node>, InternalNode> = new WeakMap();
let currentStitch: Stitch | null = null;
let currentScope: Scope = null;

/**
 * Gets the currently mounting stitch instance.
 *
 * @returns - A stitch instance.
 * @throws - If there is no stitch instance being mounted.
 */
export function getStitch(): Stitch {
  if (!currentStitch)
    throw new Error('Invalid call outside of a mounting stitch instance.');
  return currentStitch;
}

/**
 * Runs logic within a stitch's scope and returns the result. The stitch scope
 * is reset back to the previous value at the end of the function's execution.
 *
 * @param stitch - The stitch instance.
 * @param fn - The logic to run.
 * @returns - The return value of `fn`.
 */
export function withStitch<T>(stitch: Stitch, fn: () => T): T {
  if (currentStitch && currentStitch !== stitch) {
    throw new Error('An existing stitch instance is already being mounted.');
  }

  const prevStitch = currentStitch;
  currentStitch = stitch;
  const value = fn();
  currentStitch = prevStitch;
  return value;
}

/**
 * Gets the internal node.
 *
 * @param node - The node.
 * @returns - The internal node or `undefined` if the node is not registered.
 */
export function getNode<T extends Node>(
  node: T,
): InternalNode | null | undefined {
  return node === null ? null : nodesRegistry.get(node);
}

/**
 * Registers a node and its internal counterpart.
 *
 * @param node - The node.
 * @param internalNode - The internal node.
 */
export function registerNode(node: Node, internalNode: InternalNode): void {
  if (node) {
    nodesRegistry.set(node, internalNode);
  }
}

/**
 * Gets the current scope.
 *
 * @returns - The current scope.
 */
export function getCurrentScope(): Scope {
  return currentScope;
}

/**
 * Runs logic within a scope and returns the result. The scope is reset back to
 * the previous value at the end of the function's execution.
 *
 * @param scope - The scope.
 * @param fn - The logic to run within the scope.
 * @returns - The returned value from `fn`.
 */
export function withScope<T>(scope: Scope, fn: () => T): T {
  const prevScope = currentScope;
  currentScope = scope;
  const value = fn();
  currentScope = prevScope;
  return value;
}

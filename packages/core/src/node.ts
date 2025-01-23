import { type Computation } from './computation';
import { type Element } from './elements';
import { registerNode } from './globals';

export type Node = (() => Node) | Element | null;

export abstract class InternalNode<
  T extends NonNullable<Node> = NonNullable<Node>,
> {
  ref: T;
  parent: InternalNode | null = null;
  children: InternalNode[] = [];
  computations: Set<Computation> | null = null;

  constructor(ref: T) {
    this.ref = ref;
    registerNode(ref, this);
  }

  detachChildren(): void {
    for (const child of this.children) {
      child.parent = null;
    }

    this.children = [];
  }

  setParent(parent: InternalNode | null): void {
    if (this === parent) {
      console.warn('Cannot set parent to itself.');
      return;
    }

    if (this.parent) {
      const index = this.parent.children.findIndex((n) => n === this);
      if (index !== -1) {
        this.parent.children.splice(index, 1);
      }
    }

    if (parent) {
      parent.children.push(this);
    }

    this.parent = parent;
  }

  find<T extends InternalNode>(
    predicate: (node: InternalNode) => node is T,
    inclusive?: boolean,
  ): T | undefined {
    if (inclusive && predicate(this)) {
      return this;
    }

    for (const child of this.children) {
      if (predicate(child)) {
        return child;
      }
    }

    for (const child of this.children) {
      const result = child.find(predicate);
      if (result) {
        return result;
      }
    }

    return undefined;
  }

  *getAllChildren(inclusive?: boolean): Generator<InternalNode, void> {
    yield* this.matchAll(isInternalNode, inclusive);
  }

  *matchUntil<T extends InternalNode>(
    predicate: (node: InternalNode) => node is T,
    inclusive?: boolean,
  ): Generator<T, void> {
    if (inclusive && predicate(this)) {
      yield this;
    } else {
      for (const child of this.children) {
        if (predicate(child)) {
          yield child;
        } else {
          yield* child.matchUntil(predicate);
        }
      }
    }
  }

  *matchAll<T extends InternalNode>(
    predicate: (node: InternalNode) => node is T,
    inclusive?: boolean,
  ): Generator<T, void> {
    if (inclusive && predicate(this)) {
      yield this;
    }

    for (const child of this.children) {
      yield* child.matchAll(predicate, true);
    }
  }
}

/**
 * Checks if a value is an internal node.
 *
 * @param node - The value to check.
 * @returns - `true` if the value is an internal node, `false` otherwise.
 */
export function isInternalNode(node: unknown): node is InternalNode {
  return node instanceof InternalNode;
}

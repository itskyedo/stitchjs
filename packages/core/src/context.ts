import { getCurrentScope } from './globals';
import { InternalNode, type Node, isInternalNode } from './node';

export interface ContextNodeProps<V, T extends Context<V>> {
  ref: () => Node;
  value: V;
  context: T;
}

export class ContextNode<
  V = any,
  T extends Context<V> = Context<V>,
> extends InternalNode<() => Node> {
  value: V;
  context: Context<V>;

  constructor(props: ContextNodeProps<V, T>) {
    super(props.ref);
    this.value = props.value;
    this.context = props.context;
  }
}

/**
 * Checks if a value is a context node.
 *
 * @param node - The value to check.
 * @returns - `true` if the value is a context node, `false` otherwise.
 */
export function isContextNode(node: unknown): node is ContextNode {
  return node instanceof ContextNode;
}

export interface ContextProviderProps<T> {
  value?: T;
  children?: [Node] | [];
}

export class Context<T = any> {
  defaultValue: T;

  constructor(defaultValue: T) {
    this.defaultValue = defaultValue;
  }

  Provider(props: ContextProviderProps<T>): () => Node {
    return new ContextNode({
      ref: () => props.children?.[0] ?? null,
      context: this,
      value: props.value,
    }).ref;
  }
}

export function createContext<T>(
  defaultValue?: undefined,
): Context<T | undefined>;
export function createContext<T>(defaultValue: T): Context<T>;
/**
 * Creates a context.
 *
 * @param defaultValue - The default value.
 * @returns - A context.
 */
export function createContext<T>(defaultValue?: T): Context<T | undefined> {
  return new Context(defaultValue);
}

/**
 * Gets the value of a context.
 *
 * @param context - The context.
 * @returns - The context's value.
 */
export function useContext<T>(context: Context<T>): T {
  return findContextNode(context)?.value ?? context.defaultValue;
}

/**
 * Finds the context node by traversing up the tree.
 *
 * @param context - The context to find.
 * @returns - The context node or `null` if not found.
 */
export function findContextNode<V>(
  context: Context<V>,
): ContextNode<V, Context<V>> | null {
  let node = getCurrentScope();
  while (isInternalNode(node)) {
    if (isContextNode(node) && node.context === context) {
      return node;
    }

    node = node.parent;
  }

  return null;
}

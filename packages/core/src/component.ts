import { InternalNode, type Node } from './node';

export class ComponentNode extends InternalNode<() => Node> {}

/**
 * Checks if a value is a component node.
 *
 * @param node - The value to check.
 * @returns - `true` if the value is a component node, `false` otherwise.
 */
export function isComponentNode(node: unknown): node is ComponentNode {
  return node instanceof ComponentNode;
}

/**
 * Creates a component.
 *
 * @param fn - The component function.
 * @returns - The component.
 */
export function createComponent<
  P extends Record<string, any> = Record<string, never>,
>(fn: (props: P) => Node): (props: P) => () => Node {
  return (props: P) => {
    const callback = () => fn(props);
    const node = new ComponentNode(callback);
    return node.ref;
  };
}

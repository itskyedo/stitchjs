import { createComputed } from './effects';
import { getCurrentScope, getStitch } from './globals';
import { createMemo } from './memo';
import { InternalNode, type Node } from './node';

export class DynamicNode extends InternalNode<() => Node> {
  contents: () => Node;

  constructor(ref: () => Node, contents: () => Node) {
    super(ref);
    this.contents = contents;
  }
}

/**
 * Checks if a value is a dynamic node.
 *
 * @param node - The value to check.
 * @returns - `true` if the value is a dynamic node, `false` otherwise.
 */
export function isDynamicNode(node: unknown): node is DynamicNode {
  return node instanceof DynamicNode;
}

export interface DynamicProps {
  contents: () => Node;
}

/**
 * Creates a node whose contents are dynamically generated.
 *
 * @param props - The props.
 * @returns - A dynamic node.
 */
export function Dynamic(props: DynamicProps): () => Node {
  const stitch = getStitch();

  return new DynamicNode(props.contents, () => {
    const node = getCurrentScope();
    if (!isDynamicNode(node)) {
      throw new Error('Unexpected scope.');
    }

    const contents = createMemo(props.contents);

    let initialResult: Node | undefined | null;
    let lastCallTime: number = -1;
    let rapidCallCount: number = 0;

    createComputed(() => {
      const mounted = typeof initialResult !== 'undefined';
      const result = contents();

      if (rapidCallCount >= 0) {
        const prevCallTime = lastCallTime;
        const callTime = performance.now();
        lastCallTime = callTime;
        if (callTime - prevCallTime < 30) rapidCallCount++;
        else rapidCallCount = 0;
        if (rapidCallCount >= 10) {
          console.warn(
            'A dynamic node is dependent on a signal that changes too frequently. Instead, use a memoized signal with a more constant value.',
          );
          rapidCallCount = -1;
        }
      }

      if (!mounted) {
        initialResult = result ?? null;
      }

      node.contents = () => result;

      if (mounted) {
        stitch.reparseNode(node);
      }
    });

    return initialResult ?? null;
  }).ref;
}

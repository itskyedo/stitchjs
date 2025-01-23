import { type Canvas, type Canvas2DContext } from './canvas';
import { Context, ContextNode, type ContextProviderProps } from './context';
import { getStitch } from './globals';
import { type Node } from './node';
import { type Accessor, type Setter } from './signal';

export class StitchContextNode<T extends Canvas = Canvas> extends ContextNode<
  StitchContextValue<T> | undefined,
  Context<StitchContextValue<T> | undefined>
> {}

export interface StitchContextValue<T extends Canvas = Canvas> {
  canvas: T;
  context: Canvas2DContext;
  pixelRatio: Accessor<number>;
  setPixelRatio: Setter<number>;
  get time(): number;
  get deltaTime(): number;
  frameId: Accessor<number>;
  setFrameId: (id: number, time: number) => number;
  render: () => void;
}

export class StitchContext<T extends Canvas = Canvas> extends Context<
  StitchContextValue<T> | undefined
> {
  constructor() {
    super(undefined);
  }

  override Provider(
    props: ContextProviderProps<StitchContextValue<T> | undefined>,
  ): () => Node {
    return new StitchContextNode({
      ref: () => props.children?.[0] ?? null,
      context: this,
      value: props.value,
    }).ref;
  }
}

/**
 * A hook for getting the current stitch context.
 *
 * @param validate - The function to validate the canvas type.
 * @returns - The current stitch context.
 */
export function useStitchContext<T extends Canvas>(
  validate: (canvas: Canvas) => canvas is T,
): StitchContextValue<T> | null {
  const stitch = getStitch();
  const root =
    stitch.root satisfies StitchContextNode | null as StitchContextNode<T>;
  if (!root.value || !validate(root.value.canvas)) {
    return null;
  }

  return root.value;
}

/**
 * Checks if a value is a stitch context node.
 *
 * @param node - The value to check.
 * @returns - `true` if the value is a stitch context node, `false` otherwise.
 */
export function isStitchContextNode(node: unknown): node is StitchContextNode {
  return node instanceof StitchContextNode;
}

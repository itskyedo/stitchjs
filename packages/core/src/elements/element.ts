import { type Rect, createLayoutParser } from '@stitchjs/layout';

import { type Canvas2DContext } from '../canvas';
import { createEffect, onMount } from '../effects';
import { getStitch, withScope } from '../globals';
import { InternalNode } from '../node';
import { unwrapObject } from '../properties';
import { type Stitch } from '../stitch';
import { untrack } from '../untrack';

import { type ElementProps } from './props';

export { type Rect };

export class ElementNode<T extends Element = Element> extends InternalNode<T> {}

export abstract class Element<P extends ElementProps = ElementProps> {
  props: P;
  outerRect: Readonly<Rect> = { x: 0, y: 0, width: 0, height: 0 };
  clientRect: Readonly<Rect> = { ...this.outerRect };
  contentRect: Readonly<Rect> = { ...this.clientRect };

  constructor(props: P) {
    this.props = props;
  }

  mount(): void {
    this.props.ref?.(this);
  }

  protected abstract render(context: Canvas2DContext): void;
}

/**
 * Creates an element.
 *
 * @param element - The element.
 * @returns - The element.
 */
export function createElement<T extends Element>(element: T): T {
  const node = new ElementNode(element);

  withScope(node, () => {
    let stitch: Stitch | null = null;
    onMount(() => {
      stitch = getStitch();
    });

    createEffect(() => {
      if (stitch) {
        unwrapObject(node.ref.props, {
          display: true,
          width: true,
          height: true,
          marginTop: true,
          marginRight: true,
          marginBottom: true,
          marginLeft: true,
          paddingTop: true,
          paddingRight: true,
          paddingBottom: true,
          paddingLeft: true,
        });

        stitch.layout();
      }
    });
  });

  return node.ref;
}

export const parseElementLayout = createLayoutParser<ElementNode>((target) =>
  untrack(() => ({
    children: target.matchUntil(isElementNode),
    props: unwrapObject(target.ref.props, {
      display: true,
      width: true,
      height: true,
      marginTop: true,
      marginRight: true,
      marginBottom: true,
      marginLeft: true,
      paddingTop: true,
      paddingRight: true,
      paddingBottom: true,
      paddingLeft: true,
    }),

    onLayout(target, rects) {
      target.ref.outerRect = rects.outerRect;
      target.ref.clientRect = rects.clientRect;
      target.ref.contentRect = rects.contentRect;
    },
  })),
);

/**
 * Checks if a value is an element node.
 *
 * @param node - The value to check.
 * @returns - `true` if the value is an element node, `false` otherwise.
 */
export function isElementNode(node: unknown): node is ElementNode {
  return node instanceof ElementNode;
}

/**
 * Checks if a value is an element.
 *
 * @param element - The value to check.
 * @returns - `true` if the value is an element, `false` otherwise.
 */
export function isElement(element: unknown): element is Element {
  return element instanceof Element;
}

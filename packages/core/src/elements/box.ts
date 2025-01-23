import { type Canvas2DContext } from '../canvas';
import { type Node } from '../node';
import { type WithAccessor, unwrap } from '../properties';
import { type Ref } from '../ref';

import { Element, createElement } from './element';
import { Display, type ElementProps, Inherit } from './props';

export interface BoxElementProps extends ElementProps {
  ref?: Ref<BoxElement> | null;
  fillStyle?: WithAccessor<string | null>;
  children?: Node[];
}

export class BoxElement extends Element<BoxElementProps> {
  constructor(props: BoxElementProps) {
    super({
      display: Display.block,
      ...props,
    });
  }

  protected override render(context: Canvas2DContext): void {
    const fillStyle = unwrap(this.props.fillStyle);

    if (fillStyle) {
      if (fillStyle !== Inherit) {
        context.fillStyle = fillStyle;
      }

      context.fillRect(
        this.clientRect.x,
        this.clientRect.y,
        this.clientRect.width,
        this.clientRect.height,
      );
    }
  }
}

/**
 * Creates a box element.
 *
 * @param props - The box element props.
 * @returns - A new box element.
 */
export function box(props: BoxElementProps): BoxElement {
  return createElement(new BoxElement(props));
}

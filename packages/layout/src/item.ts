import { type OnLayoutCallback } from './parser';
import { Display, type Fill, Intrinsic, type Percent } from './props';
import { LayoutRect } from './rect';

export interface LayoutItemProps<T> {
  target: T;
  children: LayoutItem<T>[];
  props: Partial<LayoutProps>;
  onLayout: OnLayoutCallback<T>;
}

export interface LayoutProps {
  display: Display;
  width: number | Intrinsic | Fill | Percent;
  height: number | Intrinsic | Fill | Percent;
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
}

export class LayoutItem<T> {
  readonly target: T;
  readonly outerRect: LayoutRect;
  readonly clientRect: LayoutRect;
  readonly contentRect: LayoutRect;

  props: LayoutProps;
  children: LayoutItem<T>[];
  onLayout: () => void;

  constructor(itemProps: LayoutItemProps<T>) {
    this.target = itemProps.target;
    this.children = itemProps.children;

    this.props = {
      display: itemProps.props.display ?? Display.inlineBlock,
      width: itemProps.props.width ?? Intrinsic,
      height: itemProps.props.height ?? Intrinsic,
      marginTop: Math.max(0, itemProps.props.marginTop ?? 0),
      marginRight: Math.max(0, itemProps.props.marginRight ?? 0),
      marginBottom: Math.max(0, itemProps.props.marginBottom ?? 0),
      marginLeft: Math.max(0, itemProps.props.marginLeft ?? 0),
      paddingTop: Math.max(0, itemProps.props.paddingTop ?? 0),
      paddingRight: Math.max(0, itemProps.props.paddingRight ?? 0),
      paddingBottom: Math.max(0, itemProps.props.paddingBottom ?? 0),
      paddingLeft: Math.max(0, itemProps.props.paddingLeft ?? 0),
    };

    this.outerRect = new LayoutRect();

    this.clientRect = new LayoutRect(this.outerRect, {
      top: this.props.marginTop,
      right: this.props.marginRight,
      bottom: this.props.marginBottom,
      left: this.props.marginLeft,
    });

    this.contentRect = new LayoutRect(this.clientRect, {
      top: this.props.paddingTop,
      right: this.props.paddingRight,
      bottom: this.props.paddingBottom,
      left: this.props.paddingLeft,
    });

    this.onLayout = () => {
      itemProps.onLayout(this.target, {
        outerRect: this.outerRect.toRect(),
        clientRect: this.clientRect.toRect(),
        contentRect: this.contentRect.toRect(),
      });
    };
  }
}

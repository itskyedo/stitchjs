import { LayoutItem, type LayoutProps } from './item';
import { Display, Fill, Intrinsic, parseUnit } from './props';
import { type Rect } from './rect';
import { RowsReducer } from './rows';

export type LayoutParser<T> = (target: T) => void;

export interface ParseProps<T> {
  children: T[] | Generator<T>;
  props: Partial<LayoutProps>;
  onLayout: OnLayoutCallback<T>;
}

export type OnLayoutCallback<T> = (
  target: T,
  bounds: {
    outerRect: Rect;
    clientRect: Rect;
    contentRect: Rect;
  },
) => void;

/**
 * Creates a layout parser.
 *
 * @param fn - The parser function.
 * @returns - A layout parser.
 */
export function createLayoutParser<T>(
  fn: (target: T) => ParseProps<T>,
): LayoutParser<T> {
  function constructGraph(target: T): LayoutItem<T> {
    const parseProps = fn(target);
    const children: LayoutItem<T>[] = [];
    for (const child of parseProps.children) {
      children.push(constructGraph(child));
    }

    return new LayoutItem({
      target,
      children,
      props: parseProps.props,
      onLayout: parseProps.onLayout,
    });
  }

  return (target: T): void => {
    parse(constructGraph(target), null, null);
  };
}

/**
 * Recursively parses the layout for an item.
 *
 * @param item - The layout item.
 * @param container - The layout item's container.
 * @param overrides - Overrides the item's initial rect.
 */
export function parse<T>(
  item: LayoutItem<T>,
  container?: LayoutItem<T> | null,
  overrides?: Partial<Rect> | null,
): void {
  const rowsReducer: RowsReducer<T> = new RowsReducer();

  item.outerRect.set({
    x: parseUnit(null, null, overrides?.x),
    y: parseUnit(null, null, overrides?.y),
    width: parseUnit(
      item.props.width,
      container?.contentRect.width,
      overrides?.width,
    ),
    height: parseUnit(
      item.props.height,
      container?.contentRect.height,
      overrides?.height,
    ),
  });

  for (const child of item.children) {
    if (!rowsReducer.lastRow || child.props.display === Display.block) {
      parse(child, item, {
        x: item.contentRect.x,
        y: rowsReducer.lastRow?.y2 ?? item.contentRect.y,
      });

      rowsReducer.addRow(child);
    } else {
      let willOverflow: boolean;
      const lastRow = rowsReducer.lastRow;
      const isPrevABlock = lastRow.commonProps.display === Display.block;
      const doesChildWidthFill = child.props.width === Fill;
      if (isPrevABlock) {
        willOverflow = true;
      } else if (doesChildWidthFill) {
        parse(child, item, {
          x: rowsReducer.lastRow.x2,
          y: rowsReducer.lastRow.y1,
        });

        willOverflow = false;
      } else {
        const checkWithinBounds = () =>
          lastRow.x2 + child.outerRect.width > item.contentRect.x2;
        if (checkWithinBounds()) {
          willOverflow = true;
        } else {
          parse(child, item, {
            x: rowsReducer.lastRow.x2,
            y: rowsReducer.lastRow.y1,
          });

          willOverflow = checkWithinBounds();
        }
      }

      if (willOverflow) {
        parse(child, item, {
          x: item.contentRect.x,
          y: rowsReducer.lastRow.y2,
        });

        rowsReducer.addRow(child);
      } else {
        rowsReducer.addItem(child);
      }
    }
  }

  const hasIntrinsicWidth =
    typeof overrides?.width === 'undefined' && item.props.width === Intrinsic;
  const hasIntrinsicHeight =
    typeof overrides?.height === 'undefined' && item.props.height === Intrinsic;
  if (hasIntrinsicWidth)
    item.contentRect.width = rowsReducer.x2 - item.contentRect.x;
  if (hasIntrinsicHeight)
    item.contentRect.height = rowsReducer.y2 - item.contentRect.y;

  let nextX: number = item.contentRect.x;
  let nextY: number = item.contentRect.y;
  let offsetY: number = 0;

  for (const row of rowsReducer.rows) {
    offsetY = nextY - row.y1;
    nextX = row.x1;

    for (const rowItem of row.items) {
      const asContainer =
        rowItem.props.display === Display.block ||
        (rowItem.props.display === Display.inlineBlock &&
          row.items.length === 1);

      let width: number = rowItem.outerRect.width;
      if (rowItem.props.width === Fill) {
        width = asContainer
          ? Math.max(0, item.contentRect.x2 - row.x1)
          : Math.max(0, item.contentRect.x2 - row.x2) /
            (row.horizontalSplitCount || 1);
      }

      let height: number = rowItem.outerRect.height;
      if (rowItem.props.height === Fill) {
        const contentY2 = rowsReducer.lastRow?.y2 ?? item.contentRect.y1;
        height =
          asContainer ||
          (row.commonProps.display === Display.inlineBlock &&
            row.commonProps.height === Fill)
            ? Math.max(0, item.contentRect.y2 - contentY2) /
              (rowsReducer.verticalSplitCount || 1)
            : Math.max(0, row.y2 - rowItem.outerRect.y1);
      }

      parse(rowItem, item, {
        x: nextX,
        y: rowItem.outerRect.y + offsetY,
        width,
        height,
      });

      nextX = Math.max(nextX, rowItem.outerRect.x2);
      nextY = Math.max(nextY, rowItem.outerRect.y2);
    }
  }

  item.onLayout();
}

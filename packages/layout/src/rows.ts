import { LayoutBBox } from './bbox';
import { type LayoutItem, type LayoutProps } from './item';
import { Display, Fill } from './props';

export class Row<T> {
  get x1(): number {
    return this._bbox.x1;
  }

  get y1(): number {
    return this._bbox.y1;
  }

  get x2(): number {
    return this._bbox.x2;
  }

  get y2(): number {
    return this._bbox.y2;
  }

  get items() {
    return this._items;
  }

  get commonProps() {
    return this._commonProps;
  }

  get horizontalSplitCount() {
    return this._horizontalSplitCount;
  }

  protected _bbox: LayoutBBox = new LayoutBBox();
  protected _items: LayoutItem<T>[] = [];
  protected _commonProps: RowCommonProps = {};
  protected _horizontalSplitCount: number = 0;

  constructor(initial?: LayoutItem<T>[]) {
    if (initial) {
      for (const item of initial) {
        this.add(item);
      }
    }
  }

  add(item: LayoutItem<T>): void {
    const props = {
      display: item.props.display,
      width: item.props.width,
      height: item.props.height,
    };

    this._bbox.join(item.outerRect);

    if (this._items.length === 0) this._commonProps = props;
    else this.updateCommonProps(item);

    if (item.props.width === Fill) {
      this._horizontalSplitCount += 1;
    }

    this._items.push(item);
  }

  protected updateCommonProps(item: LayoutItem<T>): void {
    const c = this._commonProps;
    const n = item.props;
    if (n.display !== c.display && c.display !== undefined)
      c.display = undefined;
    if (n.width !== c.width && c.width !== undefined) c.width = undefined;
    if (n.height !== c.height && c.height !== undefined) c.height = undefined;
  }
}

export type RowCommonProps = Partial<
  Pick<LayoutProps, 'display' | 'width' | 'height'>
>;

export class RowsReducer<T> {
  get rows(): readonly Row<T>[] {
    return this._rows;
  }

  get lastRow(): Row<T> | undefined {
    return this.rows.at(-1);
  }

  get lastItem(): LayoutItem<T> | undefined {
    return this.lastRow?.items.at(-1);
  }

  get verticalSplitCount(): number {
    return this._verticalSplitCount;
  }

  get x1(): number {
    return this._bbox.x1;
  }

  get y1(): number {
    return this._bbox.y1;
  }

  get x2(): number {
    return this._bbox.x2;
  }

  get y2(): number {
    return this._bbox.y2;
  }

  protected _rows: Row<T>[] = [];
  protected _verticalSplitCount: number = 0;
  protected _conditionalDivisor: boolean = false;
  protected _bbox: LayoutBBox = new LayoutBBox();

  addRow(initial: LayoutItem<T>) {
    const row = new Row([initial]);
    this._rows.push(row);
    this._bbox.join(row);

    if (initial.props.height === Fill) {
      if (initial.props.display === Display.block) {
        this._verticalSplitCount++;
      } else if (initial.props.display === Display.inlineBlock) {
        this._conditionalDivisor = true;
        this._verticalSplitCount++;
      }
    }
  }

  addItem(item: LayoutItem<T>) {
    if (this.lastRow) {
      this.lastRow.add(item);
      this._bbox.join(this.lastRow);

      if (this._conditionalDivisor) {
        this._conditionalDivisor = false;
        this._verticalSplitCount = Math.max(0, this._verticalSplitCount - 1);
      }
    } else {
      this.addRow(item);
    }
  }
}

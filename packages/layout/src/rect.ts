export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RectOffsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export class LayoutRect {
  get x(): number {
    return this._rect.x + this._offsets.left;
  }

  set x(value: number) {
    this._rect.x = value + this._offsets.left;
  }

  get y(): number {
    return this._rect.y + this._offsets.top;
  }

  set y(value: number) {
    this._rect.y = value + this._offsets.top;
  }

  get width(): number {
    return Math.max(
      0,
      this._rect.width - this._offsets.left - this._offsets.right,
    );
  }

  set width(value: number) {
    this._rect.width = Math.max(
      0,
      value + this._offsets.left + this._offsets.right,
    );
  }

  get height(): number {
    return Math.max(
      0,
      this._rect.height - this._offsets.top - this._offsets.bottom,
    );
  }

  set height(value: number) {
    this._rect.height = Math.max(
      0,
      value + this._offsets.top + this._offsets.bottom,
    );
  }

  get x1(): number {
    return this.x;
  }

  get y1(): number {
    return this.y;
  }

  get x2(): number {
    return this.x + this.width;
  }

  get y2(): number {
    return this.y + this.height;
  }

  protected _rect: Rect;
  protected _offsets: RectOffsets;

  constructor(base?: LayoutRect, offsets?: RectOffsets) {
    this._rect = base ?? { x: 0, y: 0, width: 0, height: 0 };
    this._offsets = offsets ?? { top: 0, right: 0, bottom: 0, left: 0 };
  }

  set(rect: Rect): void {
    this.x = rect.x;
    this.y = rect.y;
    this.width = rect.width;
    this.height = rect.height;
  }

  toRect(): Rect {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }
}

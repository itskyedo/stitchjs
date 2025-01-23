export interface BBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export class LayoutBBox {
  x1: number = 0;
  y1: number = 0;
  x2: number = 0;
  y2: number = 0;
  initial: boolean = true;

  join(bbox: BBox): void {
    if (this.initial) {
      this.initial = false;
      this.x1 = bbox.x1;
      this.y1 = bbox.y1;
      this.x2 = bbox.x2;
      this.y2 = bbox.y2;
    } else {
      this.x1 = Math.min(this.x1, this.x2, bbox.x1);
      this.y1 = Math.min(this.y1, this.y2, bbox.y1);
      this.x2 = Math.max(this.x1, this.x2, bbox.x2);
      this.y2 = Math.max(this.y1, this.y2, bbox.y2);
    }
  }
}

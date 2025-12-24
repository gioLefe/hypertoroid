import { createBoundingBox } from "../helpers";
import { BoundingBox } from "./bbox";
import { GameCycle } from "./game-cycle";
import { Size2 } from "./size";
import { Vec2 } from "./vec";

export abstract class BaseObject implements GameCycle {
  _x: number = 0;
  _y: number = 0;
  width: number = 0;
  height: number = 0;
  canvas: HTMLCanvasElement | null = null;
  bbox: BoundingBox<number> = {
    nw: { x: 0, y: 0 },
    se: { x: 0, y: 0 },
  };
  elements: BaseObject[] = [];

  constructor() {}

  async init(..._args: any): Promise<any> {}
  update(_deltaTime: number, ..._args: any): any {}
  render(..._args: any) {}
  clean(..._args: any) {}

  set x(v: number) {
    this._x = v;
    this.calcBBox();
  }
  get x(): number {
    return this._x;
  }
  set y(v: number) {
    this._y = v;
    this.calcBBox();
  }
  get y(): number {
    return this._y;
  }

  getPosition(): Vec2<number> {
    return { x: this._x, y: this.y };
  }
  getBBox = (): BoundingBox<number> | undefined => {
    return this.bbox;
  };
  calcBBox() {
    this.bbox = createBoundingBox(this.x, this.y, this.width, this.height);
  }
  getSize(): Size2 | undefined {
    return undefined;
  }
  getWidth(): number {
    return this.width;
  }
  setWidth(width: number) {
    this.width = width;
    this.bbox = createBoundingBox(this._x, this.y, this.width, this.height);
  }
  getHeight(): number {
    return this.height;
  }
  setHeight(height: number) {
    this.height = height;
    this.bbox = createBoundingBox(this._x, this.y, this.width, this.height);
  }
}
export class BaseObjectClass extends BaseObject {}

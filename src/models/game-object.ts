import { Vec2 } from "./vec";
import { BoundingBox } from "./bbox";
import { GameCycle } from "./game-cycle";
import { GraphicContext } from "./graphic-context";

export abstract class GameObject<T = GraphicContext> implements GameCycle {
  id?: string;
  ctx: T;
  protected width: number = 64;
  protected height: number = 64;
  protected position: Vec2<number> = { x: 0, y: 0 };
  protected bbox: BoundingBox<number> = {
    nw: { x: 0, y: 0 },
    se: { x: 0, y: 0 },
  };
  protected direction: number = 0;

  constructor(ctx: T) {
    this.ctx = ctx;
  }

  async init(..._args: any) {}
  async update(_deltaTime: number, ..._args: any) {}
  render(..._args: any) {}
  clean(..._args: any) {}

  setPosition(value: Vec2<number>): void {
    this.position = value;
  }
  getPosition(): Vec2<number> {
    return this.position;
  }

  getSize(): Vec2<number> | undefined {
    return undefined;
  }

  getDirection(): number {
    return this.direction;
  }
  setDirection(value: number): void {
    this.direction = value;
  }

  getWidth(): number {
    return this.width;
  }
  setWidth(width: number) {
    this.width = width;
  }
  getHeight(): number {
    return this.height;
  }
  setHeight(height: number) {
    this.height = height;
  }
}

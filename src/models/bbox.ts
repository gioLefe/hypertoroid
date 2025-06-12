import { Vec2 } from "./vec";

export type BoundingBox<T> = {
  nw: Vec2<T>;
  se: Vec2<T>;
};

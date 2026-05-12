import { BoundingBox, Vec2 } from "../models";

export function isPointInAlignedBBox(
  point: Vec2<number>,
  bbox: BoundingBox<number>,
) {
  return (
    point.x >= bbox.nw.x &&
    point.x <= bbox.se.x &&
    point.y >= bbox.nw.y &&
    point.y <= bbox.se.y
  );
}

export function isPointInBounds(
  x: number,
  y: number,
  nwX: number,
  nwY: number,
  seX: number,
  seY: number,
) {
  return x >= nwX && x < seX && y >= nwY && y < seY;
}

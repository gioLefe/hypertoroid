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

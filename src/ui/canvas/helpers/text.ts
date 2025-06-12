import { Vec2, BoundingBox } from "../../../models";

export function getTextBBox(
  ctx: CanvasRenderingContext2D,
  text: string,
  position: Vec2<number>,
): BoundingBox<number> {
  // Measure the text
  const metrics: TextMetrics = ctx.measureText(text);

  // Calculate the bounding box coordinates
  const nw: Vec2<number> = {
    x: position.x + metrics.actualBoundingBoxLeft,
    y: position.y - metrics.actualBoundingBoxAscent,
  };
  const se: Vec2<number> = {
    x: position.x + metrics.actualBoundingBoxRight,
    y: position.y - metrics.actualBoundingBoxDescent,
  };

  return { nw, se };
}

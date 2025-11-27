import { BoundingBox, Vec2 } from "../../../models";

export function getTextBBox(
  ctx: CanvasRenderingContext2D,
  text: string,
  position: Vec2<number>
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

export function getWrappedTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  var words = text.split(" ");
  var lines = [];
  var currentLine = words[0];

  for (var i = 1; i < words.length; i++) {
    var word = words[i];
    var width = ctx.measureText(currentLine + " " + word).width;
    if (width < maxWidth) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

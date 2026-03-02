export type Color = {
  r: number;
  g: number;
  b: number;
  a: number;
};

export const RED: Color = { r: 255, g: 0, b: 0, a: 255 };
export const GREEN: Color = { r: 0, g: 255, b: 0, a: 255 };
export const BLUE: Color = { r: 0, g: 0, b: 255, a: 255 };
export const YELLOW: Color = { r: 255, g: 255, b: 0, a: 255 };

export function isSameColor(color: Color, colorToCompare: Color): boolean {
  return (
    color.r === colorToCompare.r &&
    color.g === colorToCompare.g &&
    color.b === colorToCompare.b &&
    color.a === colorToCompare.a
  );
}

export function colorToString(color: Color) {
  return `rgba(${color.r},${color.g},${color.b},${color.a})`;
}

export function getCtxPixelColor(
  x: number,
  y: number,
  ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
): Color {
  const data = ctx.getImageData(x, y, 1, 1).data;
  let pixelColorCache: Color = { r: 0, g: 0, b: 0, a: 0 };
  pixelColorCache.r = data[0];
  pixelColorCache.g = data[1];
  pixelColorCache.b = data[2];
  pixelColorCache.a = data[3];
  return pixelColorCache;
}

export function getImageBufferColorAt(
  x: number,
  y: number,
  width: number,
  data: Uint8ClampedArray,
): Color {
  const offset = x * 4 + y * width * 4;
  return {
    r: data[offset],
    g: data[offset + 1],
    b: data[offset + 2],
    a: data[offset + 3],
  };
}

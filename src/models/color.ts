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


const pixelColorCache: Color = { r: 0, g: 0, b: 0, a: 0 };
export function getCtxPixelColor(
  x: number,
  y: number,
  ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D
): Color {
  const data = ctx.getImageData(x, y, 1, 1).data;
  pixelColorCache.r = data[0];
  pixelColorCache.g = data[1];
  pixelColorCache.b = data[2];
  pixelColorCache.a = data[3];
  return pixelColorCache;
}

export function colorize(
  image: HTMLImageElement,
  r: number,
  g: number,
  b: number
) {
  const imageSize = image.width;

  const offscreen = new OffscreenCanvas(imageSize, imageSize);
  const ctx = offscreen.getContext("2d")!;

  ctx.drawImage(image, 0, 0);

  const imageData = ctx.getImageData(0, 0, imageSize, imageSize);

  for (let i = 0; i < imageData.data.length; i += 4) {
    imageData.data[i + 0] *= r;
    imageData.data[i + 1] *= g;
    imageData.data[i + 2] *= b;
  }

  ctx.putImageData(imageData, 0, 0);

  return offscreen;
}

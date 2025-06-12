export function drawRotated(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  img: HTMLImageElement,
  degrees: number,
) {
  ctx.clearRect(0, 0, canvasW, canvasH);

  // save the unrotated ctx of the canvas so we can restore it later
  // the alternative is to untranslate & unrotate after drawing
  ctx.save();

  // move to the center of the canvas
  ctx.translate(canvasW / 2, canvasH / 2);

  // rotate the canvas to the specified degrees
  ctx.rotate((degrees * Math.PI) / 180);

  // draw the image
  // since the ctx is rotated, the image will be rotated also
  ctx.drawImage(img, -img.width / 2, -img.width / 2);

  // we’re done with the rotating so restore the unrotated ctx
  ctx.restore();
}

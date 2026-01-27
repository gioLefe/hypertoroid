import { Color } from "../models";

export type HitboxColor = Color & {
  a: 255; // Ensure fully opaque for hitbox rendering
};

export class ColorHeap {
  private freedColors: HitboxColor[] = [];
  // private nextColor: HitBoxColor = { r: 1, g: 0, b: 0, a: 255 };
  private nextColor: HitboxColor = { r: 255, g: 255, b: 255, a: 255 };

  getNext(): HitboxColor {
    let color = this.freedColors.shift();
    if (color !== undefined) {
      return color;
    }
    color = { ...this.nextColor };

    // Increment color for next allocation
    this.nextColor.r -= 1;
    if (this.nextColor.r < 0) {
      this.nextColor.r = 255;
      this.nextColor.g -= 1;
      if (this.nextColor.g < 0) {
        this.nextColor.g = 255;
        this.nextColor.b -= 1;
        if (this.nextColor.b < 0) {
          throw new Error("Ran out of unique colors");
        }
      }
    }
    return color;
  }
}

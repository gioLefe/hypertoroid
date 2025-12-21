import { HitBoxColor } from "../core";

export class ColorHeap {
  private freedColors: HitBoxColor[] = [];
  private nextColor: HitBoxColor = { r: 1, g: 0, b: 0, a: 255 };

  getNext(): HitBoxColor {
    let color = this.freedColors.shift();
    if (color !== undefined) {
      return color;
    }
    color = { ...this.nextColor };
    
    // Increment color for next allocation
    this.nextColor.r += 1;
    if (this.nextColor.r > 255) {
      this.nextColor.r = 0;
      this.nextColor.g += 1;
      if (this.nextColor.g > 255) {
        this.nextColor.g = 0;
        this.nextColor.b += 1;
        if (this.nextColor.b > 255) {
          throw new Error("Ran out of unique colors");
        }
      }
    }
    return color;
  }
}

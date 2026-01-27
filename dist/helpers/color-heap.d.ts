import { Color } from "../models";
export type HitboxColor = Color & {
    a: 255;
};
export declare class ColorHeap {
    private freedColors;
    private nextColor;
    getNext(): HitboxColor;
}
//# sourceMappingURL=color-heap.d.ts.map
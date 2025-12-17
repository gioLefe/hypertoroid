export type Color = {
    r: number;
    g: number;
    b: number;
    a: number;
};
export declare const RED: Color;
export declare const GREEN: Color;
export declare const BLUE: Color;
export declare const YELLOW: Color;
export declare function isSameColor(color: Color, colorToCompare: Color): boolean;
export declare function colorToString(color: Color): string;
export declare function getCtxPixelColor(x: number, y: number, ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D): Color;
export declare function colorize(image: HTMLImageElement, r: number, g: number, b: number): OffscreenCanvas;
//# sourceMappingURL=color.d.ts.map
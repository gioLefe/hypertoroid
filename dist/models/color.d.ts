export type Color = {
    r: number;
    g: number;
    b: number;
    a: number;
};
export declare const CORNER_TILE_COLORS: {
    RED: Color;
    GREEN: Color;
    BLUE: Color;
    YELLOW: Color;
};
export declare function isSameColor(color: Color, colorToCompare: Color): boolean;
export declare function colorToString(color: Color): string;
export declare function getCtxPixelColor(x: number, y: number, ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D): Color;
export declare function getImageBufferColorAt(x: number, y: number, width: number, data: Uint8ClampedArray): Color;
//# sourceMappingURL=color.d.ts.map
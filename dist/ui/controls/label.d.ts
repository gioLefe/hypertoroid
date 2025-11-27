import { GameObject, Vec2, BoundingBox } from "../../models";
import { FillStrokeStyle } from "../canvas";
export declare class UILabel extends GameObject<CanvasRenderingContext2D> {
    id: string | undefined;
    protected text: string;
    private readonly DEFAULT_TEXT_STYLE;
    protected textStyle: CanvasTextDrawingStyles;
    protected textFillStyle: FillStrokeStyle | undefined;
    protected textStrokeStyle: FillStrokeStyle | undefined;
    constructor(ctx: CanvasRenderingContext2D, id: string, posX?: number, posY?: number, textStyle?: Partial<CanvasTextDrawingStyles>, text?: string);
    init(...args: any): Promise<void>;
    update(deltaTime: number, ...args: any): Promise<void>;
    render(...args: any): void;
    clean(...args: any): void;
    setText(text: string): void;
    getSize(): Vec2<number> | undefined;
    getBBox(): BoundingBox<number>;
    setTextFillStyle(style: FillStrokeStyle): void;
    setTextStrokeStyle(style: FillStrokeStyle): void;
    setTextStyle(textStyle: CanvasTextDrawingStyles): void;
    protected applyStyles(): void;
}

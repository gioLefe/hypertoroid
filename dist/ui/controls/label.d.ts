import { BaseObject, BoundingBox, Size2 } from "../../models";
import { FillStrokeStyle } from "../canvas";
export declare class UILabel extends BaseObject {
    id: string | undefined;
    protected ctx: CanvasRenderingContext2D | undefined;
    protected text: string | undefined;
    protected textStyle: Partial<CanvasTextDrawingStyles> | undefined;
    protected textFillStyle: FillStrokeStyle;
    protected textStrokeStyle: FillStrokeStyle;
    constructor();
    init(): Promise<void>;
    update(): Promise<void>;
    render(): void;
    clean(): void;
    setText(text: string): void;
    getSize(): Size2 | undefined;
    getBBox: () => BoundingBox<number> | undefined;
    calcBBox(): void;
    setTextFillStyle(style: FillStrokeStyle): void;
    setTextStrokeStyle(style: FillStrokeStyle): void;
    setTextStyle(textStyle: CanvasTextDrawingStyles): void;
    protected applyStyles(): void;
}
//# sourceMappingURL=label.d.ts.map
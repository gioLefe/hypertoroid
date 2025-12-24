import { GameObject, Vec2 } from "../../models";
import { FillStrokeStyle } from "../canvas";
export type TreeItem = {
    id: string;
    text: string;
    nodes?: TreeItem[];
};
export declare class UIPanel extends GameObject<CanvasRenderingContext2D> {
    pos: Vec2<number>;
    fillStyle: FillStrokeStyle | undefined;
    strokeStyle: FillStrokeStyle | undefined;
    textStyle: CanvasTextDrawingStyles | undefined;
    protected width: number;
    protected height: number;
    private items;
    private allItemsHeight;
    private heightGap;
    constructor(ctx: CanvasRenderingContext2D);
    init(...args: any): Promise<void>;
    update(deltaTime: number, ...args: any): void;
    clean(...args: any): void;
    render(...args: any): void;
    addPanelItem(gameObject: GameObject): void;
    getPanelItem(id: string): GameObject | undefined;
    setHeightGap(value: number): void;
    setFillStyle(value: FillStrokeStyle): void;
    setStrokeStyle(value: FillStrokeStyle): void;
    private calcContentHeight;
}
//# sourceMappingURL=panel.d.ts.map
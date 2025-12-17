import { BaseObject, Color, GameCycle } from "../../models";
declare class ButtonBaseClass extends BaseObject {
}
declare const ButtonBase_base: typeof ButtonBaseClass & import("../../models").AnonymousClass<import("../../mixins").WithEventHandling>;
declare class ButtonBase extends ButtonBase_base {
}
export declare class UIButton extends ButtonBase implements GameCycle {
    protected ctx: CanvasRenderingContext2D;
    backgroundColor: Color;
    hoverColor: Color;
    textColor: Color;
    activeColor: Color;
    isHovering: boolean;
    layer: number;
    hitBoxKey: string;
    constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D);
    init(hitBoxId?: string, layer?: number): Promise<void>;
    update(_deltaTime: number): Promise<void>;
    clean(..._args: any): void;
    render(): void;
    getBBox: () => import("../../models").BoundingBox<number>;
    mouseMove: (ev: MouseEvent) => void;
    mouseOut: (_ev: MouseEvent) => void;
}
export {};
//# sourceMappingURL=button.d.ts.map
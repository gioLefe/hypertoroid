import { InteractionManager } from "../../core";
import { BaseObject, Color } from "../../models";
export declare class UIButton extends BaseObject {
    protected interactionManager: InteractionManager;
    protected ctx: CanvasRenderingContext2D;
    backgroundColor: Color;
    hoverColor: Color;
    textColor: Color;
    activeColor: Color;
    isHovering: boolean;
    layer: number;
    hitBoxId: string;
    constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, hitBoxId: string);
    init(layer?: number): Promise<void>;
    update(_deltaTime: number): Promise<void>;
    clean(..._args: any): void;
    render(): void;
    getBBox: () => import("../../models").BoundingBox<number>;
    mouseMove: (ev: MouseEvent) => void;
    mouseOut: (_ev: MouseEvent) => void;
}
//# sourceMappingURL=button.d.ts.map
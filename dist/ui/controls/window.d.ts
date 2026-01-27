import { ECS } from "../../core";
import { DraggableObject } from "../../mixins";
export declare const HEADER_HEIGHT = 30;
export declare class UIWindow extends DraggableObject {
    protected ctx: CanvasRenderingContext2D;
    protected backgroundcolor: string;
    protected borderColor: string;
    protected borderWidth: number;
    protected textColor: string;
    protected title: string;
    constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, ecs: ECS);
    init(_deltaTime: number, ..._args: []): Promise<any>;
    update(_deltaTime: number): any;
    render(): void;
    clean(): void;
    private renderWindowHeader;
}
//# sourceMappingURL=window.d.ts.map
import { ColorHeap } from "../helpers";
import { ECS, EcsEntity } from "./ecs";
import { HTMLEventType } from "./types";
export declare class InteractionManager {
    private ecs;
    static INSTANCE_ID: string;
    private canvas;
    private hitBoxCanvas;
    private colorizedCache;
    private mouseMoveTargetId;
    private mouseOutCallback;
    private mouseDownTargetId;
    private mouseUpCallback;
    private _point;
    colorHeap: ColorHeap;
    hitBoxOffscreenCtx: OffscreenCanvasRenderingContext2D;
    constructor(canvas: HTMLCanvasElement, ecs: ECS);
    registerEventListener(evType: HTMLEventType, options?: boolean | AddEventListenerOptions): void;
    registerKeyboardFocus(entity: EcsEntity): void;
    updateCanvasSize(width: number, height: number): void;
    clean(evTypes: HTMLEventType[]): void;
    private listener;
    private extractPoint;
    /**
     * Query the highest-priority hitbox at a point.
     * Returns undefined if no hitbox matches.
     */
    private getHitboxAt;
    private hitTest;
    private getCanvasHitbox;
    /** Handle mouse button release across different hitboxes.
     * Ensures that if a mousedown occurs on one hitbox and mouseup on another,
     * the original hitbox's mouseup callback is still invoked.
     */
    private handleMouseButtonRelease;
    /** Handle mouse hover, dragging and mouseout across different hitboxes.
     * Ensures that if a mousedown occurs on one hitbox and mouseup on another,
     * the original hitbox's mouseup callback is still invoked.
     */
    private handleMouseMove;
}
//# sourceMappingURL=interaction-manager.d.ts.map
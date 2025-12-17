import { BoundingBox, Vec2 } from "../models";
import { Color } from "../models/color";
import { EventType } from "./types/event-type";
export type HitTestFn = (point: Vec2<number>, ctx: OffscreenCanvasRenderingContext2D) => boolean;
export type Callback<K extends keyof HTMLElementEventMap> = (ev: HTMLElementEventMap[K]) => any;
export type EventCallback = Partial<{
    [key in EventType]: Callback<key>;
}>;
export type HitBoxColor = Color & {
    a: 255;
};
/**
 * Unified hitbox + event definition.
 * Spatial hitbox with optional event callbacks and priority layer.
 */
export type HitboxEvent = {
    id: string;
    layer?: number;
    boundingBox?: () => BoundingBox<number> | undefined;
    hitTest?: HitTestFn;
    color?: HitBoxColor;
    image?: HTMLImageElement;
    callbacks?: EventCallback;
};
export type HitboxEventId = string;
export declare class InteractionManager {
    static INTERACTION_MANAGER_ID: string;
    private canvas;
    private hitboxEvents;
    private hitboxArray;
    private hitBoxCanvas;
    private hitBoxOffscreenCtx;
    private colorizedCache;
    private keyboardFocusId;
    private mouseMoveTargetId;
    private mouseOutCallback;
    private mouseDownTargetId;
    private mouseUpCallback;
    constructor(canvas: HTMLCanvasElement);
    registerEventListener(evType: EventType, options?: boolean | AddEventListenerOptions): void;
    /**
     * Query the highest-priority hitbox at a point.
     * Returns undefined if no hitbox matches.
     */
    getHitboxAt(point: Vec2<number>): HitboxEvent | undefined;
    updateCanvasSize(width: number, height: number): void;
    registerKeyboardFocus(id: string): void;
    deregisterKeyboardFocus(): void;
    upsertHitbox(id: string, options: Partial<HitboxEvent>): void;
    removeHitbox(id: string): void;
    hasHitBox(hbId: string): boolean;
    /**
     * Renders hitboxes to the offscreen canvas, sorted by layer priority.
     * This offscreen canvas is used by hitTest() for pixel-perfect collision detection.
     * Higher layer values are rendered last (on top), ensuring they win priority queries.
     */
    render(ctx?: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D): void;
    clean(evTypes: EventType[]): void;
    private listener;
    private extractPoint;
    private hitTest;
    private colorizeCached;
    private getHitboxArray;
    private getCanvasEvent;
    /** Handle mouse button release across different hitboxes.
     * Ensures that if a mousedown occurs on one hitbox and mouseup on another,
     * the original hitbox's mouseup callback is still invoked.
     */
    private handleMouseButtonRelease;
    /** Handle mouse hover and mouseout across different hitboxes.
     * Ensures that if a mousedown occurs on one hitbox and mouseup on another,
     * the original hitbox's mouseup callback is still invoked.
     */
    private handleMouseOut;
}
//# sourceMappingURL=interaction-manager.d.ts.map
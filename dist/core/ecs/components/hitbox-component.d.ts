import { BoundingBox, EcsComponent, EcsEntity, HitboxColor, Vec2 } from "hypertoroid";
import { HTMLEventType } from "../../types/html-event-type";
export type HitboxData = {
    isDragging: boolean;
};
export type HitTestFn = (point: Vec2<number>, ctx: OffscreenCanvasRenderingContext2D) => boolean;
export type Callback<K extends keyof HTMLElementEventMap> = (ev: HTMLElementEventMap[K]) => any;
export type HTMLEventCallback = Partial<{
    [key in HTMLEventType]: Callback<key>;
}>;
export declare class HitboxComponent extends EcsComponent {
    id: EcsEntity;
    priority?: number | undefined;
    callbacks?: HTMLEventCallback | undefined;
    data?: Partial<HitboxData> | undefined;
    getBoundingBox?: (() => BoundingBox<number> | undefined) | undefined;
    hitTest?: HitTestFn | undefined;
    color?: HitboxColor | undefined;
    image?: HTMLImageElement | undefined;
    constructor(id: EcsEntity, priority?: number | undefined, // 0-100, higher = higher priority. Defaults to 0.
    callbacks?: HTMLEventCallback | undefined, data?: Partial<HitboxData> | undefined, getBoundingBox?: (() => BoundingBox<number> | undefined) | undefined, hitTest?: HitTestFn | undefined, color?: HitboxColor | undefined, image?: HTMLImageElement | undefined);
}
//# sourceMappingURL=hitbox-component.d.ts.map
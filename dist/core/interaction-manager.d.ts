import { ColorHeap } from "../helpers";
import { ECS, EcsEntity } from "./ecs";
import { HTMLEventType } from "./types";
export declare class InteractionManager {
    private ecs;
    static INSTANCE_ID: string;
    colorHeap: ColorHeap;
    hitBoxCanvas: OffscreenCanvas;
    hitBoxOffscreenCtx: OffscreenCanvasRenderingContext2D;
    private canvas;
    private colorizedCache;
    private _entities;
    private _components;
    constructor(canvas: HTMLCanvasElement, ecs: ECS);
    registerEventListener(evType: HTMLEventType, options?: boolean | AddEventListenerOptions): void;
    registerKeyboardFocus(entity: EcsEntity): void;
    updateCanvasSize(width: number, height: number): void;
    clean(evTypes: HTMLEventType[]): void;
    private listener;
    private getCanvasHitbox;
}
//# sourceMappingURL=interaction-manager.d.ts.map
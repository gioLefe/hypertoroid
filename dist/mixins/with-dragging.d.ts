import { InteractionManager } from "../core";
import { BaseObject } from "../models";
export type WithInitialPosition = {
    initialX: number;
    initialY: number;
};
type DraggableChild = BaseObject & Partial<WithInitialPosition>;
export declare class DraggableObject extends BaseObject {
    interactionManager: InteractionManager;
    isDragging: boolean;
    dragStartX: number;
    dragStartY: number;
    initialX: number;
    initialY: number;
    draggingId: string;
    elements: DraggableChild[];
    constructor(...args: any[]);
    registerDragging: (id?: string) => void;
    deregister: () => void;
    getBBox: () => import("../models").BoundingBox<number>;
    _mouseHover: (ev: MouseEvent) => void;
    _mouseDown: (ev: MouseEvent) => void;
    _mouseUp: (_ev: MouseEvent) => void;
}
export {};
//# sourceMappingURL=with-dragging.d.ts.map
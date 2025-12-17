import { AnonymousClass } from "hypertoroid";
import { BaseObject } from "../models/base-object";
import { WithEventHandling } from "./with-event-handling";
interface WithDragging {
    isDragging: boolean;
    dragStartX: number;
    dragStartY: number;
    initialX: number;
    initialY: number;
    registerDragging(): void;
    deregister(): void;
}
export declare function withDragging<T extends AnonymousClass<WithEventHandling & BaseObject>>(obj: T): T & AnonymousClass<WithDragging>;
export {};
//# sourceMappingURL=with-dragging.d.ts.map
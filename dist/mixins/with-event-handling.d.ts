import { InteractionManager } from "../core";
import { AnonymousClass, BaseObject } from "../models";
export interface WithEventHandling {
    interactionManager: InteractionManager;
}
export declare function withEventHandling<T extends AnonymousClass<BaseObject>>(obj?: T): T & AnonymousClass<WithEventHandling>;
//# sourceMappingURL=with-event-handling.d.ts.map
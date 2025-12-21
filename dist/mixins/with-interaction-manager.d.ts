import { InteractionManager } from "../core";
import { BaseObject, Constructor } from "../models";
export interface hasInteractionManager {
    interactionManager: InteractionManager;
}
export declare function withInteractionManager<T extends Constructor<BaseObject>>(obj?: T): T & Constructor<hasInteractionManager>;
//# sourceMappingURL=with-interaction-manager.d.ts.map
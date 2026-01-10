import { DIContainer, InteractionManager } from "../core";
import { BaseObject, BaseObjectClass, Constructor } from "../models";

export interface hasInteractionManager {
  interactionManager: InteractionManager;
}

export function withInteractionManager<T extends Constructor<BaseObject>>(
  obj: T = BaseObjectClass as T
): T & Constructor<hasInteractionManager> {
  return class extends obj implements hasInteractionManager {
    interactionManager = DIContainer.getInstance().resolve<InteractionManager>(
      InteractionManager.INSTANCE_ID
    );

    constructor(...args: any[]) {
      super(...args);
    }
  };
}

import { DIContainer, InteractionManager } from "../core";
import { AnonymousClass, BaseObject } from "../models";

export interface WithEventHandling {
  interactionManager: InteractionManager;
}

export function withEventHandling<T extends AnonymousClass<BaseObject>>(
  obj: T = class {} as T
): T & AnonymousClass<WithEventHandling> {
  return class extends obj implements WithEventHandling {
    interactionManager = DIContainer.getInstance().resolve<InteractionManager>(
      InteractionManager.INTERACTION_MANAGER_ID
    );

    constructor(...args: any[]) {
      super(args);
    }

  };
}

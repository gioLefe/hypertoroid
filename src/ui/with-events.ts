import { AnonymousClass } from "../models";

export type EventType = keyof HTMLElementEventMap;
export type TriggerCondition<T extends EventType> = (
  ev: HTMLElementEventMap[T],
) => boolean;

export type AsyncEventCallback = (...args: any[]) => Promise<void>;
export type EventCallback = (...args: any[]) => void;

export type Callback<T extends EventType> = {
  eventType: T;
  ev: EventCallback | AsyncEventCallback;
  blocking: boolean;
  triggerCondition?: TriggerCondition<T>;
};

export type WithEvents = {
  events: Map<string, Callback<EventType>>;
  abortControllers: AbortController[];
  addCallback<T extends EventType>(
    eventType: T,
    id: string,
    eventCallback: EventCallback | AsyncEventCallback,
    blocking: boolean,
    triggerCondition?: TriggerCondition<T>,
  ): void;
  enableEvent<T>(eventType: T): (eventTarget: EventTarget) => void;
  removeCallback(id: string): void;
  deregisterEvents(): void;
};

/**
 * A mixin function that adds event handling capabilities to a class.
 *
 * @template T
 * @param {T extends AnonymousClass<unknown>} obj - The class to extend with event handling capabilities.
 * @returns {AnonymousClass<WithEvents>} A new class that extends the original class with event handling capabilities.
 */
export function withEvents<T extends AnonymousClass<unknown>>(
  obj: T,
): AnonymousClass<WithEvents> & T {
  return class extends obj implements WithEvents {
    /**
     * A map to store event callbacks by their ID.
     * @type {Map<string, Callback>}
     */
    events: Map<string, Callback<EventType>> = new Map<
      string,
      Callback<EventType>
    >();

    /**
     * A list of AbortController instances to manage event listeners.
     * @type {AbortController[]}
     */
    abortControllers: AbortController[] = [];

    /**
     * Adds a callback for a specific event type and ID.
     */
    addCallback<K extends EventType>(
      eventType: K,
      id: string,
      ev: EventCallback,
      blocking: boolean,
      triggerCondition?: TriggerCondition<K>,
    ): void {
      if (this.events?.has(id)) {
        console.warn(`event with id ${id} already exists!`);
        return;
      }
      this.events?.set(id, {
        eventType,
        ev,
        blocking,
        triggerCondition: triggerCondition as TriggerCondition<EventType>,
      });
    }

    /**
     * Removes a callback by its ID.
     */
    removeCallback(id: string): void {
      if (this.events?.has(id) === false) {
        console.warn(`cannot remove ${id}, event not found!`);
        return;
      }
      this.events?.delete(id);
    }

    /**
     * Deregisters all events by aborting their associated AbortControllers.
     *
     * @returns {void}
     */
    deregisterEvents(): void {
      this.abortControllers.forEach((ac) => ac.abort());
    }

    /**
     * Enables an event of a specific type on a given event target.
     *
     * @template T
     * @param {T} eventType - The type of the event to enable.
     * @returns {(eventTarget: EventTarget) => void} A function that takes an event target and adds the event listeners to it.
     */
    enableEvent<EventType>(
      eventType: EventType,
    ): (eventTarget: EventTarget) => void {
      return (eventTarget: EventTarget) => {
        if (eventTarget === undefined) {
          throw new Error("eventTarget is undefined!");
        }
        const controller =
          this.abortControllers[
            this.abortControllers.push(new AbortController()) - 1
          ];
        this.events.forEach((callBack) => {
          eventTarget.addEventListener(
            eventType as string,
            async (ev: Event) => {
              if (
                callBack.eventType !== eventType ||
                callBack.triggerCondition === undefined ||
                callBack.triggerCondition(ev) === false
              ) {
                return;
              }
              if (ev === undefined) {
                console.warn(`empty event cannot be run!`);
                return;
              }
              if (callBack.blocking) {
                return await callBack.ev(ev);
              }
              return callBack.ev(ev);
            },
            { signal: controller.signal },
          );
        });
      };
    }
  };
}

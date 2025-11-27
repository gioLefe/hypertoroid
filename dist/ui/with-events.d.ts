import { AnonymousClass } from "../models";
export type EventType = keyof HTMLElementEventMap;
export type TriggerCondition<T extends EventType> = (ev: HTMLElementEventMap[T]) => boolean;
export type AsyncEventCallback = (...args: any[]) => Promise<void>;
export type EventCallback = (...args: any[]) => void;
export type Callback<T extends EventType> = {
    eventType: T;
    ev: EventCallback | AsyncEventCallback;
    synchronous: boolean;
    triggerCondition: TriggerCondition<T>;
};
export type WithEvents = {
    events: Map<string, Callback<EventType>>;
    abortControllers: AbortController[];
    addCallback<T extends EventType>(eventType: T, id: string, eventCallback: EventCallback | AsyncEventCallback, blocking: boolean, triggerCondition?: TriggerCondition<T>): void;
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
export declare function withEvents<T extends AnonymousClass<unknown>>(obj: T): AnonymousClass<WithEvents> & T;

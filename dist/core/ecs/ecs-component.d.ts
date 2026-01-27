export declare abstract class EcsComponent {
}
type ComponentClass<T extends EcsComponent> = new (...args: any[]) => T;
export declare class ComponentContainer {
    private map;
    add(component: EcsComponent): void;
    get<T extends EcsComponent>(componentClass: ComponentClass<T>): T;
    has(componentClass: Function): boolean;
    hasAll(componentClasses: Iterable<Function>): boolean;
    delete(componentClass: Function): void;
}
export {};
//# sourceMappingURL=ecs-component.d.ts.map
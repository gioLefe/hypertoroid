import { ComponentContainer, EcsComponent } from "./ecs-component";
import { EcsEntity } from "./ecs-entity";
import { EcsSystem } from "./ecs-system";
type ComponentClass<T extends EcsComponent> = new (...args: any[]) => T;
export declare class ECS {
    static INSTANCE_ID: string;
    private entities;
    private systems;
    private systemOrder;
    private nextEntityID;
    private entitiesToDestroy;
    addEntity(): EcsEntity;
    /**
     * Marks `entity` for removal. The actual removal happens at the end
     * of the next `update()`. This way we avoid subtle bugs where an
     * Entity is removed mid-`update()`, with some Systems seeing it and
     * others not.
     */
    removeEntity(entity: EcsEntity): void;
    addComponent(entity: EcsEntity, component: EcsComponent): void;
    getComponents(entity: EcsEntity): ComponentContainer | undefined;
    /**
     * Get all entities in the ECS.
     * Useful for systems that need to query entities not matching their componentsRequired.
     */
    getAllEntities(): ReadonlyMap<EcsEntity, ComponentContainer>;
    removeComponent(entity: EcsEntity, componentClass: Function): void;
    addSystem(system: EcsSystem): void;
    /**
     * Note: I never actually had a removeSystem() method for the entire
     * time I was programming the game Fallgate (2 years!). I just added
     * one here for a specific testing reason (see the next post).
     * Because it's just for demo purposes, this requires an actual
     * instance of a System to remove (which would be clunky as a real
     * API).
     */
    removeSystem(system: EcsSystem): void;
    /**
     * This is ordinarily called once per tick (e.g., every frame). It
     * updates all Systems in priority order, then destroys any Entities
     * that were marked for removal.
     */
    update(): void;
    /**
     * Find all entities that have a specific component type.
     *
     * @param componentClass - The component class to search for
     * @returns Array of entities that have the specified component
     */
    findEntitiesByComponent<T extends EcsComponent>(componentClass: ComponentClass<T>): EcsEntity[];
    /**
     * Find the first entity that has a specific component matching a predicate.
     *
     * @param componentClass - The component class to search for
     * @param predicate - Function to test each component
     * @returns The first matching entity, or undefined if none found
     */
    findEntityByComponentValue<T extends EcsComponent>(componentClass: ComponentClass<T>, predicate: (component: T) => boolean): EcsEntity | undefined;
    /**
     * Find all entities that have a specific component matching a predicate.
     *
     * @param componentClass - The component class to search for
     * @param predicate - Function to test each component
     * @returns Array of matching entities
     */
    findEntitiesByComponentValue<T extends EcsComponent>(componentClass: ComponentClass<T>, predicate: (component: T) => boolean): EcsEntity[];
    private destroyEntity;
    private checkE;
    private checkES;
}
export {};
//# sourceMappingURL=ecs.d.ts.map
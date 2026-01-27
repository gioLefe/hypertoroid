import { ComponentContainer, EcsComponent } from "./ecs-component";
import { EcsEntity } from "./ecs-entity";
import { EcsSystem } from "./ecs-system";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ComponentClass<T extends EcsComponent> = new (...args: any[]) => T;

// Credits: https://maxwellforbes.com/posts/typescript-ecs-implementation/
export class ECS {
  static INSTANCE_ID = "ECS_MAIN_INSTANCE";

  // Main state
  private entities = new Map<EcsEntity, ComponentContainer>();
  private systems = new Map<EcsSystem, Set<EcsEntity>>();

  // Sorted array of systems by priority (ascending) for deterministic update order
  private systemOrder: EcsSystem[] = [];

  // Bookkeeping for entities.
  private nextEntityID = 0;
  private entitiesToDestroy = new Array<EcsEntity>();

  // API: Entities
  public addEntity(): EcsEntity {
    let entity = this.nextEntityID;
    this.nextEntityID++;
    this.entities.set(entity, new ComponentContainer());
    return entity;
  }

  /**
   * Marks `entity` for removal. The actual removal happens at the end
   * of the next `update()`. This way we avoid subtle bugs where an
   * Entity is removed mid-`update()`, with some Systems seeing it and
   * others not.
   */
  public removeEntity(entity: EcsEntity): void {
    this.entitiesToDestroy.push(entity);
  }

  // API: Components
  public addComponent(entity: EcsEntity, component: EcsComponent): void {
    this.entities.get(entity)?.add(component);
    this.checkE(entity);
  }

  public getComponents(entity: EcsEntity): ComponentContainer | undefined {
    return this.entities.get(entity);
  }

  /**
   * Get all entities in the ECS.
   * Useful for systems that need to query entities not matching their componentsRequired.
   */
  public getAllEntities(): ReadonlyMap<EcsEntity, ComponentContainer> {
    return this.entities;
  }

  public removeComponent(entity: EcsEntity, componentClass: Function): void {
    this.entities.get(entity)?.delete(componentClass);
    this.checkE(entity);
  }

  // API: Systems
  public addSystem(system: EcsSystem): void {
    // Checking invariant: systems should not have an empty
    // Components list, or they'll run on every entity. Simply remove
    // or special case this check if you do want a System that runs
    // on everything.
    if (system.componentsRequired.size == 0) {
      console.warn("System not added: empty Components list.", system);
      return;
    }

    // Give system a reference to the ECS so it can actually do
    // anything.
    system.ecs = this;

    // Save system and set who it should track immediately.
    this.systems.set(system, new Set());
    for (let entity of this.entities.keys()) {
      this.checkES(entity, system);
    }

    // Maintain sorted order by priority (ascending)
    this.systemOrder.push(system);
    this.systemOrder.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Note: I never actually had a removeSystem() method for the entire
   * time I was programming the game Fallgate (2 years!). I just added
   * one here for a specific testing reason (see the next post).
   * Because it's just for demo purposes, this requires an actual
   * instance of a System to remove (which would be clunky as a real
   * API).
   */
  public removeSystem(system: EcsSystem): void {
    this.systems.delete(system);
    const index = this.systemOrder.indexOf(system);
    if (index !== -1) {
      this.systemOrder.splice(index, 1);
    }
  }

  /**
   * This is ordinarily called once per tick (e.g., every frame). It
   * updates all Systems in priority order, then destroys any Entities
   * that were marked for removal.
   */
  public update(): void {
    // Update all systems in priority order (ascending)
    for (const system of this.systemOrder) {
      const entities = this.systems.get(system);
      if (entities !== undefined) {
        system.update(entities);
      }
    }

    // Remove any entities that were marked for deletion during the
    // update.
    while (this.entitiesToDestroy.length > 0) {
      const entity = this.entitiesToDestroy.pop();
      if (entity !== undefined) {
        this.destroyEntity(entity);
      }
    }
  }

  // API: Query helpers

  /**
   * Find all entities that have a specific component type.
   *
   * @param componentClass - The component class to search for
   * @returns Array of entities that have the specified component
   */
  public findEntitiesByComponent<T extends EcsComponent>(
    componentClass: ComponentClass<T>,
  ): EcsEntity[] {
    const results: EcsEntity[] = [];

    for (const [entity, components] of this.entities) {
      if (components.has(componentClass)) {
        results.push(entity);
      }
    }

    return results;
  }

  /**
   * Find the first entity that has a specific component matching a predicate.
   *
   * @param componentClass - The component class to search for
   * @param predicate - Function to test each component
   * @returns The first matching entity, or undefined if none found
   */
  public findEntityByComponentValue<T extends EcsComponent>(
    componentClass: ComponentClass<T>,
    predicate: (component: T) => boolean,
  ): EcsEntity | undefined {
    for (const [entity, components] of this.entities) {
      if (components.has(componentClass)) {
        const component = components.get(componentClass);
        if (predicate(component)) {
          return entity;
        }
      }
    }

    return undefined;
  }

  /**
   * Find all entities that have a specific component matching a predicate.
   *
   * @param componentClass - The component class to search for
   * @param predicate - Function to test each component
   * @returns Array of matching entities
   */
  public findEntitiesByComponentValue<T extends EcsComponent>(
    componentClass: ComponentClass<T>,
    predicate: (component: T) => boolean,
  ): EcsEntity[] {
    const results: EcsEntity[] = [];

    for (const [entity, components] of this.entities) {
      if (components.has(componentClass)) {
        const component = components.get(componentClass);
        if (predicate(component)) {
          results.push(entity);
        }
      }
    }

    return results;
  }

  // Private methods for doing internal state checks and mutations.
  private destroyEntity(entity: EcsEntity): void {
    this.entities.delete(entity);
    for (let entities of this.systems.values()) {
      entities.delete(entity); // no-op if doesn't have it
    }
  }

  private checkE(entity: EcsEntity): void {
    for (let system of this.systems.keys()) {
      this.checkES(entity, system);
    }
  }

  private checkES(entity: EcsEntity, system: EcsSystem): void {
    let have = this.entities.get(entity);
    let need = system.componentsRequired;
    if (have?.hasAll(need)) {
      // should be in system
      this.systems.get(system)?.add(entity); // no-op if in
    } else {
      // should not be in system
      this.systems.get(system)?.delete(entity); // no-op if out
    }
  }
}

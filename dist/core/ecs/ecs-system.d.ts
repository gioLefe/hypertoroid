import { ECS, EcsEntity } from "../ecs";
export declare abstract class EcsSystem {
    /**
     * Set of Component classes, ALL of which are required before the
     * system is run on an entity.
     *
     * This should be defined at compile time and should never change.
     */
    abstract componentsRequired: Set<Function>;
    /**
     * Priority determines the order in which systems are updated.
     * Lower values run first. Default is 0.
     *
     * Recommended ranges:
     * - 0-49: Pre-processing systems (e.g., FloorPrerenderSystem)
     * - 50-99: Logic systems (e.g., ZOrderSystem)
     * - 100+: Rendering systems (e.g., RenderSystem)
     */
    priority: number;
    /**
     * update() is called on the System every frame.
     */
    abstract update(entities: Set<EcsEntity>, deltaTime: number): Promise<void> | void;
    /**
     * The ECS is given to all Systems. Systems contain most of the game
     * code, so they need to be able to create, mutate, and destroy
     * Entities and Components.
     */
    ecs: ECS | undefined;
}
//# sourceMappingURL=ecs-system.d.ts.map
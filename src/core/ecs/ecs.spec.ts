import { describe, it, expect, beforeEach, vi } from "vitest";
import { ECS } from "./ecs";
import { EcsComponent } from "./ecs-component";
import { EcsSystem } from "./ecs-system";
import { EcsEntity } from "./ecs-entity";

// Test components
class TestTagComponent extends EcsComponent {}

class TestValueComponent extends EcsComponent {
  constructor(public value: number) {
    super();
  }
}

class OtherComponent extends EcsComponent {}

class PositionComponent extends EcsComponent {
  constructor(
    public x: number,
    public y: number,
  ) {
    super();
  }
}

class VelocityComponent extends EcsComponent {
  constructor(
    public vx: number,
    public vy: number,
  ) {
    super();
  }
}

// Test system
class TestSystem extends EcsSystem {
  public override componentsRequired = new Set<Function>([TestTagComponent]);
  public updateCount = 0;
  public lastEntities: Set<EcsEntity> = new Set();

  public override update(entities: Set<EcsEntity>): void {
    this.updateCount++;
    this.lastEntities = new Set(entities);
  }
}

class MovementSystem extends EcsSystem {
  public override componentsRequired = new Set<Function>([PositionComponent, VelocityComponent]);
  public processedEntities: EcsEntity[] = [];

  public override update(entities: Set<EcsEntity>): void {
    this.processedEntities = [];
    for (const entity of entities) {
      const pos = this.ecs?.getComponents(entity)?.get(PositionComponent);
      const vel = this.ecs?.getComponents(entity)?.get(VelocityComponent);
      if (pos && vel) {
        pos.x += vel.vx;
        pos.y += vel.vy;
        this.processedEntities.push(entity);
      }
    }
  }
}

describe("ECS", () => {
  let ecs: ECS;

  beforeEach(() => {
    ecs = new ECS();
  });

  describe("Entity Management", () => {
    describe("addEntity", () => {
      it("should create a new entity with unique ID", () => {
        const entity1 = ecs.addEntity();
        const entity2 = ecs.addEntity();

        expect(entity1).not.toBe(entity2);
      });

      it("should return incrementing entity IDs", () => {
        const entity1 = ecs.addEntity();
        const entity2 = ecs.addEntity();
        const entity3 = ecs.addEntity();

        expect(entity2).toBe(entity1 + 1);
        expect(entity3).toBe(entity2 + 1);
      });

      it("should add entity to getAllEntities", () => {
        const entity = ecs.addEntity();

        expect(ecs.getAllEntities().has(entity)).toBe(true);
      });
    });

    describe("removeEntity", () => {
      it("should mark entity for removal (not immediate)", () => {
        const entity = ecs.addEntity();
        ecs.removeEntity(entity);

        // Entity still exists before update()
        expect(ecs.getAllEntities().has(entity)).toBe(true);
      });

      it("should remove entity after update()", () => {
        const entity = ecs.addEntity();
        ecs.removeEntity(entity);
        ecs.update();

        expect(ecs.getAllEntities().has(entity)).toBe(false);
      });

      it("should remove entity from system tracking after update()", () => {
        const entity = ecs.addEntity();
        ecs.addComponent(entity, new TestTagComponent());

        let entitiesPassedToUpdate: Set<EcsEntity> = new Set();

        class TrackingSystem extends EcsSystem {
          public override componentsRequired = new Set<Function>([TestTagComponent]);
          public override update(entities: Set<EcsEntity>): void {
            entitiesPassedToUpdate = entities;
          }
        }

        const system = new TrackingSystem();
        ecs.addSystem(system);

        ecs.update();
        expect(entitiesPassedToUpdate.has(entity)).toBe(true);

        ecs.removeEntity(entity);
        ecs.update();

        // After removal, the entity should not be passed to the system
        expect(entitiesPassedToUpdate.has(entity)).toBe(false);
      });
    });

    describe("getAllEntities", () => {
      it("should return empty map when no entities exist", () => {
        expect(ecs.getAllEntities().size).toBe(0);
      });

      it("should return all entities", () => {
        const entity1 = ecs.addEntity();
        const entity2 = ecs.addEntity();

        const allEntities = ecs.getAllEntities();
        expect(allEntities.size).toBe(2);
        expect(allEntities.has(entity1)).toBe(true);
        expect(allEntities.has(entity2)).toBe(true);
      });
    });
  });

  describe("Component Management", () => {
    describe("addComponent", () => {
      it("should add component to entity", () => {
        const entity = ecs.addEntity();
        const component = new TestTagComponent();

        ecs.addComponent(entity, component);

        const components = ecs.getComponents(entity);
        expect(components?.has(TestTagComponent)).toBe(true);
      });

      it("should add multiple components to entity", () => {
        const entity = ecs.addEntity();

        ecs.addComponent(entity, new TestTagComponent());
        ecs.addComponent(entity, new TestValueComponent(42));

        const components = ecs.getComponents(entity);
        expect(components?.has(TestTagComponent)).toBe(true);
        expect(components?.has(TestValueComponent)).toBe(true);
      });

      it("should update system tracking when component makes entity match", () => {
        const entity = ecs.addEntity();
        const system = new TestSystem();
        ecs.addSystem(system);

        // Entity doesn't have required component yet
        ecs.update();
        expect(system.lastEntities.has(entity)).toBe(false);

        // Add required component
        ecs.addComponent(entity, new TestTagComponent());
        ecs.update();
        expect(system.lastEntities.has(entity)).toBe(true);
      });
    });

    describe("getComponents", () => {
      it("should return undefined for non-existent entity", () => {
        const components = ecs.getComponents(999);
        expect(components).toBeUndefined();
      });

      it("should return ComponentContainer for existing entity", () => {
        const entity = ecs.addEntity();
        const components = ecs.getComponents(entity);

        expect(components).toBeDefined();
      });

      it("should allow retrieving specific component", () => {
        const entity = ecs.addEntity();
        ecs.addComponent(entity, new TestValueComponent(123));

        const component = ecs.getComponents(entity)?.get(TestValueComponent);
        expect(component?.value).toBe(123);
      });
    });

    describe("removeComponent", () => {
      it("should remove component from entity", () => {
        const entity = ecs.addEntity();
        ecs.addComponent(entity, new TestTagComponent());
        ecs.addComponent(entity, new OtherComponent());

        ecs.removeComponent(entity, TestTagComponent);

        const components = ecs.getComponents(entity);
        expect(components?.has(TestTagComponent)).toBe(false);
        expect(components?.has(OtherComponent)).toBe(true);
      });

      it("should update system tracking when component removed", () => {
        const entity = ecs.addEntity();
        ecs.addComponent(entity, new TestTagComponent());

        const system = new TestSystem();
        ecs.addSystem(system);

        ecs.update();
        expect(system.lastEntities.has(entity)).toBe(true);

        ecs.removeComponent(entity, TestTagComponent);
        ecs.update();
        expect(system.lastEntities.has(entity)).toBe(false);
      });
    });
  });

  describe("System Management", () => {
    describe("addSystem", () => {
      it("should add system and set ecs reference", () => {
        const system = new TestSystem();
        ecs.addSystem(system);

        expect(system.ecs).toBe(ecs);
      });

      it("should not add system with empty componentsRequired", () => {
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

        class EmptySystem extends EcsSystem {
          public override componentsRequired = new Set<Function>();
          public override update(): void {}
        }

        const system = new EmptySystem();
        ecs.addSystem(system);

        expect(warnSpy).toHaveBeenCalledWith("System not added: empty Components list.", system);
        warnSpy.mockRestore();
      });

      it("should immediately track matching entities", () => {
        const entity = ecs.addEntity();
        ecs.addComponent(entity, new TestTagComponent());

        const system = new TestSystem();
        ecs.addSystem(system);

        ecs.update();
        expect(system.lastEntities.has(entity)).toBe(true);
      });
    });

    describe("removeSystem", () => {
      it("should remove system from update cycle", () => {
        const system = new TestSystem();
        ecs.addSystem(system);

        ecs.update();
        expect(system.updateCount).toBe(1);

        ecs.removeSystem(system);
        ecs.update();
        expect(system.updateCount).toBe(1); // Not incremented
      });
    });

    describe("system priority", () => {
      it("should update systems in priority order", () => {
        const order: string[] = [];

        class LowPrioritySystem extends EcsSystem {
          public override priority = 10;
          public override componentsRequired = new Set<Function>([TestTagComponent]);
          public override update(): void {
            order.push("low");
          }
        }

        class HighPrioritySystem extends EcsSystem {
          public override priority = 1;
          public override componentsRequired = new Set<Function>([TestTagComponent]);
          public override update(): void {
            order.push("high");
          }
        }

        // Add in wrong order
        ecs.addSystem(new LowPrioritySystem());
        ecs.addSystem(new HighPrioritySystem());

        ecs.addEntity();

        ecs.update();

        expect(order).toEqual(["high", "low"]);
      });
    });
  });

  describe("update", () => {
    it("should call update on all systems", () => {
      const entity = ecs.addEntity();
      ecs.addComponent(entity, new TestTagComponent());

      const system = new TestSystem();
      ecs.addSystem(system);

      ecs.update();
      ecs.update();
      ecs.update();

      expect(system.updateCount).toBe(3);
    });

    it("should process entities with systems", () => {
      const entity = ecs.addEntity();
      ecs.addComponent(entity, new PositionComponent(0, 0));
      ecs.addComponent(entity, new VelocityComponent(5, 10));

      const system = new MovementSystem();
      ecs.addSystem(system);

      ecs.update();

      const pos = ecs.getComponents(entity)?.get(PositionComponent);
      expect(pos?.x).toBe(5);
      expect(pos?.y).toBe(10);
    });

    it("should only process entities matching system requirements", () => {
      const entity1 = ecs.addEntity();
      ecs.addComponent(entity1, new PositionComponent(0, 0));
      ecs.addComponent(entity1, new VelocityComponent(1, 1));

      const entity2 = ecs.addEntity();
      ecs.addComponent(entity2, new PositionComponent(100, 100));
      // No velocity - should not be processed

      const system = new MovementSystem();
      ecs.addSystem(system);

      ecs.update();

      expect(system.processedEntities).toEqual([entity1]);
    });
  });

  describe("Query Methods", () => {
    describe("findEntitiesByComponent", () => {
      it("should return empty array when ECS has no entities", () => {
        const result = ecs.findEntitiesByComponent(TestTagComponent);
        expect(result).toEqual([]);
      });

      it("should return empty array when no entities have the component", () => {
        const entity = ecs.addEntity();
        ecs.addComponent(entity, new OtherComponent());

        const result = ecs.findEntitiesByComponent(TestTagComponent);
        expect(result).toEqual([]);
      });

      it("should return single entity with the component", () => {
        const entity = ecs.addEntity();
        ecs.addComponent(entity, new TestTagComponent());

        const result = ecs.findEntitiesByComponent(TestTagComponent);
        expect(result).toEqual([entity]);
      });

      it("should return multiple entities with the component", () => {
        const entity1 = ecs.addEntity();
        const entity2 = ecs.addEntity();
        const entity3 = ecs.addEntity();

        ecs.addComponent(entity1, new TestTagComponent());
        ecs.addComponent(entity2, new OtherComponent());
        ecs.addComponent(entity3, new TestTagComponent());

        const result = ecs.findEntitiesByComponent(TestTagComponent);
        expect(result).toHaveLength(2);
        expect(result).toContain(entity1);
        expect(result).toContain(entity3);
      });

      it("should not include entities without the component", () => {
        const entityWith = ecs.addEntity();
        const entityWithout = ecs.addEntity();

        ecs.addComponent(entityWith, new TestTagComponent());
        ecs.addComponent(entityWithout, new OtherComponent());

        const result = ecs.findEntitiesByComponent(TestTagComponent);
        expect(result).not.toContain(entityWithout);
      });
    });

    describe("findEntityByComponentValue", () => {
      it("should return undefined when ECS has no entities", () => {
        const result = ecs.findEntityByComponentValue(TestValueComponent, (c) => c.value === 1);
        expect(result).toBeUndefined();
      });

      it("should return undefined when no entity matches predicate", () => {
        const entity = ecs.addEntity();
        ecs.addComponent(entity, new TestValueComponent(5));

        const result = ecs.findEntityByComponentValue(TestValueComponent, (c) => c.value === 1);
        expect(result).toBeUndefined();
      });

      it("should return entity matching predicate", () => {
        const entity = ecs.addEntity();
        ecs.addComponent(entity, new TestValueComponent(42));

        const result = ecs.findEntityByComponentValue(TestValueComponent, (c) => c.value === 42);
        expect(result).toBe(entity);
      });

      it("should return first matching entity when multiple match", () => {
        const entity1 = ecs.addEntity();
        const entity2 = ecs.addEntity();

        ecs.addComponent(entity1, new TestValueComponent(10));
        ecs.addComponent(entity2, new TestValueComponent(10));

        const result = ecs.findEntityByComponentValue(TestValueComponent, (c) => c.value === 10);
        expect([entity1, entity2]).toContain(result);
      });

      it("should filter by predicate correctly", () => {
        const entity1 = ecs.addEntity();
        const entity2 = ecs.addEntity();
        const entity3 = ecs.addEntity();

        ecs.addComponent(entity1, new TestValueComponent(5));
        ecs.addComponent(entity2, new TestValueComponent(10));
        ecs.addComponent(entity3, new TestValueComponent(15));

        const result = ecs.findEntityByComponentValue(TestValueComponent, (c) => c.value > 8);
        expect([entity2, entity3]).toContain(result);
      });
    });

    describe("findEntitiesByComponentValue", () => {
      it("should return empty array when ECS has no entities", () => {
        const result = ecs.findEntitiesByComponentValue(TestValueComponent, (c) => c.value === 1);
        expect(result).toEqual([]);
      });

      it("should return empty array when no entities match predicate", () => {
        const entity = ecs.addEntity();
        ecs.addComponent(entity, new TestValueComponent(5));

        const result = ecs.findEntitiesByComponentValue(TestValueComponent, (c) => c.value === 1);
        expect(result).toEqual([]);
      });

      it("should return all entities matching predicate", () => {
        const entity1 = ecs.addEntity();
        const entity2 = ecs.addEntity();
        const entity3 = ecs.addEntity();

        ecs.addComponent(entity1, new TestValueComponent(10));
        ecs.addComponent(entity2, new TestValueComponent(20));
        ecs.addComponent(entity3, new TestValueComponent(10));

        const result = ecs.findEntitiesByComponentValue(TestValueComponent, (c) => c.value === 10);
        expect(result).toHaveLength(2);
        expect(result).toContain(entity1);
        expect(result).toContain(entity3);
      });

      it("should work with complex predicates", () => {
        const entity1 = ecs.addEntity();
        const entity2 = ecs.addEntity();
        const entity3 = ecs.addEntity();

        ecs.addComponent(entity1, new TestValueComponent(5));
        ecs.addComponent(entity2, new TestValueComponent(15));
        ecs.addComponent(entity3, new TestValueComponent(25));

        const result = ecs.findEntitiesByComponentValue(
          TestValueComponent,
          (c) => c.value >= 10 && c.value <= 20,
        );
        expect(result).toEqual([entity2]);
      });
    });
  });
});

export abstract class EcsComponent {}

type ComponentClass<T extends EcsComponent> = new (...args: any[]) => T;

export class ComponentContainer {
  private map = new Map<Function, EcsComponent>();

  public add(component: EcsComponent): void {
    this.map.set(component.constructor, component);
  }

  public get<T extends EcsComponent>(componentClass: ComponentClass<T>): T {
    return this.map.get(componentClass) as T;
  }

  public has(componentClass: Function): boolean {
    return this.map.has(componentClass);
  }

  public hasAll(componentClasses: Iterable<Function>): boolean {
    for (let cls of componentClasses) {
      if (!this.map.has(cls)) {
        return false;
      }
    }
    return true;
  }

  public delete(componentClass: Function): void {
    this.map.delete(componentClass);
  }
}

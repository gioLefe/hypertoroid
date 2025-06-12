/**
 * A Dependency Injection (DI) container for registering and resolving dependencies.
 * This class follows the Singleton pattern to ensure only one instance is used.
 */
export class DIContainer {
  /**
   * The single instance of the DIContainer.
   * @type {DIContainer}
   * @private
   * @static
   */
  private static instance: DIContainer;

  /**
   * A map to store registered dependencies.
   * @type {Map<string, any>}
   * @private
   */
  private dependencies: Map<string, any> = new Map();

  /**
   * Private constructor to prevent direct instantiation.
   * Use {@link DIContainer.getInstance} to get the single instance of this class.
   * @private
   */
  private constructor() {}

  /**
   * Gets the single instance of the DIContainer.
   * If no instance exists, it creates one.
   *
   * @returns {DIContainer} The singleton instance of the DIContainer.
   * @static
   */
  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  /**
   * Registers a dependency with a specific name.
   *
   * @template T
   * @param {string} name - The name of the dependency.
   * @param {T} dependency - The dependency to register.
   * @returns {void}
   */
  register<T>(name: string, dependency: T): void {
    this.dependencies.set(name, dependency);
  }

  /**
   * Resolves a dependency by its name.
   * Throws an error if the dependency is not found.
   *
   * @template T
   * @param {string} name - The name of the dependency to resolve.
   * @returns {T} The resolved dependency.
   * @throws {Error} If the dependency is not found.
   */
  resolve<T>(name: string): T {
    const dependency = this.dependencies.get(name);
    if (!dependency) {
      throw new Error(`Dependency ${name} not found`);
    }
    return dependency;
  }
}

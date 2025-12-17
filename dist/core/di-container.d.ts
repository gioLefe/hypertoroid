/**
 * A Dependency Injection (DI) container for registering and resolving dependencies.
 * This class follows the Singleton pattern to ensure only one instance is used.
 */
export declare class DIContainer {
    /**
     * The single instance of the DIContainer.
     * @type {DIContainer}
     * @private
     * @static
     */
    private static instance;
    /**
     * A map to store registered dependencies.
     * @type {Map<string, any>}
     * @private
     */
    private dependencies;
    /**
     * Private constructor to prevent direct instantiation.
     * Use {@link DIContainer.getInstance} to get the single instance of this class.
     * @private
     */
    private constructor();
    /**
     * Gets the single instance of the DIContainer.
     * If no instance exists, it creates one.
     *
     * @returns {DIContainer} The singleton instance of the DIContainer.
     * @static
     */
    static getInstance(): DIContainer;
    /**
     * Registers a dependency with a specific name.
     *
     * @template T
     * @param {string} name - The name of the dependency.
     * @param {T} dependency - The dependency to register.
     * @returns {void}
     */
    register<T>(name: string, dependency: T): void;
    /**
     * Resolves a dependency by its name.
     * Throws an error if the dependency is not found.
     *
     * @template T
     * @param {string} name - The name of the dependency to resolve.
     * @returns {T} The resolved dependency.
     * @throws {Error} If the dependency is not found.
     */
    resolve<T>(name: string): T;
}
//# sourceMappingURL=di-container.d.ts.map
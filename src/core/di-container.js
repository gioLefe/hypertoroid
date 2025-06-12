"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DIContainer = void 0;
/**
 * A Dependency Injection (DI) container for registering and resolving dependencies.
 * This class follows the Singleton pattern to ensure only one instance is used.
 */
var DIContainer = /** @class */ (function () {
    /**
     * Private constructor to prevent direct instantiation.
     * Use {@link DIContainer.getInstance} to get the single instance of this class.
     * @private
     */
    function DIContainer() {
        /**
         * A map to store registered dependencies.
         * @type {Map<string, any>}
         * @private
         */
        this.dependencies = new Map();
    }
    /**
     * Gets the single instance of the DIContainer.
     * If no instance exists, it creates one.
     *
     * @returns {DIContainer} The singleton instance of the DIContainer.
     * @static
     */
    DIContainer.getInstance = function () {
        if (!DIContainer.instance) {
            DIContainer.instance = new DIContainer();
        }
        return DIContainer.instance;
    };
    /**
     * Registers a dependency with a specific name.
     *
     * @template T
     * @param {string} name - The name of the dependency.
     * @param {T} dependency - The dependency to register.
     * @returns {void}
     */
    DIContainer.prototype.register = function (name, dependency) {
        this.dependencies.set(name, dependency);
    };
    /**
     * Resolves a dependency by its name.
     * Throws an error if the dependency is not found.
     *
     * @template T
     * @param {string} name - The name of the dependency to resolve.
     * @returns {T} The resolved dependency.
     * @throws {Error} If the dependency is not found.
     */
    DIContainer.prototype.resolve = function (name) {
        var dependency = this.dependencies.get(name);
        if (!dependency) {
            throw new Error("Dependency ".concat(name, " not found"));
        }
        return dependency;
    };
    return DIContainer;
}());
exports.DIContainer = DIContainer;

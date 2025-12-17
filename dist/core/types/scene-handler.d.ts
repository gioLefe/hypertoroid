import { CanvasScene2D } from "../../models/canvas-scene";
/**
 * An interface representing a handler for managing scenes.
 *
 * @interface SceneHandler
 */
export interface SceneHandler {
    /**
     * Adds a new scene.
     *
     * @param {CanvasScene2D} scene - The scene to add.
     * @returns {void}
     */
    addScene(scene: CanvasScene2D): void;
    /**
     * Deletes a scene by its ID.
     *
     * @param {string} id - The ID of the scene to delete.
     * @returns {void}
     */
    deleteScene(id: string): void;
    /**
     * Gets the current scenes.
     *
     * @returns {CanvasScene2D[] | undefined} The array of current scenes, or undefined if no scenes are present.
     */
    getCurrentScenes(): CanvasScene2D[] | undefined;
    /**
     * Changes the current scene to a new scene specified by the given ID.
     *
     * @param {string} id - The ID of the new scene to transition to.
     * @param {boolean} cleanPreviousState - A flag indicating whether to clean up the previous scene state.
     * @param {string} [loadingSceneId] - The ID of an optional loading scene to display while the new scene is initializing.
     * @returns {void}
     */
    changeScene(id: string, cleanPreviousState: boolean, loadingSceneId?: string): Promise<void>;
}
//# sourceMappingURL=scene-handler.d.ts.map
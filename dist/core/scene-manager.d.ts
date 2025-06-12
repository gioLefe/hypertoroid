import { CanvasScene2D } from "../models/canvas-scene";
import { SceneHandler } from "./models/scene-handler";
export declare class SceneManager implements SceneHandler {
    private currentScenes;
    private scenes;
    addScene(scene: CanvasScene2D): void;
    deleteScene(id: string): void;
    getCurrentScenes(): CanvasScene2D[] | undefined;
    /**
     * Changes the current scene to a new scene specified by the given ID.
     *
     * This function initializes the new scene, optionally initializes a loading scene, and updates
     * the current scenes stack. It also handles cleaning up the previous scene state if specified.
     *
     * @param {string} id - The ID of the new scene to transition to.
     * @param {boolean} [cleanPreviousState=true] - A flag indicating whether to clean up the previous scene state.
     * @param {string} [loadingSceneId] - The ID of an optional loading scene to display while the new scene is initializing.
     * @returns {Promise<void>} A promise that resolves when the scene transition is complete.
     */
    changeScene(id: string, cleanPreviousState?: boolean, loadingSceneId?: string): Promise<void>;
    private getSceneIndex;
}

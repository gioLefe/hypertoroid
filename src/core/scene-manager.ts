import { CanvasScene2D } from "../models/canvas-scene";
import { SceneHandler } from "./models/scene-handler";

export class SceneManager implements SceneHandler {
  private currentScenes: CanvasScene2D[] = [];
  private scenes: CanvasScene2D[] = [];

  addScene(scene: CanvasScene2D): void {
    if (this.scenes.findIndex((s) => s.id === scene?.id) !== -1) {
      console.warn("Scene with same id already exists, provide a new id");
      return;
    }
    this.scenes.push(scene);
  }
  deleteScene(id: string): void {
    const i = this.getSceneIndex(id, this.currentScenes);
    this.currentScenes[i].clean();
    this.currentScenes = this.currentScenes.filter((_, index) => index !== i);
  }
  getCurrentScenes(): CanvasScene2D[] | undefined {
    return this.currentScenes;
  }

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
  async changeScene(
    id: string,
    cleanPreviousState: boolean = true,
    loadingSceneId?: string,
  ): Promise<void> {
    const lastCurrentSceneId =
      this.currentScenes[this.currentScenes.length - 1]?.id;
    const newScene = this.scenes[this.getSceneIndex(id, this.scenes)];

    if (loadingSceneId !== undefined) {
      const loadingSceneIndex = this.getSceneIndex(loadingSceneId, this.scenes);
      let loadingScene: CanvasScene2D = this.scenes[loadingSceneIndex];
      const loadingSceneInitPromises = loadingScene.init();
      if (loadingSceneInitPromises !== undefined) {
        await loadingSceneInitPromises;
      }
      this.currentScenes.push(loadingScene);
    }

    const newSceneInitPromises = newScene.init();

    if (newSceneInitPromises !== undefined) {
      await newSceneInitPromises;
    }
    if (cleanPreviousState && lastCurrentSceneId !== undefined) {
      this.deleteScene(lastCurrentSceneId);
    }
    if (loadingSceneId !== undefined) {
      this.deleteScene(loadingSceneId);
    }
    this.currentScenes.push(newScene);
  }

  private getSceneIndex(id: string, scenes: CanvasScene2D[]) {
    const loadingSceneIndex = scenes.findIndex((s) => s.id === id);
    if (loadingSceneIndex === -1) {
      throw new Error(`cannot find scene with id ${id}`);
    }
    return loadingSceneIndex;
  }
}

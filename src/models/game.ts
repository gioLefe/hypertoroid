import {
  AssetsManager,
  AudioController,
  DIContainer,
  SceneHandler,
  SceneManager,
  Settings,
} from "../core";
import { GAME_LOOP_TIME } from "../core/settings";
import { AssetsHandler } from "../core/types/assets-handler";
import { GameCycle } from "./game-cycle";

export const SCENE_MANAGER_DI = "SceneManager";
export const ASSETS_MANAGER_DI = "AsetsManager";

export abstract class Game implements GameCycle {
  protected canvas: HTMLCanvasElement;
  protected ctx: CanvasRenderingContext2D;

  private lastUpdateTime: DOMHighResTimeStamp = 0;
  private cycleStartTime: DOMHighResTimeStamp = 0;
  private cycleElapsed: DOMHighResTimeStamp = 0;
  private elapsedTime: DOMHighResTimeStamp = 0;
  private frameInterval: number = 0;
  private readonly fixedDeltaTime: number = 0;

  protected diContainer = DIContainer.getInstance();
  protected sceneManager: SceneHandler | undefined;
  protected assetsManager: AssetsHandler = new AssetsManager();
  protected settingsManager: Settings | undefined;

  private debug: { init: boolean; update: boolean; render: boolean } = {
    init: false,
    update: false,
    render: false,
  };

  constructor(
    canvas: HTMLCanvasElement,
    canvasWidth: number,
    canvasHeight: number,
    fps: number = 30,
  ) {
    if (canvas === null) {
      console.error(`%c *** Error, Canvas cannot be null`);
      throw Error();
    }

    this.canvas = canvas;
    this.canvas.width = canvasWidth;
    this.canvas.height = canvasHeight;

    const context = this.canvas.getContext("2d");
    if (context === null) {
      throw Error("ctx is null");
    }

    this.ctx = context;

    this.frameInterval = 1000 / fps;
    this.fixedDeltaTime = this.frameInterval / 1000;

    this.init();
  }
  clean(..._args: any) {
    throw new Error("Method not implemented.");
  }

  async init(): Promise<void> {
    if (this.debug.init) {
      console.log(`%c *** Init`, `background:#020; color:#adad00`);
    }

    this.sceneManager = new SceneManager();
    this.settingsManager = new Settings();
    this.diContainer.register<SceneHandler>(
      SCENE_MANAGER_DI,
      this.sceneManager,
    );
    this.diContainer.register<AssetsHandler>(
      ASSETS_MANAGER_DI,
      this.assetsManager,
    );
    this.diContainer.register<AudioController>(
      AudioController.AUDIO_CONTROLLER_DI,
      new AudioController(),
    );
    this.diContainer.register<Settings>(
      Settings.INSTANCE_ID,
      this.settingsManager,
    );
  }

  update(deltaTime: number): void {
    if (this.debug.update) {
      console.log(`%c *** Update`, `background:#020; color:#adad00`);
    }

    const currentScenes = this.sceneManager?.getCurrentScenes();
    if (!currentScenes) {
      console.warn("no scene to update");
      return;
    }

    for (let i = 0; i < currentScenes.length; i++) {
      const scene = currentScenes[i];
      try {
        scene.update(deltaTime);
      } catch (error) {
        console.error("Scene update failed:", error);
      }
    }
  }

  render(..._args: any): void {
    if (this.debug.render) {
      console.log(`%c *** Render`, `background:#020; color:#adad00`);
    }
    this.ctx?.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const currentScenes = this.sceneManager?.getCurrentScenes();
    if (currentScenes === undefined) {
      console.warn("no scene to render");
      return;
    }

    for (let i = 0; i < currentScenes.length; i++) {
      currentScenes[i].render(this.ctx);
    }
  }

  gameLoop = (timestamp: DOMHighResTimeStamp): void => {
    this.elapsedTime = timestamp - this.lastUpdateTime;

    // Update and render the game only if enough time has elapsed
    if (this.elapsedTime > this.frameInterval) {
      this.cycleStartTime = performance.now();

      this.update(this.fixedDeltaTime);
      this.render(this.ctx);

      // Account for frame timing drift
      this.lastUpdateTime = timestamp - (this.elapsedTime % this.frameInterval);

      this.cycleElapsed = performance.now() - this.cycleStartTime;

      if (this.cycleElapsed > 0) {
        this.settingsManager?.set<number>(GAME_LOOP_TIME, this.cycleElapsed);
      }
    }
    requestAnimationFrame(this.gameLoop);
  };

  start(): void {
    this.lastUpdateTime = performance.now();
    this.gameLoop(this.lastUpdateTime);
  }
}

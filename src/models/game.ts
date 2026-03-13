import { DIContainer, SceneHandler, SceneManager, Settings } from "../core";
import { GAME_LOOP_TIME } from "../core/settings";
import { CanvasScene2D } from "./canvas-scene";
import { GameCycle } from "./game-cycle";

export const SCENE_MANAGER_DI = "SceneManager";
export const ASSETS_MANAGER_DI = "AsetsManager";

export abstract class Game implements GameCycle {
  protected canvas: HTMLCanvasElement;
  protected ctx: CanvasRenderingContext2D;
  protected diContainer = DIContainer.getInstance();
  protected sceneManager: SceneHandler = new SceneManager();
  protected settingsManager: Settings = new Settings();

  private lastUpdateTime: DOMHighResTimeStamp = 0;
  private cycleStartTime: DOMHighResTimeStamp = 0;
  private cycleElapsed: DOMHighResTimeStamp = 0;
  private elapsedTime: DOMHighResTimeStamp = 0;
  private frameInterval: number = 0;
  private readonly fixedDeltaTime: number = 0;

  // cache
  private _currentScenes: CanvasScene2D[] | undefined;

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
    if (this.debug.init)
      console.log(`%c *** Init`, `background:#020; color:#adad00`);

    this.diContainer.register<SceneHandler>(
      SCENE_MANAGER_DI,
      this.sceneManager,
    );

    // TODO: fix
    // this.diContainer.register<AudioController>(
    //   AudioController.AUDIO_CONTROLLER_DI,
    //   new AudioController(),
    // );
    this.diContainer.register<Settings>(
      Settings.INSTANCE_ID,
      this.settingsManager,
    );
  }

  update(deltaTime: number): void {
    if (this.debug.update)
      console.log(`%c *** Update`, `background:#020; color:#adad00`);

    this._currentScenes = this.sceneManager?.getCurrentScenes();
    if (!this._currentScenes) {
      console.warn("no scene to update");
      return;
    }

    for (let i = 0; i < this._currentScenes.length; i++) {
      try {
        this._currentScenes[i].update(deltaTime);
      } catch (error) {
        console.error("Scene update failed:", error);
      }
    }
  }

  async render(
    _ctx: CanvasRenderingContext2D,
    deltaTime: number,
    ..._args: any
  ): Promise<void> {
    if (this.debug.render)
      console.log(`%c *** Render`, `background:#020; color:#adad00`);

    this.ctx?.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this._currentScenes = this.sceneManager?.getCurrentScenes();
    if (this._currentScenes === undefined) {
      console.warn("no scene to render");
      return;
    }

    for (let i = 0; i < this._currentScenes.length; i++) {
      await this._currentScenes[i].render(this.ctx, deltaTime);
    }
  }

  gameLoop = async (timestamp: DOMHighResTimeStamp): Promise<void> => {
    this.elapsedTime = timestamp - this.lastUpdateTime;
    this.lastUpdateTime = timestamp - (this.elapsedTime % this.frameInterval);

    // Update and render the game only if enough time has elapsed
    if (this.elapsedTime > this.frameInterval) {
      this.cycleStartTime = performance.now();

      try {
        this.update(this.fixedDeltaTime);
        await this.render(this.ctx, this.elapsedTime);
      } catch (err) {
        console.error(err);
      }

      // Account for frame timing drift
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

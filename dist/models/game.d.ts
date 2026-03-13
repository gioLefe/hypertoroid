import { DIContainer, SceneHandler, Settings } from "../core";
import { GameCycle } from "./game-cycle";
export declare const SCENE_MANAGER_DI = "SceneManager";
export declare const ASSETS_MANAGER_DI = "AsetsManager";
export declare abstract class Game implements GameCycle {
    protected canvas: HTMLCanvasElement;
    protected ctx: CanvasRenderingContext2D;
    protected diContainer: DIContainer;
    protected sceneManager: SceneHandler;
    protected settingsManager: Settings;
    private lastUpdateTime;
    private cycleStartTime;
    private cycleElapsed;
    private elapsedTime;
    private frameInterval;
    private readonly fixedDeltaTime;
    private _currentScenes;
    private debug;
    constructor(canvas: HTMLCanvasElement, canvasWidth: number, canvasHeight: number, fps?: number);
    clean(..._args: any): void;
    init(): Promise<void>;
    update(deltaTime: number): void;
    render(_ctx: CanvasRenderingContext2D, deltaTime: number, ..._args: any): Promise<void>;
    gameLoop: (timestamp: DOMHighResTimeStamp) => Promise<void>;
    start(): void;
}
//# sourceMappingURL=game.d.ts.map
import { SceneHandler, Settings } from "../core";
import { AssetsHandler } from "../core/models/assets-handler";
import { GameCycle } from "./game-cycle";
export declare const SCENE_MANAGER_DI = "SceneManager";
export declare const ASSETS_MANAGER_DI = "AsetsManager";
export declare abstract class Game implements GameCycle {
    protected canvas: HTMLCanvasElement;
    protected ctx: CanvasRenderingContext2D;
    private lastUpdateTime;
    private deltaTime;
    private frameInterval;
    private diContainer;
    protected sceneManager: SceneHandler | undefined;
    protected assetsManager: AssetsHandler | undefined;
    protected settingsManager: Settings | undefined;
    private debug;
    constructor(canvas: HTMLCanvasElement, canvasWidth: number, canvasHeight: number, fps?: number);
    clean(..._args: any): void;
    init(): void;
    update(deltaTime: number): void;
    render(..._args: any): void;
    gameLoop: (timestamp: number) => void;
    start(): void;
}

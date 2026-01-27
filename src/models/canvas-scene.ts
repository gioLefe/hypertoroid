import { GameCycle } from "../models/game-cycle";

export interface CanvasScene2D extends GameCycle {
  id: string;
  canvas: HTMLCanvasElement | undefined;
  ctx: CanvasRenderingContext2D;

  resizeGameViewport: (width: number, height: number) => void;
}

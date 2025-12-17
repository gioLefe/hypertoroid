import { GameCycle } from "./game-cycle";
export interface Sprite extends GameCycle {
    ctx: CanvasRenderingContext2D;
    rotate(radiants: number): void;
    getDistanceFromCenterToSide(): number;
}
//# sourceMappingURL=sprite.d.ts.map
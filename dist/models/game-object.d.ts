import { Vec2 } from "./vec";
import { BoundingBox } from "./bbox";
import { GameCycle } from "./game-cycle";
import { GraphicContext } from "./graphic-context";
export declare abstract class GameObject<T = GraphicContext> implements GameCycle {
    id?: string;
    ctx: T;
    protected width: number;
    protected height: number;
    protected position: Vec2<number>;
    protected bbox: BoundingBox<number>;
    protected direction: number;
    constructor(ctx: T);
    init(..._args: any): void;
    update(_deltaTime: number, ..._args: any): void;
    render(..._args: any): void;
    clean(..._args: any): void;
    setPosition(value: Vec2<number>): void;
    getPosition(): Vec2<number>;
    getSize(): Vec2<number> | undefined;
    getDirection(): number;
    setDirection(value: number): void;
    getWidth(): number;
    setWidth(width: number): void;
    getHeight(): number;
    setHeight(height: number): void;
}

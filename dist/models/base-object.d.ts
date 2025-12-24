import { BoundingBox } from "./bbox";
import { GameCycle } from "./game-cycle";
import { Size2 } from "./size";
import { Vec2 } from "./vec";
export declare abstract class BaseObject implements GameCycle {
    _x: number;
    _y: number;
    width: number;
    height: number;
    canvas: HTMLCanvasElement | null;
    bbox: BoundingBox<number>;
    elements: BaseObject[];
    constructor();
    init(..._args: any): Promise<any>;
    update(_deltaTime: number, ..._args: any): any;
    render(..._args: any): void;
    clean(..._args: any): void;
    set x(v: number);
    get x(): number;
    set y(v: number);
    get y(): number;
    getPosition(): Vec2<number>;
    getBBox: () => BoundingBox<number> | undefined;
    calcBBox(): void;
    getSize(): Size2 | undefined;
    getWidth(): number;
    setWidth(width: number): void;
    getHeight(): number;
    setHeight(height: number): void;
}
export declare class BaseObjectClass extends BaseObject {
}
//# sourceMappingURL=base-object.d.ts.map
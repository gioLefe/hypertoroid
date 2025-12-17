import { BoundingBox, Vec2 } from "../";
export declare class QuadTree {
    readonly QT_NODE_CAPACITY: number | undefined;
    private boundary;
    private points;
    northWest: QuadTree | undefined;
    northEast: QuadTree | undefined;
    southWest: QuadTree | undefined;
    southEast: QuadTree | undefined;
    constructor(boundary: BoundingBox<number>);
    insert(p: Vec2<number>): void;
    subdivide(): void;
    queryRange(_range: BoundingBox<number>): Vec2<number>[] | undefined;
}
//# sourceMappingURL=quad-tree.d.ts.map
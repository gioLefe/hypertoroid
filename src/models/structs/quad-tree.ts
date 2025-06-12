// TODO
import { BoundingBox, Vec2 } from "../";

export class QuadTree {
    // Arbitrary constant to indicate how many elements can be stored in this quad tree node
    readonly QT_NODE_CAPACITY: number | undefined;

    // Axis-aligned bounding box stored as a center with half-dimensions
    // to represent the boundaries of this quad tree
    private boundary: BoundingBox<number>;

    // Points in this quad tree node
    private points: Vec2<number>[] = [];

    // Children
    northWest: QuadTree | undefined;
    northEast: QuadTree | undefined;
    southWest: QuadTree | undefined;
    southEast: QuadTree | undefined;

    // Methods
    constructor(boundary: BoundingBox<number>) {
        this.boundary = boundary;
    }

    insert(p: Vec2<number>): void {
        this.points.push(p);
    }

    subdivide(): void {
        const xLength = (this.boundary.se.x - this.boundary.nw.x) / 2;
        const yLength = (this.boundary.nw.y - this.boundary.se.y) / 2;

        // create four children that fully divide this quad into four quads of equal area
        this.northWest = new QuadTree({
            nw: this.boundary.nw,
            se: { x: this.boundary.nw.x + xLength, y: this.boundary.nw.y + yLength },
        });
        this.northEast = new QuadTree({
            nw: { x: this.boundary.nw.x + xLength, y: this.boundary.nw.y },
            se: { x: this.boundary.se.x, y: this.boundary.nw.y + yLength },
        });
        this.southWest = new QuadTree({
            nw: { x: this.boundary.nw.x, y: this.boundary.nw.y + yLength },
            se: { x: this.boundary.nw.x + xLength, y: this.boundary.se.y },
        });
        this.southEast = new QuadTree({
            nw: { x: this.boundary.nw.x + xLength, y: this.boundary.nw.y + yLength },
            se: this.boundary.se
        });
    }

    queryRange(_range: BoundingBox<number>): Vec2<number>[] | undefined {
        return undefined
    }
}

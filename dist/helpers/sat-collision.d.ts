import { Polygon, Vec2 } from "../models";
/** A polygon with world coordinates information */
export type WorldPolygon = Polygon & {
    worldCoordinates: Vec2<number>;
};
export declare function satCollision(polygonA: WorldPolygon, polygonB: WorldPolygon): boolean;
//# sourceMappingURL=sat-collision.d.ts.map
import { BoundingBox } from "../models";
import { Polygon } from "../models/polygon";
import { Vec2 } from "../models/vec";
import { WorldPolygon } from "./sat-collision";
export interface RenderingPolygonParams extends Partial<CanvasFillStrokeStyles> {
    strokeColor?: string;
    selectedStrokeColor?: string;
    collisionStrokeColor?: string;
    worldCoordinates: Vec2<number>;
}
export declare function renderPolygon(polygon: Polygon, ctx: CanvasRenderingContext2D, options?: RenderingPolygonParams): void;
export declare function createTriangle(height: number, color?: string): Polygon | null;
export declare function createSquare(sideLength: number, color?: string): Polygon | null;
export declare function createPolygon(defaults?: Partial<Polygon>): Polygon;
export declare function updatePolygonShape(polygon: Polygon): Polygon;
export declare function rotatePolygon(polygon: Polygon, radiants: number): Polygon;
export declare function calculateNormals(points: Vec2<number>[]): Vec2<number>[];
export declare function calculateEdgesPerpendiculars(points: Vec2<number>[]): Vec2<number>[];
export declare function getBBoxRect(buondingBox: BoundingBox<number>, defaults?: Partial<Polygon>): Polygon;
export declare function getWorldPolygon(polygon: Polygon, position: Vec2<number>): WorldPolygon;
export declare function printWorldPolygonInfo(polygon: WorldPolygon, label?: string): void;

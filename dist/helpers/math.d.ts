import { MinMax } from "../models/min-max";
import { Vec2 } from "../models/vec";
export declare function getVectorPerpendicular(axis: Vec2<number>): Vec2<number> | null;
/** Checks for overlap between tw intervalso */
export declare function intervalsOverlap(intervalA: MinMax, intervalB: MinMax): boolean;
/**
 * Returns a 'number' with decimals up to the precision
 * @param num
 * @param precision
 * @returns
 */
export declare function toPrecisionNumber(num: number, precision: number): number;
export declare function diffVectors(vec1: Vec2<number>, vec2: Vec2<number>): number;
export declare function createVector(direction: number, distance: number, origin?: Vec2<number>): Vec2<number>;
/**
 * Calculates the dot product of two 2-dimensional vectors.
 *
 * @param {Vec2<number>} a - The first vector.
 * @param {Vec2<number>} b - The second vector.
 * @returns {number} The dot product of vectors a and b.
 *
 * @example
 * // Define two vectors
 * const vectorA = { x: 1, y: 2 };
 * const vectorB = { x: 3, y: 4 };
 *
 * // Calculate the dot product
 * const result = dotProduct(vectorA, vectorB);
 * // result is 11 (1*3 + 2*4)
 */
export declare function dotProduct(a: Vec2<number>, b: Vec2<number>): number;
export declare function magnitude(v: Vec2<number>): number;
/** Project a polygon onto an axis */
export declare function projectPolygonToAxis(vertices: Vec2<number>[], axis: Vec2<number>): MinMax;
export declare function angleBetween(v1: Vec2<number>, v2: Vec2<number>, tolerance?: number): number;
export declare function randomIntFromInterval(min: number, max: number): number;

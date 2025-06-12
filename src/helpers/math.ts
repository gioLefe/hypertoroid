import { MinMax } from "../models/min-max";
import { Vec2 } from "../models/vec";

export function getVectorPerpendicular(
  axis: Vec2<number>,
): Vec2<number> | null {
  if (!axis) {
    console.warn(`%c *** axis is null`, `background:#222; color: #bada55`);
    return null;
  }

  return { x: -axis.y, y: axis.x };
}

/** Checks for overlap between tw intervalso */
export function intervalsOverlap(
  intervalA: MinMax,
  intervalB: MinMax,
): boolean {
  return !(intervalA.max < intervalB.min || intervalB.max < intervalA.min);
}

/**
 * Returns a 'number' with decimals up to the precision
 * @param num
 * @param precision
 * @returns
 */
export function toPrecisionNumber(num: number, precision: number): number {
  return parseFloat(num.toPrecision(precision));
}

export function diffVectors(vec1: Vec2<number>, vec2: Vec2<number>): number {
  // Use Pitagora theorem to calculate the vectors
  const vec1Length = Math.sqrt(Math.pow(vec1.x, 2) + Math.pow(vec1.y, 2));
  const vec2Length = Math.sqrt(Math.pow(vec2.x, 2) + Math.pow(vec2.y, 2));
  return vec1Length - vec2Length;
}

export function createVector(
  direction: number,
  distance: number,
  origin: Vec2<number> = { x: 0, y: 0 },
): Vec2<number> {
  return {
    x: Math.cos(direction) * distance + origin.x,
    y: Math.sin(direction) * distance + origin.y,
  };
}

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
export function dotProduct(a: Vec2<number>, b: Vec2<number>): number {
  return a.x * b.x + a.y * b.y;
}

export function magnitude(v: Vec2<number>): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

/** Project a polygon onto an axis */
export function projectPolygonToAxis(
  vertices: Vec2<number>[],
  axis: Vec2<number>,
): MinMax {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;

  // Loop through each vertex of the polygon
  for (const vertice of vertices) {
    // Project the vertex onto the axis using the dot product
    const projection = dotProduct(vertice, axis);

    // Update the minimum and maximum projection values
    if (projection < min) {
      min = projection;
    }
    if (projection > max) {
      max = projection;
    }
  }

  // Return the min and max projections
  return { min, max };
}

export function angleBetween(
  v1: Vec2<number>,
  v2: Vec2<number>,
  tolerance: number = 1e-6,
): number {
  const dot = dotProduct(v1, v2);
  const magProduct = magnitude(v1) * magnitude(v2);
  if (magProduct === 0) return 0; // To handle division by zero

  const cosTheta = dot / magProduct;
  const cosThetaClamped = Math.min(1, Math.max(-1, cosTheta)); // Ensure cosTheta is within [-1, 1]

  const theta = Math.acos(cosThetaClamped);

  // Calculate the cross product to determine the sign of the angle
  const crossProduct = v1.x * v2.y - v1.y * v2.x;
  const angle = crossProduct >= 0 ? theta : -theta;

  // If the absolute difference between the angle and zero is within the tolerance, consider it as zero
  if (Math.abs(angle) <= tolerance) {
    return 0;
  }

  return angle;
}

export function randomIntFromInterval(min: number, max: number): number {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

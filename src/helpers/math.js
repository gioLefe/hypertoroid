"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVectorPerpendicular = getVectorPerpendicular;
exports.intervalsOverlap = intervalsOverlap;
exports.toPrecisionNumber = toPrecisionNumber;
exports.diffVectors = diffVectors;
exports.createVector = createVector;
exports.dotProduct = dotProduct;
exports.magnitude = magnitude;
exports.projectPolygonToAxis = projectPolygonToAxis;
exports.angleBetween = angleBetween;
exports.randomIntFromInterval = randomIntFromInterval;
function getVectorPerpendicular(axis) {
    if (!axis) {
        console.warn("%c *** axis is null", "background:#222; color: #bada55");
        return null;
    }
    return { x: -axis.y, y: axis.x };
}
/** Checks for overlap between tw intervalso */
function intervalsOverlap(intervalA, intervalB) {
    return !(intervalA.max < intervalB.min || intervalB.max < intervalA.min);
}
/**
 * Returns a 'number' with decimals up to the precision
 * @param num
 * @param precision
 * @returns
 */
function toPrecisionNumber(num, precision) {
    return parseFloat(num.toPrecision(precision));
}
function diffVectors(vec1, vec2) {
    // Use Pitagora theorem to calculate the vectors
    var vec1Length = Math.sqrt(Math.pow(vec1.x, 2) + Math.pow(vec1.y, 2));
    var vec2Length = Math.sqrt(Math.pow(vec2.x, 2) + Math.pow(vec2.y, 2));
    return vec1Length - vec2Length;
}
function createVector(direction, distance, origin) {
    if (origin === void 0) { origin = { x: 0, y: 0 }; }
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
function dotProduct(a, b) {
    return a.x * b.x + a.y * b.y;
}
function magnitude(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y);
}
/** Project a polygon onto an axis */
function projectPolygonToAxis(vertices, axis) {
    var min = Number.POSITIVE_INFINITY;
    var max = Number.NEGATIVE_INFINITY;
    // Loop through each vertex of the polygon
    for (var _i = 0, vertices_1 = vertices; _i < vertices_1.length; _i++) {
        var vertice = vertices_1[_i];
        // Project the vertex onto the axis using the dot product
        var projection = dotProduct(vertice, axis);
        // Update the minimum and maximum projection values
        if (projection < min) {
            min = projection;
        }
        if (projection > max) {
            max = projection;
        }
    }
    // Return the min and max projections
    return { min: min, max: max };
}
function angleBetween(v1, v2, tolerance) {
    if (tolerance === void 0) { tolerance = 1e-6; }
    var dot = dotProduct(v1, v2);
    var magProduct = magnitude(v1) * magnitude(v2);
    if (magProduct === 0)
        return 0; // To handle division by zero
    var cosTheta = dot / magProduct;
    var cosThetaClamped = Math.min(1, Math.max(-1, cosTheta)); // Ensure cosTheta is within [-1, 1]
    var theta = Math.acos(cosThetaClamped);
    // Calculate the cross product to determine the sign of the angle
    var crossProduct = v1.x * v2.y - v1.y * v2.x;
    var angle = crossProduct >= 0 ? theta : -theta;
    // If the absolute difference between the angle and zero is within the tolerance, consider it as zero
    if (Math.abs(angle) <= tolerance) {
        return 0;
    }
    return angle;
}
function randomIntFromInterval(min, max) {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
}

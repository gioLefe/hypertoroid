"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.satCollision = satCollision;
var _1 = require(".");
function satCollision(polygonA, polygonB) {
    if (polygonA.normals === undefined) {
        return false;
    }
    for (var z = 0; z < polygonA.normals.length; z++) {
        // 1. Transform polygons points to space coordinates
        var polAVertices = polygonA.points.map(function (point) { return ({
            x: point.x + polygonA.worldCoordinates.x,
            y: point.y + polygonA.worldCoordinates.y,
        }); });
        var polBVertices = polygonB.points.map(function (point) { return ({
            x: point.x + polygonB.worldCoordinates.x,
            y: point.y + polygonB.worldCoordinates.y,
        }); });
        // 2. Project vertices onto the perpendiculars
        var polAProjection = (0, _1.projectPolygonToAxis)(polAVertices, polygonA.normals[z]);
        var polBProjection = (0, _1.projectPolygonToAxis)(polBVertices, polygonA.normals[z]);
        if (!(0, _1.intervalsOverlap)(polAProjection, polBProjection)) {
            //  if at least one perpendicular has no overlaps, they are separated
            return false;
        }
    }
    // All normals have been checked and all projections overlap, hence the two polygons collide
    return true;
}

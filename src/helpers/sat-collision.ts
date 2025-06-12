import { intervalsOverlap, projectPolygonToAxis } from ".";
import { Polygon, Vec2 } from "../models";

/** A polygon with world coordinates information */
export type WorldPolygon = Polygon & {
  worldCoordinates: Vec2<number>;
};

export function satCollision(
  polygonA: WorldPolygon,
  polygonB: WorldPolygon,
): boolean {
  if (polygonA.normals === undefined) {
    return false;
  }
  for (let z = 0; z < polygonA.normals.length; z++) {
    // 1. Transform polygons points to space coordinates
    const polAVertices = polygonA.points.map((point) => ({
      x: point.x + polygonA.worldCoordinates.x,
      y: point.y + polygonA.worldCoordinates.y,
    }));
    const polBVertices = polygonB.points.map((point) => ({
      x: point.x + polygonB.worldCoordinates.x,
      y: point.y + polygonB.worldCoordinates.y,
    }));

    // 2. Project vertices onto the perpendiculars
    const polAProjection = projectPolygonToAxis(
      polAVertices,
      polygonA.normals[z],
    );
    const polBProjection = projectPolygonToAxis(
      polBVertices,
      polygonA.normals[z],
    );

    if (!intervalsOverlap(polAProjection, polBProjection)) {
      //  if at least one perpendicular has no overlaps, they are separated
      return false;
    }
  }
  // All normals have been checked and all projections overlap, hence the two polygons collide
  return true;
}

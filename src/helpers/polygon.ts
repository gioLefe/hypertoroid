import { BoundingBox } from "../models";
import { Polygon } from "../models/polygon";
import { Vec2 } from "../models/vec";
import { getVectorPerpendicular } from "./math";
import { WorldPolygon } from "./sat-collision";

export interface RenderingPolygonParams
  extends Partial<CanvasFillStrokeStyles> {
  strokeColor?: string;
  selectedStrokeColor?: string;
  collisionStrokeColor?: string;
  worldCoordinates: Vec2<number>;
}

const DEFAULT_POLYGON_PARAMS: RenderingPolygonParams = {
  strokeColor: "#000000",
  selectedStrokeColor: "#aa0000",
  collisionStrokeColor: "#00a4FF",
  worldCoordinates: { x: 0, y: 0 },
};

export function renderPolygon(
  polygon: Polygon,
  ctx: CanvasRenderingContext2D,
  options: RenderingPolygonParams = DEFAULT_POLYGON_PARAMS,
): void {
  if (!polygon) {
    console.error("Polygon is null");
    return;
  }
  if (polygon.points.length < 2) {
    console.warn("Too few points , can't draw polygon ");
    return;
  }

  // Move to the first point, calculated as the origin summed to the first point coordinates
  const origin: Vec2<number> = {
    x: options.worldCoordinates.x + polygon.points[0].x,
    y: options.worldCoordinates.y + +polygon.points[0].y,
  };
  ctx.moveTo(origin.x, origin.y);
  ctx.strokeStyle = options.strokeColor ?? DEFAULT_POLYGON_PARAMS.strokeColor!;
  ctx.lineWidth = 1;

  if (polygon.color) {
    ctx.fillStyle = polygon.color;
  }

  ctx.beginPath();
  for (let i = 1; i < polygon.points.length; i++) {
    ctx.lineTo(
      options.worldCoordinates.x + polygon.points[i].x,
      options.worldCoordinates.y + +polygon.points[i].y,
    );
  }
  ctx.lineTo(origin.x, origin.y);
  ctx.closePath();
  if (polygon.fill) {
    ctx.fill();
  }
  if (polygon.outline) {
    ctx.stroke();
  }
}

export function createTriangle(
  height: number,
  color: string = "#ffb3ba",
): Polygon | null {
  if (height === 0) {
    console.warn("height cannot be 0");
    return null;
  }
  return {
    color,
    fill: true,
    points: [
      { x: -height / 2, y: 0 },
      { x: height / 2, y: height / 2 },
      { x: height / 2, y: -height / 2 },
    ],
    sideLength: (2 * height) / Math.sqrt(3),
  } as Polygon;
}

export function createSquare(
  sideLength: number,
  color: string = "#ffb3ba",
): Polygon | null {
  if (sideLength === 0) {
    console.warn("sideLength cannot be 0");
    return null;
  }
  return {
    color,
    fill: true,
    points: [
      { x: -sideLength / 2, y: sideLength / 2 },
      { x: sideLength / 2, y: sideLength / 2 },
      { x: sideLength / 2, y: -sideLength / 2 },
      { x: -sideLength / 2, y: -sideLength / 2 },
    ],
    sideLength,
  } as Polygon;
}

export function createPolygon(defaults: Partial<Polygon> = {}): Polygon {
  return {
    color: defaults.color ?? "#ffb3ba",
    fill: defaults.fill ?? true,
    outline: defaults.outline ?? true,
    numSides: defaults.numSides ?? 3,
    points: generatePolygonPoints(
      defaults.numSides ?? 3,
      defaults.sideLength ?? 10,
    ),
    sideLength: defaults.sideLength ?? 22,
  } as Polygon;
}

export function updatePolygonShape(polygon: Polygon) {
  return {
    ...polygon,
    points: generatePolygonPoints(polygon.numSides, polygon.sideLength),
  } as Polygon;
}

export function rotatePolygon(polygon: Polygon, radiants: number): Polygon {
  return {
    ...polygon,
    points: generatePolygonPoints(
      polygon.numSides,
      polygon.sideLength,
      radiants,
    ),
  };
}

export function calculateNormals(points: Vec2<number>[]): Vec2<number>[] {
  return calculateEdgesPerpendiculars(points).reduce(
    (accumulation: Vec2<number>[], current: Vec2<number>) => {
      return accumulation.some(
        (n) =>
          Math.abs(n.y) === Math.abs(current.y) &&
          Math.abs(n.x) === Math.abs(current.x),
      )
        ? accumulation
        : accumulation.concat(current);
    },
    [],
  );
}

export function calculateEdgesPerpendiculars(
  points: Vec2<number>[],
): Vec2<number>[] {
  const perpendiculars: Vec2<number>[] = [];

  const numPoints = points.length;

  for (let i = 0; i < numPoints; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % numPoints]; // Next point (wraps around to the first point)

    // Calculate edge vector
    const edge: Vec2<number> = {
      x: p2.x - p1.x,
      y: p2.y - p1.y,
    };

    // Calculate perpendicular axis by swapping x and y and negating one
    const perpendicularAxis = getVectorPerpendicular(edge);
    if (perpendicularAxis === null) {
      console.warn(
        `%c *** Cannot calculate perpendicular for edge`,
        `background:#222; color: #FFda55`,
        edge,
      );
      continue;
    }

    // Normalize the perpendicular axis
    const length = Math.sqrt(
      perpendicularAxis.x * perpendicularAxis.x +
        perpendicularAxis.y * perpendicularAxis.y,
    );
    perpendicularAxis.x /= length;
    perpendicularAxis.y /= length;

    perpendiculars.push(perpendicularAxis);
  }

  return perpendiculars;
}

export function getBBoxRect(
  buondingBox: BoundingBox<number>,
  defaults: Partial<Polygon> = {},
): Polygon {
  return {
    color: defaults.color ?? "#ffb3ba",
    fill: defaults.fill ?? true,
    outline: defaults.outline ?? true,
    numSides: 4,
    points: [
      { x: buondingBox.nw.x, y: buondingBox.nw.y },
      { x: buondingBox.se.x, y: buondingBox.nw.y },
      { x: buondingBox.se.x, y: buondingBox.se.y },
      { x: buondingBox.nw.x, y: buondingBox.se.y },
    ],
  } as Polygon;
}

export function getWorldPolygon(
  polygon: Polygon,
  position: Vec2<number>,
): WorldPolygon {
  return {
    ...polygon,
    worldCoordinates: { x: position.x, y: position.y },
  };
}

export function printWorldPolygonInfo(
  polygon: WorldPolygon,
  label = "polygon",
) {
  console.log(
    `${label}: sides: ${polygon.numSides} | center: x:${polygon?.worldCoordinates.x.toFixed(1)}, y:${polygon?.worldCoordinates.y.toFixed(1)} | points: ${polygon.points.forEach((p, i) => `p[${i}]-${p.x}:${p.y},`)} | normals: ${polygon.normals?.forEach((n, i) => `n[${i}]-${n.x}:${n.y},`)}`,
  );
}

function generatePolygonPoints(
  numSides: number,
  sideLength: number,
  radiants?: number,
): Vec2<number>[] {
  const points: Vec2<number>[] = [];
  let fullCircle = 2 * Math.PI;
  const angleIncrement = fullCircle / numSides;

  for (let i = 0; i < numSides; i++) {
    let angle = i * angleIncrement;
    if (radiants) {
      angle = angle + radiants;
    }

    const x = sideLength * Math.cos(angle);
    const y = sideLength * Math.sin(angle);
    points.push({ x, y });
  }

  return points;
}

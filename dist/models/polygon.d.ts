import { Vec2 } from "./vec";
export type Polygon = {
    points: Vec2<number>[];
    numSides: number;
    sideLength: number;
    color?: string;
    fill?: boolean;
    outline?: boolean;
    normals?: Vec2<number>[];
};
//# sourceMappingURL=polygon.d.ts.map
import { Vec2 } from "./vec";

export type UnitVector = {
  position: Vec2<number>;
  direction: number;
};

export function pivotComparator(p1: UnitVector, p2: UnitVector) {
  return (
    p1.position.x === p2.position.x &&
    p1.position.y === p2.position.y &&
    p1.direction === p2.direction
  );
}

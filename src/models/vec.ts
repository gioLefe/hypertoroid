export type Vec2<T> = {
  x: T;
  y: T;
};

export type Vec3<T> = Vec2<T> & {
  z: T;
};

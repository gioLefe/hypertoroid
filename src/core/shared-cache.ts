export interface SharedCache<T> {
  data: T | null;
  dirty: boolean;
  invalidate(): void;
}

export function createSharedCache<T>(data: T): SharedCache<T> {
  return {
    data,
    dirty: true,
    invalidate() {
      this.dirty = true;
    },
  };
}

export interface SharedCache<T> {
    data: T | null;
    dirty: boolean;
    invalidate(): void;
}
export declare function createSharedCache<T>(data: T): SharedCache<T>;
//# sourceMappingURL=shared-cache.d.ts.map
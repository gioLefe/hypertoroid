export type Tag = string;
export type ImageAsset = {
    source: HTMLImageElement;
    tags: Tag[];
};
export type SoundAsset = {
    source: ArrayBuffer;
    tags: Tag[];
};
export type GenericFileAsset<T = any> = {
    source: T;
    tags: Tag[];
};
//# sourceMappingURL=asset.d.ts.map
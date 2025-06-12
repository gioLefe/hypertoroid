export type Tag = string;
export type ImageAsset = {
    source: HTMLImageElement;
    tags: Tag[];
};
export type SoundAsset = {
    source: ArrayBuffer;
    tags: Tag[];
};

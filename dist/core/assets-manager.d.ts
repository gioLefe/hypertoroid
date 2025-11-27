import { ImageAsset, GenericFileAsset, SoundAsset, Tag } from "../models/asset";
import { AssetsHandler } from "./models/assets-handler";
import { GameAssetRequest } from "./models/game-asset";
export declare class AssetsManager implements AssetsHandler {
    assets: Map<string, ImageAsset | SoundAsset | GenericFileAsset>;
    add(assetRequests: GameAssetRequest[]): Promise<void>[];
    find<T = ImageAsset | SoundAsset | GenericFileAsset>(id: string): T | undefined;
    delete(id: string): void;
    addTag(id: string, tag: Tag): void;
    update<T extends ImageAsset | SoundAsset | GenericFileAsset>(id: string, asset: T): void;
    updateId(oldId: string, newId: string): void;
    /**
     * Get all pixel data from an image asset
     * @param assetId - The ID of the image asset
     * @returns ImageData object or null if asset not found or not an image
     */
    getImageData(assetId: string): ImageData | null;
    private createObjectPromise;
}

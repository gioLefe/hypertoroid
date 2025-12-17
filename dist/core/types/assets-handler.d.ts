import { ImageAsset, GenericFileAsset, SoundAsset, Tag } from "../../models";
import { GameAssetRequest } from "./game-asset";
export interface AssetsHandler {
    assets: Map<string, ImageAsset | GenericFileAsset | SoundAsset> | undefined;
    add<T extends GameAssetRequest>(assetRequests: T[]): Promise<void>[];
    find<T = ImageAsset | GenericFileAsset | SoundAsset>(id: string): T | undefined;
    delete(id: string): void;
    addTag(id: string, tag: Tag): void;
    update<T extends ImageAsset | SoundAsset | GenericFileAsset>(id: string, asset: T): void;
    updateId(oldId: string, newId: string): void;
    getImageData(assetId: string): ImageData | null;
}
//# sourceMappingURL=assets-handler.d.ts.map
import { ImageAsset, SoundAsset, Tag } from "../../models";
import { GameAsset } from "./game-asset";
export interface AssetsHandler {
    assets: Map<string, ImageAsset | SoundAsset> | undefined;
    add(assetRequests: GameAsset[]): Promise<void>[];
    find<T extends ImageAsset | SoundAsset>(id: string): T | undefined;
    delete(id: string): void;
    addTag(id: string, tag: Tag): void;
}

import { ImageAsset, SoundAsset, Tag } from "../models/asset";
import { AssetsHandler } from "./models/assets-handler";
import { GameAsset } from "./models/game-asset";
export declare class AssetsManager implements AssetsHandler {
    assets: Map<string, ImageAsset | SoundAsset>;
    add(assetRequests: GameAsset[]): Promise<void>[];
    find<T>(id: string): T | undefined;
    delete(id: string): void;
    addTag(id: string, tag: Tag): void;
    private createObjectPromise;
}

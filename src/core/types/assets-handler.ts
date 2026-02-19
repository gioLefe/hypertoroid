import { GenericFileAsset, ImageAsset, SoundAsset, Tag } from "../../models";
import { GameAssetRequest } from "./game-asset";

export interface AssetsHandler {
  assets: Map<string, ImageAsset | GenericFileAsset | SoundAsset> | undefined;

  add<T extends GameAssetRequest>(
    assetRequests: T[],
  ): Promise<GameAssetRequest>[];
  find<T = ImageAsset | GenericFileAsset | SoundAsset>(
    id: string,
  ): T | undefined;
  delete(id: string): void;
  addTag(id: string, tag: Tag): void;
  update<T extends ImageAsset | SoundAsset | GenericFileAsset>(
    id: string,
    asset: T,
  ): void;
  updateId(oldId: string, newId: string): void;

  ensureLoaded<
    T extends ImageAsset | SoundAsset | GenericFileAsset,
    K extends GameAssetRequest,
  >(
    requests: K[],
  ): Promise<T[]>;

  fetchAsync(
    assetManagerHandle: this,
    assetRequest: GameAssetRequest,
  ): Promise<GameAssetRequest>;
}

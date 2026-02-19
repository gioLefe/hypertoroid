import { ImageAsset, GenericFileAsset, SoundAsset, Tag } from "../models/asset";
import { AssetsHandler } from "./types/assets-handler";
import { GameAssetRequest } from "./types/game-asset";

export class AssetsManager implements AssetsHandler {
  assets: Map<string, ImageAsset | SoundAsset | GenericFileAsset> = new Map();

  add(assetRequests: GameAssetRequest[]): Promise<GameAssetRequest>[] {
    return assetRequests.map((request) => this.fetchAsync(this, request));
  }

  find<T = ImageAsset | SoundAsset | GenericFileAsset>(
    id: string,
  ): T | undefined {
    return this.assets.get(id) as T;
  }
  delete(id: string): void {
    this.assets.delete(id);
  }
  addTag(id: string, tag: Tag): void {
    const a = this.assets.get(id);
    if (a === undefined) {
      console.warn(`cannot find asset ${id}`);
      return;
    }
    a.tags.push(tag);
    this.assets.set(id, a);
  }
  update<T extends ImageAsset | SoundAsset | GenericFileAsset>(
    id: string,
    asset: T,
  ): void {
    if (this.assets.has(id) === false) {
      console.warn(`Cannot find asset ${id}`);
      return;
    }
    this.assets.set(id, asset);
  }
  updateId(oldId: string, newId: string): void {
    if (this.assets.has(oldId) === false) {
      console.warn(`Cannot find asset ${oldId}`);
      return;
    }
    const asset = this.assets.get(oldId);
    if (asset === undefined) {
      console.warn(`Cannot find asset ${oldId}`);
      return;
    }
    this.assets.set(newId, asset);
    this.assets.delete(oldId);
  }

  async ensureLoaded<
    T extends ImageAsset | SoundAsset | GenericFileAsset,
    K extends GameAssetRequest,
  >(requests: K[]): Promise<T[]> {
    const loadPromises: Promise<GameAssetRequest>[] = [];
    requests.forEach((request) => {
      if (this.assets.has(request.id) === false) {
        loadPromises.push(this.fetchAsync(this, request));
      }
    });
    await Promise.allSettled(loadPromises);

    return Promise.resolve(
      requests.map((request) => this.assets.get(request.id) as T),
    );
  }

  async fetchAsync(
    assetManagerHandle: this,
    assetRequest: GameAssetRequest,
  ): Promise<GameAssetRequest> {
    return new Promise<GameAssetRequest>((resolve, reject) => {
      let obj: HTMLImageElement;

      let responseType: XMLHttpRequestResponseType;
      switch (assetRequest.assetType) {
        case "AUDIO":
          // generic raw binary data buffer -> https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer
          responseType = "arraybuffer";
          break;
        case "JSON":
          responseType = "json";
          break;
        default:
          responseType = "";
      }

      switch (assetRequest.assetType) {
        case "TEXT":
        case "JSON":
        case "AUDIO":
          const request = new XMLHttpRequest();
          request.open("GET", assetRequest.path, true);
          request.responseType = responseType;
          request.onload = function () {
            const result = {
              source: request.response,
              tags: [],
              ...assetRequest,
            };
            assetManagerHandle.assets.set(assetRequest.id, result);
            return resolve(result);
          };
          request.onerror = function () {
            reject(`cannot load ${assetRequest.id} at ${assetRequest.path}`);
          };
          request.send();
          break;
        case "IMAGE":
          obj = new Image();
          obj.onload = function () {
            const result = {
              source: obj as HTMLImageElement,
              tags: [],
              ...assetRequest,
            };
            assetManagerHandle.assets.set(assetRequest.id, result);
            return resolve(result);
          };
          obj.onerror = function () {
            reject(`cannot load ${assetRequest.id} at ${assetRequest.path}`);
          };
          obj.src = assetRequest.path;
          break;
        default:
          reject(`unsupported asset type ${assetRequest.assetType}`);
      }
    });
  }
}

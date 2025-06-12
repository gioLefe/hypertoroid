import { ImageAsset, SoundAsset, Tag } from "../models/asset";
import { AssetsHandler } from "./models/assets-handler";
import { GameAsset } from "./models/game-asset";

export class AssetsManager implements AssetsHandler {
  assets: Map<string, ImageAsset | SoundAsset> = new Map();

  add(assetRequests: GameAsset[]): Promise<void>[] {
    return assetRequests.map((request) =>
      this.createObjectPromise(this, request),
    );
  }

  find<T>(id: string): T | undefined {
    if (this.assets.has(id) === false) {
      throw new Error(`cannot find asset ${id}`);
    }
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

  private createObjectPromise(
    assetManagerHandle: this,
    assetRequest: GameAsset,
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let obj: HTMLImageElement | HTMLAudioElement;

      if (assetRequest.type === "AUDIO") {
        const request = new XMLHttpRequest();
        request.open("GET", assetRequest.path, true);
        request.responseType = "arraybuffer"; // generic raw binary data buffer -> https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer
        request.onload = function () {
          assetManagerHandle.assets.set(assetRequest.id, {
            source: request.response,
            tags: [],
          });
          return resolve();
        };
        request.send();
        return;
      }

      obj = new Image();
      obj.onload = function () {
        assetManagerHandle.assets.set(assetRequest.id, {
          source: obj as HTMLImageElement,
          tags: [],
        });
        return resolve();
      };
      obj.onerror = function () {
        reject(`cannot load ${assetRequest.id} at ${assetRequest.path}`);
      };
      obj.src = assetRequest.path;
    });
  }
}

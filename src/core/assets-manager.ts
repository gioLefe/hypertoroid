import { ImageAsset, GenericFileAsset, SoundAsset, Tag } from "../models/asset";
import { AssetsHandler } from "./models/assets-handler";
import { GameAssetRequest } from "./models/game-asset";

export class AssetsManager implements AssetsHandler {
  assets: Map<string, ImageAsset | SoundAsset | GenericFileAsset> = new Map();

  add(assetRequests: GameAssetRequest[]): Promise<void>[] {
    return assetRequests.map((request) =>
      this.createObjectPromise(this, request)
    );
  }

  find<T = ImageAsset | SoundAsset | GenericFileAsset>(
    id: string
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
    asset: T
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

  /**
   * Get all pixel data from an image asset
   * @param assetId - The ID of the image asset
   * @returns ImageData object or null if asset not found or not an image
   */
  getImageData(assetId: string): ImageData | null {
    const asset = this.assets.get(assetId);
    if (
      !asset ||
      !("source" in asset) ||
      !(asset.source instanceof HTMLImageElement)
    ) {
      return null;
    }

    const image = asset.source as HTMLImageElement;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return null;
    }

    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);

    return ctx.getImageData(0, 0, image.width, image.height);
  }

  private createObjectPromise(
    assetManagerHandle: this,
    assetRequest: GameAssetRequest
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let obj: HTMLImageElement;

      let responseType: XMLHttpRequestResponseType;
      switch (assetRequest.type) {
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

      switch (assetRequest.type) {
        case "TEXT":
        case "JSON":
        case "AUDIO":
          const request = new XMLHttpRequest();
          request.open("GET", assetRequest.path, true);
          request.responseType = responseType;
          request.onload = function () {
            assetManagerHandle.assets.set(assetRequest.id, {
              source: request.response,
              tags: [],
              ...assetRequest,
            });
            return resolve();
          };
          request.onerror = function () {
            reject(`cannot load ${assetRequest.id} at ${assetRequest.path}`);
          };
          request.send();
          break;
        case "IMAGE":
          obj = new Image();
          obj.onload = function () {
            assetManagerHandle.assets.set(assetRequest.id, {
              source: obj as HTMLImageElement,
              tags: [],
              ...assetRequest,
            });
            return resolve();
          };
          obj.onerror = function () {
            reject(`cannot load ${assetRequest.id} at ${assetRequest.path}`);
          };
          obj.src = assetRequest.path;
          break;
          default: reject(`unsupported asset type ${assetRequest.type}`);
      }
    });
  }
}

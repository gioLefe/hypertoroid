import { AssetType } from "./types";

export async function asyncReq<K>(
  path: string,
  assetType: AssetType,
): Promise<K> {
  return new Promise<K>((resolve, reject) => {
    let responseType: XMLHttpRequestResponseType = "";
    switch (assetType) {
      case "AUDIO":
        // generic raw binary data buffer -> https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer
        responseType = "arraybuffer";
        break;
      case "JSON":
        responseType = "json";
        break;
    }

    switch (assetType) {
      case "TEXT":
      case "JSON":
      case "AUDIO":
        const request = new XMLHttpRequest();
        request.open("GET", path, true);
        request.responseType = responseType;
        request.onload = function () {
          return resolve(request.response as K);
        };
        request.onerror = function () {
          reject(`cannot load ${path} at ${path}`);
        };
        request.send();
        break;
      case "IMAGE":
        let obj = new Image();
        obj.onload = function () {
          return resolve(obj as K);
        };
        obj.onerror = function () {
          reject(`cannot load ${path} at ${path}`);
        };
        obj.src = path;
        break;
      default:
        reject(`unsupported asset type ${assetType}`);
    }
  });
}

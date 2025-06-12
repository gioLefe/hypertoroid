"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetsManager = void 0;
var AssetsManager = /** @class */ (function () {
    function AssetsManager() {
        this.assets = new Map();
    }
    AssetsManager.prototype.add = function (assetRequests) {
        var _this = this;
        return assetRequests.map(function (request) {
            return _this.createObjectPromise(_this, request);
        });
    };
    AssetsManager.prototype.find = function (id) {
        if (this.assets.has(id) === false) {
            throw new Error("cannot find asset ".concat(id));
        }
        return this.assets.get(id);
    };
    AssetsManager.prototype.delete = function (id) {
        this.assets.delete(id);
    };
    AssetsManager.prototype.addTag = function (id, tag) {
        var a = this.assets.get(id);
        if (a === undefined) {
            console.warn("cannot find asset ".concat(id));
            return;
        }
        a.tags.push(tag);
        this.assets.set(id, a);
    };
    AssetsManager.prototype.createObjectPromise = function (assetManagerHandle, assetRequest) {
        return new Promise(function (resolve, reject) {
            var obj;
            if (assetRequest.type === "AUDIO") {
                var request_1 = new XMLHttpRequest();
                request_1.open("GET", assetRequest.path, true);
                request_1.responseType = "arraybuffer"; // generic raw binary data buffer -> https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer
                request_1.onload = function () {
                    assetManagerHandle.assets.set(assetRequest.id, {
                        source: request_1.response,
                        tags: [],
                    });
                    return resolve();
                };
                request_1.send();
                return;
            }
            obj = new Image();
            obj.onload = function () {
                assetManagerHandle.assets.set(assetRequest.id, {
                    source: obj,
                    tags: [],
                });
                return resolve();
            };
            obj.onerror = function () {
                reject("cannot load ".concat(assetRequest.id, " at ").concat(assetRequest.path));
            };
            obj.src = assetRequest.path;
        });
    };
    return AssetsManager;
}());
exports.AssetsManager = AssetsManager;

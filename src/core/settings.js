"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Settings = exports.CANVAS_HEIGHT = exports.CANVAS_WIDTH = void 0;
exports.CANVAS_WIDTH = "canvasW";
exports.CANVAS_HEIGHT = "canvasH";
var Settings = /** @class */ (function () {
    function Settings() {
        this.settings = new Map();
    }
    Settings.prototype.get = function (key) {
        if (!this.settings.has(key)) {
            return undefined;
        }
        return this.settings.get(key);
    };
    Settings.prototype.set = function (key, value) {
        this.settings = this.settings.set(key, value);
    };
    Settings.SETTINGS_DI = "settings";
    return Settings;
}());
exports.Settings = Settings;

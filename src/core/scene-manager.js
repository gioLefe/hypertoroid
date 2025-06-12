"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SceneManager = void 0;
var SceneManager = /** @class */ (function () {
    function SceneManager() {
        this.currentScenes = [];
        this.scenes = [];
    }
    SceneManager.prototype.addScene = function (scene) {
        if (this.scenes.findIndex(function (s) { return s.id === (scene === null || scene === void 0 ? void 0 : scene.id); }) !== -1) {
            console.warn("Scene with same id already exists, provide a new id");
            return;
        }
        this.scenes.push(scene);
    };
    SceneManager.prototype.deleteScene = function (id) {
        var i = this.getSceneIndex(id, this.currentScenes);
        this.currentScenes[i].clean();
        this.currentScenes = this.currentScenes.filter(function (_, index) { return index !== i; });
    };
    SceneManager.prototype.getCurrentScenes = function () {
        return this.currentScenes;
    };
    /**
     * Changes the current scene to a new scene specified by the given ID.
     *
     * This function initializes the new scene, optionally initializes a loading scene, and updates
     * the current scenes stack. It also handles cleaning up the previous scene state if specified.
     *
     * @param {string} id - The ID of the new scene to transition to.
     * @param {boolean} [cleanPreviousState=true] - A flag indicating whether to clean up the previous scene state.
     * @param {string} [loadingSceneId] - The ID of an optional loading scene to display while the new scene is initializing.
     * @returns {Promise<void>} A promise that resolves when the scene transition is complete.
     */
    SceneManager.prototype.changeScene = function (id_1) {
        return __awaiter(this, arguments, void 0, function (id, cleanPreviousState, loadingSceneId) {
            var lastCurrentSceneId, newScene, loadingSceneIndex, loadingScene, loadingSceneInitPromises, newSceneInitPromises;
            var _a;
            if (cleanPreviousState === void 0) { cleanPreviousState = true; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        lastCurrentSceneId = (_a = this.currentScenes[this.currentScenes.length - 1]) === null || _a === void 0 ? void 0 : _a.id;
                        newScene = this.scenes[this.getSceneIndex(id, this.scenes)];
                        if (!(loadingSceneId !== undefined)) return [3 /*break*/, 3];
                        loadingSceneIndex = this.getSceneIndex(loadingSceneId, this.scenes);
                        loadingScene = this.scenes[loadingSceneIndex];
                        loadingSceneInitPromises = loadingScene.init();
                        if (!(loadingSceneInitPromises !== undefined)) return [3 /*break*/, 2];
                        return [4 /*yield*/, loadingSceneInitPromises];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2:
                        this.currentScenes.push(loadingScene);
                        _b.label = 3;
                    case 3:
                        newSceneInitPromises = newScene.init();
                        if (!(newSceneInitPromises !== undefined)) return [3 /*break*/, 5];
                        return [4 /*yield*/, newSceneInitPromises];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5:
                        if (cleanPreviousState && lastCurrentSceneId !== undefined) {
                            this.deleteScene(lastCurrentSceneId);
                        }
                        if (loadingSceneId !== undefined) {
                            this.deleteScene(loadingSceneId);
                        }
                        this.currentScenes.push(newScene);
                        return [2 /*return*/];
                }
            });
        });
    };
    SceneManager.prototype.getSceneIndex = function (id, scenes) {
        var loadingSceneIndex = scenes.findIndex(function (s) { return s.id === id; });
        if (loadingSceneIndex === -1) {
            throw new Error("cannot find scene with id ".concat(id));
        }
        return loadingSceneIndex;
    };
    return SceneManager;
}());
exports.SceneManager = SceneManager;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = exports.ASSETS_MANAGER_DI = exports.SCENE_MANAGER_DI = void 0;
var core_1 = require("../core");
exports.SCENE_MANAGER_DI = "SceneManager";
exports.ASSETS_MANAGER_DI = "AsetsManager";
var Game = /** @class */ (function () {
    function Game(canvas, canvasWidth, canvasHeight, fps) {
        if (fps === void 0) { fps = 30; }
        var _this = this;
        this.lastUpdateTime = 0;
        this.deltaTime = 0;
        this.frameInterval = 0;
        this.diContainer = core_1.DIContainer.getInstance();
        this.debug = {
            init: false,
            update: false,
            render: false,
        };
        this.gameLoop = function (timestamp) {
            var elapsed = timestamp - _this.lastUpdateTime;
            if (elapsed > _this.frameInterval) {
                _this.deltaTime = elapsed / 1000; // Convert to
                _this.lastUpdateTime = timestamp;
                _this.update(_this.deltaTime);
                _this.render(_this.ctx);
            }
            requestAnimationFrame(_this.gameLoop);
        };
        if (canvas === null) {
            console.error("%c *** Error, Canvas cannot be null");
            throw Error();
        }
        this.canvas = canvas;
        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;
        var context = this.canvas.getContext("2d");
        if (context === null) {
            throw Error("ctx is null");
        }
        this.ctx = context;
        this.lastUpdateTime = 0;
        this.deltaTime = 0;
        this.frameInterval - 1000 / fps;
        this.init();
    }
    Game.prototype.clean = function () {
        var _args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _args[_i] = arguments[_i];
        }
        throw new Error("Method not implemented.");
    };
    Game.prototype.init = function () {
        if (this.debug.init) {
            console.log("%c *** Init", "background:#020; color:#adad00");
        }
        this.sceneManager = new core_1.SceneManager();
        this.assetsManager = new core_1.AssetsManager();
        this.settingsManager = new core_1.Settings();
        this.diContainer.register(exports.SCENE_MANAGER_DI, this.sceneManager);
        this.diContainer.register(exports.ASSETS_MANAGER_DI, this.assetsManager);
        this.diContainer.register(core_1.AudioController.AUDIO_CONTROLLER_DI, new core_1.AudioController());
        this.diContainer.register(core_1.Settings.SETTINGS_DI, this.settingsManager);
    };
    Game.prototype.update = function (deltaTime) {
        var _a, _b;
        if (this.debug.update) {
            console.log("%c *** Update", "background:#020; color:#adad00");
        }
        (_b = (_a = this.sceneManager) === null || _a === void 0 ? void 0 : _a.getCurrentScenes()) === null || _b === void 0 ? void 0 : _b.forEach(function (scene) { return scene.update(deltaTime); });
    };
    Game.prototype.render = function () {
        var _this = this;
        var _a, _b;
        var _args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _args[_i] = arguments[_i];
        }
        if (this.debug.render) {
            console.log("%c *** Render", "background:#020; color:#adad00");
        }
        (_a = this.ctx) === null || _a === void 0 ? void 0 : _a.clearRect(0, 0, this.canvas.width, this.canvas.height);
        var currentScenes = (_b = this.sceneManager) === null || _b === void 0 ? void 0 : _b.getCurrentScenes();
        if (currentScenes === undefined) {
            console.warn("no scene to render");
            return;
        }
        currentScenes.forEach(function (scene) { return scene.render(_this.ctx); });
    };
    Game.prototype.start = function () {
        this.lastUpdateTime = performance.now();
        this.gameLoop(this.lastUpdateTime);
    };
    return Game;
}());
exports.Game = Game;

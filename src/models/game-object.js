"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameObject = void 0;
var GameObject = /** @class */ (function () {
    function GameObject(ctx) {
        this.width = 64;
        this.height = 64;
        this.position = { x: 0, y: 0 };
        this.bbox = {
            nw: { x: 0, y: 0 },
            se: { x: 0, y: 0 },
        };
        this.direction = 0;
        this.ctx = ctx;
    }
    GameObject.prototype.init = function () {
        var _args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _args[_i] = arguments[_i];
        }
    };
    GameObject.prototype.update = function (_deltaTime) {
        var _args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            _args[_i - 1] = arguments[_i];
        }
    };
    GameObject.prototype.render = function () {
        var _args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _args[_i] = arguments[_i];
        }
    };
    GameObject.prototype.clean = function () {
        var _args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _args[_i] = arguments[_i];
        }
    };
    GameObject.prototype.setPosition = function (value) {
        this.position = value;
    };
    GameObject.prototype.getPosition = function () {
        return this.position;
    };
    GameObject.prototype.getSize = function () {
        return undefined;
    };
    GameObject.prototype.getDirection = function () {
        return this.direction;
    };
    GameObject.prototype.setDirection = function (value) {
        this.direction = value;
    };
    GameObject.prototype.getWidth = function () {
        return this.width;
    };
    GameObject.prototype.setWidth = function (width) {
        this.width = width;
    };
    GameObject.prototype.getHeight = function () {
        return this.height;
    };
    GameObject.prototype.setHeight = function (height) {
        this.height = height;
    };
    return GameObject;
}());
exports.GameObject = GameObject;

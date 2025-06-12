"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.UIPanel = void 0;
var models_1 = require("../../models");
var MENUNODES_FONT_SIZE = 48;
var MENUNODES_GAP = 8;
var MENUNODES_STYLE = {
    direction: "inherit",
    font: "".concat(MENUNODES_FONT_SIZE, " sans-serif"),
    fontKerning: "auto",
    fontStretch: "normal",
    fontVariantCaps: "normal",
    letterSpacing: "normal",
    textAlign: "start",
    textBaseline: "alphabetic",
    textRendering: "auto",
    wordSpacing: "normal",
};
var UIPanel = /** @class */ (function (_super) {
    __extends(UIPanel, _super);
    function UIPanel(ctx) {
        var _this = _super.call(this, ctx) || this;
        _this.pos = { x: 0, y: 0 };
        _this.textStyle = MENUNODES_STYLE;
        _this.width = 0;
        _this.height = 0;
        _this.items = [];
        _this.allItemsHeight = 0;
        _this.heightGap = MENUNODES_GAP;
        return _this;
    }
    UIPanel.prototype.init = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        _super.prototype.init.call(this, args);
    };
    UIPanel.prototype.update = function (deltaTime) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        _super.prototype.update.call(this, deltaTime, args);
        this.items.forEach(function (i) { return i.update(deltaTime, args); });
    };
    UIPanel.prototype.clean = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        _super.prototype.clean.call(this, args);
        this.items.forEach(function (i) { return i.clean(args); });
    };
    UIPanel.prototype.render = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this.fillStyle !== undefined) {
            this.ctx.fillStyle = this.fillStyle;
        }
        if (this.strokeStyle !== undefined) {
            this.ctx.strokeStyle = this.strokeStyle;
        }
        this.ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height);
        this.items.forEach(function (i) { return i.render(args); });
    };
    UIPanel.prototype.addPanelItem = function (gameObject) {
        var _this = this;
        if (gameObject === undefined) {
            return;
        }
        this.items.push(gameObject);
        // Reposition items
        var currentHeightPosition = this.getPosition().y;
        var currentWidthPosition = this.getPosition().y;
        this.items.forEach(function (go) {
            var _a, _b;
            go.setPosition({ x: currentWidthPosition, y: currentHeightPosition });
            currentHeightPosition += _this.heightGap + ((_b = (_a = go.getSize()) === null || _a === void 0 ? void 0 : _a.y) !== null && _b !== void 0 ? _b : 0);
        });
    };
    UIPanel.prototype.getPanelItem = function (id) {
        return this.items.find(function (i) { return i.id === id; });
    };
    UIPanel.prototype.setHeightGap = function (value) {
        this.heightGap = value;
    };
    UIPanel.prototype.setFillStyle = function (value) {
        this.fillStyle = value;
    };
    UIPanel.prototype.setStrokeStyle = function (value) {
        this.strokeStyle = value;
    };
    // TODO: implement
    // @ts-expect-error ts(6133)
    UIPanel.prototype.calcContentHeight = function () {
        var _this = this;
        this.items.forEach(function (i) {
            var _a, _b;
            _this.allItemsHeight += (_b = (_a = i.getSize()) === null || _a === void 0 ? void 0 : _a.y) !== null && _b !== void 0 ? _b : 0;
        });
    };
    return UIPanel;
}(models_1.GameObject));
exports.UIPanel = UIPanel;

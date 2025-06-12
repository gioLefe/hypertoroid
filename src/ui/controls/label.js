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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UILabel = void 0;
var models_1 = require("../../models");
var canvas_1 = require("../canvas");
var UILabel = /** @class */ (function (_super) {
    __extends(UILabel, _super);
    function UILabel(ctx, id, posX, posY, textStyle, text) {
        var _this = _super.call(this, ctx) || this;
        _this.DEFAULT_TEXT_STYLE = {
            direction: "inherit",
            font: "10px sans-serif",
            fontKerning: "auto",
            fontStretch: "normal",
            fontVariantCaps: "normal",
            letterSpacing: "normal",
            textAlign: "start",
            textBaseline: "alphabetic",
            textRendering: "auto",
            wordSpacing: "normal",
        };
        _this.textStyle = _this.DEFAULT_TEXT_STYLE;
        _this.textFillStyle = "#000";
        _this.textStrokeStyle = "#000";
        _this.id = id;
        _this.position = { x: posX !== null && posX !== void 0 ? posX : 0, y: posY !== null && posY !== void 0 ? posY : 0 };
        if (textStyle !== undefined) {
            _this.textStyle = __assign(__assign({}, _this.textStyle), textStyle);
        }
        _this.text = text !== null && text !== void 0 ? text : "";
        return _this;
    }
    UILabel.prototype.init = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        _super.prototype.init.apply(this, args);
    };
    UILabel.prototype.update = function (deltaTime) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        _super.prototype.update.call(this, deltaTime, args);
        if (this.text === undefined || this.position === undefined) {
            return;
        }
        this.bbox = (0, canvas_1.getTextBBox)(this.ctx, this.text, this.position);
    };
    UILabel.prototype.render = function () {
        var _a;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        _super.prototype.render.call(this, args);
        if (this.position === undefined || this.text === undefined) {
            return;
        }
        this.applyStyles();
        this.ctx.moveTo((_a = this.position) === null || _a === void 0 ? void 0 : _a.x, this.position.y);
        this.ctx.strokeText(this.text, this.position.x, this.position.y);
        this.ctx.fillText(this.text, this.position.x, this.position.y);
    };
    UILabel.prototype.clean = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        _super.prototype.clean.call(this, args);
    };
    UILabel.prototype.setText = function (text) {
        this.text = text;
    };
    UILabel.prototype.getSize = function () {
        if (this.textFillStyle === undefined ||
            this.textStrokeStyle === undefined) {
            return;
        }
        this.applyStyles();
        var textMetrics = this.ctx.measureText(this.text);
        if (textMetrics === undefined) {
            return undefined;
        }
        return {
            x: textMetrics.width,
            y: (textMetrics === null || textMetrics === void 0 ? void 0 : textMetrics.fontBoundingBoxAscent) + textMetrics.fontBoundingBoxDescent,
        };
    };
    UILabel.prototype.getBBox = function () {
        return this.bbox;
    };
    UILabel.prototype.setTextFillStyle = function (style) {
        this.textFillStyle = style;
    };
    UILabel.prototype.setTextStrokeStyle = function (style) {
        this.textStrokeStyle = style;
    };
    UILabel.prototype.setTextStyle = function (textStyle) {
        this.textStyle = textStyle;
    };
    UILabel.prototype.applyStyles = function () {
        var _a, _b, _c, _d, _e, _f;
        //TODO add direction
        this.ctx.font = (_b = (_a = this.textStyle) === null || _a === void 0 ? void 0 : _a.font) !== null && _b !== void 0 ? _b : "20px Verdana";
        //TODO addfontKerning
        //TODO addfontStretch
        //TODO addfontVariantCaps
        //TODO addletterSpacing
        this.ctx.textAlign = (_d = (_c = this.textStyle) === null || _c === void 0 ? void 0 : _c.textAlign) !== null && _d !== void 0 ? _d : "left";
        this.ctx.textBaseline = (_f = (_e = this.textStyle) === null || _e === void 0 ? void 0 : _e.textBaseline) !== null && _f !== void 0 ? _f : "alphabetic";
        //TODO add textRendering
        //TODO add wordSpacing
        if (this.textStrokeStyle !== undefined) {
            this.ctx.strokeStyle = this.textStrokeStyle;
        }
        if (this.textFillStyle !== undefined) {
            this.ctx.fillStyle = this.textFillStyle;
        }
    };
    return UILabel;
}(models_1.GameObject));
exports.UILabel = UILabel;

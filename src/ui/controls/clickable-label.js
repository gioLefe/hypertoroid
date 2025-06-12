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
exports.UIClickableLabel = void 0;
var helpers_1 = require("../../helpers");
var with_events_1 = require("../with-events");
var label_1 = require("./label");
var MOUSE_ENTER_ID = "uiClickableLabel-enter";
var MOUSE_LEAVE_ID = "uiClickableLabel-leave";
var UIClickableLabel = /** @class */ (function (_super) {
    __extends(UIClickableLabel, _super);
    function UIClickableLabel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.mouseOver = false;
        _this.mouseEnterCallbacks = [];
        _this.mouseLeaveCallbacks = [];
        _this.addMouseEnterCallback = function (ev) {
            _this.mouseEnterCallbacks.push(ev);
        };
        _this.addMouseLeaveCallback = function (ev) {
            _this.mouseLeaveCallbacks.push(ev);
        };
        return _this;
    }
    UIClickableLabel.prototype.init = function (canvas) {
        var _this = this;
        var _args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            _args[_i - 1] = arguments[_i];
        }
        _super.prototype.init.call(this, canvas);
        this.addCallback("mousemove", MOUSE_ENTER_ID, function () {
            _this.playBtnMouseEnter();
            _this.mouseEnterCallbacks.forEach(function (callback) { return callback(); });
        }, false, function (ev) {
            return (0, helpers_1.isPointInAlignedBBox)({ x: ev.offsetX, y: ev.offsetY }, _this.getBBox()) && _this.mouseOver === false;
        });
        this.enableEvent("mousemove")(canvas);
    };
    UIClickableLabel.prototype.clean = function () {
        var _args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _args[_i] = arguments[_i];
        }
        _super.prototype.clean.call(this);
        this.deregisterEvents();
        this.removeCallback(MOUSE_ENTER_ID);
        this.removeCallback(MOUSE_LEAVE_ID);
    };
    UIClickableLabel.prototype.playBtnMouseEnter = function () {
        var _this = this;
        this.mouseOver = true;
        this.addCallback("mousemove", MOUSE_LEAVE_ID, function () {
            _this.playBtnMouseLeave();
            _this.mouseLeaveCallbacks.forEach(function (callback) { return callback(); });
        }, false, function (ev) {
            return !(0, helpers_1.isPointInAlignedBBox)({ x: ev.offsetX, y: ev.offsetY }, _this.getBBox());
        });
    };
    UIClickableLabel.prototype.playBtnMouseLeave = function () {
        this.mouseOver = false;
        this.removeCallback(MOUSE_LEAVE_ID);
    };
    return UIClickableLabel;
}((0, with_events_1.withEvents)(label_1.UILabel)));
exports.UIClickableLabel = UIClickableLabel;

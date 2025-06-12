"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPointInAlignedBBox = isPointInAlignedBBox;
function isPointInAlignedBBox(point, bbox) {
    return (point.x >= bbox.nw.x &&
        point.x <= bbox.se.x &&
        point.y >= bbox.nw.y &&
        point.y <= bbox.se.y);
}

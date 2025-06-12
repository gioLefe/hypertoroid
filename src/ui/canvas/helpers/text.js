"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTextBBox = getTextBBox;
function getTextBBox(ctx, text, position) {
    // Measure the text
    var metrics = ctx.measureText(text);
    // Calculate the bounding box coordinates
    var nw = {
        x: position.x + metrics.actualBoundingBoxLeft,
        y: position.y - metrics.actualBoundingBoxAscent,
    };
    var se = {
        x: position.x + metrics.actualBoundingBoxRight,
        y: position.y - metrics.actualBoundingBoxDescent,
    };
    return { nw: nw, se: se };
}

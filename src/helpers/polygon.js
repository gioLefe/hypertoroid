"use strict";
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
exports.renderPolygon = renderPolygon;
exports.createTriangle = createTriangle;
exports.createSquare = createSquare;
exports.createPolygon = createPolygon;
exports.updatePolygonShape = updatePolygonShape;
exports.rotatePolygon = rotatePolygon;
exports.calculateNormals = calculateNormals;
exports.calculateEdgesPerpendiculars = calculateEdgesPerpendiculars;
exports.getBBoxRect = getBBoxRect;
exports.getWorldPolygon = getWorldPolygon;
exports.printWorldPolygonInfo = printWorldPolygonInfo;
var math_1 = require("./math");
var DEFAULT_POLYGON_PARAMS = {
    strokeColor: "#000000",
    selectedStrokeColor: "#aa0000",
    collisionStrokeColor: "#00a4FF",
    worldCoordinates: { x: 0, y: 0 },
};
function renderPolygon(polygon, ctx, options) {
    var _a;
    if (options === void 0) { options = DEFAULT_POLYGON_PARAMS; }
    if (!polygon) {
        console.error("Polygon is null");
        return;
    }
    if (polygon.points.length < 2) {
        console.warn("Too few points , can't draw polygon ");
        return;
    }
    // Move to the first point, calculated as the origin summed to the first point coordinates
    var origin = {
        x: options.worldCoordinates.x + polygon.points[0].x,
        y: options.worldCoordinates.y + +polygon.points[0].y,
    };
    ctx.moveTo(origin.x, origin.y);
    ctx.strokeStyle = (_a = options.strokeColor) !== null && _a !== void 0 ? _a : DEFAULT_POLYGON_PARAMS.strokeColor;
    ctx.lineWidth = 1;
    if (polygon.color) {
        ctx.fillStyle = polygon.color;
    }
    ctx.beginPath();
    for (var i = 1; i < polygon.points.length; i++) {
        ctx.lineTo(options.worldCoordinates.x + polygon.points[i].x, options.worldCoordinates.y + +polygon.points[i].y);
    }
    ctx.lineTo(origin.x, origin.y);
    ctx.closePath();
    if (polygon.fill) {
        ctx.fill();
    }
    if (polygon.outline) {
        ctx.stroke();
    }
}
function createTriangle(height, color) {
    if (color === void 0) { color = "#ffb3ba"; }
    if (height === 0) {
        console.warn("height cannot be 0");
        return null;
    }
    return {
        color: color,
        fill: true,
        points: [
            { x: -height / 2, y: 0 },
            { x: height / 2, y: height / 2 },
            { x: height / 2, y: -height / 2 },
        ],
        sideLength: (2 * height) / Math.sqrt(3),
    };
}
function createSquare(sideLength, color) {
    if (color === void 0) { color = "#ffb3ba"; }
    if (sideLength === 0) {
        console.warn("sideLength cannot be 0");
        return null;
    }
    return {
        color: color,
        fill: true,
        points: [
            { x: -sideLength / 2, y: sideLength / 2 },
            { x: sideLength / 2, y: sideLength / 2 },
            { x: sideLength / 2, y: -sideLength / 2 },
            { x: -sideLength / 2, y: -sideLength / 2 },
        ],
        sideLength: sideLength,
    };
}
function createPolygon(defaults) {
    var _a, _b, _c, _d, _e, _f, _g;
    if (defaults === void 0) { defaults = {}; }
    return {
        color: (_a = defaults.color) !== null && _a !== void 0 ? _a : "#ffb3ba",
        fill: (_b = defaults.fill) !== null && _b !== void 0 ? _b : true,
        outline: (_c = defaults.outline) !== null && _c !== void 0 ? _c : true,
        numSides: (_d = defaults.numSides) !== null && _d !== void 0 ? _d : 3,
        points: generatePolygonPoints((_e = defaults.numSides) !== null && _e !== void 0 ? _e : 3, (_f = defaults.sideLength) !== null && _f !== void 0 ? _f : 10),
        sideLength: (_g = defaults.sideLength) !== null && _g !== void 0 ? _g : 22,
    };
}
function updatePolygonShape(polygon) {
    return __assign(__assign({}, polygon), { points: generatePolygonPoints(polygon.numSides, polygon.sideLength) });
}
function rotatePolygon(polygon, radiants) {
    return __assign(__assign({}, polygon), { points: generatePolygonPoints(polygon.numSides, polygon.sideLength, radiants) });
}
function calculateNormals(points) {
    return calculateEdgesPerpendiculars(points).reduce(function (accumulation, current) {
        return accumulation.some(function (n) {
            return Math.abs(n.y) === Math.abs(current.y) &&
                Math.abs(n.x) === Math.abs(current.x);
        })
            ? accumulation
            : accumulation.concat(current);
    }, []);
}
function calculateEdgesPerpendiculars(points) {
    var perpendiculars = [];
    var numPoints = points.length;
    for (var i = 0; i < numPoints; i++) {
        var p1 = points[i];
        var p2 = points[(i + 1) % numPoints]; // Next point (wraps around to the first point)
        // Calculate edge vector
        var edge = {
            x: p2.x - p1.x,
            y: p2.y - p1.y,
        };
        // Calculate perpendicular axis by swapping x and y and negating one
        var perpendicularAxis = (0, math_1.getVectorPerpendicular)(edge);
        if (perpendicularAxis === null) {
            console.warn("%c *** Cannot calculate perpendicular for edge", "background:#222; color: #FFda55", edge);
            continue;
        }
        // Normalize the perpendicular axis
        var length_1 = Math.sqrt(perpendicularAxis.x * perpendicularAxis.x +
            perpendicularAxis.y * perpendicularAxis.y);
        perpendicularAxis.x /= length_1;
        perpendicularAxis.y /= length_1;
        perpendiculars.push(perpendicularAxis);
    }
    return perpendiculars;
}
function getBBoxRect(buondingBox, defaults) {
    var _a, _b, _c;
    if (defaults === void 0) { defaults = {}; }
    return {
        color: (_a = defaults.color) !== null && _a !== void 0 ? _a : "#ffb3ba",
        fill: (_b = defaults.fill) !== null && _b !== void 0 ? _b : true,
        outline: (_c = defaults.outline) !== null && _c !== void 0 ? _c : true,
        numSides: 4,
        points: [
            { x: buondingBox.nw.x, y: buondingBox.nw.y },
            { x: buondingBox.se.x, y: buondingBox.nw.y },
            { x: buondingBox.se.x, y: buondingBox.se.y },
            { x: buondingBox.nw.x, y: buondingBox.se.y },
        ],
    };
}
function getWorldPolygon(polygon, position) {
    return __assign(__assign({}, polygon), { worldCoordinates: { x: position.x, y: position.y } });
}
function printWorldPolygonInfo(polygon, label) {
    var _a;
    if (label === void 0) { label = "polygon"; }
    console.log("".concat(label, ": sides: ").concat(polygon.numSides, " | center: x:").concat(polygon === null || polygon === void 0 ? void 0 : polygon.worldCoordinates.x.toFixed(1), ", y:").concat(polygon === null || polygon === void 0 ? void 0 : polygon.worldCoordinates.y.toFixed(1), " | points: ").concat(polygon.points.forEach(function (p, i) { return "p[".concat(i, "]-").concat(p.x, ":").concat(p.y, ","); }), " | normals: ").concat((_a = polygon.normals) === null || _a === void 0 ? void 0 : _a.forEach(function (n, i) { return "n[".concat(i, "]-").concat(n.x, ":").concat(n.y, ","); })));
}
function generatePolygonPoints(numSides, sideLength, radiants) {
    var points = [];
    var fullCircle = 2 * Math.PI;
    var angleIncrement = fullCircle / numSides;
    for (var i = 0; i < numSides; i++) {
        var angle = i * angleIncrement;
        if (radiants) {
            angle = angle + radiants;
        }
        var x = sideLength * Math.cos(angle);
        var y = sideLength * Math.sin(angle);
        points.push({ x: x, y: y });
    }
    return points;
}

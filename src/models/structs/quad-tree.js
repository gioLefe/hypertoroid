"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuadTree = void 0;
var QuadTree = /** @class */ (function () {
    // Methods
    function QuadTree(boundary) {
        // Points in this quad tree node
        this.points = [];
        this.boundary = boundary;
    }
    QuadTree.prototype.insert = function (p) {
        this.points.push(p);
    };
    QuadTree.prototype.subdivide = function () {
        var xLength = (this.boundary.se.x - this.boundary.nw.x) / 2;
        var yLength = (this.boundary.nw.y - this.boundary.se.y) / 2;
        // create four children that fully divide this quad into four quads of equal area
        this.northWest = new QuadTree({
            nw: this.boundary.nw,
            se: { x: this.boundary.nw.x + xLength, y: this.boundary.nw.y + yLength },
        });
        this.northEast = new QuadTree({
            nw: { x: this.boundary.nw.x + xLength, y: this.boundary.nw.y },
            se: { x: this.boundary.se.x, y: this.boundary.nw.y + yLength },
        });
        this.southWest = new QuadTree({
            nw: { x: this.boundary.nw.x, y: this.boundary.nw.y + yLength },
            se: { x: this.boundary.nw.x + xLength, y: this.boundary.se.y },
        });
        this.southEast = new QuadTree({
            nw: { x: this.boundary.nw.x + xLength, y: this.boundary.nw.y + yLength },
            se: this.boundary.se
        });
    };
    QuadTree.prototype.queryRange = function (_range) {
        return undefined;
    };
    return QuadTree;
}());
exports.QuadTree = QuadTree;

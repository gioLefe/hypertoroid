"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pivotComparator = pivotComparator;
function pivotComparator(p1, p2) {
    return (p1.position.x === p2.position.x &&
        p1.position.y === p2.position.y &&
        p1.direction === p2.direction);
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkedList = exports.LinkedListNode = void 0;
// Mainly taken from https://ricardoborges.dev/data-structures-in-typescript-linked-list
var LinkedListNode = /** @class */ (function () {
    function LinkedListNode(data) {
        this.next = null;
        this.data = data;
    }
    return LinkedListNode;
}());
exports.LinkedListNode = LinkedListNode;
var LinkedList = /** @class */ (function () {
    function LinkedList(comparator) {
        this.head = null;
        this.comparator = comparator;
    }
    LinkedList.prototype.append = function (data) {
        var newData = new LinkedListNode(data);
        if (!this.head) {
            this.head = newData;
        }
        else {
            var current = this.head;
            while (current.next != null) {
                current = current.next;
            }
            current.next = newData;
        }
        return newData;
    };
    LinkedList.prototype.delete = function (data) {
        if (!this.head)
            return;
        // Check if the head node is the node to be removed
        if (this.comparator(this.head.data, data)) {
            this.head = this.head.next;
            return;
        }
        var current = this.head.next;
        var previous = this.head;
        /**
         * Search for the node to be removed and keep track of its previous node
         **/
        while (current) {
            if (this.comparator(current.data, data)) {
                current = null;
            }
            else {
                previous = current;
                current = current.next;
            }
        }
        /**
         * set previous.next to the target.next, if the node target is not found,
         * the 'previous' will point to the last node,
         * since the last node hasn't next, nothing will happen
         **/
        previous.next = previous.next ? previous.next.next : null;
    };
    LinkedList.prototype.search = function (data) {
        var current = this.head;
        while (current) {
            if (this.comparator(current.data, data)) {
                return current;
            }
            current = current.next;
        }
        return null;
    };
    LinkedList.prototype.traverse = function () {
        // taken from https://dev.to/glebirovich/typescript-data-structures-linked-list-3o8i
        var array = [];
        if (!this.head) {
            return array;
        }
        var addToArray = function (node) {
            array.push(node.data);
            return node.next ? addToArray(node.next) : array;
        };
        return addToArray(this.head);
    };
    LinkedList.prototype.size = function () {
        return this.traverse().length;
    };
    return LinkedList;
}());
exports.LinkedList = LinkedList;

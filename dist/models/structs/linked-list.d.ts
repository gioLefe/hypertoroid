export declare class LinkedListNode<T> {
    data: T;
    next: LinkedListNode<T> | null;
    constructor(data: T);
}
export interface ILinkedList<T> {
    append(data: T): LinkedListNode<T>;
    delete(data: T): void;
    search(data: T): LinkedListNode<T> | null;
    traverse(): T[];
    size(): number;
}
export declare class LinkedList<T> implements ILinkedList<T> {
    head: LinkedListNode<T> | null;
    comparator: (a: T, b: T) => boolean;
    constructor(comparator: (a: T, b: T) => boolean);
    append(data: T): LinkedListNode<T>;
    delete(data: T): void;
    search(data: T): LinkedListNode<T> | null;
    traverse(): T[];
    size(): number;
}

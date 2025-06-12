// Mainly taken from https://ricardoborges.dev/data-structures-in-typescript-linked-list
export class LinkedListNode<T> {
  data: T;
  next: LinkedListNode<T> | null = null;

  constructor(data: T) {
    this.data = data;
  }
}

export interface ILinkedList<T> {
  append(data: T): LinkedListNode<T>;
  delete(data: T): void;
  search(data: T): LinkedListNode<T> | null;
  traverse(): T[];
  size(): number;
}

export class LinkedList<T> implements ILinkedList<T> {
  head: LinkedListNode<T> | null = null;
  comparator: (a: T, b: T) => boolean;

  constructor(comparator: (a: T, b: T) => boolean) {
    this.comparator = comparator;
  }

  append(data: T): LinkedListNode<T> {
    const newData = new LinkedListNode(data);
    if (!this.head) {
      this.head = newData;
    } else {
      let current = this.head;
      while (current.next != null) {
        current = current.next;
      }
      current.next = newData;
    }
    return newData;
  }

  delete(data: T): void {
    if (!this.head) return;

    // Check if the head node is the node to be removed
    if (this.comparator(this.head.data, data)) {
      this.head = this.head.next;
      return;
    }

    let current = this.head.next;
    let previous = this.head;

    /**
     * Search for the node to be removed and keep track of its previous node
     **/
    while (current) {
      if (this.comparator(current.data, data)) {
        current = null;
      } else {
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
  }

  search(data: T): LinkedListNode<T> | null {
    let current = this.head;
    while (current) {
      if (this.comparator(current.data, data)) {
        return current;
      }
      current = current.next;
    }
    return null;
  }

  traverse() {
    // taken from https://dev.to/glebirovich/typescript-data-structures-linked-list-3o8i
    const array: T[] = [];
    if (!this.head) {
      return array;
    }

    const addToArray = (node: LinkedListNode<T>): T[] => {
      array.push(node.data);
      return node.next ? addToArray(node.next) : array;
    };
    return addToArray(this.head);
  }

  size(): number {
    return this.traverse().length;
  }
}

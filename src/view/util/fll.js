class Node {
  constructor( element ) {
    this.element = element;
    this.next = null;
    this.prev = null;
  }
}

export class FixedLengthDoublyLinkedList {
  constructor( maxLength ) {
    this.head = null;
    this.tail = null;
    this.maxLength = maxLength;
    this.length = 0;
  }

  append( element ) {
    let node = new Node( element );
    this.length += 1;
    if (!this.head) {
      this.head = node;
      this.tail = node;
    } else {
      if (this.length >= this.maxLength)
        this.removeHead();
      node.prev = this.tail;
      this.tail.next = node;
      this.tail = node;
    }
    return this;
  }

  removeHead() {
    this.head = this.head.next;
    this.head.prev = null;
    this.length -= 1;
  }

  traverse( fn ) {
    let current = this.head;
    while (current !== null) {
      fn( current );
      current = current.next;
    }
    return this;
  }

  map( fn ) {
    return this.toArray().map(fn);
  }

  toArray() {
    let ary = [];
    this.traverse((node) => {
      ary.push(node.element);
    });
    return ary;
  }

}
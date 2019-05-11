import Node from './node.js';

export default class NumberNode extends Node {
    constructor(x, y) {
        super(x, y, 1, 1, "Number");
    }
}

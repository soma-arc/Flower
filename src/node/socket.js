import {Randomstr} from '../util.js';

export default class Socket {
    constructor(parentNode, n, inOrOut, x, y) {
        this.parentNode = parentNode;
        this.index = n;
        this.inOrOut = inOrOut;
        this.posX = x;
        this.posY = y;

        this.socketRadius = 10;

        this.id = randomstr();
    }

    static get SOCKET_INPUT() {
        return 0;
    }

    static get SOCKET_OUTPUT() {
        return 1;
    }
}

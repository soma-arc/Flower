import {Randomstr} from '../util.js';
import Socket from './socket.js';

export default class Node {
    constructor(x, y, numInputs, numOutputs, title) {
        this.posX = x;
        this.posY = y;
        this.numInputs = numInputs;
        this.numOutputs = numOutputs;
        this.title = title;

        this.width = 150;
        this.height = 100 + numInputs * 50;
        
        for(let i = 0; i < this.numInputs; i++) {
            this.inputSockets.push(new Socket(this, i, Socket.SOCKET_INPUT,
                                              this.posX, this.posY + 100 + i * 50));
        }
        for(let i = 0; i < this.numOutputs; i++) {
            this.outputSockets.push(new Socket(this, i, Socket.SOCKET_OUTPUT,
                                               this.posX + this.width, this.posY + 50 + i * 50));
        }
        this.id = Randomstr();
    }
}

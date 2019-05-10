import Rete from "rete";
import ConnectionPlugin from 'rete-connection-plugin';
import VueRenderPlugin from 'rete-vue-render-plugin';
import ContextMenuPlugin from 'rete-context-menu-plugin';
import AreaPlugin from 'rete-area-plugin';
import CommentPlugin from 'rete-comment-plugin';
import HistoryPlugin from 'rete-history-plugin';
import Complex from './complex.js';
//import ConnectionMasteryPlugin from 'rete-connection-mastery-plugin';

// https://qiita.com/coa00/items/679b0b5c7c468698d53f
function randomstr(length) {
  var s = "";
  length = length || 32;
  for (let i = 0; i < length; i++) {
      let random = Math.random() * 16 | 0;
      s += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
  }

  return s;
}

class Socket {
    constructor(parentNode, n, inout, x, y) {
        this.parentNode = parentNode;
        this.index = n;
        this.inout = inout;
        this.posX = x;
        this.posY = y;

        this.socketRadius = 10;

        this.id = randomstr();

        this.value;

        this.controls = [];
    }

    addControl(control) {
        this.controls.push(control);
    }

    isSame(socket) {
        console.log(socket);
        return this.id === socket.id;
    }

    setPosition(x, y) {
        this.posX = x;
        this.posY = y;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle = "rgb(0, 200, 0)";
        ctx.arc(this.posX, this.posY, this.socketRadius,
                0, 2 * Math.PI, true);
        ctx.fill();
    }

    isSelected(x, y) {
        const dx = this.posX - x;
        const dy = this.posY - y;
        if(Math.sqrt(dx * dx + dy * dy) < this.socketRadius) {
            return true;
        }
        return false;
    }

    setValue(value) {
        this.value = value;
    }

    getValue() {
        return this.value;
    }

    static get SOCKET_INPUT() {
        return 0;
    }

    static get SOCKET_OUTPUT() {
        return 1;
    }
}

class Connection {
    constructor(socketIn, socketOut) {
        this.socketIn = socketIn;
        this.socketOut = socketOut;
        this.id = randomstr();
    }

    draw(ctx) {
        ctx.fillStyle = "rgb(0, 0, 0)";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(this.socketIn.posX, this.socketIn.posY);
        ctx.lineTo(this.socketOut.posX, this.socketOut.posY);
        ctx.stroke();
    }
}

class NumberControl {
    constructor() {
        this.input = document.createElement( 'input' );
        this.input.defaultValue = 0;
        this.input.type = "number";
        this.input.style.position = 'absolute';
	    this.input.style.border = 'none';
	    this.input.style.background = '#aaa';
	    this.input.style.color = '#444';

        document.body.appendChild(this.input);
    }

    setPosition(x, y, width) {
        this.input.style.left = x +'px';
	    this.input.style.top = y +'px';
	    this.input.style.width = width +'px';
    }

    getValue() {
        return this.input.value;
    }

    setValue(value) {
        this.input.value = value;
    }
}

class Node {
    constructor(canvas, x, y, numInputs, numOutputs, title) {
        this.canvas = canvas;
        this.posX = x;
        this.posY = y;
        this.numInputs = numInputs;
        this.numOutputs = numOutputs;
        this.title = title;

        this.inputSockets = [];
        this.outputSockets = [];

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
        this.id = randomstr();
    }

    draw(ctx) {
        ctx.fillStyle = "rgb(200, 0, 0)";
        ctx.fillRect(this.posX, this.posY,
                     this.width, this.height);

        for(let socket of this.inputSockets) {
            socket.draw(ctx);
        }

        for(let socket of this.outputSockets) {
            socket.draw(ctx);
        }

        ctx.fillStyle = "rgb(0, 0, 0)";
        ctx.font = "20px 'TimesNewRoman'";
        ctx.fillText(this.title, this.posX + 10, this.posY + 20, this.posX + this.width);
    }

    isSelected(x, y) {
        if(this.posX < x && x < this.posX + this.width &&
           this.posY < y && y < this.posY + this.height) {
            return true;
        }

        return false;
    }

    selectSocket(x, y) {
        for(let socket of this.inputSockets) {
            if(socket.isSelected(x, y)) {
                return socket;
            }
        }
        for(let socket of this.outputSockets) {
            if(socket.isSelected(x, y)) {
                return socket;
            }
        }

        return undefined;
    }

    updateControl() {}

    getValue() {
        return undefined;
    }

    setValue() {}

    setPosition(x, y) {
        this.posX = x;
        this.posY = y;
        this.updateControl();

        let i = 0;
        for(let socket of this.inputSockets) {
            socket.setPosition(this.posX, this.posY + 100 + i * 50);
            i++;
        }
        i = 0;
        for(let socket of this.outputSockets) {
            socket.setPosition(this.posX + this.width, this.posY + 50 + i * 50);
            i++;
        }
    }
}

class NumberNode extends Node {
    constructor(canvas, x, y) {
        super(canvas, x, y, 1, 1, "Real Number");

        this.numberControl = new NumberControl();
        this.numberControl.input.addEventListener('change',  (e) => {
            // update output node
            console.log('changed');
            this.numberControl.input.value = 100;
            console.log(this.numberControl.input.value);
        });
        this.updateControl();
    }

    updateControl() {
        this.numberControl.setPosition(this.posX + 25, this.posY + 100, this.width - 50);
    }

    getValue() {
        return this.numberControl.getValue();
    }
}

class ComplexNode extends Node {
    constructor(canvas, x, y) {
        super(canvas, x, y, 2, 1, "Complex");

        this.numberControl1 = new NumberControl();
        this.numberControl1.input.addEventListener('change', (e) => {
            console.log('change1');
        });
        this.numberControl2 = new NumberControl();
        this.numberControl2.input.addEventListener('change', (e) => {
            console.log('change2');
        });
        this.updateControl();

    }

    updateControl() {
        this.numberControl1.setPosition(this.posX + 25, this.posY + 100, this.width - 50);
        this.numberControl2.setPosition(this.posX + 25, this.posY + 150, this.width - 50);
    }

    getValue() {
        return new Complex(this.numberControl1.getValue(),
                           this.numberControl2.getValue());
    }

    updateParent() {
        this.getValue();
    }

    setValue() {
        
    }
}

// class QuaternionNode extends Node {
//      constructor(canvas, x, y) {
//          super(canvas, x, y, 4, 1, "Quaternion");
 //         this.numberControl1 = new NumberControl();
//         this.numberControl2 = new NumberControl();
//         this.numberControl3 = new NumberControl();
//         this.numberControl4 = new NumberControl();
//         this.updateControl();
//     }

//     updateControl() {
//         this.numberControl1.setPosition(this.posX + 25, this.posY + 100, this.width - 50);
//         this.numberControl2.setPosition(this.posX + 25, this.posY + 150, this.width - 50);
//         this.numberControl3.setPosition(this.posX + 25, this.posY + 200, this.width - 50);
//         this.numberControl4.setPosition(this.posX + 25, this.posY + 250, this.width - 50);
//     }
// }

class ComplexAddNode extends Node {
    constructor(canvas, x, y) {
        super(canvas, x, y, 2, 1, "ComplexAdd");

        this.complex1 = new Complex(0, 0);
        this.complex2 = new Complex(0, 0);
    }

    getValue() {
        return this.complex1.add(this.complex2);
    }
}

const MOUSE_STATE_NONE = 0;
const MOUSE_STATE_CLICK_SOCKET = 1;
const MOUSE_STATE_DRAG_BODY = 2;
const connectedNodes = [];

let mouseState = {state: MOUSE_STATE_NONE,
                  selectedNode: undefined,
                  selectedSocket: undefined,
                  diffX: 0,
                  diffY: 0};

const connections = [];

function updateConnection() {
    for (let connection of connections) {
        const v = connection.socketOut.getValue();
        connection.socketIn.parentNode.setValue(v);
    }
}

function draw(nodes, ctx, x, y) {
    ctx.fillStyle = 'rgb(255, 255, 255)';
    ctx.fillRect(0, 0, 1024, 1024);
    
    if (mouseState.state === MOUSE_STATE_CLICK_SOCKET &&
        mouseState.selectedSocket != undefined) {
        ctx.fillStyle = "rgb(0, 0, 0)";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(mouseState.selectedSocket.posX, mouseState.selectedSocket.posY);
        ctx.lineTo(x, y);
        ctx.stroke();
    }

    for(const connection of connections) {
        connection.draw(ctx);
    }

    for(const node of nodes) {
        node.draw(ctx);
    }
}

window.addEventListener('load', async () => {
    const width = 1024;
    const height = 1024;
    const container = document.getElementById('canvas');
    container.width = width;
    container.height = height;
    const ctx = container.getContext('2d');

    const n = new NumberNode(container, 0, 0);
    const c = new ComplexNode(container, 200, 0);
    const c2= new ComplexNode(container, 300, 0);
    const add = new ComplexAddNode(container, 400, 0);
    //const q = new QuaternionNode(container, 150, 0);

    const nodes = [n, c, c2, add];

    draw(nodes, ctx, 0, 0);

    container.addEventListener('mousedown', (event) => {
        const rect = event.target.getBoundingClientRect();
        const canvasX = event.clientX - rect.left;
        const canvasY = event.clientY - rect.top;

        let socket;
        let node;
        
        for(const node of nodes) {
            socket = node.selectSocket(canvasX, canvasY);
            if (socket != undefined) break;
        }
        if (socket === undefined) {
            // did not click socket
            if (mouseState.state === MOUSE_STATE_CLICK_SOCKET) {
                console.log('break click socket');
                mouseState.selectedSocket = undefined;
                mouseState.state = MOUSE_STATE_NONE;
            } else {
                for(const node of nodes) {
                    if (node.isSelected(canvasX, canvasY)) {
                        console.log('drag body')
                        mouseState.diffX = canvasX - node.posX;
                        mouseState.diffY = canvasY - node.posY;
                        mouseState.selectedNode = node;
                        mouseState.state = MOUSE_STATE_DRAG_BODY;
                        return;
                    }
                }
            }
        } else {
            // click socket
            if (mouseState.state === MOUSE_STATE_NONE) {
                console.log('click socket'); // display connection line
                mouseState.state = MOUSE_STATE_CLICK_SOCKET;
                mouseState.selectedSocket = socket;
            } else if (mouseState.state === MOUSE_STATE_CLICK_SOCKET &&
                       socket.parentNode.id != mouseState.selectedSocket.parentNode.id ) {
                console.log('connect');
                connections.push(new Connection(socket, mouseState.selectedSocket));
                mouseState.state = MOUSE_STATE_NONE;
                mouseState.selectedSocket = undefined;
                updateConnection();
            } else {
                console.log('break click socket2');
                mouseState.selectedSocket = undefined;
                mouseState.state = MOUSE_STATE_NONE;
            }
        }
        
        draw(nodes, ctx, canvasX, canvasY);
    });

    container.addEventListener('mousemove', (event) => {
        const rect = event.target.getBoundingClientRect();
        const canvasX = event.clientX - rect.left;
        const canvasY = event.clientY - rect.top;
        if(mouseState.selectedNode != undefined) {
            mouseState.selectedNode.setPosition(canvasX - mouseState.diffX,
                                                canvasY - mouseState.diffY);
            draw(nodes, ctx, 0, 0);
        } else if (mouseState.selectedSocket != undefined) {
            draw(nodes, ctx, canvasX, canvasY);
        }
    });

    container.addEventListener('mouseup', (event) => {
        mouseState.selectedNode = undefined;
        if(mouseState.state === MOUSE_STATE_DRAG_BODY) {
            mouseState.state = MOUSE_STATE_NONE;
        }
    });

    container.addEventListener('mouseleave', (event) => {
        mouseState.selectedNode = undefined;
        if(mouseState.state === MOUSE_STATE_DRAG_BODY) {
            mouseState.state = MOUSE_STATE_NONE;
        }
    });
});

import Canvas from './canvas.js';
import { Edge, FloatEdge } from './node/edge.js';

export class GraphCanvas2d extends Canvas {
    constructor(canvasId, scene) {
        super(canvasId);
        this.scene = scene;
        this.mouseState = {
            isPressing: false,
            prevPosition: [0, 0],
            button: -1
        };

        this.scale = 1;
        this.scaleFactor = 1.25;
        this.translate = [0, 0];

        this.canvas = document.getElementById(this.canvasId);
        this.ctx = this.canvas.getContext('2d');

        this.selectedNode = undefined;
        this.optionNode = undefined;
        this.selectedSocket = undefined;
        this.unfinishedEdge = undefined;

        this.mouseState = { x: 0,
                            y: 0,
                            diffX: 0,
                            diffY: 0 };

        function keyEvent(event) {
            if (event.key === 'Enter') {
                this.optionNode.closeTextbox();
                this.optionNode.isShowingOption = false;
                this.optionNode = undefined;
                this.render();
            }
            if (this.optionNode !== undefined &&
                this.optionNode.isShowingOption) {
                this.optionNode.textbox.keyTextbox(event.key);
                this.render();
            }
        }
        this.canvas.addEventListener('keydown', keyEvent.bind(this));
    }

    resizeCanvas() {
        const parent = this.canvas.parentElement;
        this.canvas.width = parent.clientWidth * this.pixelRatio;
        this.canvas.height = parent.clientHeight * this.pixelRatio;
        this.canvasRatio = this.canvas.width / this.canvas.height / 2;
    }

    render() {
        const ctx = this.ctx;
        ctx.save();

        ctx.fillStyle = 'rgb(220, 220, 220)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.scene.renderGraph(ctx, this.mouseState);

        ctx.restore();
    }

    computeCoordinates(mx, my) {
        const rect = this.canvas.getBoundingClientRect();
        return [mx - rect.left, my - rect.top];
    }

    mouseDownListener(event) {
        event.preventDefault();
        this.canvas.focus();
        const [x, y] = this.computeCoordinates(event.clientX, event.clientY);

        if (this.optionNode !== undefined) {
            this.optionNode.closeTextbox();
            this.optionNode.isShowingOption = false;
            this.optionNode = undefined;
            this.render();
        }

        if (event.button === Canvas.MOUSE_BUTTON_LEFT) {
            this.selectedSocket = this.pressSocket(x, y);
            if (this.selectedSocket === undefined) {
                this.selectedNode = this.pressNode(x, y);
            } else {
                this.scene.unfinishedEdge = new Edge(this.selectedSocket, undefined);
                this.mouseState.x = x;
                this.mouseState.y = y;
            }
            this.render();
        } else if (event.button === Canvas.MOUSE_BUTTON_WHEEL) {
            console.log('wheel');
        } else if (event.button === Canvas.MOUSE_BUTTON_RIGHT) {
            this.optionNode = this.pressNode(x, y);
            if (this.optionNode !== undefined) {
                this.optionNode.isShowingOption = true;
                this.optionNode.showOption();
                this.render();
            } else {
                // ShowMenu
            }
        }
    }

    // keydownListener(event) {
    //     console.log(event);
    //     console.log(event.key);
    //     if (this.selectedNode !== undefined &&
    //         this.selectedNode.isShowingOption) {
    //         this.selectedNode.textbox.keyTextbox(event.key);
    //         this.render();
    //     }
    // }

    mouseUpListener(event) {
        this.selectedNode = undefined;

        if (this.scene.unfinishedEdge !== undefined) {
            const [x, y] = this.computeCoordinates(event.clientX, event.clientY);
            const s = this.pressSocket(x, y);
            if (s !== undefined && s !== this.selectedSocket) {
                const r1 = this.selectedSocket.isOutput;
                const r2 = s.isOutput;
                if (((r1 && !r2) || (!r1 && r2)) &&
                    !this.scene.inputDuplicate(s)) {
                    if (this.scene.unfinishedEdge.s1.socketType === s.socketType) {
                        this.scene.unfinishedEdge.s1.edgeOn = true;
                        s.edgeOn = true;
                        const e = new FloatEdge(this.scene.unfinishedEdge.s1,
                                                s);
                        this.scene.edges.push(e);
                    }
                }
            }

            this.scene.unfinishedEdge = undefined;
        }

        this.render();
    }

    mouseMoveListener(event) {
        event.preventDefault();
        this.canvas.focus();
        const [x, y] = this.computeCoordinates(event.clientX, event.clientY);
        this.mouseState.x = x;
        this.mouseState.y = y;

        if (this.selectedNode !== undefined) {
            this.selectedNode.x = x - this.mouseState['diffX'];
            this.selectedNode.y = y - this.mouseState['diffY'];
            this.render();
        }
        if (this.scene.unfinishedEdge !== undefined) {
            this.render();
        }
    }

    pressNode(x, y) {
        for (const n of this.scene.nodes) {
            if (n.isPressed(x, y)) {
                this.mouseState['diffX'] = x - n.x;
                this.mouseState['diffY'] = y - n.y;
                return n;
            }
        }
        return undefined;
    }

    pressSocket(x, y) {
        for (const n of this.scene.nodes) {
            for (const s of n.sockets) {
                if (s.isPressed(x, y)) {
                    return s;
                }
            }
        }
        return undefined;
    }

    keydownListener(event) {
    }
}

export class ConstructionCanvas2d extends Canvas {
    constructor(canvasId, scene) {
        super(canvasId);
        this.scene = scene;
        this.mouseState = {
            isPressing: false,
            prevPosition: [0, 0],
            button: -1
        };

        this.scale = 1;
        this.scaleFactor = 1.25;
        this.translate = [0, 0];
    }

    init() {
        this.canvas = document.getElementById(this.canvasId);
    }

    render() {
    }
}

import Canvas from './canvas.js';

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
        this.selectedSocket = undefined;

        this.mouseState = { diffX: 0,
                            diffY: 0 };
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

        ctx.fillStyle = 'rgb(255, 255, 255)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.scene.renderGraph(ctx);

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

        if (event.button === Canvas.MOUSE_BUTTON_LEFT) {
            // this.pressSocket(x, y);
            this.selectedNode = this.pressNode(x, y);
        } else if (event.button === Canvas.MOUSE_BUTTON_WHEEL) {
            console.log('wheel');
        } else if (event.button === Canvas.MOUSE_BUTTON_RIGHT) {
            console.log('right');
        }
    }

    mouseUpListener(event) {
        this.selectedNode = undefined;
    }

    mouseMoveListener(event) {
        event.preventDefault();
        this.canvas.focus();
        const [x, y] = this.computeCoordinates(event.clientX, event.clientY);

        if (this.selectedNode !== undefined) {
            this.selectedNode.x = x - this.mouseState['diffX'];
            this.selectedNode.y = y - this.mouseState['diffY'];
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

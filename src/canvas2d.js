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

        ctx.fillStyle = 'rgb(255, 255, 0)';
        ctx.beginPath();
        ctx.rect(0, 0, 100, 100);
        ctx.fill();
        ctx.closePath();

        ctx.restore();
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

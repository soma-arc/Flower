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
    }

    init() {
        this.canvas = document.getElementById(this.canvasId);
        this.ctx = this.canvas.getContext('2d');
    }

    render() {
        this.scene.render(this.ctx);
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

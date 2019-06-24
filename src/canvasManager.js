import { GraphCanvas2d, ConstructionCanvas2d } from './canvas2d.js';

export default class CanvasManager {
    constructor(scene) {
        this.scene = scene;

        this.resizeCallback = this.resize.bind(this);
    }

    init() {
        this.graphCanvas = new GraphCanvas2d('graphCanvas', this.scene);
        this.graphCanvas.resizeCanvas();
        this.graphCanvas.addEventListeners();
    }

    renderGraph() {
        this.graphCanvas.render();
    }

    resize() {
        this.graphCanvas.resizeCanvas();
        this.graphCanvas.render();
    }
}

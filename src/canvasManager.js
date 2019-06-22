import { GraphCanvas2d, ConstructionCanvas2d } from './canvas2d.js';

export default class CanvasManager {
    constructor(scene) {
        this.scene = scene;
    }

    init() {
        this.graphCanvas = new GraphCanvas2d('graphCanvas', this.scene);
    }

    render() {
        this.graphCanvas.render();
    }
}

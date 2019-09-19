import GraphCanvas2d from './canvas/graphCanvas2d.js';
import ConstructionCanvas2d from './canvas/constructionCanvas2d.js';

export default class CanvasManager {
    constructor(scene) {
        this.scene = scene;

        this.resizeCallback = this.resize.bind(this);
    }

    init() {
        this.graphCanvas = new GraphCanvas2d('graphCanvas', this.scene, this);
        this.graphCanvas.resizeCanvas();
        this.graphCanvas.addEventListeners();

        this.constructionCanvas = new ConstructionCanvas2d('constructionCanvas',
                                                           this.scene, this);
        this.constructionCanvas.resizeCanvas();
        this.constructionCanvas.addEventListeners();

        this.constructionCanvas.render();
    }

    renderGraph() {
        this.graphCanvas.render();
    }

    render() {
        this.graphCanvas.render();
        this.constructionCanvas.render();
    }

    compileRenderShader() {
        this.constructionCanvas.compileRenderShader();
    }

    resize() {
        this.graphCanvas.resizeCanvas();
        this.graphCanvas.render();

        this.constructionCanvas.resizeCanvas();
        this.constructionCanvas.render();
    }
}

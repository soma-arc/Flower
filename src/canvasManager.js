import GraphCanvas2d from './canvas/graphCanvas2d.js';
import ConstructionCanvas2d from './canvas/constructionCanvas2d.js';

export default class CanvasManager {
    constructor(scene) {
        this.scene = scene;
        this.graphCanvas = new GraphCanvas2d('graphCanvas', this.scene, this);
        this.constructionCanvas = new ConstructionCanvas2d('constructionCanvas',
                                                           this.scene, this);
        this.resizeCallback = this.resize.bind(this);
    }

    init() {
        this.graphCanvas.init();
        this.graphCanvas.resizeCanvas();
        this.graphCanvas.addEventListeners();

        this.constructionCanvas.init();
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

    loadSceneFromFile() {
        const reader = new FileReader();
        reader.addEventListener('load', () => {
            this.scene.load(JSON.parse(reader.result));
            this.constructionCanvas.compileRenderShader();
            this.constructionCanvas.render();
            this.graphCanvas.render();
        });
        const a = document.createElement('input');
        a.type = 'file';
        a.addEventListener('change', function(event) {
            const files = event.target.files;
            reader.readAsText(files[0]);
        });
        a.click();
    }
}

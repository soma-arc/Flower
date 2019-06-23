export default class Scene {
    constructor() {
        this.nodes = [];
        this.edges = [];
    }

    renderGraph(ctx) {
        for (const e of this.edges) {
            e.renderEdge(ctx);
        }

        for (const n of this.nodes) {
            n.renderNode(ctx, 1);
        }
    }
}

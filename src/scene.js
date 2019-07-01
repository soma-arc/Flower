const OBJ_NAMES = ['Point', 'LineTwoPoints', 'LineMirror',
                   'CircleThreePoints', 'CircleMirror'];

export default class Scene {
    constructor() {
        this.nodes = [];
        this.edges = [];
        this.unfinishedEdge = undefined;
    }

    renderGraph(ctx, mouseState) {
        for (const e of this.edges) {
            e.renderEdge(ctx, 1, mouseState);
        }

        if (this.unfinishedEdge !== undefined) {
            this.unfinishedEdge.renderEdge(ctx, 1, mouseState);
        }

        for (const n of this.nodes) {
            n.renderNode(ctx, 1);
        }
    }

    inputDuplicate(socket) {
        for (const e of this.edges) {
            if (!e.s1.isOutput && e.s1 === socket) return true;
            if (!e.s2.isOutput && e.s2 === socket) return true;
        }
        return false;
    }

    addNode(node) {
        this.nodes.push(node);
    }

    getUniforms() {
        let numPoints = 0;
        for (const n of this.nodes) {
            if (n.name === 'Point') {
                numPoints++;
            }
        }

        return { 'numPoints': numPoints };
    }

    // context for nunjucks
    getContext() {
        const context = {}
        for (const node of this.nodes) {
            for (const nodeName of OBJ_NAMES) {
                if (node.name === nodeName) {
                    if (context[`num${nodeName}`] === undefined) {
                        context[`num${nodeName}`] = 0;
                    }
                    context[`num${nodeName}`]++;
                    break;
                }
            }
        }
        return context;
    }
}

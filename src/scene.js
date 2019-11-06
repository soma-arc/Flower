import Vue from 'vue';
import ConstructionState from './state/constructionState.js';

const OBJ_NAMES = ['Point', 'LineTwoPoints', 'LineMirror',
                   'CircleThreePoints', 'CircleMirror'];

export default class Scene {
    constructor() {
        this.nodes = [];
        this.edges = [];
        this.unfinishedEdge = undefined;
        this.selectedNode = undefined;
        this.constructionState = new ConstructionState();
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

    clearScene() {
        this.nodes = [];
        this.edges = [];
        this.unfinishedEdge = undefined;
        this.selectedNode = undefined;
        this.constructionState = new ConstructionState();
    }

    setUniformLocations(gl, uniLocations, program) {
        const objects = {};
        for (const node of this.nodes) {
            if (node.name === 'Constant' ||
                node.name === 'SinWave' ||
                node.name === 'CircularMotion') continue;
            if (objects[node.name] === undefined) {
                objects[node.name] = [];
            }
            objects[node.name].push(node);
        }
        const objKeyNames = Object.keys(objects);
        for (const objName of objKeyNames) {
            if (objName === 'Constant' ||
                objName === 'SinWave' ||
                objName === 'CircularMotion') continue;
            const objArray = objects[objName];
            for (let i = 0; i < objArray.length; i++) {
                objArray[i].setUniformLocations(gl, uniLocations, program, i);
            }
        }
    }

    setUniformValues(gl, uniLocation, uniIndex, sceneScale) {
        let uniI = uniIndex;
        const objects = {};
        for (const node of this.nodes) {
            if (node.name === 'Constant' ||
                node.name === 'SinWave' ||
                node.name === 'CircularMotion') continue;
            if (objects[node.name] === undefined) {
                objects[node.name] = [];
            }
            objects[node.name].push(node);
        }
        const objKeyNames = Object.keys(objects);
        for (const objName of objKeyNames) {
            if (objName === 'Constant' ||
                objName === 'SinWave' ||
                objName === 'CircularMotion') continue;
            const objArray = objects[objName];
            for (let i = 0; i < objArray.length; i++) {
                uniI = objArray[i].setUniformValues(gl, uniLocation, uniI, sceneScale);
            }
        }
        return uniI;
    }

    // context for nunjucks
    getContext() {
        const context = {};
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

    select (mouse, sceneScale) {
        if (this.constructionState.selectedNode !== undefined) {
            this.constructionState.selectedNode.selected = false;
        }
        for (const node of this.nodes) {
            const state = node.select(mouse, sceneScale);
            if (state.isSelectingNode()) {
                this.constructionState = state;
                if (this.selectedNode !== undefined) this.selectedNode.selected = false;
                this.selectedNode = this.constructionState.selectedNode;
                this.constructionState.selectedNode.selected = true;
                return true;
            }
        }
        this.constructionState = new ConstructionState();
        return false;
    }

    move(mouse, selectionState) {
        if (this.constructionState.isSelectingNode()) {
            this.constructionState.selectedNode.move(mouse, this.constructionState);
            return true;
        }
        return false;
    }

    getNodesWithoutInput(nodeSet) {
        const result = [];
        for (const n of nodeSet) {
            let hasInput = false;
            for (const s of n.sockets) {
                if (s.isOutput === false &&
                   s.edgeOn === true) {
                    hasInput = true;
                }
            }
            if (hasInput === false) {
                result.push(n);
            }
        }
        return result;
    }

    topologicalSort() {
        const L = [];
        const S = this.getNodesWithoutInput(this.nodes);

        for (const e of this.edges) e.markAsDeletion = false;

        while (S.length > 0) {
            const n = S.splice(0, 1)[0];
            L.push(n);
            const outputEdges = this.getOutputEdges(n);
            for (const e of outputEdges) {
                if (e.markAsDeletion) continue;
                const mNode = e.getOutputNode();
                e.markAsDeletion = true;
                if (mNode.hasInputEdge() === false) S.push(mNode);
            }
        }
        return L;
    }

    getOutputEdges(node) {
        const outputEdges = []
        for (const s of node.sockets) {
            if (s.isOutput === false ||
                s.edge === undefined ||
                s.edge.markAsDeletion) continue;
            const e = s.edge;
            outputEdges.push(e);
        }

        return outputEdges;
    }
}

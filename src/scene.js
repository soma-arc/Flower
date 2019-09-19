import Vue from 'vue';
import ConstructionState from './state/constructionState.js';

const OBJ_NAMES = ['Point', 'LineTwoPoints', 'LineMirror',
                   'CircleThreePoints', 'CircleMirror'];

export default class Scene {
    constructor() {
        this.nodes = [];
        this.edges = [];
        this.unfinishedEdge = undefined;
        this.selectedObj = undefined;
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

    setUniformLocations(gl, uniLocations, program) {
        const objects = {};
        for (const node of this.nodes) {
            if (objects[node.name] === undefined) {
                objects[node.name] = [];
            }
            objects[node.name].push(node);
        }
        const objKeyNames = Object.keys(objects);
        for (const objName of objKeyNames) {
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
            if (objects[node.name] === undefined) {
                objects[node.name] = [];
            }
            objects[node.name].push(node);
        }
        const objKeyNames = Object.keys(objects);
        for (const objName of objKeyNames) {
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
        if (this.constructionState.selectedObj !== undefined) {
            this.constructionState.selectedObj.selected = false;
        }
        for (const node of this.nodes) {
            const state = node.select(mouse, sceneScale);
            if (state.isSelectingObj()) {
                this.constructionState = state;
                this.selectedObj = this.constructionState.selectedObj;
                this.constructionState.selectedObj.selected = true;
                return true;
            }
        }
        this.constructionState = new ConstructionState();
        return false;
    }

    move(mouse, selectionState) {
        if (this.constructionState.isSelectingObj()) {
            this.constructionState.selectedObj.move(mouse, this.constructionState);
            return true;
        }
        return false;
    }
}

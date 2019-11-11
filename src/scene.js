import Vue from 'vue';
import ConstructionState from './state/constructionState.js';
import { ConstantNode, SinWaveNode, CircularMotion,
         PointNode, LineTwoPointsNode, LineMirrorNode,
         CircleThreePointsNode, CircleMirrorNode, OrbitSeedNode } from './node/node.js';
import { FloatEdge, PointEdge, LineEdge, CircleEdge } from './node/edge.js';
const OBJ_NAMES = ['Point', 'LineTwoPoints', 'LineMirror',
                   'CircleThreePoints', 'CircleMirror', 'OrbitSeed'];

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
        for (const edge of this.edges) {
            for (const s of node.sockets) {
                if (s.isOutput &&
                    (edge.s1.id === s.id ||
                     edge.s2.id === s.id)) {
                    outputEdges.push(edge);
                    break;
                }
            }
        }
        return outputEdges;
    }

    exportSceneAsJSON() {
        const json = { 'nodes': [], 'edges': [] };
        const objects = this.topologicalSort();
        for (const obj of objects) {
            const sockets = [];
            for (const s of obj.sockets) {
                const socket = {};
                socket['id'] = s.id;
                socket['name'] = s.name;
                socket['isOutput'] = s.isOutput;
                socket['edgeOn'] = s.edgeOn;
                sockets.push(socket);
            }

            const jsonObj = { 'name': obj.name,
                              'x': obj.x,
                              'y': obj.y,
                              'id': obj.id,
                              'sockets': sockets };
            json['nodes'].push(jsonObj);
        }

        for (const edge of this.edges) {
            const edgeJson = { 'id': edge.id,
                               'name': edge.name,
                               's1Id': edge.s1.id,
                               's2Id': edge.s2.id };
            json['edges'].push(edgeJson);
        }
        return json;
    }

    saveSceneAsJson() {
        const blob = new Blob([JSON.stringify(this.exportSceneAsJSON(),
                                              null, '    ')],
                              { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'scene.json';
        a.click();
    }

    load(json) {
        for (const node of json['nodes']) {
            let n = undefined;
            if (node.name === 'Constant') {
                n = new ConstantNode(node.x, node.y);
            } else if (node.name === 'SinWave') {
                n = new SinWaveNode(node.x, node.y);
            } else if (node.name === 'CircularMotion') {
                n = new CircularMotion(node.x, node.y);
            } else if (node.name === 'Point') {
                n = new PointNode(node.x, node.y);
            } else if (node.name === 'LineTwoPoints') {
                n = new LineTwoPointsNode(node.x, node.y);
            } else if (node.name === 'LineMirror') {
                n = new LineMirrorNode(node.x, node.y);
            } else if (node.name === 'CircleThreePoints') {
                n = new CircleThreePointsNode(node.x, node.y);
            } else if (node.name === 'CircleMirror') {
                n = new CircleMirrorNode(node.x, node.y);
            }
            n.id = node.id;

            for (const socket of n.sockets) {
                for (const socketData of node.sockets) {
                    if (socket.isOutput === socketData.isOutput &&
                        socket.name === socketData.name &&
                        socket.edgeOn === socketData.edgeOn) {
                        socket.id = socketData.id;
                        break;
                    }
                }
            }

            this.nodes.push(n);
            console.log(n);
        }
        /*
        console.log(this.nodes);
        
        for (const edge of json['edges']) {
            console.log('edges');
            let s1 = undefined;
            let s2 = undefined;
            let foundS1 = false;
            let foundS2 = false;
            for (const node of this.nodes) {
                console.log(node);
                for (const socket of node.sockets) {
                    if (socket.id === edge.s1Id &&
                        foundS1 === false) {
                        console.log('found s1')
                        s1 = socket;
                        foundS1 = true;
                    }
                    if (socket.id === edge.s2Id &&
                        foundS2 === false) {
                        console.log('found s2')
                        s2 = socket;
                        foundS2 = true;
                    }
                }
            }
            if (s1 === undefined && s2 === undefined) {
                console.log('continue');
                continue;
            }
            let e;
            if (edge.name === 'Float') {
                e = new FloatEdge(s1, s2);
            } else if (edge.name === 'Point') {
                e = new PointEdge(s1, s2);
            } else if (edge.name === 'Line') {
                e = new LineEdge(s1, s2);
            } else if (edge.name === 'Circle') {
                e = new CircleEdge(s1, s2);
            }
            s1.edgeOn = true;
            s1.edge = e;
            console.log(s2);
            s2.edgeOn = true;
            s2.edge = e;
            this.edges.push(e);
        }
    */
    }
}

import Canvas from './canvas.js';
import { Edge, FloatEdge, PointEdge, LineEdge, CircleEdge } from '../node/edge.js';
import { ConstantNode, PointNode, LineTwoPointsNode,
         LineMirrorNode, CircleThreePointsNode,
         CircleMirrorNode, SinWaveNode, CircularMotion } from '../node/node.js';

import GraphState from '../state/graphState.js';

const MENU_ITEM = ['Constant', 'Point', 'LineTwoPoints',
                   'LineMirror', 'CircleThreePoints',
                   'CircleMirror', 'SinWave', 'CircularMotion'];

export default class GraphCanvas2d extends Canvas {
    constructor(canvasId, scene, canvasManager) {
        super(canvasId);
        this.scene = scene;
        this.canvasManager = canvasManager;

        this.canvas = document.getElementById(this.canvasId);
        this.resizeCanvas();
        this.ctx = this.canvas.getContext('2d');

        this.scale = 1;
        this.scaleFactor = 1.25;
        this.translate = [this.canvas.width * 0.5, this.canvas.height * 0.5];

        //this.selectedNode = undefined;
        this.draggingNode = undefined;
        this.optionNode = undefined;
        this.selectedSocket = undefined;
        this.unfinishedEdge = undefined;

        this.mouseState = { x: 0,
                            y: 0,
                            diffX: 0,
                            diffY: 0,
                            button: -1 };

        this.isRenderingMenu = false;
    }

    restoreSocketEdgeOn () {
        for (const n of this.scene.nodes) {
            for (const s of n.sockets) {
                s.edgeOn = false;
            }
        }

        for (const e of this.scene.edges) {
            e.s1.edgeOn = false;
            e.s2.edgeOn = false;
        }
    }

    render() {
        for (let i = 0; i < 5; i++) {
            this.update();
        }

        const ctx = this.ctx;
        ctx.save();

        ctx.fillStyle = 'rgb(220, 220, 220)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.translate(this.translate[0], this.translate[1]);
        ctx.scale(this.scale, this.scale);

        this.scene.renderGraph(ctx, this.mouseState);

        ctx.restore();

        if (this.isRenderingMenu) {
            this.renderMenu(ctx);
        }
    }

    mouseWheelListener(event) {
        event.preventDefault();
        if (event.deltaY > 0) {
            this.scale /= this.scaleFactor;
        } else {
            this.scale *= this.scaleFactor;
        }
    }

    computeCoordinates(mx, my) {
        const rect = this.canvas.getBoundingClientRect();
        return [((mx - rect.left) - this.translate[0]) / this.scale,
                ((my - rect.top) - this.translate[1]) / this.scale];
    }

    computeOriginalCoord(mx, my) {
        const rect = this.canvas.getBoundingClientRect();
        return [(mx - rect.left),
                (my - rect.top)];
    }

    mouseDownListener(event) {
        event.preventDefault();
        this.canvas.focus();
        this.mouseState.button = event.button;
        const [x, y] = this.computeCoordinates(event.clientX, event.clientY);

        if (event.button === Canvas.MOUSE_BUTTON_LEFT) {
            if (this.isRenderingMenu) {
                const [ox, oy] = this.computeOriginalCoord(event.clientX, event.clientY)
                this.selectAddingNodeFromList(ox, oy);
                return;
            }

            for (const n of this.scene.nodes) {
                n.selectNode(x, y);
                if (n.graphState.selection === GraphState.SELECT_OPTION) {
                    return;
                }
                if (n.graphState.selection === GraphState.SELECT_SOCKET) {
                    if (n.graphState.selectedSocket.edgeOn &&
                        n.graphState.selectedSocket.isOutput === false) {
                        const anotherInputSocket = n.graphState.selectedSocket.edge.getAnotherSocket(n.graphState.selectedSocket);
                        this.scene.unfinishedEdge = new Edge(anotherInputSocket, undefined);
                        this.selectedSocket = anotherInputSocket;
                        this.mouseState.x = x;
                        this.mouseState.y = y;
                        for (let e = this.scene.edges.length - 1; e >= 0; e--) {
                            if (n.graphState.selectedSocket.edge === undefined) continue;

                            if (this.scene.edges[e].id === n.graphState.selectedSocket.edge.id) {
                                this.scene.edges.splice(e, 1);
                                n.graphState.selectedSocket.edge.s1.edgeOn = false;
                                n.graphState.selectedSocket.edge.s2.edgeOn = false;
                                n.graphState.selectedSocket.edge = undefined;
                            }
                        }
                    } else {
                        this.scene.unfinishedEdge = new Edge(n.graphState.selectedSocket,
                                                             undefined);
                        if (this.scene.selectedNode !== undefined) this.scene.selectedNode.selected = false;
                        this.scene.selectedNode = n;
                        this.scene.selectedNode.selected = true;
                        this.selectedSocket = n.graphState.selectedSocket;
                        this.mouseState.x = x;
                        this.mouseState.y = y;
                    }
                    return;
                }
                if (n.graphState.selection === GraphState.SELECT_BODY) {
                    this.draggingNode = n;
                    if (this.scene.selectedNode !== undefined) {
                        this.scene.selectedNode.selected = false;
                    }
                    this.scene.selectedNode = n;
                    this.scene.selectedNode.selected = true;
                    // this.mouseState.x = x;
                    // this.mouseState.y = y;
                    return;
                }
            }

            this.addNode(x, y);
        } else if (event.button === Canvas.MOUSE_BUTTON_WHEEL) {
            this.mouseState.x = x;
            this.mouseState.y = y;
        } else if (event.button === Canvas.MOUSE_BUTTON_RIGHT) {
            for (const n of this.scene.nodes) {
                n.selectNode(x, y);
                if (n.graphState.selection === GraphState.SELECT_BODY ||
                    n.graphState.selection === GraphState.SELECT_OPTION) {
                    if (this.scene.selectedNode.id === n.id) {
                        n.isShowingOption = !n.isShowingOption;
                        if (n.selectedBoxIndex === -1) n.selectedBoxIndex = 0;
                    } else {
                        if (this.scene.selectedNode !== undefined) this.scene.selectedNode.selected = false;
                        this.scene.selectedNode = n;
                        this.scene.selectedNode.selected = true;
                    }
                    return;
                }
                if (n.graphState.selection !== GraphState.SELECT_NONE) {
                    if (this.scene.selectedNode !== undefined) {
                        this.scene.selectedNode.selected = false;
                    }
                    this.scene.selectedNode = n;
                    this.scene.selectedNode.selected = true;
                }
            }

            this.isRenderingMenu = !this.isRenderingMenu;
        }
    }

    mouseUpListener(event) {
        if (this.scene.unfinishedEdge !== undefined) {
            const [x, y] = this.computeCoordinates(event.clientX, event.clientY);
            const s = this.pressSocket(x, y);

            if (s !== undefined && s.id !== this.selectedSocket.id) {
                const r1 = this.selectedSocket.isOutput;
                const r2 = s.isOutput;
                if (((r1 && !r2) || (!r1 && r2)) &&
                    !this.scene.inputDuplicate(s)) {
                    if (this.scene.unfinishedEdge.s1.name === s.name) {
                        if (this.scene.unfinishedEdge.s1.name === 'Float') {
                            this.pushEdge(s, new FloatEdge(this.scene.unfinishedEdge.s1, s));
                        }
                        if (this.scene.unfinishedEdge.s1.name === 'Point') {
                            this.pushEdge(s, new PointEdge(this.scene.unfinishedEdge.s1, s));
                        }
                        if (this.scene.unfinishedEdge.s1.name === 'Line') {
                            this.pushEdge(s, new LineEdge(this.scene.unfinishedEdge.s1, s));
                        }
                        if (this.scene.unfinishedEdge.s1.name === 'Circle') {
                            this.pushEdge(s, new CircleEdge(this.scene.unfinishedEdge.s1, s));
                        }
                    }
                }
            }

            this.scene.unfinishedEdge = undefined;
        }

        this.draggingNode = undefined;
        this.selectedSocket = undefined;
        this.mouseState.button = -1;
        // this.canvasManager.constructionCanvas.render();
    }

    pushEdge(socket, edge) {
        this.scene.unfinishedEdge.s1.edgeOn = true;
        socket.edgeOn = true;
        this.scene.unfinishedEdge.s1.edge = edge;
        socket.edge = edge;
        this.scene.edges.push(edge);
    }

    mouseMoveListener(event) {
        event.preventDefault();
        this.canvas.focus();
        const [x, y] = this.computeCoordinates(event.clientX, event.clientY);
        let flag = false;

        if (this.scene.unfinishedEdge !== undefined) {
            this.mouseState.x = x;
            this.mouseState.y = y;
            flag = true;
        } else if (this.draggingNode !== undefined) {
            this.draggingNode.x = x - this.draggingNode.graphState.diffX;
            this.draggingNode.y = y - this.draggingNode.graphState.diffY;
            flag = true;
        }

        if (this.mouseState.button === Canvas.MOUSE_BUTTON_WHEEL) {
            this.translate[0] += x - this.mouseState.x;
            this.translate[1] += y - this.mouseState.y;
            flag = true;
        }

    }

    renderMenu(ctx) {
        for (let y = 0; y < MENU_ITEM.length; y++) {
            ctx.strokeStyle = 'black';
            ctx.fillStyle = 'pink';
            ctx.beginPath();
            ctx.rect(5, 5 + y * 30, 150, 30);
            ctx.fill();
            ctx.stroke();
        }

        for (let y = 0; y < MENU_ITEM.length; y++) {
            ctx.font = "18px 'Times New Roman'";
            ctx.fillStyle = 'black';
            ctx.fillText(MENU_ITEM[y], 10, 30 + y * 30);
        }
    }

    selectAddingNodeFromList(x, y) {
        let index = -1;
        for (let yy = 0; yy < MENU_ITEM.length; yy++) {
            //ctx.rect(5, 5 + y * 30, 150, 30);
            if (5 < x && x < 5 + 150 &&
                5 + yy * 30 < y && y < 5 + yy * 30 + 30) {
                index = yy;
                break;
            }
        }

        if (index === -1) {
            this.addingNode = undefined;
        }

        this.addingNode = MENU_ITEM[index];
        console.log(this.addingNode);
        this.isRenderingMenu = false;
    }

    addNode(x, y) {
        switch (this.addingNode) {
        case 'Constant': {
            this.scene.addNode(new ConstantNode(x, y));
            break;
        }
        case 'Point': {
            this.scene.addNode(new PointNode(x, y));
            break;
        }
        case 'LineTwoPoints': {
            this.scene.addNode(new LineTwoPointsNode(x, y));
            break;
        }
        case 'LineMirror': {
            this.scene.addNode(new LineMirrorNode(x, y));
            break;
        }
        case 'CircleThreePoints': {
            this.scene.addNode(new CircleThreePointsNode(x, y));
            break;
        }
        case 'CircleMirror': {
            this.scene.addNode(new CircleMirrorNode(x, y));
            break;
        }
        case 'SinWave': {
            this.scene.addNode(new SinWaveNode(x, y));
            break;
        }
        case 'CircularMotion': {
            this.scene.addNode(new CircularMotion(x, y));
            break;
        }
        }
        if (this.scene.selectedNode !== undefined) {
            this.scene.selectedNode.selected = false;
        }
        this.scene.selectedNode = this.scene.nodes[this.scene.nodes.length - 1];
        if (this.scene.selectedNode !== undefined) this.scene.selectedNode.selected = true;
        this.canvasManager.compileRenderShader();
    }

    keydownListener(event) {
        if (event.key === 'Delete') {
            for (let n = this.scene.nodes.length - 1; n >= 0; n--) {
                if (this.scene.selectedNode === undefined) break;
                if (this.scene.nodes[n].id === this.scene.selectedNode.id) {
                    this.scene.nodes.splice(n, 1);

                    for (const socket of this.scene.selectedNode.sockets) {
                        for (let e = this.scene.edges.length - 1; e >= 0; e--) {
                            if (socket.edge === undefined) continue;
                            if (this.scene.edges[e].id === socket.edge.id) {
                                this.scene.edges.splice(e, 1);
                                socket.edge.s1.edgeOn = false;
                                socket.edge.s2.edgeOn = false;
                                socket.edge = undefined;
                            }
                        }
                    }
                    this.scene.selectedNode = undefined;
                    break;
                }
            }

            this.restoreSocketEdgeOn();
            this.canvasManager.compileRenderShader();
        } else if (this.scene.selectedNode !== undefined &&
            this.scene.selectedNode.isShowingOption) {
            this.scene.selectedNode.keydown(event.key);
        }
    }

    pressNode(x, y) {
        for (const n of this.scene.nodes) {
            if (n.isPressed(x, y)) {
                this.mouseState['diffX'] = x - n.x;
                this.mouseState['diffY'] = y - n.y;
                return n;
            }
        }
        return undefined;
    }

    pressSocket(x, y) {
        for (const n of this.scene.nodes) {
            for (const s of n.sockets) {
                if (s.isPressedAndDiff(x, y)[0]) {
                    return s;
                }
            }
        }
        return undefined;
    }

    update() {
        for (const e of this.scene.edges) {
            e.update();
        }

        for (const n of this.scene.nodes) {
            n.update();
        }
    }
}

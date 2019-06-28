import Canvas from './canvas.js';
import { Edge, FloatEdge } from './node/edge.js';
import { ConstantNode, PointNode, LineTwoPointsNode,
         LineMirrorNode, CircleThreePointsNode,
         CircleMirrorNode } from './node/node.js';

const MENU_ITEM = ['Constant', 'Point', 'LineTwoPoints',
                   'LineMirror', 'CircleThreePoints',
                   'CircleMirror'];

export class GraphCanvas2d extends Canvas {
    constructor(canvasId, scene) {
        super(canvasId);
        this.scene = scene;
        this.mouseState = {
            isPressing: false,
            prevPosition: [0, 0],
            button: -1
        };

        this.scale = 1;
        this.scaleFactor = 1.25;
        this.translate = [0, 0];

        this.canvas = document.getElementById(this.canvasId);
        this.ctx = this.canvas.getContext('2d');

        this.selectedNode = undefined;
        this.draggingNode = undefined;
        this.optionNode = undefined;
        this.selectedSocket = undefined;
        this.unfinishedEdge = undefined;

        this.mouseState = { x: 0,
                            y: 0,
                            diffX: 0,
                            diffY: 0 };

        function keyEvent(event) {
            if (event.key === 'Enter') {
                this.optionNode.closeTextbox();
                this.optionNode.isShowingOption = false;
                this.optionNode = undefined;
                this.render();
            } else if (event.key === 'Delete') {
                for (let e = this.scene.edges.length - 1; e >= 0; e--) {
                    if (this.scene.edges[e].s1.parent.selected ||
                        this.scene.edges[e].s2.parent.selected) {
                        this.scene.edges.splice(e, 1);
                    }
                }
                for (let n = this.scene.nodes.length - 1; n >= 0; n--) {
                    if (this.scene.nodes[n].selected) {
                        this.scene.nodes.splice(n, 1);
                    }
                }
                this.restoreSocketEdgeOn();
                this.render();
            }
            if (this.optionNode !== undefined &&
                this.optionNode.isShowingOption) {
                this.optionNode.textbox.keyTextbox(event.key);
                this.render();
            }
        }
        this.canvas.addEventListener('keydown', keyEvent.bind(this));

        this.isRenderingMenu = false;
    }

    restoreSocketEdgeOn () {
        for (const n of this.scene.nodes) {
            for (const s of n.sockets) {
                s.edgeOn = false;
            }
        }

        for (const e of this.scene.edges) {
            e.s1.edgeOn = true;
            e.s2.edgeOn = true;
        }
    }
    
    resizeCanvas() {
        const parent = this.canvas.parentElement;
        this.canvas.width = parent.clientWidth * this.pixelRatio;
        this.canvas.height = parent.clientHeight * this.pixelRatio;
        this.canvasRatio = this.canvas.width / this.canvas.height / 2;
    }

    render() {
        const ctx = this.ctx;
        ctx.save();

        ctx.fillStyle = 'rgb(220, 220, 220)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.scene.renderGraph(ctx, this.mouseState);

        if (this.isRenderingMenu) {
            this.renderMenu(ctx);
        }

        ctx.restore();
    }

    computeCoordinates(mx, my) {
        const rect = this.canvas.getBoundingClientRect();
        return [mx - rect.left, my - rect.top];
    }

    mouseDownListener(event) {
        event.preventDefault();
        this.canvas.focus();
        const [x, y] = this.computeCoordinates(event.clientX, event.clientY);

        if (this.optionNode !== undefined) {
            this.optionNode.closeTextbox();
            this.optionNode.isShowingOption = false;
            this.optionNode = undefined;
            this.render();
        }

        if (event.button === Canvas.MOUSE_BUTTON_LEFT) {
            this.selectedSocket = this.pressSocket(x, y);
            if (this.selectedSocket === undefined) {
                if (this.selectedNode !== undefined) {
                    this.selectedNode.selected = false;
                }
                this.draggingNode = this.pressNode(x, y);
                this.selectedNode = this.draggingNode;
                if (this.draggingNode === undefined) {
                    if (this.isRenderingMenu) {
                        this.selectAddNode(x, y);
                    } else {
                        this.addNode(x, y);
                    }
                } else {
                    this.draggingNode.selected = true;
                }
            } else {
                this.scene.unfinishedEdge = new Edge(this.selectedSocket, undefined);
                this.mouseState.x = x;
                this.mouseState.y = y;
            }
            this.render();
        } else if (event.button === Canvas.MOUSE_BUTTON_WHEEL) {
            console.log('wheel');
        } else if (event.button === Canvas.MOUSE_BUTTON_RIGHT) {
            this.optionNode = this.pressNode(x, y);
            if (this.optionNode !== undefined) {
                this.optionNode.isShowingOption = true;
                this.optionNode.showOption();
            } else {
                this.isRenderingMenu = !this.isRenderingMenu;
            }
            this.render();
        }
    }

    renderMenu(ctx) {
        for (let y = 0; y < MENU_ITEM.length; y++) {
            ctx.strokeStyle = 'black';
            ctx.fillStyle = 'pink';
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

    selectAddNode(x, y) {
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
        }
    }

    // keydownListener(event) {
    //     console.log(event);
    //     console.log(event.key);
    //     if (this.draggingNode !== undefined &&
    //         this.draggingNode.isShowingOption) {
    //         this.draggingNode.textbox.keyTextbox(event.key);
    //         this.render();
    //     }
    // }

    mouseUpListener(event) {
        this.draggingNode = undefined;

        if (this.scene.unfinishedEdge !== undefined) {
            const [x, y] = this.computeCoordinates(event.clientX, event.clientY);
            const s = this.pressSocket(x, y);
            if (s !== undefined && s !== this.selectedSocket) {
                const r1 = this.selectedSocket.isOutput;
                const r2 = s.isOutput;
                if (((r1 && !r2) || (!r1 && r2)) &&
                    !this.scene.inputDuplicate(s)) {
                    if (this.scene.unfinishedEdge.s1.socketType === s.socketType) {
                        this.scene.unfinishedEdge.s1.edgeOn = true;
                        s.edgeOn = true;
                        const e = new FloatEdge(this.scene.unfinishedEdge.s1,
                                                s);
                        this.scene.edges.push(e);
                    }
                }
            }

            this.scene.unfinishedEdge = undefined;
        }

        this.render();
    }

    mouseMoveListener(event) {
        event.preventDefault();
        this.canvas.focus();
        const [x, y] = this.computeCoordinates(event.clientX, event.clientY);
        this.mouseState.x = x;
        this.mouseState.y = y;

        if (this.draggingNode !== undefined) {
            this.draggingNode.x = x - this.mouseState['diffX'];
            this.draggingNode.y = y - this.mouseState['diffY'];
            this.render();
        }
        if (this.scene.unfinishedEdge !== undefined) {
            this.render();
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
                if (s.isPressed(x, y)) {
                    return s;
                }
            }
        }
        return undefined;
    }

    keydownListener(event) {
    }
}

export class ConstructionCanvas2d extends Canvas {
    constructor(canvasId, scene) {
        super(canvasId);
        this.scene = scene;
        this.mouseState = {
            isPressing: false,
            prevPosition: [0, 0],
            button: -1
        };

        this.scale = 1;
        this.scaleFactor = 1.25;
        this.translate = [0, 0];
    }

    init() {
        this.canvas = document.getElementById(this.canvasId);
    }

    render() {
    }
}

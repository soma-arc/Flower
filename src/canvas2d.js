import Canvas from './canvas.js';
import { Edge, FloatEdge, PointEdge, LineEdge, CircleEdge } from './node/edge.js';
import { ConstantNode, PointNode, LineTwoPointsNode,
         LineMirrorNode, CircleThreePointsNode,
         CircleMirrorNode } from './node/node.js';
import { GetWebGL2Context, CreateSquareVbo, CreateRGBATextures,
         AttachShader, LinkProgram } from './glUtils.js';

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

    render() {
        for (let i = 0; i < 5; i++) {
            this.update();
        }

        const ctx = this.ctx;
        ctx.save();

        ctx.fillStyle = 'rgb(220, 220, 220)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.isRenderingMenu) {
            this.renderMenu(ctx);
        }

        this.scene.renderGraph(ctx, this.mouseState);

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

    keydownListener(event) {
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
                        if (this.scene.unfinishedEdge.s1.socketType === 'Float') {
                            this.scene.unfinishedEdge.s1.edgeOn = true;
                            s.edgeOn = true;
                            const e = new FloatEdge(this.scene.unfinishedEdge.s1,
                                                    s);
                            this.scene.edges.push(e);
                        }
                        if (this.scene.unfinishedEdge.s1.socketType === 'Point') {
                            this.scene.unfinishedEdge.s1.edgeOn = true;
                            s.edgeOn = true;
                            const e = new PointEdge(this.scene.unfinishedEdge.s1, s);
                            this.scene.edges.push(e);
                        }
                        if (this.scene.unfinishedEdge.s1.socketType === 'Line') {
                            this.scene.unfinishedEdge.s1.edgeOn = true;
                            s.edgeOn = true;
                            const e = new LineEdge(this.scene.unfinishedEdge.s1, s);
                            this.scene.edges.push(e);
                        }
                        if (this.scene.unfinishedEdge.s1.socketType === 'Circle') {
                            this.scene.unfinishedEdge.s1.edgeOn = true;
                            s.edgeOn = true;
                            const e = new CircleEdge(this.scene.unfinishedEdge.s1, s);
                            this.scene.edges.push(e);
                        }
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

    update() {
        for (const e of this.scene.edges) {
            e.update();
        }

        for (const n of this.scene.nodes) {
            n.update();
        }
    }
}

const RENDER_FRAGMENT = require('./shaders/render.frag');
const RENDER_VERTEX = require('./shaders/render.vert');
const CONSTRUCTION_FRAG = require('./shaders/construction.frag');

export class ConstructionCanvas2d extends Canvas {
    constructor(canvasId, scene) {
        super(canvasId);
        this.scene = scene;
        this.mouseState = {
            isPressing: false,
            prevPosition: [0, 0],
            button: -1
        };

        this.canvas = document.getElementById(this.canvasId);

        this.scale = 1;
        this.scaleFactor = 1.25;
        this.translate = [0, 0];

        this.gl = GetWebGL2Context(this.canvas);
        this.vertexBuffer = CreateSquareVbo(this.gl);

        // render to canvas
        this.renderCanvasProgram = this.gl.createProgram();
        AttachShader(this.gl, RENDER_VERTEX,
                     this.renderCanvasProgram, this.gl.VERTEX_SHADER);
        AttachShader(this.gl, RENDER_FRAGMENT,
                     this.renderCanvasProgram, this.gl.FRAGMENT_SHADER);
        LinkProgram(this.gl, this.renderCanvasProgram);
        this.renderCanvasVAttrib = this.gl.getAttribLocation(this.renderCanvasProgram,
                                                             'a_vertex');

        this.compileRenderShader();
        this.initRenderTextures();
        this.texturesFrameBuffer = this.gl.createFramebuffer();
    }

    compileRenderShader() {
        this.renderProgram = this.gl.createProgram();
        AttachShader(this.gl, RENDER_VERTEX, this.renderProgram, this.gl.VERTEX_SHADER);
        // attachShader(this.gl, CIRCLE_EDGE_SHADER_TMPL.render(this.scene.getContext()),
        //              this.renderProgram, this.gl.FRAGMENT_SHADER);
        AttachShader(this.gl, CONSTRUCTION_FRAG,
                     this.renderProgram, this.gl.FRAGMENT_SHADER);
        LinkProgram(this.gl, this.renderProgram);
        this.renderVAttrib = this.gl.getAttribLocation(this.renderProgram, 'a_vertex');
        this.getRenderUniformLocations();
    }

    initRenderTextures() {
        this.renderTextures = CreateRGBATextures(this.gl, this.canvas.width,
                                                 this.canvas.height, 2);
    }

    getRenderUniformLocations() {
        this.uniLocations = [];
        this.uniLocations.push(this.gl.getUniformLocation(this.renderProgram,
                                                          'u_accTexture'));
        // this.uniLocations.push(this.gl.getUniformLocation(this.renderProgram,
        //                                                   'u_resolution'));
        // this.uniLocations.push(this.gl.getUniformLocation(this.renderProgram,
        //                                                   'u_geometry'));
        // this.uniLocations.push(this.gl.getUniformLocation(this.renderProgram,
        //                                                   'u_maxIISIterations'));
        // this.uniLocations.push(this.gl.getUniformLocation(this.renderProgram,
        //                                                   'u_isRenderingGenerator'));
        // this.scene.setUniformLocation(this.gl, this.uniLocations, this.renderProgram);
    }

    setRenderUniformValues(width, height, texture) {
        let i = 0;
        let textureIndex = 0;

        this.gl.activeTexture(this.gl.TEXTURE0 + textureIndex);
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.uniform1i(this.uniLocations[i++], textureIndex);
        // this.gl.uniform2f(this.uniLocations[i++], width, height);
        // this.gl.uniform3f(this.uniLocations[i++],
        //                   this.translate.x, this.translate.y, this.scale);
        // this.gl.uniform1i(this.uniLocations[i++], this.maxIterations);
        // this.gl.uniform1i(this.uniLocations[i++], this.isRenderingGenerator);
        // i = this.scene.setUniformValues(this.gl, this.uniLocations, i, this.scale);
    }

    renderToTexture(textures, width, height) {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.texturesFrameBuffer);
        this.gl.viewport(0, 0, width, height);
        this.gl.useProgram(this.renderProgram);
        this.setRenderUniformValues(width, height, textures[0]);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0,
                                     this.gl.TEXTURE_2D, textures[1], 0);
        this.gl.enableVertexAttribArray(this.renderVAttrib);
        this.gl.vertexAttribPointer(this.renderVAttrib, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        textures.reverse();
    }

    renderTexturesToCanvas(textures) {
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.useProgram(this.renderCanvasProgram);
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, textures[0]);
        const tex = this.gl.getUniformLocation(this.renderProgram, 'u_texture');
        this.gl.uniform1i(tex, textures[0]);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.vertexAttribPointer(this.renderCanvasVAttrib, 2,
                                    this.gl.FLOAT, false, 0, 0);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        this.gl.flush();
    }

    render() {
        this.renderToTexture(this.renderTextures, this.canvas.width, this.canvas.height);
        this.renderTexturesToCanvas(this.renderTextures);
    }
}

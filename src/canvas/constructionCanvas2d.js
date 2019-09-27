import Canvas from './canvas.js';
import { GetWebGL2Context, CreateSquareVbo, CreateRGBATextures, CreateRGBTextures,
         AttachShader, LinkProgram } from '../glUtils.js';

const RENDER_FRAGMENT = require('../shaders/render.frag');
const RENDER_VERTEX = require('../shaders/render.vert');
const CONSTRUCTION_FRAG_TMPL = require('../shaders/construction.njk.frag');

export default class ConstructionCanvas2d extends Canvas {
    constructor(canvasId, scene, canvasManager) {
        super(canvasId);
        this.scene = scene;
        this.canvasManager = canvasManager;
        this.mouseState = {
            isPressing: false,
            prevPosition: [0, 0],
            prevTranslate: [0, 0],
            button: -1
        };

        this.canvas = document.getElementById(this.canvasId);
        this.resizeCanvas();

        this.scale = 100;
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

    mouseWheelListener(event) {
        event.preventDefault();
        if (event.deltaY < 0) {
            this.scale /= this.scaleFactor;
        } else {
            this.scale *= this.scaleFactor;
        }
    }

    mouseDownListener(event) {
        event.preventDefault();
        this.canvas.focus();
        const mouse = this.calcSceneCoord(event.clientX, event.clientY);
        this.mouseState.button = event.button;

        if (event.button === Canvas.MOUSE_BUTTON_LEFT) {
            this.scene.select(mouse, this.scale);
        }

        this.mouseState.prevPosition = mouse;
        this.mouseState.prevTranslate = this.translate;
        this.mouseState.isPressing = true;
    }

    mouseMoveListener(event) {
        // envent.button return 0 when the mouse is not pressed.
        // Thus we check if the mouse is pressed.
        if (!this.mouseState.isPressing) return;
        const mouse = this.calcSceneCoord(event.clientX, event.clientY);
        if (this.mouseState.button === Canvas.MOUSE_BUTTON_LEFT) {
            const moved = this.scene.move(mouse);
            if (moved) {
            }
        } else if (this.mouseState.button === Canvas.MOUSE_BUTTON_WHEEL) {
            this.translate[0] = this.translate[0] - (mouse[0] - (this.mouseState.prevPosition[0]))
            this.translate[1] = this.translate[1] - (mouse[1] - (this.mouseState.prevPosition[1]))
        }
    }

    mouseUpListener(event) {
        this.mouseState.isPressing = false;
    }

    mouseOutListener(event) {
        this.mouseState.isPressing = false;
    }

    /**
     * Calculate screen coordinates from mouse position
     * scale * [-width/2, width/2]x[-height/2, height/2]
     * @param {number} mx
     * @param {number} my
     * @returns {Vec2}
     */
    calcCanvasCoord(mx, my) {
        const rect = this.canvas.getBoundingClientRect();
        return [this.scale * (((mx - rect.left) * this.pixelRatio) /
                              this.canvas.height - this.canvasRatio),
                this.scale * -(((my - rect.top) * this.pixelRatio) /
                               this.canvas.height - 0.5)];
    }

    /**
     * Calculate coordinates on scene (consider translation) from mouse position
     * @param {number} mx
     * @param {number} my
     * @returns {Vec2}
     */
    calcSceneCoord(mx, my) {
        const [x, y] = this.calcCanvasCoord(mx, my);
        return [x + this.translate[0], y + this.translate[1]];
    }

    compileRenderShader() {
        this.renderProgram = this.gl.createProgram();
        AttachShader(this.gl, RENDER_VERTEX, this.renderProgram, this.gl.VERTEX_SHADER);
        // attachShader(this.gl, CIRCLE_EDGE_SHADER_TMPL.render(this.scene.getContext()),
        //              this.renderProgram, this.gl.FRAGMENT_SHADER);
        AttachShader(this.gl, CONSTRUCTION_FRAG_TMPL.render(this.scene.getContext()),
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
        this.uniLocations.push(this.gl.getUniformLocation(this.renderProgram,
                                                          'u_resolution'));
        this.uniLocations.push(this.gl.getUniformLocation(this.renderProgram,
                                                          'u_geometry'));

        // for (let n = 0; n < this.numPoints.length; n++) {
        //     this.uniLocations.push(this.gl.getUniformLocation(this.renderProgram,
        //                                                       `u_point${n}`));
        // }
        // this.uniLocations.push(this.gl.getUniformLocation(this.renderProgram,
        //                                                   'u_maxIISIterations'));
        // this.uniLocations.push(this.gl.getUniformLocation(this.renderProgram,
        //                                                   'u_isRenderingGenerator'));
        this.scene.setUniformLocations(this.gl, this.uniLocations, this.renderProgram);
    }

    setRenderUniformValues(width, height, texture) {
        let i = 0;
        let textureIndex = 0;
        this.gl.activeTexture(this.gl.TEXTURE0 + textureIndex);
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.uniform1i(this.uniLocations[i++], textureIndex);
        this.gl.uniform2f(this.uniLocations[i++], width, height);
        this.gl.uniform3f(this.uniLocations[i++],
                          this.translate[0], this.translate[1], this.scale);
        // this.gl.uniform1i(this.uniLocations[i++], this.maxIterations);
        // this.gl.uniform1i(this.uniLocations[i++], this.isRenderingGenerator);
        i = this.scene.setUniformValues(this.gl, this.uniLocations, i, this.scale);
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

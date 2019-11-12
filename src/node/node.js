import { FloatSocket,
         PointSocket,
         LineSocket,
         CircleSocket,
         Vec3Socket } from '../socket/socket.js';
import Textbox from '../textbox.js';
import ConstructionState from '../state/constructionState.js';
import GraphState from '../state/graphState.js';

export class Node {
    constructor(x, y) {
        this.sockets = [];
        this.selected = false;
        this.nodeColor = 'rgb(255, 255, 255)';
        this.x = x;
        this.y = y;
        this.width = 100;
        this.height = 100;
        this.leftX = 0;
        this.rightX = this.width;
        this.upY = 10;
        this.downY1 = this.height - 10;
        this.downY2 = this.height - 25;
        this.downY3 = this.height - 40;
        this.downY4 = this.height - 55;
        this.name = '';
        this.isShowingOption = false;

        this.textbox = new Textbox();
        this.id = this.getUniqueStr();

        this.constructionState = new ConstructionState();
        this.graphState = new GraphState();

        this.optionArray = [];
        this.isCheckBox = [];
        this.reverse = [];
        this.selectedBoxIndex = -1;
        this.optionWidth = 190;
        this.optionHeight = 34;

        this.currentCursors = []; // 0 ... rightmost edge
    }

    getUniqueStr(myStrong) {
        let strong = 1000;
        if (myStrong) strong = myStrong;
        return new Date().getTime().toString(16) + Math.floor(strong * Math.random()).toString(16)
    }

    hasInputEdge() {
        for (const s of this.sockets) {
            if (s.isOutput === false &&
                s.edgeOn === true &&
                s.edge.markAsDeletion === false) {
                return true;
            }
        }
        return false;
    }

    renderPane(ctx, sceneScale) {
        if (this.selected) {
            ctx.lineWidth = 3.0;
            ctx.strokeStyle = 'rgb(0, 0, 255)';
        } else {
            ctx.lineWidth = 1.0;
            ctx.strokeStyle = 'rgb(0, 0, 0)';
        }
        ctx.fillStyle = this.nodeColor;
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();

        ctx.lineWidth = 1.0;
        for (const s of this.sockets) {
            s.renderSocket(ctx);
        }
        ctx.fillStyle = 'rgb(0, 0, 0)';
        ctx.font = "12px 'Times New Roman'";
        ctx.fillText(this.name, this.x + 6, this.y + 18);
    }

    renderNode(ctx, sceneScale) {
        this.renderPane(ctx, sceneScale);

        this.renderOption(ctx);
    }

    renderOption(ctx) {
        if (this.isShowingOption === false &&
            this.selected === false) {
            return;
        }
    }

    renderOptionBoxes(ctx, optionNames) {
        const numBoxes = optionNames.length;
        if (numBoxes <= 0) return;
        for (let y = 0; y < numBoxes; y++) {
            ctx.strokeStyle = 'black';
            ctx.fillStyle = 'rgb(228, 228, 228)';
            const xx = this.x + 12;
            const yy = this.y + 24 + y * this.optionHeight;
            ctx.beginPath();
            ctx.rect(xx, yy, this.optionWidth, this.optionHeight);
            ctx.fill();
            ctx.stroke();
            ctx.closePath();

            ctx.fillStyle = 'white';
            if (this.selectedBoxIndex === y) {
                ctx.strokeStyle = 'blue';
            } else {
                ctx.strokeStyle = 'black';
            }
            const boxStartX = xx + 5;
            const boxStartY = yy + 5;
            const dataTextStartX = boxStartX + 5;
            const dataTextStartY = boxStartY + 18;
            if (this.isCheckBox.length === numBoxes &&
                this.isCheckBox[y]) {
                // checkbox
                ctx.beginPath();
                ctx.rect(boxStartX, boxStartY, 24, 24);
                ctx.fill();
                ctx.stroke();
                ctx.closePath();

                ctx.fillStyle = 'black';
                ctx.font = "21px 'Times New Roman'";
                if (this.reverse[y]) {
                    ctx.beginPath();
                    ctx.rect(boxStartX + 5, boxStartY + 5, 14, 14);
                    ctx.fill();
                    ctx.stroke();
                    ctx.closePath();
                }
                ctx.fillText(optionNames[y], xx + 35, yy + 23);
            } else {
                // number input
                // draw textbox
                ctx.beginPath();
                ctx.rect(boxStartX, boxStartY, 80, 24);
                ctx.fill();
                ctx.stroke();
                ctx.closePath();

                // draw data as text
                ctx.fillStyle = 'black';
                ctx.font = "21px 'Times New Roman'";
                ctx.fillText(optionNames[y], xx + 90, yy + 23);

                ctx.fillText(this[optionNames[y]], dataTextStartX, dataTextStartY);

                if (this.selectedBoxIndex === y) {
                    this.renderCursor(ctx, dataTextStartX, boxStartY,
                                      `${this[optionNames[y]]}`.length,
                                      this.currentCursors[y]);
                }
            }
        }
    }

    renderCursor(ctx, textboxStartX, textboxStartY, textLength, cursor) {
        ctx.fillStyle = 'black'
        ctx.strokeStyle = 'black'
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(textboxStartX + (textLength - cursor) * 11,
                   textboxStartY + 2);
        ctx.lineTo(textboxStartX + (textLength - cursor) * 11,
                   textboxStartY + 24 - 2);
        ctx.stroke();
        ctx.closePath();
    }

    keydown(key) {
        console.log(key);
        let boxValueStr = `${this[this.optionArray[this.selectedBoxIndex]]}`;
        const cursorFromLeft = (boxValueStr.length - this.currentCursors[this.selectedBoxIndex]);
        if (key === 'ArrowRight') {
            if (this.currentCursors[this.selectedBoxIndex] > 0) {
                this.currentCursors[this.selectedBoxIndex]--;
            }
        } else if (key === 'ArrowLeft') {
            if (this.currentCursors[this.selectedBoxIndex] < `${this[this.optionArray[this.selectedBoxIndex]]}`.length) {
                this.currentCursors[this.selectedBoxIndex]++;
            }
        } else if (key === 'ArrowUp') {
            if (this.selectedBoxIndex > 0) this.selectedBoxIndex--;
        } else if (key === 'ArrowDown') {
            if (this.selectedBoxIndex < this.optionArray.length - 1) this.selectedBoxIndex++;
        } else if (key === 'Backspace') {
            if (cursorFromLeft === 0) {
                return;
            };
            boxValueStr = this.spliceSplit(boxValueStr, cursorFromLeft - 1, 1);
            if (boxValueStr === '' || boxValueStr === '-') {
                this[this.optionArray[this.selectedBoxIndex]] = boxValueStr;
            } else {
                this[this.optionArray[this.selectedBoxIndex]] = parseFloat(boxValueStr);
            }
        } else if ((0 <= key && key <= 9) ||
                   key === '.' ||
                   (cursorFromLeft === 0 && key === '-')) {
            boxValueStr = this.spliceSplit(boxValueStr, cursorFromLeft, 0, key);
            if (boxValueStr === '-') {
                this[this.optionArray[this.selectedBoxIndex]] = boxValueStr;
            } else {
                this[this.optionArray[this.selectedBoxIndex]] = parseFloat(boxValueStr);
            }
        } else if ((key === 'Enter') &&
                   this.isCheckBox.length === this.optionArray.length &&
                   this.isCheckBox[this.selectedBoxIndex]) {
            this.reverse[this.selectedBoxIndex] = !this.reverse[this.selectedBoxIndex];
        }
    }

    spliceSplit (str, index, count, add) {
        const ar = str.split('');
        ar.splice(index, count, add);
        return ar.join('');
    }

    update() {}

    selectNode(mx, my) {
        this.graphState = new GraphState();
        if (this.isPressedOption(mx, my)) return true;
        if (this.isPressedSocket(mx, my)) return true;
        if (this.isPressedBody(mx, my)) return true;
        return false;
    }

    isPressedSocket(mx, my) {
        for (const s of this.sockets) {
            const [selected, diffX, diffY] = s.isPressedAndDiff(mx, my);
            if (selected) {
                this.graphState.selection = GraphState.SELECT_SOCKET;
                this.graphState.x = s.x;
                this.graphState.y = s.y;
                this.graphState.diffX = diffX;
                this.graphState.diffY = diffY;
                this.graphState.selectedSocket = s;
                return true;
            }
        }
        return false;
    }

    isPressedBody(mx, my) {
        if (this.x < mx && mx < this.x + this.width &&
            this.y < my && my < this.y + this.height) {
            this.graphState.selection = GraphState.SELECT_BODY;
            this.graphState.x = this.x;
            this.graphState.y = this.y;
            this.graphState.diffX = mx - this.x;
            this.graphState.diffY = my - this.y;
            return true;
        }
        return false;
    }

    isPressedOption(mx, my) {
        if (this.isShowingOption &&
            this.selected &&
            this.setOptionIndex(mx, my)) {
            this.graphState.selection = GraphState.SELECT_OPTION;
            return true;
        }
        return false;
    }

    setOptionIndex(mx, my) {
        for (let y = 0; y < this.optionArray.length; y++) {
            const xx = this.x + 12;
            const yy = this.y + 24 + y * 34;
            if (xx < mx && mx < xx + this.optionWidth &&
                yy < my && my < yy + this.optionHeight) {
                this.selectedBoxIndex = y;

                if (this.isCheckBox.length === this.optionArray.length &&
                    this.isCheckBox[this.selectedBoxIndex]) {
                    const boxStartX = xx + 5;
                    const boxStartY = yy + 5;
                    if (boxStartX < mx && mx < boxStartX + 24 &&
                        boxStartY < my && my < boxStartY + 24) {
                        this.reverse[y] = !this.reverse[y];
                    }
                }

                return true;
            }
        }

        return false;
    }

    setUniformLocations(gl, uniLocation, program, index) {}

    setUniformValues(gl, uniLocation, uniIndex, sceneScale) {}

    // mouse = [x, y]
    select(mouse, sceneScale) {
        return new ConstructionState();
    }

    move(mouse, selectionState) {
        return false;
    }
}

export class ConstantNode extends Node {
    constructor(x, y) {
        super(x, y);
        this.nodeColor = 'rgb(0, 255, 255)';
        this.name = 'Constant';

        this.value = 1;
        this.out1 = 0;

        this.output1 = new FloatSocket(this, this.rightX, this.downY1, true);
        this.sockets.push(this.output1);

        this.optionArray = ['value'];
        this.currentCursors = [0];
    }

    renderNode(ctx, sceneScale) {
        this.renderPane(ctx, sceneScale);
        ctx.fillStyle = 'black';

        const xx = this.x + 12;
        const yy = this.y + 36;
        ctx.fillText(`${this.value}`, xx, yy);

        if (this.isShowingOption && this.selected) {
            this.renderOption(ctx);
        }
    }

    renderOption(ctx) {
        this.renderOptionBoxes(ctx, this.optionArray);
    }

    update() {
        this.out1 = this.value;
        this.output1.value = this.out1;
    }
}

export class SinWaveNode extends Node {
    constructor(x, y) {
        super(x, y);

        this.period = 1000;
        this.amplitude = 10;
        this.phaseShift = 0;
        this.offset = 0;
        this.value = 1;
        this.out1 = 0;

        this.nodeColor = 'rgb(0, 255, 255)';
        this.name = 'SinWave';
        this.output1 = new FloatSocket(this, this.rightX, this.downY1, true);
        this.sockets.push(this.output1);

        this.optionArray = ['period', 'amplitude',
                            'phaseShift', 'offset'];
        this.currentCursors = [0, 0, 0, 0];
    }

    renderNode(ctx, sceneScale) {
        this.renderPane(ctx, sceneScale);
        ctx.fillStyle = 'black';

        let xx = this.x + 12;
        let yy = this.y + 36;
        let str = `p:${this.period}`;
        ctx.fillText(str, xx, yy);
        yy += 18;
        str = `a:${this.amplitude}`;
        ctx.fillText(str, xx, yy);
        yy += 18;
        str = `p:${this.phaseShift}`;
        ctx.fillText(str, xx, yy);
        yy += 18;
        str = `o:${this.offset}`;
        ctx.fillText(str, xx, yy);

        if (this.isShowingOption && this.selected) {
            this.renderOption(ctx);
        }
    }

    renderOption(ctx) {
        this.renderOptionBoxes(ctx, this.optionArray);
    }

    update() {
        this.out1 = this.value =
            this.offset + this.amplitude *
            Math.sin(2 * Math.PI * (this.phaseShift + new Date().getTime() / this.period));
        this.output1.value = this.out1;
    }
}

export class CircularMotion extends Node {
    constructor(x, y) {
        super(x, y);
        this.period = 1000;
        this.amplitude = 10;
        this.phaseShift = 0;
        this.offsetX = 0;
        this.offsetY = 0;
        this.valueX = 1;
        this.valueY = 1;
        this.outX = 0;
        this.outY = 0;

        this.nodeColor = 'rgb(0, 255, 255)';
        this.name = 'CircularMotion';
        this.outputY = new FloatSocket(this, this.rightX, this.downY1, true);
        this.sockets.push(this.outputY);
        this.outputX = new FloatSocket(this, this.rightX, this.downY2, true);
        this.sockets.push(this.outputX);

        this.optionArray = ['period', 'amplitude',
                            'phaseShift', 'offsetX', 'offsetY'];
        this.currentCursors = [0, 0, 0, 0, 0];
    }

    renderNode(ctx, sceneScale) {
        this.renderPane(ctx, sceneScale);
        ctx.fillStyle = 'black';

        let xx = this.x + 12;
        let yy = this.y + 36;
        let str = `p:${this.period}`;
        ctx.fillText(str, xx, yy);
        yy += 18;
        str = `a:${this.amplitude}`;
        ctx.fillText(str, xx, yy);
        yy += 18;
        str = `p:${this.phaseShift}`;
        ctx.fillText(str, xx, yy);
        yy += 18;
        str = `oX:${this.offsetX}`;
        ctx.fillText(str, xx, yy);
        yy += 18;
        str = `oY:${this.offsetY}`;
        ctx.fillText(str, xx, yy);

        if (this.isShowingOption && this.selected) {
            this.renderOption(ctx);
        }
    }

    renderOption(ctx) {
        this.renderOptionBoxes(ctx, this.optionArray);
    }

    update() {
        const millis = new Date().getTime();
        this.outX = this.valueX = this.offsetX + this.amplitude *
            Math.cos(2 * Math.PI * (this.phaseShift + millis / this.period));
        this.outY = this.valueY = this.offsetY + this.amplitude *
            Math.sin(2 * Math.PI * (this.phaseShift + millis / this.period));
        this.outputX.value = this.outX;
        this.outputY.value = this.outY;
    }
}

export class PointNode extends Node {
    constructor(x, y) {
        super(x, y);
        this.posY = Math.round((Math.random() * 20 - 10) * 10000) / 10000;
        this.posX = Math.round((Math.random() * 20 - 10) * 10000) / 10000;
        this.nodeColor = 'rgb(255, 0, 255)';
        this.name = 'Point';

        // y coord
        this.input1 = new FloatSocket(this, this.leftX, this.downY1, false);
        // x coord
        this.input2 = new FloatSocket(this, this.leftX, this.downY2, false);
        this.output1 = new PointSocket(this, this.rightX, this.downY1, true);
        this.sockets.push(this.input1);
        this.sockets.push(this.input2);
        this.sockets.push(this.output1);

        this.uiRadius = 0.5;
        this.optionArray = ['posX', 'posY'];
        this.currentCursors = [0, 0];
    }

    renderNode(ctx, sceneScale) {
        this.renderPane(ctx, sceneScale);
        ctx.fillStyle = 'black';
        const xx = this.x + 12;
        const yy = this.y + 36;
        ctx.fillText(`${this.posX}`, xx, yy);
        const yy2 = yy + 18;
        ctx.fillText(`${this.posY}`, xx, yy2);
        if (this.isShowingOption && this.selected) {
            this.renderOption(ctx);
        }
    }

    renderOption(ctx) {
        this.renderOptionBoxes(ctx, this.optionArray);
    }

    update() {
        if (this.input1.edgeOn) {
            this.posY = this.input1.value;
        }
        if (this.input2.edgeOn) {
            this.posX = this.input2.value;
        }
        this.output1.valueX = this.posX;
        this.output1.valueY = this.posY;
    }

    setUniformLocations(gl, uniLocation, program, index) {
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_point${index}`));
    }

    setUniformValues(gl, uniLocation, uniIndex, sceneScale) {
        let uniI = uniIndex;
        gl.uniform3f(uniLocation[uniI++],
                     this.posX, this.posY, this.uiRadius);
        // console.log(`${this.posY}, ${this.posX}, ${this.uiRadius}`);
        return uniI;
    }

    select(mouse, sceneScale) {
        const dx = mouse[0] - this.posX;
        const dy = mouse[1] - this.posY;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d > this.uiRadius/* * sceneScale*/) return new ConstructionState();
        console.log(d);
        return new ConstructionState().setNode(this)
            .setDiffObj(dx, dy);
    }

    move(mouse, constructionState) {
        this.posX = Math.round((mouse[0] - constructionState.diffX) * 10000) / 10000;
        this.posY = Math.round((mouse[1] - constructionState.diffY) * 10000) / 10000;
        this.update();
    }
}

export class LineTwoPointsNode extends Node {
    constructor(x, y) {
        super(x, y);
        this.nodeColor = 'rgb(255, 100, 100)';
        this.name = 'LineTwoPoints';

        this.valueA = 1;
        this.valueB = 1;
        this.valueC = -500;

        this.input1 = new PointSocket(this, this.leftX, this.downY1, false);
        this.input2 = new PointSocket(this, this.leftX, this.downY2, false);
        this.output1 = new LineSocket(this, this.rightX, this.downY1, true);
        this.sockets.push(this.input1);
        this.sockets.push(this.input2);
        this.sockets.push(this.output1);
    }

    renderNode(ctx, sceneScale) {
        this.renderPane(ctx, sceneScale);
        const xx = this.x + 12;
        const yy = this.y + 36;
        let str;
        if (this.valueB !== 0) {
            if (this.valueC / this.valueB < 0) {
                str = `y=${Math.round(-this.valueA / this.valueB * 10) / 10}x+` +
                    `${Math.round(-this.valueC / this.valueB * 10) / 10}`;
            } else {
                str = `y=${Math.round(-this.valueA / this.valueB * 10) / 10}x-` +
                    `${Math.round(this.valueC / this.valueB * 10) / 10}`;
            }
        } else {
            str = `x=${Math.round(-this.valueC / this.valueA * 10) / 10}`;
        }

        ctx.fillStyle = 'black';
        ctx.fillText(`${str}`, xx, yy)
    }

    update() {
        const x1 = this.input1.valueX;
        const y1 = this.input1.valueY;
        const x2 = this.input2.valueX;
        const y2 = this.input2.valueY;
        this.valueA = y2 - y1;
        this.valueB = -x2 + x1;
        this.valueC = -x1 * (y2 - y1) + y1 * (x2 - x1);
        const mag = Math.sqrt(this.valueA * this.valueA + this.valueB * this.valueB);
        this.valueA /= mag;
        this.valueB /= mag;
        this.valueC /= mag;

        this.output1.valueA = this.valueA;
        this.output1.valueB = this.valueB;
        this.output1.valueC = this.valueC;

        this.output1.p1 = [x1, y1];
        this.output1.p2 = [x2, y2];
    }

    setUniformLocations(gl, uniLocation, program, index) {
        uniLocation.push(gl.getUniformLocation(program, `u_line${index}`))
    }

    setUniformValues(gl, uniLocation, uniIndex, sceneScale) {
        let uniI = uniIndex;
        const v = [this.input2.valueX - this.input1.valueX,
                   this.input2.valueY - this.input1.valueY];
        const d = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
        const d2 = [v[0] / d, v[1] / d];
        const n = [d2[0], d2[1]];
        gl.uniform4f(uniLocation[uniI++],
                     this.input1.valueX, this.input1.valueY,
                     -n[1], n[0]); // [dirX, dirY, normal.x, normal.y]
        return uniI;
    }
}

export class LineMirrorNode extends Node {
    constructor(x, y) {
        super(x, y);
        this.nodeColor = 'rgb(0, 255, 255)';
        this.name = 'LineMirror';

        this.valueA = 1;
        this.valueB = 1;
        this.valueC = -500;
        this.p1 = [0, 0];
        this.p2 = [0, 0];
        this.lineMirrorType = 'p->m';

        this.input1 = new LineSocket(this, this.leftX, this.downY1, false);
        this.output1 = new LineSocket(this, this.rightX, this.downY1, true);
        this.sockets.push(this.input1);
        this.sockets.push(this.output1);

        this.optionArray = ['reverseNormal'];
        this.isCheckBox = [true];
        this.reverse = [false];
    }

    renderNode(ctx, sceneScale) {
        this.renderPane(ctx, sceneScale);
        ctx.fillStyle = 'black'
        ctx.font = "12px 'Times New Roman'";

        const xx = this.x + 12;
        const yy = this.y + 36;

        let str;
        if (this.valueB !== 0) {
            if (this.valueC / this.valueB < 0) {
                str = `y=${Math.round(-this.valueA / this.valueB * 10) / 10}x+` +
                    `${Math.round(-this.valueC / this.valueB * 10) / 10}`;
            } else {
                str = `y=${Math.round(-this.valueA / this.valueB * 10) / 10}x-` +
                    `${Math.round(this.valueC / this.valueB * 10) / 10}`;
            }
        } else {
            str = `x=${Math.round(-this.valueC / this.valueA * 10) / 10}`;
        }
        ctx.fillText(`${str}`, xx, yy);
        ctx.fillText(`reverse: ${this.reverse[0]}`, xx, yy + 18);

        if (this.isShowingOption) {
            this.renderOption(ctx);
        }
    }

    renderOption(ctx) {
        this.renderOptionBoxes(ctx, this.optionArray);
    }

    update() {
        this.valueA = this.input1.valueA;
        this.valueB = this.input1.valueB;
        this.valueC = this.input1.valueC;
        this.p1 = this.input1.p1;
        this.p2 = this.input1.p2;

        this.output1.valueA = this.valueA;
        this.output1.valueB = this.valueB;
        this.output1.valueC = this.valueC;
        this.output1.p1 = this.p1;
        this.output1.p2 = this.p2;
    }

    setUniformLocations(gl, uniLocation, program, index) {
        uniLocation.push(gl.getUniformLocation(program, `u_lineMirror${index}`))
    }

    setUniformValues(gl, uniLocation, uniIndex, sceneScale) {
        let uniI = uniIndex;
        const v = [this.p2[0] - this.p1[0],
                   this.p2[1] - this.p1[1]];
        const d = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
        const d2 = [v[0] / d, v[1] / d];
        const n = [d2[0], d2[1]];
        if (this.reverse[0]) {
            n[0] *= -1;
            n[1] *= -1;
        }
        gl.uniform4f(uniLocation[uniI++],
                     this.p2[0], this.p2[1],
                     -n[1], n[0]); // [dirX, dirY, normal.x, normal.y]
        return uniI;
    }
}

export class CircleThreePointsNode extends Node {
    constructor(x, y) {
        super(x, y);
        this.nodeColor = 'rgb(255, 100, 0)';
        this.name = 'CircleThreePoints';

        this.valueX = 1;
        this.valieY = 1;
        this.valueR = 1;

        this.input1 = new PointSocket(this, this.leftX, this.downY1, false);
        this.input2 = new PointSocket(this, this.leftX, this.downY2, false);
        this.input3 = new PointSocket(this, this.leftX, this.downY3, false);
        this.output1 = new CircleSocket(this, this.rightX, this.downY1, true);

        this.sockets.push(this.input1);
        this.sockets.push(this.input2);
        this.sockets.push(this.input3);
        this.sockets.push(this.output1);
    }

    renderNode(ctx, sceneScale) {
        this.renderPane(ctx, sceneScale);
        ctx.fillStyle = 'black'
        ctx.font = "12px 'Times New Roman'";

        const xx = this.x + 12;
        const yy = this.y + 36;

        let str1 = `(${Math.round(this.valueX * 10) / 10}, ${Math.round(this.valueY * 10) / 10})`;
        ctx.fillText(str1, xx, yy);
        str1 = `r=${Math.round(this.valueR * 10) / 10}`;
        ctx.fillText(str1, xx, yy + 18);
    }

    update() {
        const x1 = this.input1.valueX;
        const y1 = this.input1.valueY;
        const x2 = this.input2.valueX;
        const y2 = this.input2.valueY;
        const x3 = this.input3.valueX;
        const y3 = this.input3.valueY;
        // (x-x1)^2+(y-y1)^2 = (x-x2)^2+(y-y2)^2
        // x1^2+y1^2-x2^1-y2^2 = 2(x1-x2)x +2(y1-y2)y
        // x1^2+y1^2-x3^1-y3^2 = 2(x1-x3)x +2(y1-y3)y
        const a = 2 * (x1 - x2);
        const b = 2 * (y1 - y2);
        const c = 2 * (x1 - x3);
        const d = 2 * (y1 - y3);
        const p = x1 * x1 + y1 * y1 - x2 * x2 - y2 * y2;
        const q = x1 * x1 + y1 * y1 - x3 * x3 - y3 * y3;

        this.valueX = (p * d - b * q) / (a * d - b * c);
        this.valueY = (a * q - p * c) / (a * d - b * c);
        this.valueR = Math.sqrt((this.valueX - x1) * (this.valueX - x1) + (this.valueY - y1) * (this.valueY - y1));

        this.output1.valueX = this.valueX;
        this.output1.valueY = this.valueY;
        this.output1.valueR = this.valueR;
    }

    setUniformLocations(gl, uniLocation, program, index) {
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_circleThreePoints${index}`));
    }

    setUniformValues(gl, uniLocation, uniIndex, sceneScale) {
        let uniI = uniIndex;
        gl.uniform3f(uniLocation[uniI++],
                     this.valueX, this.valueY, this.valueR);
        return uniI;
    }
}

export class CircleMirrorNode extends Node {
    constructor(x, y) {
        super(x, y);
        this.nodeColor = 'rgb(255, 100, 0)';
        this.name = 'CircleMirror';

        this.valueX = 1;
        this.valueY = 1;
        this.valueR = 1;
        this.circleMirrorType = 'in->out';

        this.input1 = new CircleSocket(this, this.leftX, this.downY1, false);
        this.output1 = new CircleSocket(this, this.rightX, this.downY1, true);
        this.sockets.push(this.input1);
        this.sockets.push(this.output1);
    }

    renderNode(ctx, sceneScale) {
        this.renderPane(ctx, sceneScale);
        ctx.fillStyle = 'black'
        ctx.font = "12px 'Times New Roman'";

        const xx = this.x + 12;
        const yy = this.y + 36;

        let str1 = `(${Math.round(this.valueX * 10) / 10}, ${Math.round(this.valueY * 10) / 10})`;
        ctx.fillText(str1, xx, yy);
        str1 = `r=${Math.round(this.valueR * 10) / 10}`;
        ctx.fillText(str1, xx, yy + 18);
        ctx.fillText(this.circleMirrorType, xx, yy + 18 + 18);
        if (this.isShowingOption && this.selected) {
            //this.renderOption(ctx);
        }
    }

    renderOption(ctx) {
        this.renderOptionBoxes(ctx, this.optionArray);
    }

    update() {
        this.valueX = this.input1.valueX;
        this.valueY = this.input1.valueY;
        this.valueR = this.input1.valueR;

        this.output1.valueX = this.valueX;
        this.output1.valueY = this.valueY;
        this.output1.valueR = this.valueR;
    }

    setUniformLocations(gl, uniLocation, program, index) {
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_circleMirror${index}`));
    }

    setUniformValues(gl, uniLocation, uniIndex, sceneScale) {
        let uniI = uniIndex;
        gl.uniform4f(uniLocation[uniI++],
                     this.valueX, this.valueY, this.valueR, this.valueR * this.valueR);
        return uniI;
    }
}

export class OrbitSeedNode extends Node {
    constructor(x, y) {
        super(x, y);
        this.posX = 0;
        this.posY = 0;
        this.seedWidth = 10;
        this.seedHeight = 10;

        this.nodeColor = 'rgb(100, 100, 255)';
        this.name = 'OrbitSeed'

        // y coord
        this.input1 = new FloatSocket(this, this.leftX, this.downY1, false);
        // x coord
        this.input2 = new FloatSocket(this, this.leftX, this.downY2, false);
        this.sockets.push(this.input1);
        this.sockets.push(this.input2);

        this.optionArray = ['posX', 'posY'];
    }

    renderNode(ctx, sceneScale) {
        this.renderPane(ctx, sceneScale);
        ctx.fillStyle = 'black';
        const xx = this.x + 12;
        const yy = this.y + 36;
        ctx.fillText(`${this.posX}`, xx, yy);
        const yy2 = yy + 18;
        ctx.fillText(`${this.posY}`, xx, yy2);
        if (this.isShowingOption && this.selected) {
            this.renderOption(ctx);
        }
    }

    renderOption(ctx) {
        this.renderOptionBoxes(ctx, this.optionArray);
    }

    update() {
        if (this.input1.edgeOn) {
            this.posY = this.input1.value;
        }
        if (this.input2.edgeOn) {
            this.posX = this.input2.value;
        }
    }

    setUniformLocations(gl, uniLocation, program, index) {
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_orbitSeed${index}`));
    }

    setUniformValues(gl, uniLocation, uniIndex, sceneScale) {
        let uniI = uniIndex;
        gl.uniform4f(uniLocation[uniI++],
                     this.posX, this.posY, this.seedWidth, this.seedHeight);
        return uniI;
    }

    select(mouse, sceneScale) {
        if (this.posX < mouse[0] && mouse[0] < this.posX + this.seedWidth &&
            this.posY < mouse[1] && mouse[1] < this.posY + this.seedHeight) {
            const dx = mouse[0] - this.posX;
            const dy = mouse[1] - this.posY;
            return new ConstructionState().setNode(this)
                .setDiffObj(dx, dy);
        }
        return new ConstructionState();
    }

    move(mouse, constructionState) {
        this.posX = Math.round((mouse[0] - constructionState.diffX) * 10000) / 10000;
        this.posY = Math.round((mouse[1] - constructionState.diffY) * 10000) / 10000;
        this.update();
    }
}

export class ColorPalettesNode extends Node {
    constructor(x, y) {
        super(x, y);
        this.width = 150;
        this.a = [0.5, 0.5, 0.5];
        this.b = [0.5, 0.5, 0.5];
        this.c = [1.0, 1.0, 1.0];
        this.d = [0.0, 0.33, 0.67];

        this.inputA = new Vec3Socket(this, this.leftX, this.downY4, false);
        this.inputB = new Vec3Socket(this, this.leftX, this.downY3, false);
        this.inputC = new Vec3Socket(this, this.leftX, this.downY2, false);
        this.inputD = new Vec3Socket(this, this.leftX, this.downY1, false);

        this.sockets.push(this.inputA);
        this.sockets.push(this.inputB);
        this.sockets.push(this.inputC);
        this.sockets.push(this.inputD);

        this.nodeColor = 'rgb(100, 100, 255)';
        this.name = 'ColorPalettes'
    }

    renderNode(ctx, sceneScale) {
        this.renderPane(ctx, sceneScale);
        ctx.fillStyle = 'black';
        const xx = this.x + 10;
        const yy = this.y + 50;
        //ctx.fillText(`${this.posX}`, xx, yy);
        const yy2 = yy + 18;
        //ctx.fillText(`${this.posY}`, xx, yy2);
        const numSplit = 130;
        for (let lx = 0; lx < numSplit; lx++) {
            const t = lx / numSplit;
            const r = this.a[0] + this.b[0] * Math.cos(6.28318 * (this.c[0] * t + this.d[0]));
            const g = this.a[1] + this.b[1] * Math.cos(6.28318 * (this.c[1] * t + this.d[1]));
            const b = this.a[2] + this.b[2] * Math.cos(6.28318 * (this.c[2] * t + this.d[2]));
            ctx.strokeStyle = `rgb(${r * 255}, ${g * 255}, ${b * 255})`;
            ctx.beginPath();
            ctx.moveTo(xx + lx, yy);
            ctx.lineTo(xx + lx, yy + 30);
            ctx.stroke();
        }
    }

    update() {
        if (this.inputA.edgeOn) {
            this.a = [this.inputA.valueX, this.inputA.valueY, this.inputA.valueZ]
        }
        if (this.inputB.edgeOn) {
            this.b = [this.inputB.valueX, this.inputB.valueY, this.inputB.valueZ]
        }
        if (this.inputC.edgeOn) {
            this.c = [this.inputC.valueX, this.inputC.valueY, this.inputC.valueZ]
        }
        if (this.inputD.edgeOn) {
            this.d = [this.inputD.valueX, this.inputD.valueY, this.inputD.valueZ]
        }
    }
}

export class Vec3Node extends Node {
    constructor(x, y) {
        super(x, y);
        this.valueX = Math.round((Math.random()) * 10000) / 10000;
        this.valueY = Math.round((Math.random()) * 10000) / 10000
        this.valueZ = Math.round((Math.random()) * 10000) / 10000;

        this.nodeColor = 'rgb(255, 0, 255)';
        this.name = 'Vec3';

        // z coord
        this.input3 = new FloatSocket(this, this.leftX, this.downY1, false);
        // y coord
        this.input2 = new FloatSocket(this, this.leftX, this.downY2, false);
        // x coord
        this.input1 = new FloatSocket(this, this.leftX, this.downY3, false);
        this.output1 = new Vec3Socket(this, this.rightX, this.downY1, true);
        this.sockets.push(this.input1);
        this.sockets.push(this.input2);
        this.sockets.push(this.input3);
        this.sockets.push(this.output1);

        this.uiRadius = 0.5;
        this.optionArray = ['valueX', 'valueY', 'valueZ'];
        this.currentCursors = [0, 0, 0];
    }

    renderNode(ctx, sceneScale) {
        this.renderPane(ctx, sceneScale);
        ctx.fillStyle = 'black';
        const xx = this.x + 12;
        const yy = this.y + 36;
        ctx.fillText(`${this.valueX}`, xx, yy);
        const yy2 = yy + 18;
        ctx.fillText(`${this.valueY}`, xx, yy2);
        const yy3 = yy2 + 18;
        ctx.fillText(`${this.valueZ}`, xx, yy3);
        if (this.isShowingOption && this.selected) {
            this.renderOption(ctx);
        }
    }

    renderOption(ctx) {
        this.renderOptionBoxes(ctx, this.optionArray);
    }

    update() {
        if (this.input1.edgeOn) {
            this.valueX = this.input1.value;
        }
        if (this.input2.edgeOn) {
            this.valueY = this.input2.value;
        }
        if (this.input3.edgeOn) {
            this.valueZ = this.input3.value;
        }
        this.output1.valueX = this.valueX;
        this.output1.valueY = this.valueY;
        this.output1.valueZ = this.valueZ;
    }
}

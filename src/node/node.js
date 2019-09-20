import { FloatSocket,
         PointSocket,
         LineSocket,
         CircleSocket } from '../socket/socket.js';
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
        this.name = '';
        this.isShowingOption = false;

        this.textbox = new Textbox();
        this.id = this.getUniqueStr();

        this.constructionState = new ConstructionState();
        this.graphState = new GraphState();

        this.optionArray = [];
    }

    getUniqueStr(myStrong) {
        let strong = 1000;
        if (myStrong) strong = myStrong;
        return new Date().getTime().toString(16) + Math.floor(strong * Math.random()).toString(16)
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
        if (this.isShowingOption) {
            this.renderOption(ctx)
        }
    }

    renderOption(ctx) {
    }

    renderOptionBoxes(ctx, optionNames) {
        const numBoxes = optionNames.length;
        if (numBoxes <= 0) return;
        for (let y = 0; y < numBoxes; y++) {
            ctx.strokeStyle = 'rgb(0, 0, 0)';
            ctx.fillStyle = 'rgb(228, 228, 228)';
            let xx = this.x + 12;
            let yy = this.y + 24 + y * 34;
            ctx.beginPath();
            ctx.rect(xx, yy, 180, 34);
            ctx.fill();
            ctx.stroke();
            ctx.closePath();

            ctx.fillStyle = 'white';
            xx += 5;
            yy += 5;
            ctx.beginPath();
            ctx.rect(xx, yy, 80, 24);
            ctx.fill();
            ctx.stroke();
            ctx.closePath();

            ctx.fillStyle = 'black';
            ctx.font = "18px 'Times New Roman'";
            ctx.fillText(optionNames[y], xx + 90, yy + 23);
            const textStartX = xx + 5;
            const textStartY = yy + 18;
            const cursor = `${this[optionNames[y]]}`.length;
            ctx.fillText(this[optionNames[y]], textStartX, textStartY); // data
            //console.log(`cursor ${cursor}`)
        }
    }

    keydown(key) {
        console.log(`keydown ${this.id}`);
    }
    
    update() {}

    selectNode(mx, my) {
        this.graphState = new GraphState();

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
        console.log('isPressedOption');
        if (this.isShowingOption && this.getOptionIndex(mx, my)) {
            this.graphState.selection = GraphState.SELECT_OPTION;
            console.log('click option');
            return true;
        }
        return false;
    }

    getOptionIndex(mx, my) {
        for (let y = 0; y < this.optionArray.length; y++) {
            const xx = this.x + 12;
            const yy = this.y + 24 + y * 34;
            if (xx < mx && mx < xx + 120 &&
                yy < my && my < yy + 34) {
                this.optionIndex = y;
                return true;
            }
        }

        this.optionIndex = -1;
        return false;
    }

    showOption() {}

    closeTextbox() {}

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
    }

    renderNode(ctx, sceneScale) {
        this.renderPane(ctx, sceneScale);
        ctx.fillStyle = 'black';

        const xx = this.x + 12;
        const yy = this.y + 36;
        ctx.fillText(`${this.value}`, xx, yy);

        if (this.isShowingOption) {
            this.renderOption(ctx);
        }
    }

    renderOption(ctx) {
        this.renderOptionBoxes(ctx, ['value']);
    }

    update() {
        this.out1 = this.value;
        this.output1.value = this.out1;
    }

    showOption() {
        this.textbox.textboxX = this.x + 12;
        this.textbox.textboxY = this.y + 24;
        this.textbox.textboxWidth = 80;
        this.textbox.setupTextbox();
        this.textbox.renderOn = true;

        const str = `${this.value}`;
        for (let i = 0; i < str.length; i++) {
            this.textbox.textboxText[i] = str.charAt(i);
        }
        this.textbox.textboxCursor = str.length;
        this.textbox.parent = this;
    }

    closeTextbox() {
        this.value = parseFloat(this.textbox.getTextboxArray());
        this.textbox.renderOn = false;
    }
}

export class SinWaveNode extends Node {
    constructor(x, y) {
        super(x, y);

        this.period = 1000;
        this.amplitude = 1;
        this.phaseShift = 0;
        this.offset = 0;
        this.value = 1;
        this.out1 = 0;
        this.optionIndex = -1;

        this.nodeColor = 'rgb(0, 255, 255)';
        this.name = 'SinWave';
        this.output1 = new FloatSocket(this, this.rightX, this.downY1, true);
        this.sockets.push(this.output1);

        this.optionArray =  ['period', 'amplitude',
                             'phaseShift', 'offset'];
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

        if (this.isShowingOption) {
            this.renderOption(ctx);
        }
    }

    renderOption(ctx) {
        this.renderOptionBoxes(ctx, this.optionArray);
    }

    closeTextbox() {
        if (this.optionIndex === 0) this.period = parseFloat(this.textbox.getTextboxArray());
        else if (this.optionIndex === 1) this.amplitude = parseFloat(this.textbox.getTextboxArray());
        else if (this.optionIndex === 2) this.phaseShift = parseFloat(this.textbox.getTextboxArray());
        else if (this.optionIndex === 3) this.offset = parseFloat(this.textbox.getTextboxArray());
        this.textbox.renderOn = false;
    }

    isPressedOption(mx, my) {
        for (let y = 0; y < 4; y++) {
            const xx = this.x + 12;
            const yy = this.y + 24 + y * 34;
            if (xx < mx && mx < xx + 120 &&
                yy < my && my < yy + 34) {
                this.optionIndex = y;
                return true;
            }
        }

        // if (this.x < mx && mx < this.x + this.width &&
        //     this.y < my && my < this.y + this.height) {
        //     return true;
        // }
        this.optionIndex = -1;
        return false;
    }

    update() {
        this.out1 = this.value =
            this.offset + this.amplitude *
            Math.sin(2 * Math.PI * (this.phaseShift + new Date().getTime() / this.period));
        this.output1.value = this.out1;
    }

    showOption() {
        this.textbox.textboxX = this.x + 12;
        this.textbox.textboxY = this.y + 24;
        this.textbox.textboxWidth = 80;
        this.textbox.setupTextbox();
        this.textbox.renderOn = true;

        const str = `${this.value}`;
        for (let i = 0; i < str.length; i++) {
            this.textbox.textboxText[i] = str.charAt(i);
        }
        this.textbox.textboxCursor = str.length;
        this.textbox.parent = this;
    }

    closeTextbox() {
        this.value = parseFloat(this.textbox.getTextboxArray());
        this.textbox.renderOn = false;
    }
}

export class PointNode extends Node {
    constructor(x, y) {
        super(x, y);
        this.posY = 10;
        this.posX = 20;
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
    }

    renderNode(ctx, sceneScale) {
        this.renderPane(ctx, sceneScale);
        ctx.fillStyle = 'black';
        const xx = this.x + 12;
        const yy = this.y + 36;
        ctx.fillText(`${this.posX}`, xx, yy);
        const yy2 = yy + 18;
        ctx.fillText(`${this.posY}`, xx, yy2);
        if (this.isShowingOption) {
            this.renderOption(ctx);
        }
    }

    renderOption(ctx) {
        this.renderOptionBoxes(ctx, ['posX', 'posY']);
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
        this.posX = mouse[0] - constructionState.diffX;
        this.posY = mouse[1] - constructionState.diffY;
        console.log(mouse);
        console.log(constructionState.diffObj);
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
        ctx.fillText(`${this.lineMirrorType}`, xx, yy + 18);

        if (this.isShowingOption) {
            this.renderOption(ctx);
        }
    }

    renderOption(ctx) {
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
        gl.uniform4f(uniLocation[uniI++],
                     this.p2[0], this.p2[1],
                     -n[1], n[0]); // [dirX, dirY, normal.x, normal.y]
        console.log(`${this.p2[0]}, ${this.p2[1]}`);
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
        if (this.isShowingOption) {
            this.renderOption(ctx);
        }
    }

    renderOption(ctx) {
        this.renderOptionBoxes(ctx, ['reverse']);
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

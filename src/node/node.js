import { FloatSocket,
         PointSocket,
         LineSocket,
         CircleSocket } from '../socket/socket.js';
import Textbox from '../textbox.js';
import SelectionState from '../selectionState.js';

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
    }

    update() {}

    isPressed(mx, my) {
        if (this.x < mx && mx < this.x + this.width &&
            this.y < my && my < this.y + this.height) {
            return true;
        }
        return false;
    }

    showOption() {}

    closeTextbox() {}

    setUniformLocations(gl, uniLocation, program, index) {}

    setUniformValues(gl, uniLocation, uniIndex, sceneScale) {}

    // mouse = [x, y]
    select(mouse, sceneScale) {
        return new SelectionState();
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
            //            this.textbox.showOption();
            this.textbox.textboxX = this.x + 12;
            this.textbox.textboxY = this.y + 24;
            this.textbox.renderTextbox(ctx);
        }
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

export class PointNode extends Node {
    constructor(x, y) {
        super(x, y);
        this.value1 = 10;
        this.value2 = 20;
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

        this.uiRadius = 0.1;
    }

    renderNode(ctx, sceneScale) {
        this.renderPane(ctx, sceneScale);
        ctx.fillStyle = 'black';
        const xx = this.x + 12;
        const yy = this.y + 36;
        ctx.fillText(`${this.value2}`, xx, yy);
        const yy2 = yy + 18;
        ctx.fillText(`${this.value1}`, xx, yy2);
    }

    update() {
        if (this.input1.edgeOn) {
            this.value1 = this.input1.value;
        }
        if (this.input2.edgeOn) {
            this.value2 = this.input2.value;
        }
        this.output1.valueX = this.value2;
        this.output1.valueY = this.value1;
    }

    setUniformLocations(gl, uniLocation, program, index) {
        uniLocation.push(gl.getUniformLocation(program,
                                               `u_point${index}`));
    }

    setUniformValues(gl, uniLocation, uniIndex, sceneScale) {
        let uniI = uniIndex;
        gl.uniform3f(uniLocation[uniI++],
                     this.value2, this.value1, this.uiRadius);
        // console.log(`${this.value1}, ${this.value2}, ${this.uiRadius}`);
        return uniI;
    }

    select(mouse, sceneScale) {
        const dx = mouse[0] - this.value2;
        const dy = mouse[1] - this.value1;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d > this.uiRadius/* * sceneScale*/) return new SelectionState();
        console.log(d);
        return new SelectionState().setObj(this)
            .setDiffObj(dx, dy);
    }

    move(mouse, selectionState) {
        this.value2 = mouse[0] - selectionState.diffX;
        this.value1 = mouse[1] - selectionState.diffY;
        console.log(mouse);
        console.log(selectionState.diffObj);
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
        this.valueB = -x2 + x1
        this.valueC = -x1 * (y2 - y1) + y1 * (x2 - x1);
        const mag = Math.sqrt(this.valueA * this.valueA + this.valueB * this.valueB);
        this.valueA /= mag;
        this.valueB /= mag;
        this.valueC /= mag;

        this.output1.valueA = this.valueA;
        this.output1.valueB = this.valueB;
        this.output1.valueC = this.valueC;
    }

    setUniformLocations(gl, uniLocation, program, index) {
        uniLocation.push(gl.getUniformLocation(program, `u_line${index}`))
    }

    setUniformValues(gl, uniLocation, uniIndex, sceneScale) {
        let uniI = uniIndex;
        gl.uniform2f(uniLocation[uniI++],
                     this.input1.valueX, this.value1.valueY,
                     this.input2.valueX, this.input2.valueY); // [dirX, dirY, normal.x, normal.y]
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
    }

    update() {
        this.valueA = this.input1.valueA;
        this.valueB = this.input1.valueB;
        this.valueC = this.input1.valueC;
        this.output1.valueA = this.valueA;
        this.output1.valueB = this.valueB;
        this.output1.valueC = this.valueC;
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
    }

    update() {
        this.valueX = this.input1.valueX;
        this.valueY = this.input1.valueY;
        this.valueR = this.input1.valueR;

        this.output1.valueX = this.valueX;
        this.output1.valueY = this.valueY;
        this.output1.valueR = this.valueR;
    }
}

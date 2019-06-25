import { FloatSocket,
         PointSocket,
         LineSocket } from '../socket/socket.js';

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
    }

    update() {
        this.out1 = this.value;
        this.output1.value = this.out1;
    }
}

export class PointNode extends Node {
    constructor(x, y) {
        super(x, y);
        this.value1 = 100;
        this.value2 = 100;
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
        if (this.input1.edgeOn && this.input2.edgeOn) {
            this.value1 = this.input1.value;
            this.value2 = this.input2.value;
        }
        this.output1.valueX = this.value2;
        this.output1.valueY = this.value1;
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
        this.valueD = 0;

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
}

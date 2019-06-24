export class Edge {
    constructor(s1, s2) {
        this.s1 = s1;
        this.s2 = s2;
    }

    renderEdge(ctx, sceneScale, mouseState) {
        const x1 = this.s1.parent.x + this.s1.x;
        const y1 = this.s1.parent.y + this.s1.y;
        let x2 = 0;
        let y2 = 0;
        let x3 = 0;
        let y3 = 0;
        let x4 = 0;
        let y4 = 0;

        if (this.s2 === undefined) {
            x4 = mouseState.x;
            y4 = mouseState.y
        } else {
            x4 = this.s2.parent.x + this.s2.x;
            y4 = this.s2.parent.y + this.s2.y;
        }

        if (this.s1.isOutput) {
            x2 = x1 + Math.max(100, (x4 - x1) * 0.5);
            y2 = y1;
            x3 = x4 - Math.max(100, (x4 - x1) * 0.5);
            y3 = y4;
        } else {
            x2 = x1 - Math.max(100, (x4 - x1) * 0.5);
            y2 = y1;
            x3 = x4 + Math.max(100, (x4 - x1) * 0.5);
            y3 = y4;
        }

        ctx.strokeStyle = 'rgb(0, 0, 0)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.bezierCurveTo(x2, y2, x3, y3, x4, y4);
        ctx.stroke();
    }

    update() {}
}

export class FloatEdge extends Edge {
    constructor(s1, s2) {
        super(s1, s2);
        this.value = 0;
    }

    update() {
        if (this.s1.isOutput) { // s1 -> s2
            this.value = this.s1.value;
            this.s2.value = this.value;
        } else if (this.s2.isOutput) { // s2 -> s1
            this.value = this.s2.value;
            this.s1.value = this.value;
        }
    }
}

export class PointEdge extends Edge {
    constructor(s1, s2) {
        super(s1, s2);
        this.valueX = 0;
        this.valueY = 0;
    }

    update() {
        if (this.s1.isOutput) { // s1 -> s2
            this.valueX = this.s1.valueX;
            this.valueY = this.s1.valueY;
            this.s2.valueX = this.valueX;
            this.s2.valueY = this.valueY;
        } else if (this.s2.isOutput) { // s2 -> s1
            this.valueX = this.s2.valueX;
            this.valueY = this.s2.valueY;
            this.s1.valueX = this.valueX;
            this.s1.valueY = this.valueY;
        }
    }
}

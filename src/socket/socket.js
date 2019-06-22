export class Socket {
    constructor(parent, x, y) {
        this.parent = parent;
        this.x = x;
        this.y = y;
        this.socketColor = 'rgb(0, 255, 0)';

        this.socketType = '';
    }

    renderSocket(ctx) {
        const xx = this.parent.x + this.x;
        const yy = this.parent.y + this.y;
        ctx.strokeStyle = 'rgb(0, 0, 0)';
        ctx.fillStyle = this.socketColor;
        ctx.beginPath();
        ctx.arc(xx, yy, 10, 0, 2 * Math.PI);
        ctx.fill();
    }

    update() {}
}

export class FloatSocket extends Socket {
    constructor(parent, x, y) {
        super(parent, x, y)
        this.socketType = 'Float';
        this.socketColor = 'rgb(255, 255, 0)';
        this.value = 0;
    }
}

export class PointSocket extends Socket {
    constructor(parent, x, y) {
        super(parent, x, y)
        this.socketType = 'Point';
        this.socketColor = 'rgb(255, 0, 255)';
        this.valueX = 0;
        this.valueY = 0;
    }
}

export class LineSocket extends Socket {
    constructor(parent, x, y) {
        super(parent, x, y);
        this.socketType = 'Line';
        this.socketColor = 'rgb(255, 0, 100)';
        this.valueA = 0;
        this.valueB = 0;
        this.valueC = 0;
    }
}

export class CircleSocket extends Socket {
    constructor(parent, x, y) {
        super(parent, x, y);
        this.socketType = 'Circle';
        this.socketColor = 'rgb(0, 1000, 255)';
        this.valueX = 0;
        this.valueY = 0;
        this.valueR = 0;
    }
}

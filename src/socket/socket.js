export class Socket {
    constructor(parent, x, y, isOutput) {
        this.parent = parent;
        this.x = x;
        this.y = y;
        this.isOutput = isOutput;
        this.socketColor = 'rgb(0, 255, 0)';
        this.edgeOn = false;
        this.edge = undefined;
        this.outputEdges = []

        this.name = '';

        this.radius = 8;

        this.id = this.getUniqueStr();
    }

    getUniqueStr(myStrong) {
        let strong = 1000;
        if (myStrong) strong = myStrong;
        return new Date().getTime().toString(16) + Math.floor(strong * Math.random()).toString(16)
    }
    
    renderSocket(ctx) {
        const xx = this.parent.x + this.x;
        const yy = this.parent.y + this.y;
        ctx.strokeStyle = 'rgb(0, 0, 0)';
        ctx.fillStyle = this.socketColor;
        ctx.beginPath();
        ctx.arc(xx, yy, this.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }

    update() {}

    isPressedAndDiff(mx, my) {
        const xx = this.parent.x + this.x;
        const yy = this.parent.y + this.y;
        const tx = mx - xx;
        const ty = my - yy;
        if (Math.sqrt(tx * tx + ty * ty) < this.radius) {
            return [true, tx, ty];
        }
        return [false, tx, ty];
    }
}

export class FloatSocket extends Socket {
    constructor(parent, x, y, isOutput) {
        super(parent, x, y, isOutput);
        this.name = 'Float';
        this.socketColor = 'rgb(255, 255, 0)';
        this.value = 0;
    }
}

export class PointSocket extends Socket {
    constructor(parent, x, y, isOutput) {
        super(parent, x, y, isOutput);
        this.name = 'Point';
        this.socketColor = 'rgb(255, 0, 255)';
        this.valueX = 0;
        this.valueY = 0;
    }
}

export class LineSocket extends Socket {
    constructor(parent, x, y, isOutput) {
        super(parent, x, y, isOutput);
        this.name = 'Line';
        this.socketColor = 'rgb(255, 0, 100)';
        this.valueA = 0;
        this.valueB = 0;
        this.valueC = 0;

        this.p1 = [0, 0];
        this.p2 = [0, 0];
    }
}

export class CircleSocket extends Socket {
    constructor(parent, x, y, isOutput) {
        super(parent, x, y, isOutput);
        this.name = 'Circle';
        this.socketColor = 'rgb(0, 100, 255)';
        this.valueX = 0;
        this.valueY = 0;
        this.valueR = 0;
    }
}

export class Vec3Socket extends Socket {
    constructor(parent, x, y, isOutput) {
        super(parent, x, y, isOutput);
        this.name = 'Vec3';
        this.socketColor = 'LightGreen';
        this.valueX = 0;
        this.valueY = 0;
        this.valueZ = 0;
    }
}

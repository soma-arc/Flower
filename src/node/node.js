export class Node {
    constructor(x, y) {
        this.sockets = [];
        this.selected = false;
        this.nodeColor = 'rgb(255, 0, 0)';
        this.x = x;
        this.y = y;
        this.width = 100;
        this.height = 100;
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
        ctx.lineWidth = 1.0;
        for (const s of this.sockets) {
            s.draw();
        }
        ctx.strokeStyle = 'rgb(0, 0, 0)';
        ctx.strokeText(this.name, this.x + 6, this.y + 18);
    }

    renderNode(ctx, sceneScale) {
        this.renderPane(ctx, sceneScale);
    }

    update() {}
}

export class ConstantNode extends Node {
    constructor(x, y) {
        super(x, y);
        this.nodeColor = 'rgb(0, 255, 255)';
        this.name = 'Constant';
    }
}

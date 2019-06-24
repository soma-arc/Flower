export default class Textbox {
    constructor() {
        this.textboxX = 100;
        this.textboxY = 100;
        this.textboxWidth = 500;
        this.textboxHeight = 34;

        this.textboxFontSize = 28;
        this.textboxText = new Array(128);
        this.textboxCursor = 0;
        this.textboxStart = 0;
        this.renderOn = false;

        this.parent = undefined;

        for (const i = 0; i < 128; i++) {
            this.textboxText = ' ';
        }
    }

    renderTextbox(ctx) {
        if (this.renderOn === false) return;

        ctx.fillStyle = 'white';
        ctx.fillRect(this.textboxX, this.textboxY,
                     this.textboxWidth, this.textboxHeight);
        if (this.textboxCursor < 30) {
            this.textboxStart = 0;
        } else {}

        ctx.fillStyle = 'black';
        ctx.font = "28px 'Times New Roman'";

        for (let i = this.textboxStart; i < 128 && i < this.textboxStart + 32; i++) {
            if (this.textboxText[i] !== ' ') {
                ctx.fillText(this.textboxText[i],
                             this.textboxX + (i - this.textboxStart) * 15,
                             this.textboxY + this.textboxHeight - 5);
            }
        }
        this.drawTextboxCursor(ctx);
    }

    drawTextboxCursor(ctx) {
        ctx.fillStyle = 'rgb(50, 50, 50)';
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(this.textboxX + (this.textboxCursor - this.textboxStart) * 15,
                   this.textboxY);
        ctx.lineTo(this.textboxX + (this.textboxCursor - this.textboxStart) * 15,
                   this.textboxY + this.textboxHeight);
        ctx.stroke();
        ctx.closePath();
    }

    keyTextbox(key) {
        if ((0 <= parseInt(key) && parseInt(key) <= 9) ||
            (key === '.')) {
            for (let i = 126; i >= this.textboxCursor; i--) {
                this.textboxText[i + 1] = this.textboxText[i];
            }
        }
    }

    getTextboxArray() {
        let ret = '';
        for (let i = 0; i < 128; i++) {
            if (this.textboxText[i] !== ' ') {
                ret += this.textboxText[i];
            }
        }
        return ret;
    }
}

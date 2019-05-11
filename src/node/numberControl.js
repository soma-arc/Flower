export default class NumberControl {
    constructor() {
        this.input = document.createElement( 'input' );
        this.input.defaultValue = 0;
        this.input.type = "number";
        this.input.style.position = 'absolute';
	    this.input.style.border = 'none';
	    this.input.style.background = '#aaa';
	    this.input.style.color = '#444';

        document.body.appendChild(this.input);
    }

    setPosition(x, y, width) {
        this.input.style.left = x +'px';
	    this.input.style.top = y +'px';
	    this.input.style.width = width +'px';
    }

    getValue() {
        return this.input.value;
    }

    setValue(value) {
        this.input.value = value;
    }
}

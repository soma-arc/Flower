export default class SelectionState {
    constructor(x, y, diffX, diffY) {
        this.x = 0;
        this.y = 0;
        this.diffX = 0;
        this.diffY = 0;

        this.selection = SelectionState.SELECT_NONE;
        this.selectedSocket = undefined;
    }

    static get SELECT_NONE() {
        return -1;
    }

    static get SELECT_BODY() {
        return 0;
    }

    static get SELECT_SOCKET() {
        return 1;
    }

    static get SELECT_OPTION() {
        return 2;
    }
}

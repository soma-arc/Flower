export default class ConstructionState {
    /**
     *
     */
    constructor () {
        this.selectedObj = undefined;
        this.componentId = -1;
        // difference between mouse and the object
        // (e.g. center of the circle)
        this.diffObj = -1;
        // distance between mouse and the selected component
        // (e.g. boundary of the circle)
        this.distToComponent = -1;
    }

    /**
     *
     * @param {Node} obj
     * @returns {SelectionState}
     */
    setObj (obj) {
        this.selectedObj = obj;
        return this;
    }

    /**
     *
     * @param {number} componentId
     * @returns {SelectionState}
     */
    setComponentId (componentId) {
        this.componentId = componentId;
        return this;
    }

    /**
     *
     * @param {Number} diffX
     * @param {Number} diffY
     * @returns {SelectionState}
     */
    setDiffObj (diffX, diffY) {
        this.diffX = diffX;
        this.diffY = diffY;
        return this;
    }

    /**
     *
     * @param {number} distToComponent
     * @returns {SelectionState}
     */
    setDistToComponent (distToComponent) {
        this.distToComponent = distToComponent;
        return this;
    }

    /**
     *
     * @returns {boolean}
     */
    isSelectingObj () {
        return this.selectedObj !== undefined;
    }
}

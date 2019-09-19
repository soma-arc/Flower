export default class ConstructionState {
    /**
     *
     */
    constructor () {
        this.selectedNode = undefined;
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
    setNode (node) {
        this.selectedNode = node;
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
    isSelectingNode () {
        return this.selectedNode !== undefined;
    }
}

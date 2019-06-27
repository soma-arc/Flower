import Vue from 'vue';
import Buefy from 'buefy';
import 'buefy/dist/buefy.css';
import Root from './vue/root.vue';
import Scene from './scene.js';
import CanvasManager from './canvasManager.js';
import { ConstantNode, PointNode } from './node/node.js';

window.addEventListener('load', () => {
    Vue.use(Buefy);
    window.Vue = Vue;

    const scene = new Scene();
    const canvasManager = new CanvasManager(scene);

    const d = { 'scene': scene,
                'canvasManager': canvasManager };

    /* eslint-disable no-unused-vars */
    const app = new Vue({
        el: '#app',
        data: d,
        render: (h) => {
            return h('root', { 'props': d });
        },
        components: { 'root': Root }
    });

    canvasManager.init();

    let resizeTimer = setTimeout(canvasManager.resizeCallback, 500);
    window.addEventListener('resize', () => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(canvasManager.resizeCallback, 500);
    });

    scene.addNode(new ConstantNode(100, 10));
    scene.addNode(new PointNode(250, 10));
    canvasManager.renderGraph();
});

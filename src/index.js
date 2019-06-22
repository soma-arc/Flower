import Vue from 'vue';
import Buefy from 'buefy';
import 'buefy/dist/buefy.css';
import Root from './vue/root.vue';
import Scene from './scene.js';
import CanvasManager from './canvasManager.js';

window.addEventListener('load', () => {
    Vue.use(Buefy);
    window.Vue = Vue;

    const scene = new Scene();
    const canvasManager = new canvasManager(scene);
    
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
});

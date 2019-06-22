<template>
  <div class="contentParent">
    <div class="graphPanel">
      <canvas class="canvas" id="graphCanvas"></canvas>
    </div>
    <div class="constructionPanel">
      <canvas class="canvas" id="constructionCanvas"></canvas>
    </div>
  </div>
</template>

<script>

export default {
    props: ['scene', 'canvasManager'],
    methods: {
    },
    components: {
    },
    data: function() {
        return {
        }
    }
}
</script>

<style>
canvas:focus {
    outline: none;
}

.selectable {
    cursor: pointer;
}

.contentParent {
    flex: 1;
    display: flex;
    flex-direction: row;
    overflow: hidden;
}

.canvasParent {
    flex: 1;
    display: flex;
    width:100%;
    border-style: ridge;
    border-color: gray;
    overflow: hidden;
}

.graphPanel {
    flex: 1;
    border-style: ridge;
    border-color: gray;
    overflow: hidden;
}

.constructionPanel {
    flex: 1;
    border-style: ridge;
    border-color: gray;
    overflow: hidden;
}

.canvas {
    width: 100%;
    height: 100%;
    background: gray;
}
</style>

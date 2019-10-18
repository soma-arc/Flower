<template>
<header>
  <ul class="headerLeft">
    <li class="headerContent"><span>Flower</span></li>
  </ul>
  <!-- <ul class="headerRight"> -->
  <!--   <li class="buttonLi"> -->
  <!--     <b-tooltip label="Redo: Ctrl+Shift+z" -->
  <!--                position="is-left"> -->
  <!--       <button class="button" -->
  <!--               @click="redo">Redo</button> -->
  <!--     </b-tooltip> -->
  <!--   </li> -->
  <!--   <b-tooltip label="Undo: Ctrl+z" -->
  <!--              position="is-left"> -->
  <!--     <li class="buttonLi"><button class="button" @click="undo">Undo</button></li> -->
  <!--   </b-tooltip> -->
  <!--   <li class="buttonLi"><button class="button" @click="clearScene">Clear</button></li> -->
  <!-- </ul> -->
</header>
</template>

<script>
export default {
    props: ['scene', 'canvasHandler'],
    methods: {
        undo: function() {
            this.scene.undo();
            this.canvasHandler.render();
        },
        redo: function() {
            this.scene.redo();
            this.canvasHandler.render();
        },
        clearScene: function() {
            this.scene.clearObjects();
            this.canvasHandler.render();
        }
    }
}
</script>

<style>
header {
    border-style: ridge;
    border-color: gray;

    overflow:hidden;
    font-size: 2rem;

    height: 50px;
    background-color: Azure;
    display: flex;
    justify-content: space-between;
    align-items: center;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    cursor: default
}

.headerLeft {
    margin: 0;
    padding: 0;
    display: flex;
    align-items: center;

    list-style: none;
    height: 100%;
}

.headerRight{
    margin: 0;
    padding: 0;
    display: flex;
    align-items: center;

    list-style: none;
    height: 100%;

    flex-direction: row-reverse;
}

.buttonLi {
    flex: 1;
    align-items: center;
    justify-content: center;
    padding-right: 10px;
    display: flex;
}

.headerContent {
    padding: 5px;
}
</style>

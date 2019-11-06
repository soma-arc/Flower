<template>
  <div id="root">
    <header-panel :scene="scene" :canvasManager="canvasManager"/>
    <middle-panel :scene="scene" :canvasManager="canvasManager"/>
    <footer-panel />
  </div>
</template>

<script>
import HeaderPanel from './headerPanel.vue';
import MiddlePanel from './middlePanel.vue';
import FooterPanel from './footerPanel.vue';

export default {
      props: ['scene', 'canvasManager'],
      components: {
          HeaderPanel, MiddlePanel, FooterPanel 
      }
  }
</script>

<style>
#root {
    margin: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}
</style>

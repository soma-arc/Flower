<template>
  <footer>
    <div id="left">
      <a id="ghLink" href="https://github.com/soma-arc/Flower"
         target="_blank">
          <img src="../img/GitHub-Mark-32px.png" class="imgLink"/>
      </a>
      <a id="link" href="https://youtu.be/FWp-eF5gz5o"
         target="_blank">
          Introductory video on YouTube
      </a>
    </div>
    <div>
      Created by soma_arc
    </div>
  </footer>
</template>

<script>
</script>

<style>
footer {
    border-style: ridge;
    border-color: gray;
    height: 50px;
    background-color: Azure;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-right: 0.9rem;
    
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    cursor: default;
}

#left {
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-left: 10px;
}

#link {
    align-items: center;
    justify-content: center;
    padding-top: 20px;
    padding-right: 5px;
    padding-left: 5px;
    margin-left: 5px;
    border-right-style: ridge;
    border-left-style: ridge;
    border-right-color: gray;
    border-left-color: gray;
    text-decoration: none;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
}

#link:hover{
    background-color: PaleTurquoise;
}
</style>

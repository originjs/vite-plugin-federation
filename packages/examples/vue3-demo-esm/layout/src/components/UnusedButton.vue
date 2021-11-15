<template>
  <div id="home-unusedbutton">
    <h1>{{ title }}</h1>
    <button :class="$style.button" @click="title = title + '!'">Unused Layout Button</button>
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      title: 'I will not be used'
    }
  }
}
</script>

<style module>
.button {
    background-color: #4CAF50; /* Green */
    border: none;
    color: white;
    padding: 15px 32px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
}
</style>


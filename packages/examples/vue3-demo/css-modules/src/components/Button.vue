<template>
  <div id="home-unusedbutton">
    <h1>{{ title }}</h1>
    <button :class="$style.button" @click="title = title + '!'">Button with style</button>
  </div>
</template>

<script>
// import styles from './Button.module.css'
export default {
  data: function () {
    return {
      title: 'I need styles!'
    }
  }
}
</script>
<style module>
.button {
  background-color: #4caf50; /* Green */
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
}
</style>

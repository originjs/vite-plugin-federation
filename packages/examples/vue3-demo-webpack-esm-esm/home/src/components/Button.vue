<template>
  <div>
    <h1>{{ title }}</h1>
    <button id="webpack-button" class="button">Webpack Button</button>
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      title: ''
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


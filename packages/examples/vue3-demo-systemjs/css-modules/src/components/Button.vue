<template>
  <div id="css-modules-div">
    <h1 :class="$style.powderblue">{{ title }}</h1>
    <button :class="$style.button" @click="title = title + '!'">Button with style</button>
  </div>
</template>

<script>
// import styles from './Button.module.css'
export default {
  data: function () {
    return {
      title: ''
    }
  }
}
</script>
<style module>
.powderblue {
  color: powderblue
}

.button {
  background-color: powderblue;
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
}
</style>

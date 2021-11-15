<template>
  <Content />
  <Button />
  <UnusedButton />
  <hr />
  <home-images />
  <home-content />
  <home-button />
  <hr />
  <css-modules-button />
  <hr />
  <common-lib-element />
  <common-lib-counter />
</template>

<script>
import Content from "./components/Content.vue";
import Button from "./components/Button.js";
import UnusedButton from "./components/UnusedButton.vue";
export default {  components: {
    Content,
    Button,
    UnusedButton,
  },};
</script>

<style scoped>
img {
  width: 200px;
}
.h1 {
  border: 5px solid red !important;
  padding: 1px !important;
}
.section {
  border: 1px solid black;
  padding: 10px;
}
</style>

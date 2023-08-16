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
  <hr />
  <div ref="container"></div>
</template>

<script>
import Content from "./components/Content.vue";
import Button from "./components/Button.js";
import UnusedButton from "./components/UnusedButton.vue";
import { render,h } from 'vue'
import {__federation_method_setRemote, __federation_method_getRemote, __federation_method_unwrapDefault} from 'virtual:__federation__'

export default {  components: {
    Content,
    Button,
    UnusedButton,
  },
  mounted(){
    __federation_method_setRemote('dynamic', {url:()=>Promise.resolve('http://localhost:5004/assets/remoteEntry.js'),format:'esm',from:'vite'});
    __federation_method_getRemote('dynamic','./Button')
    .then(moduleWraped=>__federation_method_unwrapDefault(moduleWraped))
    .then(module=>{
      render(h(module,{}),this.$refs.container)
    })
  }
  };
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

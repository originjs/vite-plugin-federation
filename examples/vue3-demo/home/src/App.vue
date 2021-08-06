<template>
  <div>
    <h3>Main App</h3>
    <Content />
    <Button />
  </div>
</template>

<script>
import { ref, defineAsyncComponent } from "vue";
// import Content from "./components/Content.vue";
// import Button from "./components/Button.js";
export default {
  components: {
    Content: defineAsyncComponent(() => import("./components/Content.vue")),
    Button: defineAsyncComponent(() => import("./components/Button.js")),
  },
  // components: {
  //   Content,
  //   Button,
  // },
  setup() {
    const count = ref(0);
    const inc = () => {
      count.value++;
    };

    return {
      count,
      inc,
    };
  },
};
</script>

<style scoped>
img {
  width: 200px;
}
h1 {
  font-family: Arial, Helvetica, sans-serif;
}
</style>

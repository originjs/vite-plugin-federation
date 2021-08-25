<template>
  <div>
    <h3>Main App</h3>
    <Content />
    <Button />
    <UnusedButton />
  </div>
</template>

<script>
import { ref, defineAsyncComponent } from "vue";
import Content from "./components/Content.vue";
import Button from "./components/Button.js";
import UnusedButton from "./components/UnusedButton.vue";
export default {
  components: {
    Content,
    Button,
    UnusedButton,
  },
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

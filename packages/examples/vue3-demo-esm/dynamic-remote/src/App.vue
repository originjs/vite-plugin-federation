<template>
  <div>
    <h3>Main App</h3>
    <Images />
    <hr />
    <Content />
    <Button />
    <UnusedButton />
  </div>
</template>

<script>
import { ref } from "vue";
import Content from "./components/Content.vue";
import Button from "./components/Button.js";
import UnusedButton from "./components/UnusedButton.vue";
import Images from "./components/Images.vue";

export default {
  components: {
    Content,
    Button,
    UnusedButton,
    Images
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
h1 {
  font-family: Arial, Helvetica, sans-serif;
}
</style>

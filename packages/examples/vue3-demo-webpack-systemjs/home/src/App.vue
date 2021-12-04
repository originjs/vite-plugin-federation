<template>
  <div>
    <h3>Main App</h3>
    <Content />
    <Button />
  </div>
</template>

<script>
import Content from "./components/Content";
import Button from "./components/Button";
import {ref} from "vue";
export default {
  components: {
    Content,
    Button
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

<template>
  <div>
    <h3>css-modules Remote App</h3>
    <Button />
  </div>
</template>

<script>
import { ref} from "vue";
import Button from "./components/Button.vue";
export default {
  components: {
    Button,
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

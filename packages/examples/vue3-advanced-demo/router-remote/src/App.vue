<template>
  <div>
    <h3>router-remote App</h3>
    <ElementPlus/>
    <h1>Shopping Cart Example</h1>
    <hr>
    <ProductList/>
    <hr>
    <ShoppingCart/>
  </div>
</template>

<script>
import {ref} from "vue";
import ElementPlus from "./components/ElementPlus.vue";
// vuex demo
import ProductList from './components/ProductList.vue'
import ShoppingCart from './components/ShoppingCart.vue'

export default {
  components: {
    ElementPlus, ProductList, ShoppingCart
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

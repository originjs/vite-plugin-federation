<script setup lang="ts">
import BasketInfo from 'team-blue/BasketInfo'
import BuyButton from 'team-blue/BuyButton'
import Recommendations from 'team-green/Recommendations'
import { reactive } from 'vue'
import { product } from '../product'
import { currentItemStore } from '../store'
const currentStore = currentItemStore();
const variant = reactive(Object.assign({}, product.variants[0]))

function clickProduct(sku: string) {
  const [variant2] = product.variants.filter((v) => sku === v.sku);
  Object.assign(variant, variant2)
  currentStore.sku = sku
}
</script>

<template>
  <h1 id="store">The Model Store</h1>
  <BasketInfo />
  <div id="image">
    <div>
      <img :src="variant.image" :alt="variant.name" />
    </div>
  </div>
  <h2 id="name">
    {{product.name}} <small>{{variant.name}}</small>
  </h2>
  <div id="options">
    <button v-for="varia in product.variants" :key="varia.sku" type="button" @click="clickProduct(varia.sku)">
      <img :src="varia.thumb" :alt="varia.name" />
    </button>

  </div>
  <BuyButton :item="variant.sku" />
  <Recommendations/>
</template>

<style>
* {
  box-sizing: border-box;
  font-family: "Helvetica Neue", Arial, sans-serif;
}

dl {
  display: grid;
  grid-column-gap: 15px;
  grid-row-gap: 2px;
  grid-template-columns: 2fr 1fr;
  max-width: 300px;
}

dt {
  text-align: right;
}

dd {
  margin: 0;
}

.main {
  display: grid;
  grid-column-gap: 20px;
  grid-gap: 20px;
  grid-row-gap: 10px;
  margin: 20px auto;
  min-width: 500px;
}

@media only screen and (max-width: 999px) {
  .main {
    grid-template-areas:
      "store basket"
      "image name"
      "image options"
      "image buy"
      "reco reco";
    grid-template-columns: 4fr 3fr;
  }
}

@media only screen and (min-width: 1000px) {
  .main {
    grid-template-areas:
      "store basket  reco"
      "image name    reco"
      "image options reco"
      "image buy     reco";
    grid-template-columns: 4fr 3fr 200px;
    width: 1000px;
  }
}

#store {
  font-weight: 400;
  grid-area: store;
  margin-top: 5px;
}

#image {
  grid-area: image;
  width: 100%;
}

#image>div {
  padding-top: 100%;
  position: relative;
}

#image img {
  bottom: 0;
  left: 0;
  max-width: 100%;
  position: absolute;
  right: 0;
  top: 0;
}


#name {
  font-weight: 400;
  grid-area: name;
  height: 3em;
}

#name small {
  font-size: 1em;
  font-weight: 200;
}

#options {
  align-self: center;
  display: flex;
  grid-area: options;
}

#options button {
  border: none;
  border-bottom: 2px solid white;
  cursor: pointer;
  display: block;
  margin: 2px;
  outline: none;
  padding: 0;
}

#options button.active,
#options button:hover {
  border-bottom-color: seagreen;
}

#options img {
  display: block;
  max-width: 100%;
}

.main {
  outline: 3px dashed orangered;
  padding: 15px;
}
</style>
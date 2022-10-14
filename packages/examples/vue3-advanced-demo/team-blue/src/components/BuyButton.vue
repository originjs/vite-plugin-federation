<script setup lang="ts">
//import { ElButton } from 'element-plus'
import { useStore } from '../store'
const store = useStore();

const prices: { [key: string]: any } = {
    porsche: '66,00 €',
    fendt: '54,00 €',
    eicher: '58,00 €',
}

defineProps<{ item: string }>()

function addToCart(product: string) {
    console.log(product)
    store.buy()
}

</script>

<template>
    <div className="blue-buy" id="buy">
        <button @click="addToCart(item)">
            buy for {{ prices[item] }}
        </button>
    </div>
</template>

<style>
#buy {
    align-self: center;
    grid-area: buy;
}

#buy button {
    background: none;
    border: 1px solid gray;
    border-radius: 20px;
    cursor: pointer;
    display: block;
    font-size: 20px;
    outline: none;
    padding: 20px;
    width: 100%;
}

#buy button:hover {
    border-color: black;
}

#buy button:active {
    border-color: seagreen;
}
</style>
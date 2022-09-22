<script setup lang="ts">
//import { ElButton } from 'element-plus'

const prices:{[key:string]: any } = {
    porsche: '66,00 €',
    fendt: '54,00 €',
    eicher: '58,00 €',
}

defineProps<{ item: string}>()

function addToCart(product: string) {
    console.log(product)
}

</script>

<template>
    <div className="blue-buy" id="buy">
        <button @click="addToCart(item)">
             buy for {{ prices[item] }} 
        </button>
    </div>
</template>
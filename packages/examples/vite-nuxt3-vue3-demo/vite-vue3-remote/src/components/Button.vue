<template>
  <div class="button-container">
    <button class="remote-button" @click="store.increment">
      Remote Button - Clicked {{ store.count }} times
    </button>
    <button class="reset-button" @click="store.reset">Reset</button>
  </div>
</template>

<script setup>
import { useCounterStore } from '../stores/counter'

const store = useCounterStore()
</script>

<style scoped>
.button-container {
  display: flex;
  gap: 8px;
}

.remote-button {
  padding: 8px 16px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.remote-button:hover {
  background-color: #359268;
}

.reset-button {
  padding: 8px 16px;
  background-color: #666;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.reset-button:hover {
  background-color: #555;
}
</style>
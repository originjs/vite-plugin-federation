<template>
  <div id="store-count">
    count:{{ counter.count }}
  </div>
  <div>
    <button id="store-button" @click=counter.increase()>increase:{{ counter.count }}</button>
  </div>
</template>

<script>
import {counterState} from 'remote-store/remoteStore'

export default {
  data(){
    let counter = counterState()
    return {counter}
  }
};
</script>

<style scoped>
img {
  width: 200px;
}

.h1 {
  border: 5px solid red !important;
  padding: 1px !important;
}

.section {
  border: 1px solid black;
  padding: 10px;
}
</style>

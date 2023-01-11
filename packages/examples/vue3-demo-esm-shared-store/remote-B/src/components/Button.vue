<template>
  <div style="border: 1px solid #4CAF50">
    Remote-B
    <br>
    <div>
      count: {{ counter.count }}
    </div>
    <div>
      <button id="remoteB" @click=counter.increase()>increase</button>
    </div>
  </div>
</template>

<script>
import {counterState} from '../store'

export default {
  setup() {
    let counter = counterState();
    return {counter};
  }
}
</script>
<template>
  <remote-a_-button/>
  <br>
  <remote-b_-button/>
</template>

<script>
import remoteA_Button from 'remoteA/Button'
import remoteB_Button from 'remoteB/Button'

export default {
  components: {
    remoteA_Button,
    remoteB_Button
  },
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

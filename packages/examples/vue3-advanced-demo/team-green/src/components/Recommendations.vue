<script setup lang="ts">
import { ref } from 'vue';
import { allRecommendations } from '../recos'
import { currentItemStore } from '../store'

const recommendations = ref<Array<{ image: string; id: string }>>([])
recommendations.value = allRecommendations['porsche']

const store = currentItemStore()
store.$subscribe((mutation, state) => {
  recommendations.value = allRecommendations[state.sku]
})

</script>

<template>
  <div className="green-recos" id="reco">
    <h3>Related Products</h3>
    <img v-for="recommendation in recommendations" :key="recommendation.id" :src="recommendation.image"
      :alt="`Recommendation`+recommendation.id" />
  </div>
</template>

<style>
.green-recos {
  display: block;
  outline: 3px dashed forestgreen;
  width: 100%;
}


#reco {
  grid-area: reco;
}

@media only screen and (max-width: 999px) {
  #reco {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    margin-top: 20px;
    padding-top: 20px;
  }
}

@media only screen and (min-width: 1000px) {
  #reco {
    justify-content: stretch;
    text-align: center;
    width: 100%;
  }
}

#reco h3 {
  font-weight: 400;
}

#reco img {
  display: inline-block;
  height: 180px;
  width: 180px;
}
</style>
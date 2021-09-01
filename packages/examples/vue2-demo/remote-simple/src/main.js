import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

var vm = new Vue({
  render: (h) => h(App)
})
vm.$mount('#app')

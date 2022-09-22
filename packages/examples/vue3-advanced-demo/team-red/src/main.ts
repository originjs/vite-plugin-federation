import { createApp,defineAsyncComponent } from "vue"
import { createPinia } from 'pinia'
import App from "./App.vue"
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(ElementPlus)

//const BasketInfo = defineAsyncComponent(() => import('team-blue/BasketInfo'))
// app.component('BasketInfo' , BasketInfo)
// const BuyButton = defineAsyncComponent(() => import('team-blue/BuyButton'))
// app.component('BuyButton' , BuyButton)

const Recommendations = defineAsyncComponent(() => import('team-green/Recommendations'))
app.component('Recommendations' , Recommendations)

app.mount("#app")

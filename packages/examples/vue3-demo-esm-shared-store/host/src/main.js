import { createApp} from "vue";
import { createPinia } from 'pinia'
import 'shared-styled'
import App from "./App.vue";

const app = createApp(App);

app.use(createPinia());
app.mount("#root");

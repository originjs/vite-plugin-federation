import { createApp, defineAsyncComponent } from "vue";
import store from './store';
import Layout from "./Layout.vue";

import HomeContent from  "home/Content";
const HomeButton = defineAsyncComponent(() => import("home/Button"));
const app = createApp(Layout);



app.component("home-content", HomeContent);
app.component("home-button", HomeButton);

app.use(store);
app.mount("#root");

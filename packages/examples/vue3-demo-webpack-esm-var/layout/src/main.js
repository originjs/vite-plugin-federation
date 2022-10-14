import { createApp, defineAsyncComponent } from "vue";
import { createPinia } from 'pinia'
import Layout from "./Layout.vue";

import HomeContent from "home/Content";
const HomeButton = defineAsyncComponent(() => import("home/Button"));
const app = createApp(Layout);

app.component("home-content", HomeContent);
app.component("home-button", HomeButton);

app.use(createPinia());
app.mount("#root");

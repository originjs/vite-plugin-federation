import { createApp, defineAsyncComponent } from "vue";
import { createPinia } from 'pinia'
import Layout from "./Layout.vue";

import HomeContent from "home/Content";
import HomeButton  from "home/Button";
import HomeImages from "home/Images";

const CommonLibCounter = defineAsyncComponent(() => import("common-lib/CommonCounter"));
const CommonLibHeader = defineAsyncComponent(() => import("common-lib/CommonHeader"));
const CssModuleButton = defineAsyncComponent(() => import("css-modules/Button"));


const app = createApp(Layout);
app.component("home-content", HomeContent);
app.component("home-button", HomeButton);
app.component("home-images", HomeImages);
app.component("css-modules-button", CssModuleButton);
app.component("common-lib-element", CommonLibHeader);
app.component("common-lib-counter", CommonLibCounter);

app.use(createPinia());
app.mount("#root");

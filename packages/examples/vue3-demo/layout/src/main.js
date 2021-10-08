import { createApp, defineAsyncComponent } from "vue";
import store from './store';
import Layout from "./Layout.vue";

const HomeContent = defineAsyncComponent(() => import("home/Content"));
const HomeButton = defineAsyncComponent(() => import("home/Button"));

const CommonLibCounter = defineAsyncComponent(() => import("common-lib/CommonCounter"));
const CommonLibHeader = defineAsyncComponent(() => import("common-lib/CommonHeader"));

const CssModuleButton = defineAsyncComponent(() => import("css-modules/Button"));


const app = createApp(Layout);



app.component("home-content", HomeContent);
app.component("home-button", HomeButton);

app.component("css-modules-button", CssModuleButton);

app.component("common-lib-element", CommonLibHeader);
app.component("common-lib-counter", CommonLibCounter);


app.use(store);
app.mount("#root");

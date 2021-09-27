import { createApp, defineAsyncComponent } from "vue";
import store from './store';
import Layout from "./Layout.vue";

const Content = defineAsyncComponent(() => import("home/Content"));
const Button = defineAsyncComponent(() => import("home/Button"));

const CommonCounter = defineAsyncComponent(() => import("common-lib/CommonCounter"));
const CommonHeader = defineAsyncComponent(() => import("common-lib/CommonHeader"));

const CssButton = defineAsyncComponent(() => import("css-modules/Button"));


const app = createApp(Layout);

app.component("header-element", CommonHeader);

app.component("content-element", Content);
app.component("button-element", Button);
app.component("css-modules-button-element", CssButton);

app.component("counter-element", CommonCounter);


app.use(store);
app.mount("#root");

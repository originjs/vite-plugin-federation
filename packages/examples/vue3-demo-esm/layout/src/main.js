import { createApp} from "vue";
import store ,{name} from './store';
import Layout from "./Layout.vue";

console.log(`name=${name}`);
import HomeContent from "home/Content";
import HomeButton from "home/Button";
import HomeImages from  "home/Images";
import CommonLibCounter from  "common-lib/CommonCounter";
import CommonLibHeader from "common-lib/CommonHeader";
import CssModuleButton from "css-modules/Button";


const app = createApp(Layout);



app.component("home-content", HomeContent);
app.component("home-button", HomeButton);
app.component("home-images", HomeImages);

app.component("css-modules-button", CssModuleButton);
app.component("common-lib-element", CommonLibHeader);
app.component("common-lib-counter", CommonLibCounter);


app.use(store);
app.mount("#root");

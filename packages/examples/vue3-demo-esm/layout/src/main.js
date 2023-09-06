import { createApp} from "vue";
import { createPinia } from 'pinia'
import Layout from "./Layout.vue";

import {__federation_method_setRemote, __federation_method_getRemote, __federation_method_unwrapDefault} from 'virtual:__federation__'
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



__federation_method_setRemote('dynamic', { url:() => Promise.resolve('http://localhost:5004/assets/remoteEntry.js'), format: 'esm', from: 'vite' });
const dynamicComponents = ['Content','Button','Images'];
const res = []
for await(let value of dynamicComponents){
    const moduleWraped = await __federation_method_getRemote('dynamic', `./${value}`)
    res.push({
        name:`dynamic-${value.toLowerCase()}`,
        component:__federation_method_unwrapDefault(moduleWraped)
    })
}
res.map(item=>app.component(item.name,item.component))

app.use(createPinia());
app.mount("#root");

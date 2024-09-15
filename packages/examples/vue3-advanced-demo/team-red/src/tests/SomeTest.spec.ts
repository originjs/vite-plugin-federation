



import { test } from 'vitest'
import {  shallowMount} from "@vue/test-utils";
import App from '../App.vue';


test('mount the app', () => {
    shallowMount(App)
})
import { defineStore } from 'pinia';

export const currentItemStore = defineStore('current_sku', {
    state: () => ({
        sku: ''
    })
});

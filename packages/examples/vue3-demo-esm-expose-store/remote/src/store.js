import {defineStore} from 'pinia';

export const counterState = defineStore('main', {
    state: () => ({
        count: 1
    }),

    actions: {
        increase() {
            this.count++
        }
    }
});
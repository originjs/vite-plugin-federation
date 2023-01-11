import {defineStore} from 'pinia';

export const counterState = defineStore('main', {
    state: () => ({
        count: 0
    }),

    actions: {
        increase() {
            this.count++
        }
    }
});

import { defineStore } from 'pinia';

export const useStore = defineStore('main', {
    state: () => ({
        counter: 10
    }),

    actions: {
        increase() {
            this.counter++
        }
    }
});

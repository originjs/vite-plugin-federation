import { defineStore } from 'pinia';

export const useStore = defineStore('main', {
    state: () => ({
        counter: 5
    }),

    actions: {
        increase() {
            this.counter++
        }
    }
});

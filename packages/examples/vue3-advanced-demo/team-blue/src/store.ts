import { defineStore } from 'pinia';

export const useStore = defineStore('basket', {
    state: () => ({
        items: 0
    }),

    actions: {
        buy() {
            this.items++
        }
    }
});

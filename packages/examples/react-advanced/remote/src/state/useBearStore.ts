import { create } from 'zustand'

interface BearState {
    bears: number
    increasePopulation: () => void
    removeAllBears: () => void
}

export const useBearStore = create<BearState>((set) => ({
    bears: 0,
    increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
    removeAllBears: () => set({ bears: 0 }),
}))

export default useBearStore
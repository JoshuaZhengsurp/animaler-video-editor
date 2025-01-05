import { create } from 'zustand';

interface StateStore {
    isLoading: boolean;
    setIsLoading: (isLoading: boolean) => void;
}

export const useStateStore = create<StateStore>(set => ({
    isLoading: true,
    setIsLoading: (isLoading: boolean) => {
        set({ isLoading });
    },
}));

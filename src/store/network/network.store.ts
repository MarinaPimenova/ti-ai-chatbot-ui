// src/store/network/network.store.ts
import { create } from 'zustand';

export interface NetworkState {
    hasNetworkError: boolean;
    setNetworkError: (hasError: boolean) => void;
    clearNetworkError: () => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
    hasNetworkError: false,
    setNetworkError: (hasError) => set({ hasNetworkError: hasError }),
    clearNetworkError: () => set({ hasNetworkError: false }),
}));
import { create } from 'zustand';

export const useRequestTypeStore = create(set => ({
  selectedMode: 'clipboard',
  setSelectedMode: (mode: string) => set({ selectedMode: mode }),
}));

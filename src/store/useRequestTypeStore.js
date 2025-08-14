import { create } from 'zustand';

export const useRequestTypeStore = create(set => ({
  selectedMode: 'clipboard',
  setSelectedMode: mode => set({ selectedMode: mode }),
}));

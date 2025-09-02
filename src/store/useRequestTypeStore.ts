import { create } from 'zustand';

interface RequestTypeState {
  selectedMode: string;
  setSelectedMode: (mode: string) => void;
}

export const useRequestTypeStore = create<RequestTypeState>(set => ({

  selectedMode: 'clipboard',
  setSelectedMode: (mode: string) => set({ selectedMode: mode }),
}));

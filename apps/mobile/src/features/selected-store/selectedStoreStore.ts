import { create } from 'zustand';

type SelectedStoreState = {
  selectedStoreIds: string[];
  selectStores: (ids: string[]) => void;
  clearSelectedStore: () => void;
};

export const useSelectedStoreStore = create<SelectedStoreState>((set) => ({
  selectedStoreIds: [],
  selectStores: (selectedStoreIds) => set({ selectedStoreIds }),
  clearSelectedStore: () => set({ selectedStoreIds: [] }),
}));

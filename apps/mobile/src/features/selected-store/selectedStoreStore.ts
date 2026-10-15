import { create } from 'zustand';
import type { MapRegion } from '../map/mapStore';

export type BrowseTask = 'browse' | 'facility' | 'store';
export type ListPosition = {
  storeId: string | null;
  relativeOffset: number;
  offset: number;
};
export const INITIAL_LIST_POSITION: ListPosition = {
  storeId: null,
  relativeOffset: 0,
  offset: 0,
};

type ParentContext = {
  task: BrowseTask;
  selectedStoreIds: string[];
  camera: MapRegion;
  sheetIndex: number;
  scrollPosition: ListPosition;
};

type SelectedStoreState = {
  task: BrowseTask;
  selectedStoreIds: string[];
  parents: ParentContext[];
  sheetIndex: number;
  scrollPosition: ListPosition;
  contextVersion: number;
  selectStores: (ids: string[], camera: MapRegion) => void;
  goBack: () => ParentContext | null;
  setSheetIndex: (index: number) => void;
  setScrollPosition: (position: ListPosition) => void;
  startSearch: (searching: boolean) => void;
};

export const useSelectedStoreStore = create<SelectedStoreState>((set, get) => ({
  task: 'browse',
  selectedStoreIds: [],
  parents: [],
  sheetIndex: 0,
  scrollPosition: INITIAL_LIST_POSITION,
  contextVersion: 0,
  selectStores: (selectedStoreIds, camera) => {
    if (selectedStoreIds.length === 0) return;
    const state = get();
    const fromFacility =
      state.task === 'facility' &&
      selectedStoreIds.length === 1 &&
      state.selectedStoreIds.includes(selectedStoreIds[0]);
    const parents =
      fromFacility || state.task === 'browse'
        ? [
            ...state.parents,
            {
              task: state.task,
              selectedStoreIds: state.selectedStoreIds,
              camera,
              sheetIndex: state.sheetIndex,
              scrollPosition: state.scrollPosition,
            },
          ]
        : state.parents.slice(0, 1);
    set({
      selectedStoreIds,
      task: selectedStoreIds.length > 1 ? 'facility' : 'store',
      parents,
      sheetIndex: 1,
      scrollPosition: INITIAL_LIST_POSITION,
      contextVersion: state.contextVersion + 1,
    });
  },
  goBack: () => {
    const state = get();
    const parent = state.parents.at(-1);
    if (!parent) return null;
    set({
      task: parent.task,
      selectedStoreIds: parent.selectedStoreIds,
      sheetIndex: parent.sheetIndex,
      scrollPosition: parent.scrollPosition,
      parents: state.parents.slice(0, -1),
      contextVersion: state.contextVersion + 1,
    });
    return parent;
  },
  setSheetIndex: (sheetIndex) =>
    set({ sheetIndex: Math.max(0, Math.min(2, sheetIndex)) }),
  setScrollPosition: (scrollPosition) => set({ scrollPosition }),
  // A new search keeps detail open, but cannot resurrect an earlier result position.
  startSearch: (searching) =>
    set((state) => ({
      scrollPosition:
        state.task === 'browse' ? INITIAL_LIST_POSITION : state.scrollPosition,
      sheetIndex:
        state.task === 'browse' && state.sheetIndex === 0 && searching
          ? 1
          : state.sheetIndex,
      parents: state.parents.map((parent) => ({
        ...parent,
        scrollPosition: INITIAL_LIST_POSITION,
      })),
      contextVersion: state.contextVersion + 1,
    })),
}));

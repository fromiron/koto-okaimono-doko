import { create } from 'zustand';

export type MapRegion = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

export type LatLng = {
  latitude: number;
  longitude: number;
};

type MapState = {
  region: MapRegion;
  searchRegion: MapRegion;
  pendingSearchRegion: MapRegion | null;
  proposeSearchRegion: (region: MapRegion) => void;
  searchThisArea: () => void;
  clearPendingSearch: () => void;
  userLocation: LatLng | null;
  setRegion: (region: MapRegion) => void;
  setUserLocation: (location: LatLng | null) => void;
};

export const KOTO_INITIAL_REGION: MapRegion = {
  latitude: 35.674,
  longitude: 139.81,
  latitudeDelta: 0.009,
  longitudeDelta: 0.011,
};

export const useMapStore = create<MapState>((set) => ({
  region: KOTO_INITIAL_REGION,
  searchRegion: KOTO_INITIAL_REGION,
  pendingSearchRegion: null,
  clearPendingSearch: () => set({ pendingSearchRegion: null }),
  proposeSearchRegion: (pendingSearchRegion) => set({ pendingSearchRegion }),
  searchThisArea: () =>
    set((state) => ({
      searchRegion: state.pendingSearchRegion ?? state.region,
      pendingSearchRegion: null,
    })),
  userLocation: null,
  setRegion: (region) => set({ region }),
  setUserLocation: (userLocation) => set({ userLocation }),
}));

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
  userLocation: LatLng | null;
  isFollowingUser: boolean;
  setRegion: (region: MapRegion) => void;
  setUserLocation: (location: LatLng | null) => void;
  setIsFollowingUser: (value: boolean) => void;
};

export const KOTO_INITIAL_REGION: MapRegion = {
  latitude: 35.674,
  longitude: 139.81,
  latitudeDelta: 0.009,
  longitudeDelta: 0.011,
};

export const useMapStore = create<MapState>((set) => ({
  region: KOTO_INITIAL_REGION,
  userLocation: null,
  isFollowingUser: false,
  setRegion: (region) => set({ region }),
  setUserLocation: (userLocation) => set({ userLocation }),
  setIsFollowingUser: (isFollowingUser) => set({ isFollowingUser }),
}));

import { create } from 'zustand';

type PreferencesState = {
  /** Whether foreground location may be used for current-location and distance features. */
  locationEnabled: boolean;
  setLocationEnabled: (enabled: boolean) => void;
};

export const usePreferencesStore = create<PreferencesState>((set) => ({
  locationEnabled: true,
  setLocationEnabled: (locationEnabled) => set({ locationEnabled }),
}));

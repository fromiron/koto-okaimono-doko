import { describe, expect, it } from 'vitest';

import { usePreferencesStore } from './preferencesStore';

describe('preferencesStore', () => {
  it('defaults locationEnabled to true', () => {
    expect(usePreferencesStore.getState().locationEnabled).toBe(true);
  });

  it('updates locationEnabled via the setter', () => {
    usePreferencesStore.getState().setLocationEnabled(false);
    expect(usePreferencesStore.getState().locationEnabled).toBe(false);

    usePreferencesStore.getState().setLocationEnabled(true);
    expect(usePreferencesStore.getState().locationEnabled).toBe(true);
  });
});

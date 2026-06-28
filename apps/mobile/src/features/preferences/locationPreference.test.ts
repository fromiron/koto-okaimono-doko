import { beforeEach, describe, expect, it, vi } from 'vitest';

const memory = new Map<string, string>();

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(async (key: string) => (memory.has(key) ? memory.get(key)! : null)),
    setItem: vi.fn(async (key: string, value: string) => {
      memory.set(key, value);
    }),
  },
}));

import { getStoredLocationEnabled, setStoredLocationEnabled } from './locationPreference';

describe('locationPreference', () => {
  beforeEach(() => {
    memory.clear();
  });

  it('defaults to true when nothing is stored', async () => {
    expect(await getStoredLocationEnabled()).toBe(true);
  });

  it('round-trips the stored value', async () => {
    await setStoredLocationEnabled(false);
    expect(await getStoredLocationEnabled()).toBe(false);

    await setStoredLocationEnabled(true);
    expect(await getStoredLocationEnabled()).toBe(true);
  });
});

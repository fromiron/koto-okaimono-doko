import { describe, expect, it, vi } from 'vitest';

import { selectRadiusWithLocation } from './selectRadius';

const location = { latitude: 35.674, longitude: 139.81 };

describe('selectRadiusWithLocation', () => {
  it('uses the current session location without requesting it again', async () => {
    const requestLocation = vi.fn();
    const selectRadius = vi.fn();

    await expect(
      selectRadiusWithLocation({
        currentLocation: location,
        radius: 500,
        requestLocation,
        selectRadius,
      }),
    ).resolves.toBe(true);

    expect(requestLocation).not.toHaveBeenCalled();
    expect(selectRadius).toHaveBeenCalledWith(500);
  });

  it('requests a location before applying the radius when needed', async () => {
    const requestLocation = vi.fn().mockResolvedValue(location);
    const selectRadius = vi.fn();

    await expect(
      selectRadiusWithLocation({
        currentLocation: null,
        radius: 1000,
        requestLocation,
        selectRadius,
      }),
    ).resolves.toBe(true);

    expect(requestLocation).toHaveBeenCalledOnce();
    expect(selectRadius).toHaveBeenCalledWith(1000);
  });

  it('keeps the radius unchanged when a location cannot be obtained', async () => {
    const requestLocation = vi.fn().mockResolvedValue(null);
    const selectRadius = vi.fn();

    await expect(
      selectRadiusWithLocation({
        currentLocation: null,
        radius: 2000,
        requestLocation,
        selectRadius,
      }),
    ).resolves.toBe(false);

    expect(selectRadius).not.toHaveBeenCalled();
  });
});

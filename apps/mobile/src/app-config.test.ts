import { afterEach, describe, expect, it, vi } from 'vitest';

const originalGoogleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

afterEach(() => {
  if (originalGoogleMapsApiKey === undefined) {
    delete process.env.GOOGLE_MAPS_API_KEY;
  } else {
    process.env.GOOGLE_MAPS_API_KEY = originalGoogleMapsApiKey;
  }

  vi.resetModules();
});

describe('Expo app config', () => {
  it('adds the Android Google Maps plugin when a key is configured', async () => {
    process.env.GOOGLE_MAPS_API_KEY = 'test-google-maps-key';
    vi.resetModules();

    const { default: config } = await import('../app.config');

    expect(config.plugins).toContainEqual([
      'react-native-maps',
      {
        androidGoogleMapsApiKey: 'test-google-maps-key',
      },
    ]);
  });

  it('omits the Android Google Maps plugin when the key is blank', async () => {
    process.env.GOOGLE_MAPS_API_KEY = '   ';
    vi.resetModules();

    const { default: config } = await import('../app.config');

    const hasMapsPlugin = config.plugins?.some(
      (plugin) => Array.isArray(plugin) && plugin[0] === 'react-native-maps',
    );

    expect(hasMapsPlugin).toBe(false);
  });
});

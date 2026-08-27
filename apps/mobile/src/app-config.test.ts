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
  it('supports rotation and localizes native permission prompts', async () => {
    const { default: config } = await import('../app.config');

    expect(config.orientation).toBe('default');
    expect(config.userInterfaceStyle).toBe('light');
    expect(config.version).toBe('1.0.4');
    expect(config.ios?.buildNumber).toBe('4');
    expect(config.android?.versionCode).toBe(4);
    expect(config.locales).toEqual({
      en: './locales/en.json',
      ja: './locales/ja.json',
      ko: './locales/ko.json',
      'zh-Hans': './locales/zh-Hans.json',
      'zh-Hant': './locales/zh-Hant.json',
    });
    expect(config.ios?.infoPlist?.CFBundleAllowMixedLocalizations).toBe(true);
  });

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

  it('keeps the maps plugin buildable with an explicit placeholder when the key is blank', async () => {
    process.env.GOOGLE_MAPS_API_KEY = '   ';
    vi.resetModules();

    const { default: config } = await import('../app.config');

    expect(config.plugins).toContainEqual([
      'react-native-maps',
      {
        androidGoogleMapsApiKey: 'MISSING_API_KEY',
      },
    ]);
  });
});

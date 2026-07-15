import type { ExpoConfig } from 'expo/config';

const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY?.trim();

const plugins: NonNullable<ExpoConfig['plugins']> = [
  'expo-router',
  'expo-localization',
  'expo-sqlite',
  'expo-asset',
  [
    'expo-splash-screen',
    {
      // splash-icon.png is icon.png (the full poster artwork) padded into the
      // centre-66% safe circle — the SAME geometry as the adaptive-icon
      // foreground, so launcher icon and launch screen show one image.
      backgroundColor: '#FBF6EF',
      image: './assets/splash-icon.png',
      imageWidth: 180,
    },
  ],
];

plugins.push([
  'react-native-maps',
  {
    androidGoogleMapsApiKey: googleMapsApiKey || 'MISSING_API_KEY',
  },
]);

const config: ExpoConfig = {
  name: 'こうとうお買い物どこ',
  slug: 'koto-okaimono-doko',
  version: '1.0.0',
  platforms: ['ios', 'android'],
  orientation: 'default',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  scheme: 'koto-okaimono-doko',
  locales: {
    en: './locales/en.json',
    ja: './locales/ja.json',
    ko: './locales/ko.json',
    'zh-Hans': './locales/zh-Hans.json',
    'zh-Hant': './locales/zh-Hant.json',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'app.koto.okaimono.doko',
    infoPlist: {
      CFBundleAllowMixedLocalizations: true,
      NSLocationWhenInUseUsageDescription:
        '現在地の表示、距離計算、周辺検索に使用します。このアプリ自体は位置情報を保存・アップロードしません。',
    },
  },
  android: {
    package: 'app.koto.okaimono.doko',
    adaptiveIcon: {
      backgroundColor: '#FBF6EF',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
    permissions: ['ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION'],
  },
  plugins,
  experiments: {
    typedRoutes: true,
  },
};

export default config;

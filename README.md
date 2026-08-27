<p align="center">
  <strong>English</strong> ·
  <a href="README.ja.md">日本語</a> ·
  <a href="README.ko.md">한국어</a> ·
  <a href="README.zh-Hans.md">简体中文</a> ·
  <a href="README.zh-Hant.md">繁體中文</a>
</p>

<p align="center">
  <img src="assets/readme-hero.webp" alt="Illustrated riverside neighborhood with shops and map pins" width="100%" />
</p>

<h1 align="center">Koto Okaimono Doko</h1>

<p align="center">
  An unofficial map app for finding stores that accept<br />
  <strong>こうとう商店街DEお買い物券＋2026</strong>
</p>

<p align="center">
  <a href="https://github.com/fromiron/koto-okaimono-doko/actions/workflows/mobile-ci.yml"><img src="https://github.com/fromiron/koto-okaimono-doko/actions/workflows/mobile-ci.yml/badge.svg" alt="Mobile CI" /></a>
  <a href="https://github.com/fromiron/koto-okaimono-doko/releases/latest"><img src="https://img.shields.io/github/v/release/fromiron/koto-okaimono-doko?label=release" alt="Latest release" /></a>
</p>

<p align="center">
  <strong><a href="https://github.com/fromiron/koto-okaimono-doko/releases/latest">Get the latest Android APK →</a></strong>
</p>

> [!IMPORTANT]
> This is an independent, unofficial project. It is not affiliated with Koto City or any participating company. Always confirm current coupon terms and store availability on the [official website](https://koto-okaimono-premium.jp/) or with the store.

## Download

| Platform | Availability                                                                                                             |
| -------- | ------------------------------------------------------------------------------------------------------------------------ |
| Android  | The [latest GitHub Release](https://github.com/fromiron/koto-okaimono-doko/releases/latest) includes an `arm64-v8a` APK. |
| iOS      | Build from source on macOS. No public iOS binary is published.                                                           |

## What you can do

- **Browse by map or list** — pins distinguish stores that accept both `A・B` coupons, `B`-only stores, and facilities containing multiple stores.
- **Search the complete Store Dataset** — find matches by store name, address, facility name, or shopping street, not only inside the visible map area.
- **Filter for the right store** — narrow results by coupon type, payment medium (paper or digital), official category, and straight-line distance radius.
- **Open useful details** — view the Japanese source address, optional phone and official-page links, approximate straight-line distance, and directions in the platform map app.
- **Use essential store data offline** — the initial Store Dataset is bundled with the app, so search and details do not require an initial download. Map tiles may still need a network connection.
- **Choose from five UI languages** — Japanese, English, Korean, Simplified Chinese, and Traditional Chinese. Official store names, addresses, and facility names stay in Japanese.

## Data and privacy

- Store data is built from the program's [Official Source](https://koto-okaimono-premium.jp/). The app shows the source date in Settings; the official website and each store remain authoritative.
- A complete Seed Dataset ships as `seed.sqlite`. When a Dataset Manifest URL is configured, Settings can check for and apply a verified `stores.sqlite` update.
- Location access is optional and foreground-only. Coordinates are held in session memory for the current-position display, nearby search, and distance calculation; they are not uploaded or persisted. Only the location on/off preference is stored.
- Distances shown by the app are approximate straight-line distances, not walking-route distances.

## Development

This repository is a pnpm workspace for an Expo Router app and its shared packages.

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm test
pnpm mobile:start
```

Expo Go is suitable for layout, navigation, and bundled-data smoke checks. Validate the Android map in a native development or release build because the Google Maps key is applied at build time.

### Native maps

For Android, copy `apps/mobile/.env.example` to `apps/mobile/.env.local`, set `GOOGLE_MAPS_API_KEY`, then run:

```bash
pnpm --dir apps/mobile exec expo run:android
```

For iOS, use macOS with Xcode. Apple Maps is the default provider, so no Google Maps key is required:

```bash
pnpm mobile:ios
```

## Dataset pipeline

Dataset generation runs outside the app. It downloads the Official Source, normalizes and validates Store records, then writes the SQLite Dataset and manifest used by the mobile app.

```bash
pnpm dataset:build
pnpm dataset:test
```

The build requires network access and Poppler. PDFs are never parsed on the device.

## Project layout

| Path                   | Role                                              |
| ---------------------- | ------------------------------------------------- |
| `apps/mobile`          | Expo app, screens, map, and Dataset runtime       |
| `packages/core`        | Shared category, distance, and geographic helpers |
| `packages/schema`      | Store schema, supported locales, and shared types |
| `packages/dataset-cli` | Official-source ingestion and Dataset build       |
| `data/corrections`     | Reviewed manual geocode corrections               |

See [`CONTEXT.md`](CONTEXT.md) for the canonical product glossary.

## Environment variables

| Variable                           | Used by             | Purpose                                              |
| ---------------------------------- | ------------------- | ---------------------------------------------------- |
| `GOOGLE_MAPS_API_KEY`              | Mobile native build | Android Google Maps key, applied at build time       |
| `EXPO_PUBLIC_DATASET_MANIFEST_URL` | Mobile app          | Public URL for optional Dataset update checks        |
| `DATASET_BASE_URL`                 | Dataset CLI         | Base URL written into generated manifest asset links |

## Checks and feedback

Before opening a pull request, run:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm --dir apps/mobile exec expo install --check
```

When changing GitHub Actions, also run the affected workflow with the repository's `act` configuration. Report app bugs or data corrections in [GitHub Issues](https://github.com/fromiron/koto-okaimono-doko/issues).

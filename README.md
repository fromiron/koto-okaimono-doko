<div align="center">

<img src="assets/brand/main.png" alt="こうとうお買い物どこ — 2026年 江東区 プレミアム付商品券 対応店舗マップ" width="420" />

# こうとうお買い物どこ

**Koto Okaimono Doko** — unofficial, offline-first map app for finding stores that
accept the 2026 Koto City premium shopping coupon
(`こうとう商店街DEお買い物券＋2026`).

Unofficial · Open Source · JA / EN / 한국어 / 简体 / 繁體

</div>

> [!NOTE]
> This is an unofficial service and is not affiliated with any municipality or
> company. Always confirm the latest information on the official site or with each store.

## Features

- **Map-first browsing** — edge-to-edge native map with teardrop coupon pins:
  `A・B` (both coupons), `B` (B-only), and gray facility pins for stores that
  share the same coordinates.
- **Search & filters** — global store name / address search, inline coupon-type
  chips, and a full filter sheet (coupon type, payment medium, category,
  distance radius).
- **Store details** — bottom sheet on the map plus a full detail view (address,
  phone, walking distance, directions, official page, mini map).
- **Offline-first** — works on first launch from the bundled `seed.sqlite`;
  updates arrive as a `manifest.json` plus a raw `stores.sqlite` download.
- **Multilingual UI** — `ja`, `en`, `ko`, `zh-Hans`, `zh-Hant`. Official store
  names, addresses, and facility names stay in their Japanese source text.
- **Private by design** — location is foreground-only, session-memory-only, and
  never uploaded or persisted.

## Tech Stack

- **App**: Expo (~56) + Expo Router, React Native 0.85, TypeScript (strict).
- **Styling**: Uniwind (Tailwind v4) driven by design tokens
  (`apps/mobile/src/theme/tokens.ts` + `apps/mobile/src/global.css`).
- **State**: Zustand for UI/app state only (the full store list lives in SQLite).
- **Data**: `expo-sqlite` for store data, AsyncStorage for small preferences.
- **Map**: `react-native-maps` — Google Maps on Android, Apple Maps on iOS.
- **i18n**: `i18next` / `react-i18next`. Validation with `zod`.

## Monorepo Layout

pnpm workspaces (`apps/*`, `packages/*`):

| Path | Package | Role |
|---|---|---|
| `apps/mobile` | `@koto/mobile` | Expo app (screens, UI, map, dataset runtime). |
| `packages/core` | `@koto/core` | Shared domain helpers (categories, distance, geo). |
| `packages/schema` | `@koto/schema` | `Store` schema, supported locales, shared types. |
| `packages/dataset-cli` | `@koto/dataset-cli` | Build the dataset from official sources. |

See `CONTEXT.md` for the canonical product glossary.

## Design

The visual identity (「まちかどマルシェ」 — vermillion `#EA5F3F`, marigold
`#F5A31C`, matcha teal `#3D9E83` on cream washi `#FBF6EF`) is derived 1:1 from
the brand artwork in [`assets/brand/`](assets/brand/):

| File | Role |
|---|---|
| `assets/brand/main.png` | Key visual / poster — source of the splash screen and this README's hero. |
| `assets/brand/appicon.png` | App icon base artwork — source of `apps/mobile/assets/icon.png` and the adaptive/splash icons. |

The app re-skins from two token files kept in sync by tests
(`tokenParity.test.ts`, `spacing.test.ts`, `styleGuard.test.ts`):
`apps/mobile/src/theme/tokens.ts` (JS constants) and
`apps/mobile/src/global.css` (Tailwind `@theme` variables). Runtime
illustrations live in [`assets/`](assets/) (see its README).

## Development

```bash
pnpm install
pnpm dataset:build   # build the dataset (see "Dataset Pipeline")
pnpm typecheck
pnpm lint
pnpm test
pnpm mobile:start
```

Use Expo Go only for layout, navigation, and local data smoke checks. Validate the
Android map in a development or production build created with `GOOGLE_MAPS_API_KEY`,
because the app's native Google Maps configuration is applied at build time.

Create local mobile environment settings from the example before native Android map checks:

```bash
cp apps/mobile/.env.example apps/mobile/.env.local
$EDITOR apps/mobile/.env.local
pnpm --dir apps/mobile exec expo run:android
```

## Dataset Pipeline

The dataset is generated in CI (never on device) from the Official Source. Individual
stages are available as scripts and `dataset:build` runs the full pipeline:

```bash
pnpm dataset:fetch            # download official HTML/PDF sources
pnpm dataset:parse            # parse raw sources into structured records
pnpm dataset:normalize        # normalize addresses and fields
pnpm dataset:validate         # validate against the schema
pnpm dataset:build-sqlite     # build stores.sqlite
pnpm dataset:export-manifest  # write manifest.json
pnpm dataset:build            # run the whole pipeline
pnpm dataset:test             # dataset-cli unit tests
```

Coordinates are produced during the build via address normalization, geocoding, and
manual correction CSVs. PDFs are never parsed on device.

## Environment Variables

| Variable | Where | Purpose |
|---|---|---|
| `GOOGLE_MAPS_API_KEY` | `apps/mobile/.env.local` | Android Google Maps key, applied at native build time. |
| `EXPO_PUBLIC_DATASET_MANIFEST_URL` | mobile (public in JS bundle) | Optional runtime dataset manifest URL. |
| `DATASET_BASE_URL` | dataset CLI | Base URL for manifest asset links. |

iOS uses Apple Maps by default and needs no map key.

## Privacy

User location is foreground-only, held in session memory only, and never uploaded or
persisted. It is used solely to search for nearby stores.

## CI Local Check

Run GitHub Actions locally before pushing workflow changes:

```bash
act -W .github/workflows/mobile-ci.yml -j quality
```

The dataset workflow can be smoke-checked with:

```bash
act -W .github/workflows/build-dataset.yml -j build-dataset
```

Pages deployment is intended for GitHub-hosted CI, not local `act`.
Artifact upload and Pages upload are skipped under `act` because local runs do not
provide GitHub's artifact runtime token.

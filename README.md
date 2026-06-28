# こうとうお買い物どこ / Koto Okaimono Doko

Unofficial, offline-first map app for finding stores that accept the 2026 Koto City
premium shopping coupon program (`こうとう商店街DEお買い物券＋2026`).

> This is an unofficial service and is not affiliated with any municipality or
> company. Always confirm the latest information on the official site or with each store.

## Features

- Native map with coupon markers: `A・B` (both coupons), `B` (B-only), and gray
  **Location Group** markers for stores that share the same coordinates.
- Search by store name / address and quick filter chips, plus a full filter sheet
  (coupon type, payment medium, category, distance radius).
- Store bottom sheet on the map and a full store detail page (address, phone,
  walking distance, directions, official page, mini map).
- Settings: dataset version/update check, foreground-only location toggle, and
  language selection.
- Multilingual UI: `ja`, `en`, `ko`, `zh-Hans`, `zh-Hant`. Official store names,
  addresses, and facility names remain in their Japanese source text.
- Offline-first: works on first launch from the bundled `seed.sqlite`; updates are
  delivered as a `manifest.json` plus a raw `stores.sqlite` download.

## Tech Stack

- **App**: Expo (~56) + Expo Router, React Native 0.85, TypeScript (strict).
- **Styling**: Uniwind (Tailwind v4) with design tokens in `docs/design-system.md`.
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

See `CONTEXT.md` for the canonical product glossary and `docs/adr/` for design decisions.

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

## Design

- Visual tokens and screen rules: `docs/design-system.md`.
- Sample screens (source visual truth): `docs/wireframes/images/`.
- Copy and flows: `docs/wireframes.md`.

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

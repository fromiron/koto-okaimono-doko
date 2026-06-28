# こうとうお買い物どこ

Unofficial offline-first map app for stores participating in `こうとう商店街DEお買い物券＋2026`.

## Development

```bash
pnpm install
pnpm dataset:build
pnpm typecheck
pnpm lint
pnpm test
pnpm mobile:start
```

Android production map builds need `GOOGLE_MAPS_API_KEY`. The app can run from bundled `seed.sqlite`; dataset updates use `EXPO_PUBLIC_DATASET_MANIFEST_URL`.
Use Expo Go only for layout, navigation, and local data smoke checks. Validate the Android map in a development or production build created with `GOOGLE_MAPS_API_KEY`, because the app's native Google Maps configuration is applied at build time.

Create local mobile environment settings from the example before native Android map checks:

```bash
cp apps/mobile/.env.example apps/mobile/.env.local
$EDITOR apps/mobile/.env.local
pnpm --dir apps/mobile exec expo run:android
```

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
Artifact upload and Pages upload are skipped under `act` because local runs do not provide GitHub's artifact runtime token.

# Image assets

Transparent-background WebP exports for `こうとうお買い物どこ` / `koto okaimono doko`.

These raster files are the preferred app/documentation assets. They avoid SVG font rendering, icon alignment, and filter differences across platforms. External drop shadows are intentionally removed or minimized; add shadows at the component or screen level when needed.

## Documentation asset

| File                  | Use                                                                      |
| --------------------- | ------------------------------------------------------------------------ |
| `readme-hero.webp`    | Project-title hero shared by the root READMEs; not a product screenshot. |
| `readme-hero-sol.png` | Full-resolution source used to produce the optimized WebP.               |

## Runtime illustration assets

| File                                   | Use                                      |
| -------------------------------------- | ---------------------------------------- |
| `illustration-map-empty.png`           | Map empty/search state                   |
| `illustration-store-detail.png`        | Store detail / bottom sheet illustration |
| `illustration-mall-group.png`          | Mall/facility group state                |
| `illustration-filter.png`              | Filter modal illustration                |
| `illustration-location-permission.png` | Location permission state                |
| `illustration-offline-cache.png`       | Offline / cached dataset state           |
| `illustration-dataset-update.png`      | Settings / dataset update state          |

## Brand base artwork (`brand/`)

Source-of-truth artwork the identity is derived from — not bundled into the app
directly; derived assets live in `apps/mobile/assets/`.

| File                | Use                                                            |
| ------------------- | -------------------------------------------------------------- |
| `brand/main.png`    | Key visual / poster and splash artwork source                  |
| `brand/appicon.png` | App icon base (source of `icon.png` and adaptive/splash icons) |
